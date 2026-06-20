# Alpha Season 2 — v1.3 Patch

## 📋 Overview

Focus: **Remote balance retuning + New character (Orange) + Battle structure diversification**

---

## 🔵 BLUE Reload Balance

### Change
- **Reload Speed: 0.1s → 0.3~0.4s** (weapon becomes slower)

### Impact
- Reduces continuous DPS pressure
- Increases close-range character viability
- Maintains long-range stability

### Design Intent
- **Solve "infinite laser DPS" problem**
- More skill-based reload management
- Risk/reward for missed shots higher

---

## 🔴 RED Balance (Planned)

### Planned Changes
- Range: Slight increase
- Damage: Slight increase

### Design Intent
- **Reward successful close-range engagement**
- Maintain tank role identity

---

## 🟢 GREEN (No Change)

### Status
- High-skill-based performance maintained
- Mid-range assassin role unchanged

### Design Intent
- **Meta-standard character**
- Difficulty curve steeper than others

---

## 🟠 ORANGE (New Character)

### Position
- Damage dealer (projectile-based)

### Skill Structure
- **Orange Bomb Launch**: Explosive projectile
- **Detonation**: On hit OR max range reached
- **5-way Spread**: Juice spreads in 5 directions
- **Direct Hit**: All 5 projectiles land

### Damage
- **Max Damage: 5000** (direct hit to single target)
- Spread reduces effectiveness vs single target
- High risk/reward playstyle

### Mechanics
- Single bomb per fire event
- 5-way split on detonation
- Each split projectile deals ~1000 base damage
- Position-dependent threat (area control)

### Stats (TBD during implementation)
- HP: ~6500-7000 (medium-tanky)
- Attack Cooldown: ~0.6-0.8s (medium fire rate)
- Range: ~6-7 (between Green and Blue)
- Move Speed: Normal or slightly slower

---

## 🎮 Implementation Checklist

- [ ] Update CHARACTERS config (Blue reload time)
- [ ] Add Orange character to CHARACTERS
- [ ] Implement bomb projectile system
- [ ] Implement 5-way explosion mechanic
- [ ] Add explosion VFX
- [ ] Enable Orange in character select
- [ ] Add v1.3 patch notes
- [ ] Localization (KO/EN)
- [ ] Test balance and gameplay
- [ ] Deploy to GitHub
