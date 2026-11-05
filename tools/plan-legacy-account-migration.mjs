// Offline preparation only. Not imported by either game or account server.
import {createHash} from 'node:crypto';
import {parseAccountBackup} from '../src/account-transfer.js';
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const hash=text=>createHash('sha256').update(text).digest('hex');
const canonical=value=>JSON.stringify(value,(_,v)=>object(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);
export function planLegacyMigration({backupText,sourceOrigin,targetAccountId,targetVersion,targetHasProgress=false}) {
 if(typeof backupText!=='string'||backupText.length>2000000)throw Error('Invalid backup');
 const account=parseAccountBackup(backupText);
 const origin=new URL(sourceOrigin);if(!['http:','https:'].includes(origin.protocol)||origin.origin!==sourceOrigin)throw Error('Exact source origin required');
 if(typeof targetAccountId!=='string'||!targetAccountId.trim()||targetAccountId.length>128)throw Error('Authenticated target required');
 if(!Number.isSafeInteger(targetVersion)||targetVersion<0)throw Error('Target version required');
 if(targetHasProgress)throw Error('Destination progress conflict: no automatic overwrite or currency merge');
 const snapshot=structuredClone(account),snapshotHash=hash(canonical(snapshot));
 return {format:'colors-legacy-migration-plan',version:1,status:'dry-run-only',source:{origin:sourceOrigin,legacyId:account.id,snapshotHash,rawBackupHash:hash(backupText)},target:{accountId:targetAccountId,expectedVersion:targetVersion},
   idempotencyKey:hash(canonical({origin:sourceOrigin,legacyId:account.id})),
   snapshot,summary:{nickname:account.nickname,coins:account.coins,credits:account.credits,characters:account.ownedCharacters.length,skins:account.ownedSkins.length,fields:Object.keys(account).sort()},
   policy:{addBetaCurrency:false,overwriteTarget:false,competitiveHistory:'legacy-unverified',deleteSource:false},
   blockers:['Source ownership must be confirmed; a legacy ID or backup hash is not authentication','Target session must be verified by server; supplied targetAccountId is a preview only','Atomic server import, receipt and shared-state adapter are not connected']};
}
export function validateMigrationReceipt(plan,receipt,currentSourceAccount){
 if(hash(canonical(currentSourceAccount))!==plan.source.snapshotHash)throw Error('Source changed: repeat preview');
 if(!receipt||receipt.accountId!==plan.target.accountId||receipt.idempotencyKey!==plan.idempotencyKey||receipt.snapshotHash!==plan.source.snapshotHash||receipt.committedVersion!==plan.target.expectedVersion+1)throw Error('Receipt mismatch');
 return {verified:true,sourceMayBeDeleted:false};
}
