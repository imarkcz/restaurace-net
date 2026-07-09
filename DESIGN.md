# DESIGN.md — „Autentická moderna" (v5)

Vizuální systém Restaurant NET. Doplňuje PRODUCT.md. Platí od 07/2026.

## Theme

Světlý, teplý, vzdušný. Kostěná/krémová plocha, inkoustový text, jeden paprikový akcent. Jediné tmavé plochy: marquee pás a footer (inkoust) — dávají stránce rytmus.

## Color

| Token | Hodnota | Role |
|---|---|---|
| `--bone` | `#F5EFE4` | základní pozadí |
| `--bone-2` | `#ECE4D3` | střídavé sekce |
| `--ink` | `#211B12` | text, tmavé plochy (marquee, footer, primární tlačítko) |
| `--paprika` | `#B84A22` | akcent: ceny, odkazy, akcentní řádek titulku |
| `--moss` | `#5E7050` | sekundární akcent: badge, veg tagy, WhatsApp hover |

Žádná čistá černá/bílá. Strategie: Restrained-warm s jedním sebevědomým akcentem.

## Typography

- **Gloock** (Google Fonts, latin-ext): display — H1/H2, číselné fakty, footer wordmark. Jen 400, bez kurzívy.
- **Schibsted Grotesk**: UI a text, 400/500/600/700 + italic.
- Hero `clamp(3.2rem, 9.5vw, 8.75rem)`, poměr škály ~1.33, `tabular-nums` na cenách a časech.

## Imagery

**Pouze reálné materiály z restaurace**: `images/hero.webm|mp4` (záběry jídla), `salonek.webp`, `vstup.webp`. Zákaz AI-generovaných a ilustrovaných obrazů (rozhodnutí klienta 07/2026). Fotky v zaoblených rámech (`--radius: 20px`), jemný vnitřní parallax.

## Motion (main.js) — signature vrstva v5.5

- **Preloader**: ink závoj, Gloock counter 0–100 + paprika progress bar, opona nahoru; opakovaná návštěva v session jen krátké zvednutí.
- **Lenis** smooth-scroll napojený na GSAP ticker; `e.velocity` je sdílená pro reaktivní efekty.
- Hero titulek: rozpad na **znaky** (word > ch), kaskádový nástup s rotací; při scrollu se řádky smýkají od sebe (±5vw scrub).
- **Hero video = WebGL shader** (Three.js VideoTexture + custom GLSL): jemné „dýchání" obrazu, ripple za myší, RGB posun podle rychlosti scrollu. Jen desktop, fallback čisté video.
- Hero video okno: `clip-path: inset()` scrub na full-bleed.
- Marquee: nekonečný pás, **timeScale řízený rychlostí a směrem scrollu** (couvá při scrollu nahoru).
- Fotky: parallax scrub + `skewY` podle setrvačnosti scrollu (±3,5°).
- Menu: obří ghost zkratka dne (Gloock outline) za panelem, mění se s tabem.
- **Footer opona**: footer fixed za obsahem, main s marginem ho odhaluje.
- **Custom kurzor**: tečka + zpožděný kroužek, `mix-blend-difference`, roste nad interaktivními prvky. Jen fine pointer.
- Magnetická tlačítka `[data-magnetic]`, čísla faktů se dopočítávají.
- Denní režim: po 15. hodině je primární CTA „Rezervovat salónek" místo „Dnešní menu".
- Easing: expo.out / power3.out; **žádný** linear (mimo scrub), bounce ani elastic.
- `prefers-reduced-motion`: loader, kurzor, WebGL, marquee i scruby vypnuté, video pauznuté.

## Components

- **Tlačítka**: pill (radius 100px). Primární ink→paprika hover, sekundární obrys, telefonní v nav.
- **Taby dnů**: pill přepínače, aktivní ink; zavřené dny 45% opacity.
- **Řádky jídel**: hairline dělení, název + příloha vlevo, paprika cena vpravo, hover zvýraznění.
- **Formulář**: světlé inputy radius 12, label uppercase, focus paprika.
- **Footer**: ink, obří Gloock wordmark přes celou šířku.

## Zákazy

Em-dash v copy (použij dvojtečku/čárku/·), emoji ikony, glassmorphism, gradient text, side-stripe bordery, karty v kartách.
