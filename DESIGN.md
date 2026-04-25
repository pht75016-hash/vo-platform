# VO Platform — Design System

Ce fichier fait autorité sur toutes les décisions visuelles.
Tout composant, toute page, tout module doit respecter ces règles sans exception.

---

## Ambiance générale

- **Style** : SaaS moderne, professionnel, coloré sans être chargé
- **Inspiration** : Linear, Notion, Odoo
- **Densité** : Aéré — cards espacées, mobile-first
- **Navigation** : Sidebar fixe à gauche sur desktop, bottom bar sur mobile

---

## Palette de couleurs

```js
const colors = {
  // Primaire — accent principal
  accent:          '#2563EB',   // bleu SaaS
  accentHover:     '#1D4ED8',
  accentLight:     '#DBEAFE',   // fond badge bleu
  accentText:      '#1D4ED8',   // texte sur fond accentLight

  // Sidebar
  sidebarBg:       '#1A1A2E',   // fond sidebar sombre
  sidebarText:     'rgba(255,255,255,0.55)',
  sidebarTextHover:'rgba(255,255,255,0.85)',
  sidebarActive:   '#2563EB',   // item actif = accent
  sidebarBorder:   'rgba(255,255,255,0.08)',
  sidebarSection:  'rgba(255,255,255,0.3)',

  // Layout
  pageBg:          '#F7F7F8',   // fond de page général
  surfacePrimary:  '#FFFFFF',   // cards, modals
  surfaceBorder:   '#E8E8E8',   // bordure cards
  borderLight:     '#E0E0E0',   // bordure inputs, séparateurs

  // Texte
  textPrimary:     '#111111',
  textSecondary:   '#666666',
  textMuted:       '#999999',

  // Topbar
  topbarBg:        '#FFFFFF',
  topbarBorder:    '#E8E8E8',

  // Statuts véhicules
  statusStock:     { bg: '#DCFCE7', text: '#16A34A' },   // vert
  statusProjet:    { bg: '#F1F0E8', text: '#5F5E5A' },   // gris
  statusVendu:     { bg: '#DBEAFE', text: '#1D4ED8' },   // bleu

  // Jours en stock
  daysGreen:       { bg: '#DCFCE7', text: '#16A34A' },   // < 30j
  daysOrange:      { bg: '#FEF3C7', text: '#D97706' },   // 30–60j
  daysRed:         { bg: '#FEE2E2', text: '#DC2626' },   // > 60j

  // Marges
  margeGreen:      { bg: '#DCFCE7', text: '#16A34A' },   // > 1500€
  margeOrange:     { bg: '#FEF3C7', text: '#D97706' },   // 500–1500€
  margeRed:        { bg: '#FEE2E2', text: '#DC2626' },   // < 500€

  // Étapes (points de progression)
  stepDone:        '#16A34A',   // vert
  stepInProgress:  '#D97706',   // orange
  stepTodo:        '#E5E7EB',   // gris clair

  // Alerts
  alertRed:        '#EF4444',
}
```

---

## Typographie

```js
// Import Google Fonts dans index.html :
// <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Mono&display=swap" rel="stylesheet">

const typography = {
  fontPrimary:  "'DM Sans', system-ui, sans-serif",
  fontMono:     "'Space Mono', monospace",  // immatriculations, VIN, prix HT/TTC

  // Tailles
  xs:   '10px',
  sm:   '11px',
  base: '13px',
  md:   '14px',
  lg:   '15px',
  xl:   '16px',
  h3:   '16px',
  h2:   '18px',
  h1:   '22px',

  // Graisses
  regular: 400,
  medium:  500,
  semibold: 600,
  bold:    700,
}
```

---

## Espacements & rayons

