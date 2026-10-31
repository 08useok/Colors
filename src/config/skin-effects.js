import { SKINS } from './skins.js';

// Cosmetic permissions come from the equipped skin, never character rarity.
export const SKIN_EFFECT_TIERS = Object.freeze({
  rare: Object.freeze({basic:false,ultimate:false,ambient:false,color:0x6ebcff}),
  epic: Object.freeze({basic:true,ultimate:false,ambient:false,color:0x7bc9ff}),
  hero: Object.freeze({basic:true,ultimate:true,ambient:false,color:0xc68cff}),
  legendary: Object.freeze({basic:true,ultimate:true,ambient:true,color:0xffd467}),
});
export function skinEffectProfile(characterId, skinId) {
  const skin = SKINS[skinId];
  if (!skin || skin.character !== characterId) return null;
  return SKIN_EFFECT_TIERS[skin.rarity] ?? null;
}
