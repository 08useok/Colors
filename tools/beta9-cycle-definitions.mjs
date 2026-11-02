// Definitions for the 18-character Season 9 counter cycle: the 17 Beta 8 fighters plus Raspberry,
// built the same way the beta page builds them (attack/ultimate release windups from the motion tables).
import {BETA_CHARACTERS} from '../src/config/beta-characters.js';
import {applyBeta7Balance} from '../src/config/beta7-balance.js';
import {applyBeta8Balance} from '../src/config/beta8-balance.js';
import {RASPBERRY_CHARACTER} from '../src/config/raspberry.js';
import {BETA_ATTACK_MOTIONS} from '../src/config/beta-attack-motion.js';
import {BETA_ULTIMATE_MOTIONS} from '../src/config/beta-ultimate-motion.js';
export function season9CycleConfig(){
  const config=applyBeta8Balance(applyBeta7Balance(BETA_CHARACTERS));
  config.raspberry=structuredClone(RASPBERRY_CHARACTER);
  config.raspberry.attackWindup=BETA_ATTACK_MOTIONS.raspberry?.release??0;
  config.raspberry.ultimate.motionWindup=BETA_ULTIMATE_MOTIONS.raspberry?.release??0;
  return config;
}
