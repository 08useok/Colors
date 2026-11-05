// Season 9 transform (변신): a second gauge, like a hypercharge, that fills alongside the ultimate.
// While a character is transformed its kit changes for `duration` seconds.
// Gauge: ultimate charge gained also fills the transform gauge; a full gauge takes
// `chargeMultiplier` ultimates' worth of charge. Nothing charges while transformed.
export const TRANSFORMS = {
  orange: {
    name: '껍질이 왜 이렇게 많아?!', color: '#ff9b32', duration: 6, chargeMultiplier: 1.5,
    // The changed ability is the ultimate, so the ultimate must be ready to transform.
    needsUltimate: true,
    summary: '궁극기 껍질 15개(거리별 1·2·3·4·5개), 껍질 하나당 1,000 피해',
    // Rows of peels from near to far: 1, 2, 3, 4, 5 peels, spread across the ultimate range.
    peelRows: [1, 2, 3, 4, 5], peelSpacing: 1.3, peelDamage: 1000,
  },
  chartreuse: {
    name: '천사', color: '#fff2a8', duration: 6, chargeMultiplier: 1.5,
    summary: '모든 일반 공격이 Heaven 탄환 · 맞은 적은 표식 중 CC를 받으면 즉사',
    // Every basic shot is a Heaven round. A hit leaves an angel mark for `markDuration` s;
    // the marked enemy dies the moment it is crowd-controlled by anyone on the other side.
    heaven: true, markDuration: 6,
  },
};
