import {createServer} from 'node:http';
import {readFileSync,existsSync,statSync,createReadStream} from 'node:fs';
import {resolve,extname,sep} from 'node:path';
const root=resolve('.');
const probe=`
window.__ultimateQA={
 ids:Object.keys(BETA_ULTIMATE_MOTIONS),
 cancel(){redUltimateCharge=1000;performCharacterUltimate();const queued=!!betaPracticeUltimatePending;resetTestCombatHud();return{queued,cleared:betaPracticeUltimatePending===null};},
 state(){return{pending:!!betaPracticeUltimatePending,guard:!!redGuardMesh,errors:window.__qaErrors??[]};},
 cast(){goldUltimateCharge=redUltimateCharge=pinkUltimateCharge=azureUltimateCharge=crystalUltimateCharge=yellowUltimateCharge=orangeUltimateCharge=purpleUltimateCharge=lavenderSpecialCharge=salmonUltimateCharge=mintUltimateCharge=blueSpecialCharge=crimsonUltimateCharge=cyanUltimateCharge=ivoryUltimateCharge=greenUltimateCharge=chartreuseUltimateCharge=1000;
 goldRushState.health=10000;player.position.set(-40,6.25,0);player.rotation.y=0;for(const t of testTargets){t.visible=true;t.position.set(-40,6.25,2);t.userData.health=1000000;t.userData.invulnerableUntil=0;}
 updateCrimsonUltimateGauge();const before=Number(ultimateButton.getAttribute('aria-valuenow'));performCharacterUltimate();return{profile:modelAttackCharacter,pending:!!betaPracticeUltimatePending,before};},
 castResult(){updateCrimsonUltimateGauge();return {charge:Number(ultimateButton.getAttribute('aria-valuenow')),pending:!!betaPracticeUltimatePending};},
 prepare(id){if(!betaState.ownedCharacters.includes(id))betaState.ownedCharacters.push(id);betaState.selectedSkins[id]='';selectCharacter(id);goldRushState.dead=false;},
 ready(){return !modelLoading.blocking&&activeCharacterMotion?.characterId===betaState.selectedCharacter;},
 sample(){const id=betaState.selectedCharacter,p=BETA_ULTIMATE_MOTIONS[id],root=activeCharacterMotion.scenes[activeCharacterMotion.current],pos=root.position.clone();
 restoreModelAttackPose();startModelAttackMotion(id+'Ultimate');updateModelAttackMotion(p.release*.7);
 const changed=modelAttackPoseRestore.filter(s=>s.bone.quaternion.angleTo(s.quaternion)>.01).length;
 const saved=modelAttackPoseRestore.map(s=>({bone:s.bone,q:s.quaternion.clone()}));
 restoreModelAttackPose();const restored=saved.every(s=>s.bone.quaternion.equals(s.q));
 updateModelAttackMotion(p.duration+1);restoreModelAttackPose();
 const mesh=new THREE.Group(),bot={model:root,mesh,characterId:id,previousModelPosition:mesh.position.clone(),modelAttackTime:0,modelUltimateMotion:true,modelConcealed:false,dead:false};
 updateBetaBotModel(bot,p.release*.7);const botChanged=bot.rigAttackPose.filter(s=>s.bone.quaternion.angleTo(s.quaternion)>.01).length;
 updateBetaBotModel(bot,p.duration+1);
 return {id,changed,restored,botChanged,botRestored:bot.rigAttackPose.length===0,rootFixed:pos.equals(root.position)};}
};`;
createServer((req,res)=>{const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=resolve(root,'.'+path);if(!file.startsWith(root+sep)||!existsSync(file)||!statSync(file).isFile()){res.writeHead(404).end();return;}res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png'})[extname(file)]??'application/octet-stream');if(path==='/beta-season.html')res.end(readFileSync(file,'utf8').replace('<head>',"<head><script>window.__qaErrors=[];window.addEventListener('error',e=>__qaErrors.push(e.message));window.addEventListener('unhandledrejection',e=>__qaErrors.push(String(e.reason)));</script>"));else if(path==='/src/beta-season.js')res.end(readFileSync(file,'utf8')+probe);else createReadStream(file).pipe(res);}).listen(4188,'127.0.0.1',()=>console.log('Ultimate QA http://127.0.0.1:4188/beta-season.html'));