```js
const spacing = {
  // Padding interne des cards
  cardPadding:   '16px 18px',
  cardPaddingMd: '14px 16px',

  // Gap entre cards dans une grille
  gridGap:  '12px',
  gridGapLg:'16px',

  // Padding page
  pagePadding:       '24px',
  pagePaddingMobile: '16px',

  // Rayons
  radiusSm:  '6px',   // badges, chips, inputs
  radiusMd:  '8px',   // boutons, petits éléments
  radiusLg:  '10px',  // cards
  radiusXl:  '14px',  // sidebar, modals, shell
  radiusFull:'999px', // pills
}
```

---

## Composants — spécifications

### Boutons

```js
// Hauteur fixe 32px sur desktop, 38px sur mobile
// box-sizing: border-box TOUJOURS

const buttonStyles = {
  primary: {
    height: '32px',
    padding: '0 14px',
    borderRadius: '7px',
    background: '#2563EB',
    color: '#fff',
    fontSize: '13px',
    fontWeight: 500,
    border: 'none',
  },
  ghost: {
    height: '32px',
    padding: '0 14px',
    borderRadius: '7px',
    background: 'transparent',
    color: '#555',
    fontSize: '13px',
    fontWeight: 500,
    border: '0.5px solid #E0E0E0',
  },
  danger: {
    // Même que primary mais background: '#EF4444'
  }
}

// RÈGLE ABSOLUE : jamais de disabled={true} sur un bouton submit
// Utiliser un feedback visuel à la place (message d'erreur, shake, etc.)
```

### Inputs & Selects

```js
const inputStyle = {
  height: '32px',
  padding: '0 10px',
  borderRadius: '7px',
  border: '0.5px solid #E0E0E0',
  background: '#fff',
  fontSize: '13px',           // desktop
  fontSizeMobile: '16px',     // OBLIGATOIRE mobile — empêche zoom iOS
  color: '#111',
  outline: 'none',
  // Focus :
  focusBorder: '1.5px solid #2563EB',
}
```

### Cards véhicule (vue liste)

```
┌─────────────────────────────────────────────────────────────┐
│  [photo]  Marque Modèle              ●●●○  [statut]  Prix   │
│  52×38px  Immat · km · carburant · année    Marge    [j]    │
└─────────────────────────────────────────────────────────────┘
```

- Fond blanc, border 0.5px `#E8E8E8`, border-radius 10px
- Hover : border-color passe à `#2563EB`
- Points de progression : 8px, ronds, couleurs stepDone/InProgress/Todo
- Badge jours : pill coloré selon seuils (< 30j vert, 30–60j orange, > 60j rouge)

### KPI cards (haut de module)

```js
const kpiCard = {
  background: '#FFFFFF',
  border: '0.5px solid #E8E8E8',
  borderRadius: '10px',
  padding: '16px 18px',
  // Structure :
  // label  : 11px, uppercase, #888, letter-spacing 0.5px
  // valeur : 24px, bold, #111, letter-spacing -0.5px
  // delta  : 11px, couleur selon tendance (vert/orange)
}
```

### Badges / Pills

```js
// Structure : padding 3px 8px, border-radius 5px (pill: 999px)
// Toujours : bg clair + texte foncé de la même couleur
// Exemples :
//   Statut stock  : bg #DCFCE7, text #16A34A
//   Statut projet : bg #F1F0E8, text #5F5E5A
//   Statut vendu  : bg #DBEAFE, text #1D4ED8
//   Alerte        : bg #FEE2E2, text #DC2626
```

### Filtres (chips)

```js
// Ligne de chips horizontale au-dessus des listes
const filterChip = {
  padding: '4px 10px',
  borderRadius: '20px',
  fontSize: '12px',
  fontWeight: 500,
  border: '0.5px solid #E0E0E0',
  background: '#fff',
  color: '#666',
  // Actif :
  activeBackground: '#2563EB',
  activeColor: '#fff',
  activeBorder: '#2563EB',
}
```

---

## Layout global

### Desktop (> 768px)

