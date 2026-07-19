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

## Tech stack

Čisté **HTML + CSS + vanilla JS**. Žádné frameworky, build kroky, ani závislosti.

| Soubor | Účel | Rozsah |
|---|---|---|
| `index.html` | Celá stránka — markup, inline `<script>` na konci `<body>`, inline SVG ikony | ~826 řádků |
| `style.css` | Všechny styly v jednom souboru, sekce oddělené `═══` komentáři | ~1 743 řádků |
| `images/hero.webm` + `hero.mp4` | Hero video duál — VP9 458 KB primární, H.264 587 KB Safari fallback | — |
| `images/salonek.webp` · `vstup.webp` | Statické fotky pro hero/salónek/about | — |
| `CLAUDE.md` | Tento soubor | — |
| `.gitignore` | Standardní + `.vercel/` (přidává Vercel CLI při `vercel link`) | — |

## Příkazy

### Lokální vývoj
```bash
# Spustit dev server (potřeba Python 3)
python -m http.server 8080
# → otevři http://localhost:8080
```
Restart serveru po změnách HTML/CSS/JS **není potřeba** — stačí `Ctrl+F5` v prohlížeči.

### Deploy
```bash
# Vercel je propojený s GitHub repem — push na main = auto-deploy za ~10s
git add .
git commit -m "popis změny"
git push

# Manuální deploy (pokud někdy potřeba):
npx vercel deploy --prod --yes
```

### Optimalizace videa (pokud se vymění hero video)
```bash
# MP4 (H.264, no audio, 1280×960, ~1 Mbps)
ffmpeg -i SOURCE.mp4 -an -c:v libx264 -preset slow -crf 26 -pix_fmt yuv420p \
  -movflags +faststart -vf "scale=1280:-2:flags=lanczos,fps=24" images/hero.mp4

# WebM (VP9, smaller, primární zdroj)
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

### `index.html` — velká mapa

HTML má 10 hlavních sekcí oddělených `<!-- ═══ -->` blokovými komentáři. Pořadí je finální:

1. **Nav** — fixed, transparentní → tmavá při scrollu (>80px), scroll-spy přidává `.is-active` aktivnímu odkazu
2. **Hero** — `min-height: 100vh`, video s posterem, asymetrický 2-řádkový headline (line1 normal, line2 italic bold), staggered fade-up animace
3. **Polední menu** — 5 panelů (St/Čt/Pá/So/Ne) v `.weekly-menu`, taby přepínané přes `data-day`, defaultně dnešní den (`getDay()` 0–6). Pátek a neděle jsou „closed" panely. Data hardcoded; zdroj viz [Menicka.cz integrace](#menickacz-integrace).
4. **Pro koho jsme tu** — 3 karty s gold top-line hover animací
5. **Salónek** — TMAVÉ pozadí (`section--dark`), 2-col layout, formulář s tmavými inputy a zlatým submit
6. **Jídelní lístek** — 5 kategorií, každá 3–4 vzorová jídla
7. **Recenze** — 3 karty s velkým gold uvozovkovým symbolem (`::before`)
8. **O nás** — 2-col, fakta o restauraci
9. **Kontakt** — telefon + WhatsApp tlačítka + Google Maps iframe (search-based, bez API klíče)
10. **Footer** — 3-col + bottom credit

### `style.css` — pořadí sekcí

```
:root (custom properties)  →  Reset/base + ::selection + scrollbar  →
keyframes + .reveal  →  .container + .section + section-header  →
.btn + variants  →  Nav  →  Hero  →  Weekly menu (taby + panely)  →
Cards  →  Salónek + form  →  Menu grid  →  Reviews  →  About  →
Contact  →  Footer  →  Photo frames (filter grading)  →  Responsive
```

Všechny barvy, easing a stíny jsou v `:root` jako custom properties — **nikdy se nehardcodují**.

### Inline `<script>` na konci `<body>`

Šest oddělených bloků (každý označený `// ─── Název ───`):

1. **Nav scroll-state** — `window.scroll` listener přidává `.scrolled` při >80px
2. **Hamburger toggle** — třída `.open` na `#navLinks` + `#hamburger`
3. **Dnešní datum česky** — `dny[]` + `mesice[]` arraye, vypsáno do `#todayDate`
4. **Hero video** — `playbackRate = 0.8` (slow-cinema), triple-redundant event listening (`canplay`/`playing`/`loadeddata`) + 1,5s timeout fallback pro `is-ready` třídu (CSS fade-in), pause při skrytém tabu
5. **IntersectionObserver scroll-reveal** — pozoruje `.reveal` elementy, přidává `.is-visible` jednou při vstupu do viewportu
6. **Scroll-spy nav** — aktivní `.nav__link` dle pozice scrollu vůči `<section>` offsetům
7. **Týdenní menu taby** — přepínání `.is-active` mezi `.weekly-menu__tab` + `.weekly-menu__panel` podle `data-day`
8. **Smooth scroll** — pro všechny `a[href^="#"]` s offsetem `nav.offsetHeight + 8`

### CSS classes a vzory

- BEM: `.block`, `.block__element`, `.block--modifier`
- Sekce: `.section.section--cream` / `.section--dark` / `.section--white` určují pozadí
- Reveal animace: přidat třídu `.reveal` na element → IntersectionObserver ho odhalí
- Eyebrow: `<p class="section-eyebrow">text</p>` — em-dashes a uppercase styling řeší CSS `::before`/`::after`

## Design systém

