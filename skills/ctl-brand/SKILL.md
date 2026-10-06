---
name: ctl-brand
description: Bruk denne skillen alltid når noen ber om dokument, rapport, introduksjon, notat, brev, tilbud eller annet materiell for Center for Transformative Leadership (CTL) eller produktet Collective Navigator – uansett om brukeren nevner "CTL-stil" eller ikke. Gir CTLs farger, logo, dokumentmal, språkregler og begreper, og et script som bygger Word-dokumenter i CTL-profil. Triggere – "CTL", "Center for Transformative Leadership", "Collective Navigator", "transformleadership.no", "lag en introduksjon", "CTL-mal". Ikke bruk for Abilator-leveranser (bruk abilator-brand / abilator-docx) eller Miljødirektoratet.
---

# CTL Brand

Skal brukes når materiell lages **på vegne av CTL** eller for Collective Navigator. Profilen er hentet fra CTLs logosett, transformleadership.no og Word-malen «Utvikling av emosjonell robusthet».

## Arbeidsgang

1. Les `references/brand.md` (farger, navn, språk) før du skriver noe.
2. Ved Word-dokument: les `references/docx-spec.md`, skriv en JSON-spesifikasjon og kjør `scripts/build_ctl_docx.js`.
3. Ved andre formater (HTML, slides): bruk fargene og reglene i `references/brand.md`, og hent logo som beskrevet under.
4. Valider og se på resultatet visuelt før du leverer.

## Logo

Logoene ligger i brand-repoet `https://github.com/abilatoras/brand-assets-ctl`, i mappen `assets/logo/`.

Last ned med bash (raw.githubusercontent.com er tillatt):

```bash
curl -sfL -o /tmp/ctl-logo.png \
  "https://raw.githubusercontent.com/abilatoras/brand-assets-ctl/main/assets/logo/ctl-logo-farge.png" \
  || echo "Logo ikke funnet i repo – bruker medfølgende logo"
```

Send filen som tredje argument til scriptet (`node build_ctl_docx.js spec.json out.docx /tmp/ctl-logo.png`). Hvis nedlastingen feiler, brukes den medfølgende `assets/ctl-logo.png` (farge, horisontal, 1200 px bred, fra det offisielle logosettet).

I HTML-artefakter, der bash ikke er tilgjengelig, kan logoen lenkes via jsDelivr:
`https://cdn.jsdelivr.net/gh/abilatoras/brand-assets-ctl@main/assets/logo/ctl-logo-farge.png`

Filer i repoet (`assets/logo/`): `ctl-logo-farge.png` (standard), `ctl-logo-gra.png`, `ctl-logo-sort.png`, tilsvarende `ctl-symbol-*.png`, og masterfilen `ctl_logosett.pdf` (vektor). Hvit variant for mørk bakgrunn mangler ennå.

## Faste regler (kort)

- Firmanavn: **Center for Transformative Leadership (CTL)**, alltid på engelsk.
- Norsk beskrivende begrep: **utviklende ledelse**, aldri «transformativt lederskap».
- Dokumenter: primær `#045373`, overskrifter `#0F4761`. Web/slides: marine `#152D3B`, oransje aksent `#E99938`, beige `#F2F0E8`.
- Folkelig språk, invitende tone, «vi» ikke «jeg».
- Eksterne kunder anonymiseres i generelle tekster («en større offentlig virksomhet»).
- Domenet skrives `transformleadership.no`.

## Kjente mangler

Fonter, nettsidens eksakte farger, hvit logo-variant og slide-mal er ikke bekreftet. Se «Åpne punkter» i `references/brand.md`. Spør brukeren hvis det er avgjørende for oppgaven, ellers bruk Calibri i dokumenter (Raleway på web hvis tilgjengelig) og fargene over.
