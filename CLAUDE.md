# CLAUDE.md — Restaurant NET Uherské Hradiště

## Co tento projekt je

One-page web pro **Restaurant NET** v centru Uherského Hradiště. Rodinná restaurace, polední menu, salónek pro 60 osob, oslavy a firemní akce.

**Adresa:** Jindřícha Průchy 310, 686 01 Uherské Hradiště
**Telefon:** +420 572 552 597
**Menu zdroj:** https://www.menicka.cz/123-restaurant-net-.html

## Technologie

- Čistý **HTML + CSS + vanilla JS** — žádné frameworky, žádný build step
- Deploy: jednoduchý statický hosting (FTP do libovolné složky)
- Lokální dev: `python -m http.server 8080` v root projektu
- Soubory:
  - `index.html` — celá stránka
  - `style.css` — styly
  - `images/` — fotky (`salonek.webp`, `vstup.webp`)

## Design systém

### Barvy (CSS custom properties v `:root`)
- `--burgundy: #8B2635` — primární akcent
- `--burgundy-d: #5A1827` — tmavá pozadí (hero, kontakt, salónek)
- `--cream: #F7F2EA` — sekundární pozadí
- `--gold: #C8A86E` — zlatý akcent (linky, eyebrows, ikony)
- `--text: #2C2C2C` — text
- WhatsApp tlačítko: `#2D4A3A` (British racing green) — NIKDY ne neonová WhatsApp zelená

### Typografie (Google Fonts)
- **Cormorant Garamond** 400/600/italic — nadpisy, hero headline-line2 (italic bold)
- **DM Sans** 300/400/500 — text, UI

### Easing
- `--ease: cubic-bezier(0.32, 0.72, 0, 1)` — Apple-esque, pro všechny transitions
- `--ease-soft: cubic-bezier(0.16, 1, 0.3, 1)` — scroll-reveal výstupy
- **NIKDY** `linear`, `ease-in-out` — vždy custom cubic-bezier

### Stín systém
- Diffusion shadows (měkké, široké, tónované do burgundy):
  - `--shadow-sm: 0 2px 12px rgba(40,18,22,.06)`
  - `--shadow-md: 0 12px 32px -10px rgba(40,18,22,.14)`
  - `--shadow-lg: 0 20px 60px -16px rgba(40,18,22,.2)`

## Pravidla designu (NEPORUŠOVAT)

Tento projekt je v archetypu **Editorial Luxury** (taste-skill). Z toho plyne:

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

## Struktura sekcí

1. **Nav** — fixed, transparentní → tmavá při scrollu (>80px)
2. **Hero** — fullscreen interiér + asymetrický headline (line1 normal, line2 italic bold)
3. **Polední menu** — 5 tabů (Po-Ne) s daty z menicka.cz, defaultně dnešní den
4. **Pro koho jsme tu** — 3 karty (Pracovní oběd / Rodinná oslava / Večerní posezení)
5. **Salónek** — TMAVÉ pozadí, 2-col layout, formulář s tmavými inputy a zlatým submit
6. **Jídelní lístek** — 5 kategorií, každá 3-4 vzorová jídla
7. **Recenze** — 3 karty s velkým gold uvozovkovým symbolem
8. **O nás** — 2-col, fakta o restauraci
9. **Kontakt** — telefon + WhatsApp tlačítka + Google Maps iframe
10. **Footer** — 3-col (brand, navigace, kontakt) + bottom credit

## Menicka.cz integrace

Aktuálně menu **hardcoded v HTML** — ručně aktualizováno z https://www.menicka.cz/123-restaurant-net-.html.

**Plán automatizace** (zatím neimplementováno):
- Varianta A: oficiální menicka.cz widget (iframe) — nejjednodušší, ale nelze stylizovat
- **Varianta B (preferovaná):** PHP cron skript scrapuje menicka 1× denně, generuje `menu.json`, web ho fetch-uje
- Varianta C: Cloudflare Worker proxy

Vyžaduje hosting s podporou cron / scheduled tasks (Wedos, Forpsi, Cloudflare Workers).

## Skilly aplikované v tomto projektu

Z `~/.claude/skills/`:
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
- [ ] **Kompletní jídelní lístek** — momentálně 3-4 vzorová jídla v každé kategorii, doplnit dle reality
- [ ] **Formulář v salónku** — aktuálně `action="#"`, napojit na FormSpree / Web3Forms / vlastní backend
- [ ] **Fotka personálu** — aktuálně sekce O nás používá `vstup.webp`, ideálně doplnit fotku týmu/kuchyně

## Pravidla pro budoucí práci

- **Nikdy** neměň barvy v `:root` bez konzultace — paleta je domluvená a sladěná
- **Nikdy** nepřidávej nové sekce bez požadavku — struktura je finální
- **Nikdy** `rm` na soubory — pravidlo z globálního CLAUDE.md (PowerShell + Recycle Bin)
- Před zmenou layoutu si přečti tento CLAUDE.md a relevantní skill v `~/.claude/skills/high-end-visual-design/SKILL.md`
- Při úpravě fotek: jen CSS grading (sepia/saturate/hue-rotate filter), nikdy nepřepisovat originální `.webp` v `images/`

## Užitečné

- Lokální dev start: `python -m http.server 8080` v root, pak http://localhost:8080
- Restart serveru po změnách CSS není nutný — Ctrl+F5 v prohlížeči stačí
- Web vytvořil: **Mark Bobčík**