### Barvy (CSS custom properties v `:root`)
- `--burgundy: #8B2635` — primární akcent
- `--burgundy-d: #5A1827` — tmavá pozadí (hero, kontakt, salónek)
- `--cream: #F7F2EA` — sekundární pozadí
- `--gold: #C8A86E` — zlatý akcent (linky, eyebrows, ikony)
- `--text: #2C2C2C` — text
- WhatsApp tlačítko: `#2D4A3A` (British racing green) — **NIKDY** ne neonová WhatsApp zelená

### Typografie (Google Fonts)
- **Cormorant Garamond** 400/600/italic — nadpisy, hero `headline-line2` (italic bold)
- **DM Sans** 300/400/500 — text, UI

### Easing
- `--ease: cubic-bezier(0.32, 0.72, 0, 1)` — Apple-esque, pro všechny transitions
- `--ease-soft: cubic-bezier(0.16, 1, 0.3, 1)` — scroll-reveal výstupy
- **NIKDY** `linear`, `ease-in-out` — vždy custom cubic-bezier

### Stín systém
Diffusion shadows (měkké, široké, tónované do burgundy):
- `--shadow-sm: 0 2px 12px rgba(40,18,22,.06)`
- `--shadow-md: 0 12px 32px -10px rgba(40,18,22,.14)`
- `--shadow-lg: 0 20px 60px -16px rgba(40,18,22,.2)`

## Pravidla designu (NEPORUŠOVAT)

Projekt je v archetypu **Editorial Luxury** (taste-skill). Z toho plyne:

1. **Žádné emoji v UI.** Vše ikona = inline SVG (Phosphor-thin styl, stroke-width 1.4–1.6)
2. **Žádný Inter / Roboto / Arial** — Cormorant + DM Sans drží premium tón
3. **Žádné tvrdé černé stíny** (`rgba(0,0,0,0.3)`) — pouze diffusion shadows tónované do burgundy
4. **Žádné neonové gradienty / fialovo-modré AI patterns** — paleta je teplá moravská
5. **Filmová zrnitost** — `body::before` aplikuje SVG-noise overlay (opacity 0.035, mix-blend overlay)
6. **Custom cubic-bezier** transitions, nikdy `linear`
7. **Macro-whitespace** — sekce `padding: 80px 0` desktop, 48px mobile
8. **Eyebrows** vždy s em-dashes a `letter-spacing: .3em` uppercase, gold barva
9. **Section titles** mají dekorativní 60×2px gold linku pod sebou (`::after`)
10. **Karty** s gold top-line animací při hoveru (scaleX 0→1) + lift -6px
11. **Reveal** scroll animace přes IntersectionObserver, ne `window.scroll` listener
12. **Nikdy** neměň barvy v `:root` bez konzultace — paleta je domluvená a sladěná
13. **Nikdy** nepřidávej nové sekce bez požadavku — struktura je finální
14. Při úpravě fotek: jen CSS grading (sepia/saturate/hue-rotate filter), **nikdy** nepřepisovat originální `.webp` v `images/`

## Menicka.cz integrace

Menu je aktuálně **hardcoded v HTML** v sekci `weekly-menu` — ručně aktualizováno z https://www.menicka.cz/123-restaurant-net-.html.

**Plán automatizace** (zatím neimplementováno, viz konverzace s Markem):
- Varianta A: oficiální menicka.cz widget (iframe) — nejjednodušší, ale nelze stylizovat
- **Varianta B (preferovaná):** PHP cron skript scrapuje menicka 1× denně, generuje `menu.json`, JS ho fetchuje
- Varianta C: Cloudflare Worker proxy

Vyžaduje hosting s podporou cron / scheduled tasks (Wedos, Forpsi, Cloudflare Workers).

## Skilly aplikované v tomto projektu

Načítají se z `~/.claude/skills/`:
- `frontend-design` — premium UI patterns
- `high-end-visual-design` — Editorial Luxury archetyp, Double-Bezel, custom cubic-bezier, macro-whitespace, eyebrow tags
- `design-taste-frontend` — anti-emoji policy, deterministická typografie, anti-3-col-card-bias

## TODO — co doplnit před produkcí

- [ ] **Telefon** — všude je `572 552 597` (z menicka), ověřit s majitelem
- [ ] **Adresa** v kontaktu — Jindřícha Průchy 310 (z firmy.cz), ověřit
- [ ] **Otevírací doba SO/NE** — aktuálně placeholder „dle rezervace"; SO menicka ukazuje víkendovou nabídku, takže možná otevřeno
- [ ] **Rok otevření** v sekci O nás — placeholder `[ROK]`
- [ ] **Počet členů týmu** v O nás — placeholder `[X]+`
- [ ] **Google Maps embed** — momentálně search-based iframe, případně vyměnit za přesný embed s API klíčem
- [ ] **Recenze** — aktuálně fiktivní; nahradit reálnými z Google
- [ ] **Hodnocení 4,2 / 708 recenzí** — z aktuálního Google profilu, ověřit
- [ ] **Kompletní jídelní lístek** — momentálně 3–4 vzorová jídla v každé kategorii, doplnit dle reality
- [ ] **Formulář v salónku** — aktuálně `action="#"`, napojit na FormSpree / Web3Forms / vlastní backend
- [ ] **Fotka personálu** — aktuálně sekce O nás používá `vstup.webp`, ideálně doplnit fotku týmu/kuchyně
- [ ] **Vlastní doména** — pokud klient pořídí (např. `restaurantnet.cz`), nakonfigurovat ve Vercelu: Settings → Domains
