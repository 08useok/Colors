import {createServer} from 'node:http';import {readFileSync,existsSync,statSync,createReadStream} from 'node:fs';import {resolve,sep,extname} from 'node:path';
const root=resolve('.'),probe=`
window.__blueShieldQA={
 ready(){return !modelLoading.blocking;},
 async shot(){generalAttackReady=true;goldRushState.ammo=3;player.position.set(-40,6.25,0);player.rotation.y=Math.PI/2;performCharacterAttackCore({manualAim:true});await new Promise(r=>setTimeout(r,90));const p=betaProjectiles.find(p=>p.type==='marble');return p?{radius:p.hitRadius,scale:p.mesh.scale.x}:null;},
 pick(){selectCharacter('blue');for(const t of testTargets)t.visible=false;if(attackRobot)attackRobot.visible=false;},
 reset(){blueDashState=null;betaPracticeUltimatePending=null;goldRushState.dead=false;goldRushState.invulnerableUntil=0;goldRushState.health=100000;blueSpecialCharge=BETA_CHARACTERS.blue.special.chargeRequired;updateBlueShieldVisual();},
 hit(){const hp=goldRushState.health;damageGoldRushPlayer(1000);return hp-goldRushState.health;},
 start(){performCharacterUltimate();updateBlueShieldVisual();},
 snapshot(){return {reduction:blueShieldReduction(),rolling:!!blueDashState,preparing:!!betaPracticeUltimatePending,shield:!!player.getObjectByName('blue-ultimate-shield')};},
 finish(){updateBlueDash(BETA_CHARACTERS.blue.special.duration+.01);updateBlueShieldVisual();return this.snapshot();}
};`;
createServer((req,res)=>{const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=resolve(root,'.'+path);if(!file.startsWith(root+sep)||file.slice(root.length).split(/[\\/]/).some(p=>p.startsWith('.'))||!existsSync(file)||!statSync(file).isFile()){res.writeHead(404).end();return;}res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json'})[extname(file)]||'application/octet-stream');if(path==='/src/beta-season.js')res.end(readFileSync(file,'utf8')+probe);else if(path==='/beta-season.html')res.end(readFileSync(file,'utf8').replace('<head>',"<head><script>window.__qaErrors=[];addEventListener('error',e=>__qaErrors.push(e.message));addEventListener('unhandledrejection',e=>__qaErrors.push(String(e.reason)));</script>"));else createReadStream(file).pipe(res);}).listen(4194,'127.0.0.1',()=>console.log('Blue shield isolated QA http://127.0.0.1:4194/beta-season.html'));
