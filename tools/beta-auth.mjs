import { DatabaseSync } from 'node:sqlite';
import { randomBytes, randomUUID, createHash, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { createRecordRoutes } from './beta-records.mjs';

const derive = promisify(scrypt);
const hashToken = token => createHash('sha256').update(token).digest('hex');
const cookieName = 'colors_beta_session';
const sessionAge = 7 * 86400;
const passwordHash = (password,salt) => derive(password,salt,64,{N:32768,r:8,p:3,maxmem:64*1024*1024});
const fail = (status,message) => Object.assign(new Error(message),{status});

// Local beta authentication only. It is deliberately separate from production.
export function createBetaAuth(filename, { now = Date.now } = {}) {
  if(filename !== ':memory:') mkdirSync(dirname(filename),{recursive:true});
  const db = new DatabaseSync(filename);
  db.exec(`PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL;
    CREATE TABLE IF NOT EXISTS accounts(id TEXT PRIMARY KEY, username TEXT NOT NULL UNIQUE, nickname TEXT NOT NULL, salt TEXT NOT NULL, password_hash TEXT NOT NULL, created_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY, account_id TEXT NOT NULL REFERENCES accounts(id), expires_at INTEGER NOT NULL);
    CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires_at);
    CREATE TABLE IF NOT EXISTS beta_saves(account_id TEXT PRIMARY KEY REFERENCES accounts(id), version INTEGER NOT NULL, data TEXT NOT NULL, updated_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS recovery_codes(account_id TEXT PRIMARY KEY REFERENCES accounts(id), code_hash TEXT NOT NULL, created_at INTEGER NOT NULL);`);
  const attempts = new Map();
  function limit(key,max,window) {
    const time=now();
    for(const [k,v] of attempts) if(v.until<=time)attempts.delete(k);
    const value=attempts.get(key)??{count:0,until:time+window};
    if(value.count>=max)throw fail(429,'시도가 너무 많습니다. 잠시 후 다시 시도하세요.');
    value.count++;attempts.set(key,value);
  }
  function token(req) { return /(?:^|;\s*)colors_beta_session=([a-f0-9]{64})(?:;|$)/.exec(req.headers.cookie??'')?.[1]??''; }
  function account(req) {
    const value=token(req);if(!value)return null;
    return db.prepare('SELECT a.id,a.username,a.nickname FROM sessions s JOIN accounts a ON a.id=s.account_id WHERE s.token_hash=? AND s.expires_at>?').get(hashToken(value),now())??null;
  }
  function send(res,status,data,extra={}) {
    res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...extra});res.end(JSON.stringify(data));
  }
  async function body(req) {
    if(!req.headers['content-type']?.startsWith('application/json'))throw fail(415,'JSON 요청이 필요합니다.');
    const chunks=[];let size=0;
    for await(const chunk of req){size+=chunk.length;if(size>200000)throw fail(413,'저장 데이터가 너무 큽니다.');chunks.push(chunk);}
    try{return JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw fail(400,'요청 형식이 올바르지 않습니다.');}
  }
  function session(req,res,user) {
    const old=token(req);if(old)db.prepare('DELETE FROM sessions WHERE token_hash=?').run(hashToken(old));
    db.prepare('DELETE FROM sessions WHERE expires_at<=?').run(now());
    const value=randomBytes(32).toString('hex');
    db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(hashToken(value),user.id,now()+sessionAge*1000);
    send(res,200,{user:{id:user.id,username:user.username,nickname:user.nickname}},{'Set-Cookie':`${cookieName}=${value}; HttpOnly; SameSite=Strict; Path=/api/beta-account; Max-Age=${sessionAge}`});
  }
  function validatePassword(password) {
    if(typeof password!=='string'||password.length<10||password.length>128)throw fail(400,'비밀번호는 10~128자로 입력하세요.');
  }
  async function verifyPassword(req,password,expectedAccountId) {
    const current=account(req);if(!current)throw fail(401,'다시 로그인하세요.');
    if(current.id!==expectedAccountId)throw fail(409,'로그인 계정이 바뀌었습니다. 새로고침하세요.');
    limit('sensitive:'+current.id,10,900000);
    const user=db.prepare('SELECT * FROM accounts WHERE id=?').get(current.id);
    if(typeof password!=='string'||password.length>128)throw fail(401,'현재 비밀번호가 맞지 않습니다.');
    const derived=await passwordHash(password,user.salt);
    if(!timingSafeEqual(derived,Buffer.from(user.password_hash,'hex')))throw fail(401,'현재 비밀번호가 맞지 않습니다.');
    if(account(req)?.id!==user.id||db.prepare('SELECT password_hash FROM accounts WHERE id=?').get(user.id).password_hash!==user.password_hash)throw fail(401,'인증 정보가 변경되었습니다. 다시 로그인하세요.');
    return user;
  }
  function newRecovery(userId) {
    const code=randomBytes(24).toString('hex');
    db.prepare('INSERT INTO recovery_codes VALUES(?,?,?) ON CONFLICT(account_id) DO UPDATE SET code_hash=excluded.code_hash,created_at=excluded.created_at').run(userId,hashToken(code),now());
    return code.match(/.{8}/g).join('-');
  }
  function transaction(operation) {
    db.exec('BEGIN IMMEDIATE');try{const result=operation();db.exec('COMMIT');return result;}catch(error){db.exec('ROLLBACK');throw error;}
  }
  function validateSave(data) {
    if(!data||typeof data!=='object'||Array.isArray(data))throw fail(400,'저장 데이터가 올바르지 않습니다.');
    function inspect(v,depth=0){if(depth>12)throw fail(400,'저장 구조가 너무 깊습니다.');if(typeof v==='number'&&!Number.isFinite(v))throw fail(400,'잘못된 수치입니다.');if(v&&typeof v==='object')for(const[k,child]of Object.entries(v)){if(['__proto__','prototype','constructor'].includes(k))throw fail(400,'허용되지 않는 저장 항목입니다.');inspect(child,depth+1);}}
    inspect(data);
  }
  const recordRoutes=createRecordRoutes(db,{now,account,body,send,fail,limit});
  return {db,close:()=>db.close(),async handle(req,res) {
    const path=new URL(req.url,'http://localhost').pathname;
    if(!path.startsWith('/api/beta-account/'))return false;
    try{
      if(!/^(?:127\.0\.0\.1|localhost):\d+$/.test(req.headers.host??''))throw fail(403,'로컬 베타 주소에서 이용하세요.');
      const origin=req.headers.origin,expected=`http://${req.headers.host}`;
      if(origin&&origin!==expected)throw fail(403,'같은 게임 화면에서 요청하세요.');
      if(!['GET','POST','PUT'].includes(req.method))throw fail(405,'지원하지 않는 요청입니다.');
      if(req.method!=='GET'&&origin!==expected)throw fail(403,'요청 출처를 확인할 수 없습니다.');
      if(await recordRoutes(req,res,path))return true;
      if(path==='/api/beta-account/register'&&req.method==='POST') {
        limit('register:'+req.socket.remoteAddress,10,3600000);
        const input=await body(req),username=String(input.username??'').trim().toLowerCase(),nickname=String(input.nickname??'').trim(),password=input.password;
        if(!/^[a-z0-9_]{3,24}$/.test(username))throw fail(400,'아이디는 영문·숫자·밑줄 3~24자로 입력하세요.');
        if(!nickname||nickname.length>12||/[<>\x00-\x1f]/.test(nickname))throw fail(400,'닉네임은 1~12자로 입력하세요.');
        validatePassword(password);
        if(db.prepare('SELECT id FROM accounts WHERE username=?').get(username))throw fail(409,'이미 사용 중인 아이디입니다.');
        const salt=randomBytes(16).toString('hex'),derived=await passwordHash(password,salt);
        const user={id:randomUUID(),username,nickname};
        try{db.prepare('INSERT INTO accounts VALUES(?,?,?,?,?,?)').run(user.id,username,nickname,salt,derived.toString('hex'),now());}catch(error){if(error.code?.includes('SQLITE'))throw fail(409,'이미 사용 중인 아이디입니다.');throw error;}
        session(req,res,user);
      }else if(path==='/api/beta-account/login'&&req.method==='POST') {
        limit('login:'+req.socket.remoteAddress,30,900000);
        const input=await body(req),username=String(input.username??'').trim().toLowerCase(),password=input.password;
        if(typeof password!=='string'||password.length>128)throw fail(401,'아이디 또는 비밀번호가 맞지 않습니다.');
        const user=db.prepare('SELECT * FROM accounts WHERE username=?').get(username);
        const derived=await passwordHash(password,user?.salt??'00000000000000000000000000000000');
        if(!user||!timingSafeEqual(derived,Buffer.from(user.password_hash,'hex')))throw fail(401,'아이디 또는 비밀번호가 맞지 않습니다.');
        session(req,res,user);
      }else if(path==='/api/beta-account/password'&&req.method==='POST') {
        const input=await body(req);validatePassword(input.newPassword);
        const user=await verifyPassword(req,input.currentPassword,input.accountId);
        if(input.newPassword===input.currentPassword)throw fail(400,'현재와 다른 새 비밀번호를 입력하세요.');
        const salt=randomBytes(16).toString('hex'),derived=await passwordHash(input.newPassword,salt);
        transaction(()=>{
          if(account(req)?.id!==user.id)throw fail(401,'다시 로그인하세요.');
          const result=db.prepare('UPDATE accounts SET salt=?,password_hash=? WHERE id=? AND password_hash=?').run(salt,derived.toString('hex'),user.id,user.password_hash);
          if(result.changes!==1)throw fail(409,'비밀번호가 이미 변경되었습니다.');
          db.prepare('DELETE FROM sessions WHERE account_id=?').run(user.id);
          db.prepare('DELETE FROM recovery_codes WHERE account_id=?').run(user.id);
        });
        // Keep this device signed in with a fresh session; revoke all others.
        session(req,res,user);
      }else if(path==='/api/beta-account/recovery-code'&&req.method==='POST') {
        const input=await body(req),user=await verifyPassword(req,input.currentPassword,input.accountId);
        send(res,200,{recoveryCode:newRecovery(user.id)});
      }else if(path==='/api/beta-account/recover'&&req.method==='POST') {
        limit('recover:'+req.socket.remoteAddress,10,900000);
        const input=await body(req);validatePassword(input.newPassword);
        const username=String(input.username??'').trim().toLowerCase();
        const code=typeof input.recoveryCode==='string'?input.recoveryCode.trim().toLowerCase().replaceAll('-',''):'';
        const user=db.prepare('SELECT id FROM accounts WHERE username=?').get(username);
        const stored=user?db.prepare('SELECT code_hash FROM recovery_codes WHERE account_id=?').get(user.id):null;
        const digest=hashToken(code),expected=stored?.code_hash??'0'.repeat(64);
        if(!/^[a-f0-9]{48}$/.test(code)||!timingSafeEqual(Buffer.from(digest,'hex'),Buffer.from(expected,'hex'))||!stored)throw fail(401,'아이디 또는 복구 코드가 맞지 않습니다.');
        const salt=randomBytes(16).toString('hex'),derived=await passwordHash(input.newPassword,salt);
        transaction(()=>{
          const result=db.prepare('DELETE FROM recovery_codes WHERE account_id=? AND code_hash=?').run(user.id,digest);
          if(result.changes!==1)throw fail(401,'이미 사용되었거나 바뀐 복구 코드입니다.');
          db.prepare('UPDATE accounts SET salt=?,password_hash=? WHERE id=?').run(salt,derived.toString('hex'),user.id);
          db.prepare('DELETE FROM sessions WHERE account_id=?').run(user.id);
        });
        send(res,200,{ok:true},{'Set-Cookie':`${cookieName}=; HttpOnly; SameSite=Strict; Path=/api/beta-account; Max-Age=0`});
      }else if(path==='/api/beta-account/session'&&req.method==='GET') {
        const user=account(req);if(!user)throw fail(401,'로그인이 필요합니다.');
        const save=db.prepare('SELECT version,data FROM beta_saves WHERE account_id=?').get(user.id);
        send(res,200,{user,version:save?.version??0,state:save?JSON.parse(save.data):null,hasRecoveryCode:Boolean(db.prepare('SELECT 1 FROM recovery_codes WHERE account_id=?').get(user.id))});
      }else if(path==='/api/beta-account/logout'&&req.method==='POST') {
        db.prepare('DELETE FROM sessions WHERE token_hash=?').run(hashToken(token(req)));
        send(res,200,{ok:true},{'Set-Cookie':`${cookieName}=; HttpOnly; SameSite=Strict; Path=/api/beta-account; Max-Age=0`});
      }else if(path==='/api/beta-account/save'&&req.method==='PUT') {
        const user=account(req);if(!user)throw fail(401,'로그인이 필요합니다.');
        const input=await body(req);
        if(input.accountId!==user.id)throw fail(409,'로그인 계정이 바뀌었습니다. 새로고침하세요.');
        if(!Number.isSafeInteger(input.version)||input.version<0)throw fail(400,'저장 버전이 올바르지 않습니다.');
        validateSave(input.state);
        const data=JSON.stringify(input.state);
        const result=input.version===0
          ? db.prepare('INSERT OR IGNORE INTO beta_saves VALUES(?,1,?,?)').run(user.id,data,now())
          : db.prepare('UPDATE beta_saves SET data=?,version=version+1,updated_at=? WHERE account_id=? AND version=?').run(data,now(),user.id,input.version);
        if(result.changes!==1)throw fail(409,'다른 화면에서 저장이 바뀌었습니다. 새로고침 후 다시 시도하세요.');
        send(res,200,{version:input.version+1});
      }else throw fail(404,'계정 기능을 찾을 수 없습니다.');
    }catch(error){send(res,error.status??500,{error:error.status?error.message:'계정 서버에서 오류가 발생했습니다.'});}
    return true;
  }};
}
