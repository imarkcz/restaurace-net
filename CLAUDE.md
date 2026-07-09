# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Co tento projekt je

One-page web pro **Restaurant NET** v centru Uherského Hradiště. Rodinná restaurace, polední menu, salónek pro 60 osob, oslavy a firemní akce.

- **Adresa:** Jindřícha Průchy 310, 686 01 Uherské Hradiště
- **Telefon:** +420 572 552 597
- **Menu zdroj:** https://www.menicka.cz/123-restaurant-net-.html
- **Repo:** https://github.com/imarkcz/restaurace-net (public, `main` branch)
- **Produkce:** https://net2026.vercel.app (auto-deploy z `main` přes Vercel)
- **Autor:** Mark Bobčík

**Strategický a vizuální kontext je v `PRODUCT.md` a `DESIGN.md`** — čti je před každou designovou prací. Klíčová rozhodnutí klienta (07/2026): žádné AI-generované/malované obrazy (jen reálné fotky a video), světlé teplé ladění, moderna úrovně awwwards.

## Tech stack

Čisté **HTML + CSS + vanilla JS**, bez build kroku. CDN závislosti: **GSAP 3.12 + ScrollTrigger**, **Lenis** (smooth-scroll) a **Three.js r149** (WebGL shader hero videa).

| Soubor | Účel |
|---|---|
| `index.html` | Markup celé stránky, CDN skripty na konci `<body>` |
| `style.css` | Všechny styly, sekce oddělené `───` komentáři |
| `main.js` | Lenis, GSAP choreografie, taby menu, nav, marquee, magnetická tlačítka |
| `images/hero.webm` + `hero.mp4` | Reálné video záběry jídla — hero (VP9 primární, H.264 fallback) |
| `images/salonek.webp` · `vstup.webp` | Reálné fotky salónku a vstupu |
| `PRODUCT.md` / `DESIGN.md` | Strategie a vizuální systém (impeccable skill) |

## Příkazy

### Lokální vývoj
```bash
python -m http.server 8080
# → http://localhost:8080, po změnách stačí Ctrl+F5
```

### Deploy
```bash
git add . && git commit -m "popis" && git push   # push na main = auto-deploy (~10 s)
npx vercel deploy --prod --yes                    # manuální deploy, pokud potřeba
```

### Optimalizace videa (při výměně hero videa)
```bash
ffmpeg -i SOURCE.mp4 -an -c:v libx264 -preset slow -crf 26 -pix_fmt yuv420p \
  -movflags +faststart -vf "scale=1280:-2:flags=lanczos,fps=24" images/hero.mp4
ffmpeg -i SOURCE.mp4 -an -c:v libvpx-vp9 -crf 33 -b:v 0 -row-mt 1 \
  -vf "scale=1280:-2:flags=lanczos,fps=24" images/hero.webm
```

### Mazání souborů
**Nikdy `rm`.** Vždy do koše přes PowerShell (pravidlo z globálního `~/CLAUDE.md`):
```powershell
Add-Type -AssemblyName Microsoft.VisualBasic
[Microsoft.VisualBasic.FileIO.FileSystem]::DeleteFile('CESTA','OnlyErrorDialogs','SendToRecycleBin')
```

## Architektura

### `index.html` — mapa sekcí (pořadí je finální)

1. **Nav** — fixed, průhledná → bone blur po scrollu (`.scrolled`), scroll-spy `.is-active`, pill CTA s telefonem
2. **Hero** (`#uvod`) — meta řádek, maskovaný Gloock titulek (řádek 2 paprika), sub + pill CTAs, video okno které se scrollem roztáhne na full-bleed (`clip-path` scrub)
3. **Marquee** — ink pás s nekonečným textovým loopem
4. **Polední menu** (`#denni-menu`) — pill taby dnů (`data-day`, default dnešek přes `getDay()`), panely St/Čt/Pá/So/Ne (Pá+Ne zavřeno), data hardcoded z menicka.cz
5. **Salónek** (`#oslavy`) — sticky fotka + parametry + poptávkový formulář (`action="#"`, TODO backend)
6. **Jídelní lístek** (`#jidelni-listek`) — 5 kategorií, typografická karta, CSS columns
7. **Recenze** (`#recenze`) — 3 velké Gloock citace, prostřední zarovnaná vpravo
8. **O nás** (`#o-nas`) — text + fakty (čísla se dopočítávají) + fotka vstupu
9. **Kontakt** (`#kontakt`) — telefon/WhatsApp řádky, adresa, hodiny, Google Maps iframe (sepia filtr)
10. **Footer** — ink, obří Gloock wordmark, 3 sloupce, credit

