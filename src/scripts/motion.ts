/**
 * Motion for the whole page, orchestrated in one place.
 *   - Lenis smooth scroll, driven by GSAP's ticker so ScrollTrigger stays in sync.
 *   - Headline reveal (SplitText), counters and progress bars on first view.
 *   - The route ride and the timeline scrub (wide screens only).
 * With prefers-reduced-motion nothing here runs: every section is already fully
 * readable in its base state, so the page stays complete.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let lenisRef: Lenis | null = null;

if (!reduceMotion) {
  gsap.registerPlugin(ScrollTrigger, SplitText);

  // ---------- Smooth scroll ----------
  const lenis = new Lenis({ lerp: 0.12 });
  lenisRef = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // ---------- Headline reveal ----------
  document.fonts.ready.then(() => {
    document.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
      SplitText.create(el, {
        type: 'lines',
        mask: 'lines',
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, { yPercent: 105, duration: 1.1, ease: 'expo.out', stagger: 0.12, delay: 0.1 }),
      });
    });
  });

  // ---------- Counters: the final value is already in the DOM; we count up to it ----------
  document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    const end = Number(el.dataset.count);
    const decimals = Number(el.dataset.decimals ?? 0);
    const state = { v: 0 };
    const fmt = (v: number) => v.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: () =>
        gsap.to(state, {
          v: end,
          duration: 1.4,
          ease: 'expo.out',
          onUpdate: () => (el.textContent = fmt(state.v)),
          onComplete: () => (el.textContent = fmt(end)),
        }),
    });
  });

  // ---------- Progress bars grow from the left on first view ----------
  gsap.utils.toArray<HTMLElement>('[data-grow]').forEach((bar) => {
    gsap.from(bar, {
      scaleX: 0,
      duration: 1.2,
      ease: 'expo.out',
      scrollTrigger: { trigger: bar, start: 'top 90%', once: true },
    });
  });

  // ---------- Wide screens: the ride and the timeline scrub ----------
  const mm = gsap.matchMedia();
  let rideTrigger: ScrollTrigger | null = null;

  mm.add('(min-width: 64rem)', () => {
    rideTrigger = setUpRide();
    const tl = setUpTimeline();
    return () => {
      rideTrigger?.kill();
      rideTrigger = null;
      tl?.scrollTrigger?.kill();
      tl?.kill();
      document.querySelector('[data-ride]')?.classList.remove('is-riding');
      document.querySelector('[data-timeline]')?.classList.remove('is-scrubbing');
    };
  });

  // ---------- In-page links go through Lenis (and into the ride when it is pinned) ----------
  document.addEventListener('click', (event) => {
    const link = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute('href')!.slice(1);
    const target = id ? document.getElementById(id) : null;
    if (!target) return;
    event.preventDefault();

    const stationIndex = target.dataset.rideStation;
    if (rideTrigger && stationIndex !== undefined) {
      const count = document.querySelectorAll('[data-ride-station]').length;
      const y = rideTrigger.start + (Number(stationIndex) / (count - 1)) * (rideTrigger.end - rideTrigger.start);
      lenis.scrollTo(y + 1);
    } else {
      lenis.scrollTo(target, { offset: -8 });
    }
    history.replaceState(null, '', `#${id}`);
    if (target === document.getElementById('main') || id === 'main') target.focus?.();
  });
}

/** Pins the route and moves the train along the station positions as the reader scrolls. */
function setUpRide(): ScrollTrigger | null {
  const section = document.querySelector<HTMLElement>('[data-ride]');
  const stage = section?.querySelector<HTMLElement>('[data-ride-stage]');
  const train = section?.querySelector<HTMLElement>('[data-ride-train]');
  if (!section || !stage || !train) return null;

  const stations = [...section.querySelectorAll<HTMLElement>('[data-ride-station]')];
  const ticks = [...section.querySelectorAll<HTMLElement>('[data-ride-tick]')];
  const xs = stations.map((s) => parseFloat(getComputedStyle(s).getPropertyValue('--x')));
  section.classList.add('is-riding');

  let current = -1;
  const setCurrent = (i: number) => {
    if (i === current) return;
    current = i;
    stations.forEach((s, j) => s.classList.toggle('is-current', j === i));
    ticks.forEach((t, j) => {
      t.classList.toggle('is-current', j === i);
      t.classList.toggle('is-passed', j < i);
    });
  };
  setCurrent(0);

  const trigger = ScrollTrigger.create({
    trigger: stage,
    start: 'top top',
    end: () => `+=${window.innerHeight * 0.55 * (stations.length - 1)}`,
    pin: true,
    scrub: true,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      const f = self.progress * (stations.length - 1);
      const a = Math.floor(f);
      const b = Math.min(a + 1, stations.length - 1);
      const x = xs[a] + (xs[b] - xs[a]) * (f - a);
      train.style.left = `${x}%`;
      setCurrent(Math.round(f));
    },
  });

  // Keyboard users tabbing into a station's links ride to that station.
  const onFocus = (event: FocusEvent) => {
    const station = (event.target as Element).closest<HTMLElement>('[data-ride-station]');
    if (!station) return;
    const i = Number(station.dataset.rideStation);
    const y = trigger.start + (i / (stations.length - 1)) * (trigger.end - trigger.start);
    lenisRef?.scrollTo(y + 1, { immediate: true });
    setCurrent(i);
  };
  section.addEventListener('focusin', onFocus);
  const kill = trigger.kill.bind(trigger);
  trigger.kill = (...args) => {
    section.removeEventListener('focusin', onFocus);
    return kill(...args);
  };
  return trigger;
}

/** Pins the timeline and slides the strip sideways as the reader scrolls. */
function setUpTimeline(): gsap.core.Tween | null {
  const section = document.querySelector<HTMLElement>('[data-timeline]');
  const strip = section?.querySelector<HTMLElement>('[data-timeline-strip]');
  if (!section || !strip) return null;
  section.classList.add('is-scrubbing');

  const distance = () => Math.max(0, strip.scrollWidth - window.innerWidth);
  return gsap.to(strip, {
    x: () => -distance(),
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: () => `+=${distance()}`,
      pin: true,
      scrub: 0.6,
      invalidateOnRefresh: true,
    },
  });
}
