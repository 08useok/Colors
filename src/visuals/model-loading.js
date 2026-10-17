// A dedicated manager tracks character models and their dependent textures.
// Two rendered frames after completion let loader callbacks attach posed models.
export function createModelLoadingScreen(manager) {
  const screen = document.getElementById('model-loading-screen');
  const label = screen.querySelector('[data-model-loading-label]');
  const progress = screen.querySelector('progress');
  const detail = screen.querySelector('[data-model-loading-detail]');
  const retry = screen.querySelector('button');
  let generation = 0, pending = false, failed = false, startupReady = false;
  const english = () => document.documentElement.lang === 'en';
  const preparing = () => english() ? 'Preparing character models…' : '캐릭터 모델을 준비하는 중…';
  function show() {
    generation++;
    screen.hidden = false;
    screen.setAttribute('aria-busy', 'true');
    document.documentElement.classList.add('model-loading');
    if (!failed) { label.textContent = preparing(); retry.hidden = true; }
  }
  function finish() {
    const token = ++generation;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (token !== generation || !startupReady || pending || failed) return;
      screen.hidden = true;
      screen.setAttribute('aria-busy', 'false');
      document.documentElement.classList.remove('model-loading');
    }));
  }
  function setProgress(percent) {
    progress.max = 100; progress.value = percent;
    if (!failed) detail.textContent = `${percent}%`;
  }
  manager.onStart = () => { pending = true; show(); setProgress(0); };
  manager.onProgress = (_url, loaded, total) => {
    // Only the manager's completion callback can declare all assets ready.
    setProgress(Math.max(0, Math.min(99, Math.floor(loaded / Math.max(1, total) * 100))));
    if (!failed) {
      label.textContent = preparing();
      progress.setAttribute('aria-label', english() ? 'Model loading progress' : '모델 준비 진행률');
    }
  };
  manager.onLoad = () => { pending = false; if (!failed) setProgress(100); finish(); };
  manager.onError = url => {
    failed = true; show();
    label.textContent = english() ? 'Could not load the character model.' : '캐릭터 모델을 불러오지 못했습니다.';
    detail.textContent = decodeURIComponent(url.split('/').pop().split('?')[0]);
    retry.textContent = english() ? 'Retry' : '다시 시도'; retry.hidden = false;
  };
  retry.addEventListener('click', () => location.reload());
  // Prevent keyboard attacks/movement underneath the overlay; keep retry and reload usable.
  window.addEventListener('keydown', event => {
    if (screen.hidden || event.ctrlKey || event.metaKey || event.altKey || ['Tab','Enter'].includes(event.key)) return;
    event.preventDefault(); event.stopImmediatePropagation();
  }, true);
  // Bootstrap must register its preload requests before the first reveal.
  show(); setProgress(0);
  return { manager, ready() { startupReady = true; finish(); }, get blocking() { return !screen.hidden; } };
}
