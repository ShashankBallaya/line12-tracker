/**
 * Night edition / morning edition switch. Saves the choice when storage is allowed;
 * without storage it still works for the current page view.
 */
const root = document.documentElement;
const button = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');
const label = document.querySelector<HTMLElement>('[data-theme-label]');
const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

function current(): 'light' | 'dark' {
  const set = root.dataset.theme;
  if (set === 'light' || set === 'dark') return set;
  return systemDark.matches ? 'dark' : 'light';
}

function render() {
  const theme = current();
  if (label) label.textContent = theme === 'dark' ? 'Morning edition' : 'Night edition';
  button?.setAttribute('aria-pressed', String(theme === 'dark'));
  button?.setAttribute('aria-label', theme === 'dark' ? 'Switch to the light morning edition' : 'Switch to the dark night edition');
}

button?.addEventListener('click', () => {
  const next = current() === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  try {
    localStorage.setItem('l12-theme', next);
  } catch {
    /* storage blocked: the choice lasts for this view only */
  }
  render();
});

systemDark.addEventListener('change', render);
render();
