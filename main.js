/* ═══════════════════════════════════════════════════════════════
   RESTAURANT NET — main.js (v5.5 signature pass)
   Preloader · znaková typografie · WebGL video shader · Lenis ·
   velocity marquee/skew · custom kurzor · footer opona
   ═══════════════════════════════════════════════════════════════ */

document.documentElement.classList.add('js');

// Obnova scrollu po reloadu rozbíjí měření ScrollTriggeru — u one-pageru
// chceme po reloadu start nahoře.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
if (!location.hash) window.scrollTo(0, 0);

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE_POINTER = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if (window.gsap) gsap.registerPlugin(ScrollTrigger);

/* ─── Lenis smooth scroll + sdílená velocity ─────────────────────── */
let lenis = null;
let scrollVelocity = 0; // px/frame, kladná = dolů

if (window.Lenis && window.gsap && !REDUCED) {
  lenis = new Lenis({
    duration: 1.1,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });
  lenis.on('scroll', e => {
    scrollVelocity = e.velocity;
    ScrollTrigger.update();
  });
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

/* ─── Titulek: rozklad na slova a znaky ──────────────────────────── */
function splitChars(lineEl) {
  const text = lineEl.textContent;
  lineEl.setAttribute('aria-hidden', 'true');
  lineEl.textContent = '';
  text.split(' ').forEach((word, wi, arr) => {
    const w = document.createElement('span');
    w.className = 'word';
    for (const ch of word) {
      const c = document.createElement('span');
      c.className = 'ch';
      c.textContent = ch;
      w.appendChild(c);
    }
    lineEl.appendChild(w);
    if (wi < arr.length - 1) lineEl.appendChild(document.createTextNode(' '));
  });
}

const heroH1 = document.querySelector('.hero__headline');
if (heroH1 && window.gsap && !REDUCED) {
  heroH1.setAttribute('aria-label', heroH1.textContent.trim().replace(/\s+/g, ' '));
  heroH1.querySelectorAll('.line').forEach(splitChars);
  // řádky odkrýt (choreografii přebírají znaky), znaky schovat pod masku
  gsap.set(heroH1.querySelectorAll('.line'), { y: 0 });
  gsap.set('.hero__headline .ch', { yPercent: 120, rotate: 5 });
}

/* ─── Hero intro (spouští preloader) ─────────────────────────────── */
function heroIntro() {
  if (REDUCED || !window.gsap) return;
  ScrollTrigger.refresh();
  gsap.timeline()
    .to('.hero__headline .ch', {
      yPercent: 0,
      rotate: 0,
      duration: 1.25,
      stagger: 0.022,
      ease: 'expo.out',
    })
    .to('.hero .reveal', {
      opacity: 1,
      y: 0,
      duration: 1,
      stagger: 0.1,
      ease: 'expo.out',
    }, '-=0.95');
}

/* ─── Preloader ──────────────────────────────────────────────────── */
const loader = document.getElementById('loader');
if (!loader || REDUCED || !window.gsap) {
  if (loader) loader.classList.add('is-done');
  heroIntro();
} else if (sessionStorage.getItem('loaderSeen')) {
  gsap.timeline()
    .to(loader, { yPercent: -100, duration: .65, ease: 'expo.inOut', delay: .1 })
    .add(() => { loader.classList.add('is-done'); }, '-=0.3')
    .add(heroIntro, '-=0.55');
} else {
  sessionStorage.setItem('loaderSeen', '1');
  const count = document.getElementById('loaderCount');
  const bar = document.getElementById('loaderBar');
  const prog = { v: 0 };
  gsap.timeline()
    .to('.loader__name .line', { y: 0, duration: .9, ease: 'expo.out' }, 0.05)
    .to(prog, {
      v: 100,
      duration: 1.25,
      ease: 'power2.inOut',
      onUpdate: () => {
        count.textContent = Math.round(prog.v);
        bar.style.transform = `scaleX(${prog.v / 100})`;
      },
    }, 0)
    .to([count, bar, '.loader__name'], { opacity: 0, duration: .3, ease: 'power2.out' })
    .to(loader, { yPercent: -100, duration: .85, ease: 'expo.inOut' }, '-=0.05')
    .add(() => { loader.classList.add('is-done'); }, '-=0.35')
    .add(heroIntro, '-=0.75');
}

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

/* ─── Dnešní datum + denní režim CTA ─────────────────────────────── */
const dny = ['neděle', 'pondělí', 'úterý', 'středa', 'čtvrtek', 'pátek', 'sobota'];
const dnyKratce = { 0: 'Ne', 1: 'Po', 2: 'Út', 3: 'St', 4: 'Čt', 5: 'Pá', 6: 'So' };
const mesice = ['ledna', 'února', 'března', 'dubna', 'května', 'června',
  'července', 'srpna', 'září', 'října', 'listopadu', 'prosince'];
const dnes = new Date();
document.getElementById('todayDate').textContent =
  `${dny[dnes.getDay()]} ${dnes.getDate()}. ${mesice[dnes.getMonth()]} ${dnes.getFullYear()}`;

// večer má přednost rezervace, přes den polední menu
const hodina = dnes.getHours();
if (hodina >= 15 || hodina < 5) {
  const ctas = document.querySelectorAll('.hero__ctas .btn');
  if (ctas.length === 2) {
    ctas[0].classList.replace('btn--ink', 'btn--line');
    ctas[1].classList.replace('btn--line', 'btn--ink');
  }
}

/* ─── Polední menu: přepínání dnů + ghost písmena ────────────────── */
const weekly = document.getElementById('weeklyMenu');
if (weekly) {
  const tabs = weekly.querySelectorAll('.daytab');
  const panels = weekly.querySelectorAll('.daypanel');
  const ghost = document.getElementById('weeklyGhost');

  const activate = (day, animate = true) => {
    tabs.forEach(t => {
      const active = t.dataset.day === String(day);
      t.classList.toggle('is-active', active);
      t.setAttribute('aria-selected', active);
    });
    panels.forEach(p => p.classList.toggle('is-active', p.dataset.day === String(day)));
    if (ghost) ghost.textContent = dnyKratce[day] || '';

    if (animate && !REDUCED && window.gsap) {
      const panel = weekly.querySelector(`.daypanel[data-day="${day}"]`);
      const items = panel.querySelectorAll('.dish, .daypanel__soup, .daypanel__closed-title, .daypanel__closed-text');
      gsap.fromTo(items,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: .5, stagger: 0.03, ease: 'power3.out', overwrite: true, clearProps: 'all' });
      if (ghost) gsap.fromTo(ghost, { opacity: 0, x: 60 }, { opacity: 1, x: 0, duration: .8, ease: 'expo.out' });
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

/* ═══ GSAP scroll choreografie ═══════════════════════════════════ */
if (window.gsap && !REDUCED) {

  /* reveal — vstupy sekcí (hero řeší intro) */
  gsap.utils.toArray('.reveal').forEach(el => {
    if (el.closest('.hero')) return;
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 1.1,
      ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  /* řádky titulku se při scrollu smýkají od sebe */
  gsap.to('.hero__headline .mask:nth-child(1)', {
    x: '-5vw',
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: '60% top', scrub: true },
  });
  gsap.to('.hero__headline .mask:nth-child(2)', {
    x: '5vw',
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: '60% top', scrub: true },
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
          scrollTrigger: { trigger: '#heroMedia', start: 'top 78%', end: 'top 12%', scrub: 0.5 },
        });
      return () => { tween.scrollTrigger && tween.scrollTrigger.kill(); tween.kill(); };
    });
    mm.add('(max-width: 900px)', () => {
      const tween = gsap.fromTo(heroClip,
        { clipPath: 'inset(0% 4% round 20px)' },
        {
          clipPath: 'inset(0% 0% round 0px)',
          ease: 'none',
          scrollTrigger: { trigger: '#heroMedia', start: 'top 80%', end: 'top 20%', scrub: 0.5 },
        });
      return () => { tween.scrollTrigger && tween.scrollTrigger.kill(); tween.kill(); };
    });
  }

  /* fotky — vnitřní parallax + skew podle setrvačnosti */
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

  const photos = gsap.utils.toArray('.photo');
  if (photos.length) {
    const skewSetters = photos.map(p => gsap.quickTo(p, 'skewY', { duration: 0.4, ease: 'power2.out' }));
    gsap.ticker.add(() => {
      const skew = gsap.utils.clamp(-3.5, 3.5, scrollVelocity / 22);
      skewSetters.forEach(set => set(skew));
    });
  }

  /* marquee — rychlost i směr řídí scroll */
  const track = document.getElementById('marqueeTrack');
  if (track) {
    const part = track.querySelector('.marquee__part');
    for (let i = 0; i < 3; i++) track.appendChild(part.cloneNode(true));
    const loop = gsap.to(track, { xPercent: -25, duration: 22, ease: 'none', repeat: -1 });
    gsap.ticker.add(() => {
      const target = gsap.utils.clamp(-4, 4,
        1 + scrollVelocity / 12) || 1;
      loop.timeScale(gsap.utils.interpolate(loop.timeScale(), target, 0.08));
    });
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

/* ─── Footer opona ───────────────────────────────────────────────── */
(function footerCurtain() {
  if (REDUCED) return;
  const footer = document.querySelector('.footer');
  const main = document.querySelector('main');
  if (!footer || !main) return;

  function apply() {
    const h = footer.offsetHeight;
    if (h < innerHeight * 0.92) {
      document.documentElement.classList.add('footer-fx');
      main.style.marginBottom = h + 'px';
    } else {
      document.documentElement.classList.remove('footer-fx');
      main.style.marginBottom = '';
    }
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }
  // až po fontech, ať sedí výška
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(apply);
  else apply();
  addEventListener('resize', apply);
})();

/* ─── Custom kurzor ──────────────────────────────────────────────── */
if (FINE_POINTER && !REDUCED && window.gsap) {
  const dot = document.getElementById('cursor');
  const ring = document.getElementById('cursorRing');
  document.documentElement.classList.add('has-cursor');

  const dotX = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power2.out' });
  const dotY = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power2.out' });
  const ringX = gsap.quickTo(ring, 'x', { duration: 0.35, ease: 'power3.out' });
  const ringY = gsap.quickTo(ring, 'y', { duration: 0.35, ease: 'power3.out' });

  let shown = false;
  addEventListener('pointermove', e => {
    if (!shown) { shown = true; gsap.to([dot, ring], { opacity: 1, duration: .3 }); }
    dotX(e.clientX); dotY(e.clientY);
    ringX(e.clientX); ringY(e.clientY);
  }, { passive: true });
  document.addEventListener('mouseleave', () => {
    shown = false;
    gsap.to([dot, ring], { opacity: 0, duration: .3 });
  });

  const grow = () => gsap.to(ring, { scale: 1.9, duration: .35, ease: 'power3.out' });
  const shrink = () => gsap.to(ring, { scale: 1, duration: .35, ease: 'power3.out' });
  document.querySelectorAll('a, button, .daytab, input, textarea, label').forEach(el => {
    el.addEventListener('pointerenter', grow);
    el.addEventListener('pointerleave', shrink);
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
