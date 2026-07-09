/* ═══════════════════════════════════════════════════════════════
   RESTAURANT NET — main.js (v5)
   Lenis smooth-scroll · GSAP choreografie · maskované titulky ·
   roztahující se hero video · marquee · magnetická tlačítka
   ═══════════════════════════════════════════════════════════════ */

document.documentElement.classList.add('js');

// Obnova scrollu po reloadu rozbíjí měření ScrollTriggeru — u one-pageru
// chceme po reloadu start nahoře.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
if (!location.hash) window.scrollTo(0, 0);

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE_POINTER = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if (window.gsap) gsap.registerPlugin(ScrollTrigger);

/* ─── Lenis smooth scroll ────────────────────────────────────────── */
let lenis = null;
if (window.Lenis && window.gsap && !REDUCED) {
  lenis = new Lenis({
    duration: 1.1,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(time => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

function scrollToTarget(target) {
  const offset = -(document.getElementById('nav').offsetHeight + 12);
  if (lenis) lenis.scrollTo(target, { offset, duration: 1.2 });
  else {
    const top = target.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top, behavior: REDUCED ? 'auto' : 'smooth' });
  }
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    scrollToTarget(target);
  });
});

/* ─── Navigace: scroll stav + hamburger + scroll-spy ─────────────── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  hamburger.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', open);
});
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

const navLinkEls = document.querySelectorAll('.nav__link');
const spySections = Array.from(navLinkEls)
  .map(a => document.querySelector(a.getAttribute('href')))
  .filter(Boolean);

function setActiveLink() {
  const fromTop = window.scrollY + nav.offsetHeight + 40;
  let current = null;
  spySections.forEach(sec => { if (sec.offsetTop <= fromTop) current = sec; });
  navLinkEls.forEach(a => {
    a.classList.toggle('is-active', current && a.getAttribute('href') === '#' + current.id);
  });
}
window.addEventListener('scroll', setActiveLink, { passive: true });
setActiveLink();

/* ─── Dnešní datum česky ─────────────────────────────────────────── */
const dny = ['neděle', 'pondělí', 'úterý', 'středa', 'čtvrtek', 'pátek', 'sobota'];
const mesice = ['ledna', 'února', 'března', 'dubna', 'května', 'června',
  'července', 'srpna', 'září', 'října', 'listopadu', 'prosince'];
const dnes = new Date();
document.getElementById('todayDate').textContent =
  `${dny[dnes.getDay()]} ${dnes.getDate()}. ${mesice[dnes.getMonth()]} ${dnes.getFullYear()}`;

/* ─── Polední menu: přepínání dnů ────────────────────────────────── */
const weekly = document.getElementById('weeklyMenu');
if (weekly) {
  const tabs = weekly.querySelectorAll('.daytab');
  const panels = weekly.querySelectorAll('.daypanel');

  const activate = (day, animate = true) => {
    tabs.forEach(t => {
      const active = t.dataset.day === String(day);
      t.classList.toggle('is-active', active);
      t.setAttribute('aria-selected', active);
    });
    panels.forEach(p => p.classList.toggle('is-active', p.dataset.day === String(day)));

    if (animate && !REDUCED && window.gsap) {
      const panel = weekly.querySelector(`.daypanel[data-day="${day}"]`);
      const items = panel.querySelectorAll('.dish, .daypanel__soup, .daypanel__closed-title, .daypanel__closed-text');
      gsap.fromTo(items,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: .5, stagger: 0.03, ease: 'power3.out', overwrite: true, clearProps: 'all' });
    }
  };

  const availableDays = Array.from(tabs).map(t => t.dataset.day);
  const startDay = availableDays.includes(String(dnes.getDay())) ? dnes.getDay() : availableDays[0];
  activate(startDay, false);

  tabs.forEach(t => t.addEventListener('click', () => activate(t.dataset.day)));
}

