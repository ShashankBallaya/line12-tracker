/**
 * Refreshes the "days to the reported target" figure in the reader's browser.
 * The target date comes from project.json (target_completion.countdown_date), in IST.
 */
const el = document.querySelector<HTMLElement>('[data-countdown]');
const value = el?.querySelector<HTMLElement>('[data-countdown-value]');

if (el && value) {
  const target = Date.parse(`${el.dataset.countdown}T23:59:59+05:30`);
  const days = Math.max(0, Math.ceil((target - Date.now()) / 86_400_000));
  value.textContent = days.toLocaleString('en-IN');
}
