# CTL Brand

Felles kilde for visuell profil, språk og maler for **Center for Transformative Leadership (CTL)** og produktet **Collective Navigator**.

Repoet er skrevet for to lesere: mennesker som lager materiell, og Claude (via skills) som lager dokumenter på vegne av CTL.

## Struktur

| Mappe | Innhold |
|---|---|
| `ctl/` | Retningslinjer for CTL som selskap: logo, farger, typografi, dokumentmal, språk |
| `collective-navigator/` | Retningslinjer for produktet Collective Navigator: posisjonering, visuelt uttrykk, navn og begreper |
| `tokens/` | Farger og mål som maskinlesbar JSON og CSS |
| `assets/` | Logoer og bilder (lastes opp manuelt) |
| `skills/ctl-brand/` | Claude-skill for CTL: retningslinjer, Word-mal og bygge-script |

## Status

Hver verdi i retningslinjene er merket:

- ✅ **Verifisert**: hentet fra logosettet (vektor) eller en eksisterende CTL-leveranse (Word-malen)
- 🟡 **Målt**: målt fra skjermbilder av transformleadership.no
- 🟡 **Utledet**: avledet, bør bekreftes
- ⬜ **Mangler**: må avklares eller lastes opp

Se `ctl/brand-guidelines.md` → «Åpne punkter» for hva som gjenstår.

## Første trinn

Repoet starter med én skill, `ctl-brand`. Collective Navigator-mappen er et utkast og følger CTL-profilen inntil videre.

## Slik bruker du repoet

1. Last opp `assets/logo/` (logosettet ligger der allerede; mangler SVG og hvit variant, se `assets/README.md`)
2. Gå gjennom «Åpne punkter» og bekreft eller rett verdiene
3. Fyll inn repo-URL i `skills/ctl-brand/SKILL.md` (søk etter `<ORG>/<REPO>`)
4. Last opp `skills/ctl-brand/` som skill i Claude
