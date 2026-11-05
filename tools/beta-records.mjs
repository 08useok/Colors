import { matchRecord, rankedRows, RECORD_MODES } from '../src/config/beta8-records.js';
import { BETA_CHARACTERS } from '../src/config/beta-characters.js';
export function createRecordRoutes(db,{now,account,body,send,fail,limit}) {
  db.exec(`CREATE TABLE IF NOT EXISTS beta_record_tickets(id TEXT PRIMARY KEY,account_id TEXT NOT NULL REFERENCES accounts(id),mode TEXT NOT NULL,character TEXT NOT NULL,started_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS beta_match_records(id TEXT PRIMARY KEY,account_id TEXT NOT NULL REFERENCES accounts(id),season TEXT NOT NULL,data TEXT NOT NULL,ended_at INTEGER NOT NULL);
    CREATE INDEX IF NOT EXISTS beta_records_season ON beta_match_records(season,account_id);`);
  return async function records(req,res,path) {
    if(!path.startsWith('/api/beta-account/records/'))return false;
    const user=account(req);
    if(path.endsWith('/ranking') && req.method==='GET') {
      const summaries=new Map();
      for(const row of db.prepare('SELECT r.account_id,r.data,a.nickname FROM beta_match_records r JOIN accounts a ON a.id=r.account_id WHERE r.season=? ORDER BY r.ended_at,r.id').all('beta8')) {
        const r=JSON.parse(row.data);if(r.abandoned)continue;
        const s=summaries.get(row.account_id)||{id:row.account_id,nickname:row.nickname,points:0,wins:0,kills:0,characters:{}};
        s.points+=r.points;s.wins+=Number(r.won);s.kills+=r.kills;s.characters[r.character]=(s.characters[r.character]||0)+1;summaries.set(s.id,s);
      }
      const ranks=rankedRows([...summaries.values()].map(s=>({...s,character:Object.entries(s.characters).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))[0][0]})));
      // Never expose login IDs or internal account identifiers in the public list.
      const clean=r=>r?{rank:r.rank,nickname:r.nickname,points:r.points,wins:r.wins,character:r.character}:null;
      send(res,200,{rows:ranks.slice(0,100).map(clean),me:clean(ranks.find(r=>r.id===user?.id))});return true;
    }
    if(!user)throw fail(401,'로그인이 필요합니다.');
    const input=await body(req);
    if(input.accountId!==user.id)throw fail(409,'로그인 계정이 바뀌었습니다.');
    if(path.endsWith('/start') && req.method==='POST') {
      limit('records:'+user.id,120,3600000);
      if(!/^[a-zA-Z0-9-]{1,80}$/.test(input.id||'')||!RECORD_MODES.includes(input.mode)||!(Object.hasOwn(BETA_CHARACTERS,input.character)||['salmon','raspberry'].includes(input.character)))throw fail(400,'경기 정보가 올바르지 않습니다.');
      const old=db.prepare('SELECT * FROM beta_record_tickets WHERE id=?').get(input.id);
      if(old && (old.account_id!==user.id||old.mode!==input.mode||old.character!==input.character))throw fail(409,'다른 경기 정보입니다.');
      if(!old)db.prepare('INSERT INTO beta_record_tickets VALUES(?,?,?,?,?)').run(input.id,user.id,input.mode,input.character,now());
      send(res,200,{ok:true});return true;
    }
    if(path.endsWith('/finish') && req.method==='POST') {
      const raw=input.record;
      if(!raw||raw.season!=='beta8')throw fail(400,'베타 시즌 8 경기만 기록합니다.');
      const r=matchRecord(raw),ticket=db.prepare('SELECT * FROM beta_record_tickets WHERE id=? AND account_id=?').get(raw.id??'',user.id);
      if(!r||!ticket||r.mode!==ticket.mode||r.character!==ticket.character)throw fail(400,'시작한 경기 정보와 일치하지 않습니다.');
      const existing=db.prepare('SELECT account_id FROM beta_match_records WHERE id=?').get(r.id);
      if(existing){if(existing.account_id!==user.id)throw fail(409,'다른 경기 정보입니다.');send(res,200,{ok:true,duplicate:true});return true;}
      for(const key of ['kills','deaths','damage','healing','duration'])if(typeof raw[key]!=='number'||!Number.isFinite(raw[key])||raw[key]<0)throw fail(400,'경기 수치가 올바르지 않습니다.');
      if(r.duration>Math.max(0,(now()-ticket.started_at)/1000)+15 || r.duration>7200 || r.kills>1000 || r.deaths>1000 || r.damage>1e8 || r.healing>1e8)throw fail(400,'경기 수치를 확인해 주세요.');
      r.endedAt=now();
      db.prepare('INSERT INTO beta_match_records VALUES(?,?,?,?,?)').run(r.id,user.id,'beta8',JSON.stringify(r),now());
      send(res,200,{ok:true,points:r.points});return true;
    }
    throw fail(404,'기록 기능을 찾을 수 없습니다.');
  };
}