/* ─── Hero video: fade-in + úspora energie ───────────────────────── */
const heroVideo = document.getElementById('heroVideo');
if (heroVideo) {
  const showVideo = () => heroVideo.classList.add('is-ready');
  heroVideo.addEventListener('canplay', showVideo, { once: true });
  heroVideo.addEventListener('playing', showVideo, { once: true });
  heroVideo.addEventListener('loadeddata', showVideo, { once: true });
  setTimeout(showVideo, 1800);
  if (heroVideo.readyState >= 3) showVideo();
  if (!REDUCED) heroVideo.play().catch(() => {});
  else heroVideo.pause();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) heroVideo.pause();
    else if (!REDUCED) heroVideo.play().catch(() => {});
  });
}

/* ═══ GSAP choreografie ══════════════════════════════════════════ */
if (window.gsap && !REDUCED) {

  /* hero: maskované řádky titulku + meta/sub/cta */
  gsap.timeline({ delay: 0.15 })
    .to('.hero .mask .line', {
      y: 0,
      duration: 1.3,
      stagger: 0.12,
      ease: 'expo.out',
    })
    .to('.hero .reveal', {
      opacity: 1,
      y: 0,
      duration: 1,
      stagger: 0.1,
      ease: 'expo.out',
    }, '-=0.9');

  /* reveal — vstupy sekcí */
  gsap.utils.toArray('.reveal').forEach(el => {
    if (el.closest('.hero')) return; // hero řeší timeline výše
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 1.1,
      ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  /* hero video se roztáhne na plnou šířku */
  const heroClip = document.getElementById('heroClip');
  if (heroClip) {
    const mm = gsap.matchMedia();
    mm.add('(min-width: 901px)', () => {
      const tween = gsap.fromTo(heroClip,
        { clipPath: 'inset(0% 12% round 20px)' },
        {
          clipPath: 'inset(0% 0% round 0px)',
          ease: 'none',
          scrollTrigger: {
            trigger: '#heroMedia',
            start: 'top 78%',
            end: 'top 12%',
            scrub: 0.5,
          },
        });
      return () => { tween.scrollTrigger && tween.scrollTrigger.kill(); tween.kill(); };
    });
    mm.add('(max-width: 900px)', () => {
      const tween = gsap.fromTo(heroClip,
        { clipPath: 'inset(0% 4% round 20px)' },
        {
          clipPath: 'inset(0% 0% round 0px)',
          ease: 'none',
          scrollTrigger: {
            trigger: '#heroMedia',
            start: 'top 80%',
            end: 'top 20%',
            scrub: 0.5,
          },
        });
      return () => { tween.scrollTrigger && tween.scrollTrigger.kill(); tween.kill(); };
    });
  }

  /* fotky — jemný vnitřní parallax */
  gsap.utils.toArray('[data-parallax]').forEach(img => {
    gsap.fromTo(img, { yPercent: -5, scale: 1.12 }, {
      yPercent: 5,
      scale: 1.12,
      ease: 'none',
      scrollTrigger: {
        trigger: img.closest('.photo') || img,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  });

  /* marquee — nekonečný pás */
  const track = document.getElementById('marqueeTrack');
  if (track) {
    const part = track.querySelector('.marquee__part');
    for (let i = 0; i < 3; i++) track.appendChild(part.cloneNode(true));
    gsap.to(track, { xPercent: -25, duration: 22, ease: 'none', repeat: -1 });
  }

  /* čísla ve faktech */
  gsap.utils.toArray('.fact dt[data-count]').forEach(el => {
    const target = +el.dataset.count;
    const obj = { v: 0 };
    gsap.to(obj, {
      v: target,
      duration: 1.6,
      ease: 'power2.out',
      onUpdate: () => { el.textContent = Math.round(obj.v); },
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });
}

/* ─── Magnetická tlačítka ────────────────────────────────────────── */
if (FINE_POINTER && !REDUCED && window.gsap) {
  document.querySelectorAll('[data-magnetic]').forEach(btn => {
    const strength = 14;
    btn.addEventListener('pointermove', e => {
      const r = btn.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - 0.5) * strength;
      const y = ((e.clientY - r.top) / r.height - 0.5) * strength;
      gsap.to(btn, { x, y, duration: 0.4, ease: 'power3.out' });
    });
    btn.addEventListener('pointerleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'expo.out' });
    });
  });
}
