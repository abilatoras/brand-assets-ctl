# Word-mal: JSON-spesifikasjon

Kjør: `node scripts/build_ctl_docx.js spec.json output.docx [logo.png]`

Krever `docx` (npm). Hvis det mangler: `npm install -g docx`.

## Toppnivå

| Felt | Beskrivelse |
|---|---|
| `headerTitle` | Tekst i grå bjelke i topptekst (standard: `title`) |
| `confidential` | `"full"`, `"short"` eller `"none"` |
| `dateLine` | F.eks. `"Trondheim, 07.10.2026"` |
| `title` | Dokumenttittel (H1) |
| `intro` | Kursiv ingress |
| `blocks` | Liste av blokker |

## Blokker

```json
{"type":"h2","text":"Utfordringen"}
{"type":"p","text":"Brødtekst","lead":"Valgfri fet start."}
{"type":"bullets","items":["Punkt 1","Punkt 2"]}
{"type":"numbered","items":[{"title":"Tittel","text":"Beskrivelse"}]}
{"type":"image","path":"/sti/figur.png","caption":"Figur 1 – ...","width":470}
{"type":"contact","people":[{"name":"...","title":"...","email":"...","phone":"..."}]}
```

`width` er i piksler (maks ca. 560 ved standard marger). Høyde beregnes automatisk. PNG og JPG støttes.

## Sjekkliste før levering

1. `python /mnt/skills/public/docx/scripts/office/validate.py output.docx`
2. Konverter til PDF og se på hver side
3. Forsøk å unngå nesten tom siste side (juster bildebredde eller del opp)
4. Sjekk at e-postdomenet er `transformleadership.no`
5. Bekreft at logoen er skarp (bruk PNG på minst 1200 px bredde)