### `main.js` — bloky

Scroll-restoration fix (manual + top) → Lenis + ScrollTrigger (sdílená `scrollVelocity`) → smooth anchor scroll → rozpad hero titulku na znaky → **preloader** (counter + opona, sessionStorage skip) → nav (scrolled/hamburger/scroll-spy) → české datum + **denní režim CTA** (po 15 h primární rezervace) → taby menu (stagger + ghost písmena dne) → hero video fade-in → **WebGL shader hero videa** (Three.js, jen desktop, IO pauza) → GSAP: `.reveal`, smyk řádků titulku, clip-path expand, parallax + velocity skew fotek, velocity marquee, čísla faktů → **footer opona** (fixed + margin-bottom) → **custom kurzor** (blend-difference) → magnetická tlačítka.

Detailní popis efektů: DESIGN.md sekce Motion.

**Pozor:** ScrollTrigger se nesmí inicializovat během obnovy scroll pozice — proto `history.scrollRestoration = 'manual'` hned na začátku. Neodstraňovat.

## Design systém (detail v DESIGN.md)

- Barvy: `--bone #F5EFE4` · `--bone-2 #ECE4D3` · `--ink #211B12` · `--paprika #B84A22` · `--moss #5E7050` — **neměnit bez konzultace**
- Typografie: **Gloock** (display) + **Schibsted Grotesk** (UI/text), Google Fonts latin-ext
- Easing: expo.out / power3.out; žádný linear (mimo scrub), bounce, elastic
- Tlačítka pill, fotky radius 20, jemné teplé stíny

## Pravidla (NEPORUŠOVAT)

1. **Jen reálné fotky/video z restaurace** — žádné AI-generované, malované či stock obrazy jídla (rozhodnutí klienta 07/2026)
2. **Žádné emoji v UI** — ikony jen inline SVG
3. **Žádné em-dash v textech** — dvojtečka, čárka, tečka nebo ·
4. **Světlé ladění** — tmavé jsou jen marquee a footer; celoplošně tmavý design klient odmítl
5. Reveal animace přes ScrollTrigger `once`, ne `window.scroll` listenery
6. `prefers-reduced-motion` musí vše vypnout (Lenis, scrub, marquee, autoplay)
7. Nové sekce jen na vyžádání — struktura je finální
8. Fotky needitovat destruktivně, jen CSS

## Menicka.cz integrace

Menu je **hardcoded v HTML** (sekce `#denni-menu`), ručně dle https://www.menicka.cz/123-restaurant-net-.html.

**Plán automatizace** (neimplementováno): PHP cron scrapuje menicka 1× denně → `menu.json` → JS fetch. Vyžaduje hosting s cronem (Wedos, Forpsi, Cloudflare Workers).

## TODO — před produkcí

- [ ] **Telefon** 572 552 597 — ověřit s majitelem
- [ ] **Adresa** Jindřícha Průchy 310 — ověřit
- [ ] **Otevírací doba SO/NE** — ověřit (nyní 9:30–23:59 dle dřívějška)
- [ ] **Recenze** — fiktivní, nahradit reálnými z Google (4,2 / 708 ověřit)
- [ ] **Kompletní jídelní lístek** — nyní 3–4 vzorová jídla na kategorii
- [ ] **Formulář salónku** — `action="#"`, napojit FormSpree / Web3Forms
- [ ] **Lepší foto/video materiál** — hero video je 1280×960; ideálně natočit nové záběry interiéru + jídla na šířku, přidat fotky týmu
- [ ] **Vlastní doména** — případně nakonfigurovat ve Vercelu
