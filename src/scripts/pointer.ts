/**
 * Mouse-only details: a cursor ring that follows the pointer (the system cursor stays visible)
 * and magnetic pull on [data-magnetic] buttons. Off for touch, coarse pointers and reduced motion.
 */
const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (fine && !reduced) {
  const ring = document.createElement('div');
  ring.className = 'cursor-ring';
  ring.setAttribute('aria-hidden', 'true');
  document.body.appendChild(ring);

  let x = -100;
  let y = -100;
  let rx = -100;
  let ry = -100;
  let raf = 0;
  const tick = () => {
    rx += (x - rx) * 0.22;
    ry += (y - ry) * 0.22;
    ring.style.transform = `translate(${rx}px, ${ry}px)`;
    raf = Math.abs(x - rx) + Math.abs(y - ry) > 0.3 ? requestAnimationFrame(tick) : 0;
  };
  window.addEventListener(
    'pointermove',
    (e) => {
      x = e.clientX;
      y = e.clientY;
      ring.classList.add('is-on');
      if (!raf) raf = requestAnimationFrame(tick);
      const hot = (e.target as Element).closest('a, button, select, input[type="range"], [data-magnetic], canvas');
      ring.classList.toggle('is-hot', Boolean(hot));
    },
    { passive: true },
  );
  document.addEventListener('pointerleave', () => ring.classList.remove('is-on'));

  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${dx * 0.22}px, ${dy * 0.32}px)`;
    });
    el.addEventListener('pointerleave', () => (el.style.transform = ''));
  });
}

export {};
