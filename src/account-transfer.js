const forbidden = new Set(['__proto__', 'prototype', 'constructor']);
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
export function parseAccountBackup(text) {
  if (text.length > 2000000) throw new Error('계정 파일이 너무 큽니다.');
  let backup;
  try { backup = JSON.parse(text); } catch { throw new Error('올바른 계정 JSON 파일이 아닙니다.'); }
  if (backup?.format !== 'colors-account' || backup.version !== 1 || !object(backup.account))
    throw new Error('Colors에서 내보낸 계정 파일을 선택하세요.');
  const a = backup.account;
  const safeText = value => typeof value === 'string' && !/[<>\u0000-\u001f]/.test(value);
  function inspect(value, depth = 0) {
    if (depth > 12) throw new Error('계정 파일 구조가 올바르지 않습니다.');
    if (typeof value === 'number' && !Number.isFinite(value)) throw new Error('잘못된 계정 수치입니다.');
    if (typeof value === 'string' && (!safeText(value) || value.length > 1000)) throw new Error('잘못된 계정 문자열입니다.');
    if (value && typeof value === 'object') for (const [key, child] of Object.entries(value)) {
      if (forbidden.has(key)) throw new Error('허용되지 않는 계정 항목입니다.');
      inspect(child, depth + 1);
    }
  }
  inspect(a);
  if (!safeText(a.id) || !a.id.trim() || a.id.length > 16 || forbidden.has(a.id)
      || !safeText(a.nickname) || !a.nickname.trim() || a.nickname.length > 12)
    throw new Error('계정 아이디 또는 닉네임이 올바르지 않습니다.');
  for (const key of ['trophies', 'wins', 'losses', 'coins', 'credits'])
    if (!Number.isSafeInteger(a[key]) || a[key] < 0) throw new Error('계정 전적 또는 재화가 올바르지 않습니다.');
  for (const key of ['ownedCharacters', 'ownedSkins'])
    if (!Array.isArray(a[key]) || !a[key].every(safeText)) throw new Error('캐릭터 또는 스킨 목록이 올바르지 않습니다.');
  for (const key of ['charStats', 'charTrophies', 'charLevels', 'selectedSkins', 'daily', 'cosmetics', 'seasonStats', 'seasonCharStats', 'seasonChopWoodStats', 'seasonChopWoodCharStats'])
    if (!object(a[key])) throw new Error('계정 상세 정보가 올바르지 않습니다.');
  for (const key of ['ownedEmotes', 'equippedEmotes', 'ownedBgs', 'ownedBadges'])
    if (!Array.isArray(a.cosmetics[key]) || !a.cosmetics[key].every(v => safeText(v) || (key === 'equippedEmotes' && v === null)))
      throw new Error('꾸미기 정보가 올바르지 않습니다.');
  if (!safeText(a.selectedCharacter) || !a.ownedCharacters.includes(a.selectedCharacter)) throw new Error('선택 캐릭터가 올바르지 않습니다.');
  return a;
}
export function storeImportedAccount(account, local, session) {
  const keys = ['skullCreekAccounts', 'skullCreekAccount'];
  const old = keys.map(key => local.getItem(key));
  const activeKey = 'skullCreekActiveAccountId';
  const oldActive = session.getItem(activeKey);
  const accounts = JSON.parse(old[0] || '{}');
  if (!object(accounts)) throw new Error('저장된 계정 목록을 읽을 수 없습니다.');
  if (Object.hasOwn(accounts, account.id) || (old[1] && JSON.parse(old[1]).id === account.id))
    throw new Error('같은 아이디의 계정이 이미 있습니다. 기존 기록을 보호하기 위해 가져오기를 취소했습니다.');
  try {
    local.setItem(keys[0], JSON.stringify({ ...accounts, [account.id]: account }));
    local.setItem(keys[1], JSON.stringify(account));
    session.setItem(activeKey, account.id);
  } catch {
    const restore = (storage, key, value) => { try { if (value === null) storage.removeItem(key); else storage.setItem(key, value); } catch {} };
    keys.forEach((key, i) => restore(local, key, old[i]));
    restore(session, activeKey, oldActive);
    throw new Error('계정을 저장하지 못했습니다. 브라우저 저장 공간을 확인하세요.');
  }
}
