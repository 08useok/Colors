import { DOM } from "./LANGS/dom-core.js";
import { G } from "./shared.js";

const ACCOUNT_KEY = "skullCreekAccount";

export function loadAccount() {
  try {
    const raw = localStorage.getItem(ACCOUNT_KEY);
    if (!raw) return null;
    const account = JSON.parse(raw);
    if (!account.charStats) {
      account.charStats = {
        red: { wins: 0, games: 0 },
        green: { wins: 0, games: 0 },
        blue: { wins: 0, games: 0 },
        orange: { wins: 0, games: 0 },
      };
    }
    if (account.winStreak === undefined) account.winStreak = 0;
    if (account.bestStreak === undefined) account.bestStreak = 0;
    if (!account.lang) account.lang = "ko";
    return account;
  } catch {
    return null;
  }
}

export function saveAccount(account) {
  try {
    localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
  } catch {}
}

export function getTodayString() {
  return new Date().toISOString().slice(0, 10);
}

export function isLoginDoneToday(account) {
  return account.lastLoginDate === getTodayString();
}

export function getLoginAttemptsToday(account) {
  if (account.lastLoginDate !== getTodayString()) return 0;
  return account.loginAttempts ?? 0;
}

export function isLockedToday(account) {
  return getLoginAttemptsToday(account) >= 5;
}

export function createAccount(id, nickname, currentLang) {
  const account = {
    id, nickname, trophies: 0, wins: 0, losses: 0,
    selectedCharacter: "red",
    lastLoginDate: getTodayString(),
    loginAttempts: 0,
    charStats: {
      red: { wins: 0, games: 0 },
      green: { wins: 0, games: 0 },
      blue: { wins: 0, games: 0 },
    },
    winStreak: 0, bestStreak: 0, lang: currentLang,
  };
  saveAccount(account);
  return account;
}

export function calcLevel(trophies) {
  return Math.floor(trophies / 300) + 1;
}

export function calcTrophyChange(rank) {
  return 12 - rank * 2;
}

export function streakBonus(streak) {
  if (streak <= 1) return 0;
  return Math.min(streak - 1, 4);
}

export function recordGameResult(rank) {
  const account = loadAccount();
  if (!account) return { streakBefore: 0, streakAfter: 0, bonus: 0, milestone: false };

  const char = account.selectedCharacter;
  const prevStreak = account.winStreak;
  let bonus = 0;
  let milestone = false;

  account.charStats[char].games += 1;
  if (rank <= 4) {
    account.wins += 1;
    account.charStats[char].wins += 1;
    account.winStreak += 1;
    if (account.winStreak > account.bestStreak) account.bestStreak = account.winStreak;
    bonus = streakBonus(account.winStreak);
    if (account.charStats[char].wins > 0 && account.charStats[char].wins % 100 === 0) {
      account.trophies += 50;
      milestone = true;
    }
  } else {
    account.losses += 1;
    account.winStreak = 0;
  }

  const delta = calcTrophyChange(rank);
  account.trophies = Math.max(0, account.trophies + delta + bonus);
  saveAccount(account);
  return { streakBefore: prevStreak, streakAfter: account.winStreak, bonus, milestone };
}

export function updateLobbyUI(account, t) {
  const { lobbyNickname, lobbyLevel, lobbyTrophies, lobbyRecord, lobbyWinrate } = DOM;
  lobbyNickname.textContent = account.nickname;
  lobbyLevel.textContent = `Lv.${calcLevel(account.trophies)}`;
  lobbyTrophies.textContent = account.trophies;
  lobbyRecord.textContent = t("record", account.wins, account.losses);
  if (lobbyWinrate) {
    const totalGames = account.wins + account.losses;
    const rate = totalGames === 0 ? 0 : Math.round((account.wins / totalGames) * 100);
    lobbyWinrate.textContent = t("winrate", rate, account.wins, totalGames);
  }

  const bestRecordEl = document.getElementById("lobby-best-record");
  if (bestRecordEl) bestRecordEl.textContent = t("bestStreakLabel", account.bestStreak);

  for (const char of ["red", "green", "blue", "orange"]) {
    const el = document.getElementById(`winrate-${char}`);
    if (!el) continue;
    const s = account.charStats[char];
    if (s.games === 0) { el.textContent = t("firstGame"); }
    else {
      const rate = Math.round((s.wins / s.games) * 100);
      el.textContent = t("winrate", rate, s.wins, s.games);
    }
  }

  const streakEl = document.getElementById("streak-display");
  if (streakEl) {
    if (account.winStreak >= 2) {
      streakEl.textContent = t("streak", account.winStreak);
      streakEl.classList.remove("hidden");
    } else {
      streakEl.classList.add("hidden");
    }
  }

  document.querySelectorAll(".char-btn").forEach((btn) => {
    btn.classList.toggle("selected", btn.dataset.char === account.selectedCharacter);
  });
  G.state.selectedCharacter = account.selectedCharacter;
}

export function showDailyLogin(account, t) {
  const { dailyLoginNickname, dailyLoginLevel, dailyIdInput, dailyLoginError,
    accountRecoveryInfo, dailyLoginBtn, accountRecoveryBtn } = DOM;
  dailyLoginNickname.textContent = account.nickname;
  dailyLoginLevel.textContent = `Lv.${calcLevel(account.trophies)}`;
  dailyIdInput.value = "";
  dailyLoginError.style.display = "none";
  dailyLoginError.textContent = "";
  accountRecoveryInfo.style.display = "none";

  if (account.lastLoginDate !== getTodayString()) {
    account.loginAttempts = 0;
    saveAccount(account);
  }

  const locked = isLockedToday(account);
  dailyIdInput.disabled = locked;
  dailyLoginBtn.disabled = locked;
  accountRecoveryBtn.style.display = locked ? "block" : "none";

  if (locked) {
    dailyLoginError.textContent = t("loginExceeded");
    dailyLoginError.style.display = "block";
  }

  setTimeout(() => { if (!locked) dailyIdInput.focus(); }, 50);
}

export function showLobby(t, setLanguage, currentLang) {
  const { messageOverlay, resultOverlay, mapNameEl, accountCreation,
    lobbyMain, dailyLogin, idInput, nicknameInput, createAccountBtn } = DOM;
  messageOverlay.style.display = "flex";
  resultOverlay.style.display = "none";
  mapNameEl.classList.add("hidden");
  const sidePanel = document.getElementById("lobby-side-panel");
  const account = loadAccount();

  if (!account || !account.id) {
    accountCreation.classList.remove("hidden");
    lobbyMain.classList.add("hidden");
    dailyLogin.classList.add("hidden");
    sidePanel.classList.add("hidden");
    idInput.value = "";
    nicknameInput.value = "";
    createAccountBtn.disabled = true;
    setTimeout(() => idInput.focus(), 50);
  } else if (isLoginDoneToday(account)) {
    accountCreation.classList.add("hidden");
    lobbyMain.classList.remove("hidden");
    dailyLogin.classList.add("hidden");
    sidePanel.classList.remove("hidden");
    if (account.lang && account.lang !== currentLang) setLanguage(account.lang);
    updateLobbyUI(account, t);
  } else {
    accountCreation.classList.add("hidden");
    lobbyMain.classList.add("hidden");
    dailyLogin.classList.remove("hidden");
    sidePanel.classList.add("hidden");
    showDailyLogin(account, t);
  }
}
