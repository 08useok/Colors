// 사이트가 도메인 루트가 아니라 하위 경로(GitHub Pages의 /Colors/)에 올라갈 수
// 있으므로, 현재 URL에서 베이스 경로를 뽑아 모든 요청 앞에 붙인다.
const BASE = location.pathname.replace(/\/wiki(\/.*)?$/, "") + "/";
window.__WIKI_BASE__ = BASE;

const response = await fetch(`${BASE}wiki.html`);
if (!response.ok) throw new Error(`Wiki shell failed to load: ${response.status}`);

const source = await response.text();
const parsed = new DOMParser().parseFromString(source, "text/html");
document.body.innerHTML = parsed.body.innerHTML;

// wiki.html은 루트 기준 링크(/wiki/, /index.html)를 쓴다 — 베이스 경로로 다시 쓴다
for (const el of document.querySelectorAll("[href^='/'], [src^='/']")) {
  for (const attr of ["href", "src"]) {
    const value = el.getAttribute(attr);
    if (value && value.startsWith("/") && !value.startsWith("//")) {
      el.setAttribute(attr, BASE + value.slice(1));
    }
  }
}

await import(`${BASE}src/wiki.js?v=1.5.4`);
