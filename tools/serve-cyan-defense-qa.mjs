import {createServer} from 'node:http';
import {readFileSync,existsSync,statSync,createReadStream} from 'node:fs';
import {resolve,sep,extname} from 'node:path';
const root=resolve('.');
const probe=`
window.__cyanDefenseQA={ready(){return !modelLoading.blocking;},pick(){if(!betaState.ownedCharacters.includes('cyan'))betaState.ownedCharacters.push('cyan');selectCharacter('cyan');},
 async shoot(yaw){for(const p of betaProjectiles.splice(0))scene.remove(p.mesh);goldRushState.dead=false;goldRushState.ammo=3;generalAttackReady=true;player.rotation.y=yaw;performCharacterAttackCore({manualAim:true});await new Promise(r=>setTimeout(r,160));return betaProjectiles.filter(p=>p.type==='cyanShot').map(p=>({x:p.mesh.position.x,z:p.mesh.position.z,vx:p.vx,vz:p.vz,damage:p.damage}));}
};`;
createServer((req,res)=>{const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=resolve(root,'.'+path);if(!file.startsWith(root+sep)||file.slice(root.length).split(/[\\/]/).some(p=>p.startsWith('.'))||!existsSync(file)||!statSync(file).isFile()){res.writeHead(404).end();return;}
res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json'})[extname(file)]||'application/octet-stream');
if(path==='/src/beta-season.js')res.end(readFileSync(file,'utf8')+probe);else createReadStream(file).pipe(res);}).listen(4194,'127.0.0.1',()=>console.log('Isolated Cyan QA http://127.0.0.1:4194/beta-season.html'));