```
┌──────────────┬────────────────────────────────────────────┐
│              │  Topbar (52px, blanc, border-bottom)        │
│  Sidebar     ├────────────────────────────────────────────┤
│  220px       │                                            │
│  #1A1A2E     │  Contenu (fond #F7F7F8, padding 24px)      │
│              │                                            │
│  [nav items] │  KPIs ─────────────────────────────────   │
│              │  Filtres chips ─────────────────────────   │
│              │  Liste / grille de cards ───────────────   │
│  [user]      │                                            │
└──────────────┴────────────────────────────────────────────┘
```

### Mobile (≤ 768px)

```
┌─────────────────────────┐
│  Topbar (titre + actions)│
├─────────────────────────┤
│                         │
│  Contenu (padding 16px) │
│  Cards pleine largeur   │
│                         │
├─────────────────────────┤
│  Bottom navigation bar  │  ← icônes des modules principaux
│  (5 items max)          │
└─────────────────────────┘
```

### Sidebar — structure

```
Logo / Nom app
Sous-titre profil (Négociant VO)
─────────────────────
[Section label] PRINCIPAL
  Accueil
  Stock           [badge: 24]
  CRM             [badge alerte: 3]
  Notes
─────────────────────
[Section label] ATELIER
  Atelier
  Documents
  Location
─────────────────────
[Avatar] Prénom Nom
         Profil utilisateur
```

---

## Thème JS (objets à utiliser dans les composants)

```js
// src/utils/theme.js
export const themes = {
  light: {
    // Backgrounds
    bg:           '#F7F7F8',
    bgSurface:    '#FFFFFF',
    bgSecondary:  '#F5F5F5',

    // Texte
    text:         '#111111',
    textSecondary:'#666666',
    textMuted:    '#999999',

    // Bordures
    border:       '#E8E8E8',
    borderLight:  '#E0E0E0',

    // Accent
    accent:       '#2563EB',
    accentHover:  '#1D4ED8',
    accentLight:  '#DBEAFE',

    // Sidebar (identique light/dark — sidebar toujours sombre)
    sidebarBg:    '#1A1A2E',
    sidebarActive:'#2563EB',
    sidebarBorder:'rgba(255,255,255,0.08)',

    // Topbar
    topbarBg:     '#FFFFFF',
    topbarBorder: '#E8E8E8',
  },
  dark: {
    bg:           '#111111',
    bgSurface:    '#1C1C1C',
    bgSecondary:  '#242424',
    text:         '#F0F0F0',
    textSecondary:'#A0A0A0',
    textMuted:    '#666666',
    border:       '#2A2A2A',
    borderLight:  '#333333',
    accent:       '#3B82F6',
    accentHover:  '#2563EB',
    accentLight:  '#1E3A5F',
    sidebarBg:    '#0F0F1A',
    sidebarActive:'#2563EB',
    sidebarBorder:'rgba(255,255,255,0.06)',
    topbarBg:     '#1C1C1C',
    topbarBorder: '#2A2A2A',
  }
}

// Toujours utiliser via :
// const t = themes[theme]
// Jamais de couleurs hardcodées dans les composants
```

---

## Règles impératives

1. **Sidebar toujours sombre** (`#1A1A2E`) — indépendante du thème light/dark
2. **Accent bleu `#2563EB`** — un seul accent, pas de couleurs secondaires décoratives
3. **Cards blanches** sur fond `#F7F7F8` — le contraste fond/card est la séparation visuelle
4. **Bordures 0.5px** — jamais 1px ou 2px sauf exception documentée (card hover active)
5. **Inputs 16px sur mobile** — empêche le zoom automatique iOS, sans exception
6. **Jamais `disabled` sur submit** — toujours un feedback visuel alternatif
7. **Dropdowns en `position: fixed`** avec `getBoundingClientRect()` — évite le clipping
8. **Mobile-first** — chaque composant doit être testé sur 375px ET 1440px
9. **Une info saisie = propagée partout** — via le store Zustand, jamais re-saisie
10. **Pas de lib CSS externe** — tout en styles inline JS avec le système de thème
