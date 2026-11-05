import assert from 'node:assert/strict';
import { SKINS } from '../src/config/skins.js';
import { SKIN_EFFECT_TIERS, skinEffectProfile } from '../src/config/skin-effects.js';

const expected={rare:[false,false,false],epic:[true,false,false],hero:[true,true,false],legendary:[true,true,true]};
const snapshot=structuredClone(SKINS);
for (const skin of Object.values(SKINS)) {
  const p=skinEffectProfile(skin.character,skin.id);
  assert.deepEqual([p.basic,p.ultimate,p.ambient],expected[skin.rarity],skin.id);
  assert.equal(skinEffectProfile('invalid-character',skin.id),null);
}
for (const id of ['red','orange','yellow','green','cyan','blue','purple','pink','ivory','crimson','gold','mint','azure','crystal','lavender','chartreuse','salmon']) {
  assert.equal(skinEffectProfile(id,''),null,'base appearance gets no skin effects');
  assert.equal(skinEffectProfile(id,'missing-skin'),null);
}
assert.deepEqual(SKINS,snapshot,'cosmetic lookup never changes skins or stats');
assert(Object.isFrozen(SKIN_EFFECT_TIERS));
console.log(`PASS: ${Object.keys(SKINS).length} skins use equipped-skin rarity; four tier permissions, character ownership, base/unknown fallback, unchanged definitions.`);
