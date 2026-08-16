import {
  DEEP_WHALE_DAY_COMPOSER_RAIL,
  DEEP_WHALE_DAY_CONTENT_FRAME,
  DEEP_WHALE_DAY_MEDALLION,
  DEEP_WHALE_DAY_BOTTOM_LACE,
  DEEP_WHALE_DAY_TOP_LACE,
  DEEP_WHALE_DAY_SOFT_CONTENT_FRAME,
  DEEP_WHALE_DAY_SOFT_BOTTOM_TRIM,
  DEEP_WHALE_DAY_SOFT_NEW_SESSION,
  DEEP_WHALE_DAY_SOFT_SETTINGS,
  DEEP_WHALE_DAY_SOFT_SIDEBAR_CORNER,
  DEEP_WHALE_DAY_SOFT_TOP_TRIM,
  DEEP_WHALE_DAY_SOFT_WORKSPACE,
  DEEP_WHALE_NIGHT_COMPOSER_RAIL,
  DEEP_WHALE_NIGHT_CONTENT_FRAME,
  DEEP_WHALE_NIGHT_MEDALLION,
  DEEP_WHALE_NIGHT_BOTTOM_LACE,
  DEEP_WHALE_NIGHT_TOP_LACE,
  DEEP_WHALE_NIGHT_SOFT_CONTENT_FRAME,
  DEEP_WHALE_NIGHT_SOFT_BOTTOM_TRIM,
  DEEP_WHALE_NIGHT_SOFT_NEW_SESSION,
  DEEP_WHALE_NIGHT_SOFT_SETTINGS,
  DEEP_WHALE_NIGHT_SOFT_SIDEBAR_CORNER,
  DEEP_WHALE_NIGHT_SOFT_TOP_TRIM,
  DEEP_WHALE_NIGHT_SOFT_WORKSPACE,
} from './deep-whale-art.generated.ts'

/** CSS custom properties that form one complete ornament theme. */
export const DEEP_WHALE_ORNAMENT_PROPERTIES = [
  '--maid-top-trim-art',
  '--maid-bottom-trim-art',
  '--maid-top-lace-raster-art',
  '--maid-bottom-lace-raster-art',
  '--maid-top-flourish-art',
  '--maid-bottom-flourish-art',
  '--maid-top-crown-art',
  '--maid-bottom-crown-art',
  '--maid-left-cluster-art',
  '--maid-right-cluster-art',
  '--maid-bottom-crest-art',
  '--maid-center-crest-art',
  '--maid-composer-rail-art',
  '--maid-content-frame-art',
  '--maid-new-session-art',
  '--maid-new-session-icon-art',
  '--maid-sidebar-footer-art',
  '--maid-sidebar-corner-art',
  '--maid-composer-frame-art',
  '--maid-settings-frame-art',
  '--maid-workspace-crest-art',
  '--maid-workspace-ribbon-art',
] as const

/** One CSS property controlled by the ornament theme. */
export type DeepWhaleOrnamentProperty = typeof DEEP_WHALE_ORNAMENT_PROPERTIES[number]

/** A complete set of CSS-ready embedded images for one resolved theme. */
export type DeepWhaleOrnamentTheme = Readonly<Record<DeepWhaleOrnamentProperty, string>>

/** Wrap one embedded data URI for CSS custom-property consumption. */
function imageUrl(dataUri: string): string {
  return `url("${dataUri}")`
}

export type TideRailMode = 'day' | 'night'
type TideRailEdge = 'top' | 'bottom'
type MaidLaceEdge = 'top' | 'bottom'
type MaidLaceSide = 'left' | 'right'

/** Encode a small vector ornament without introducing another asset request. */
function svgUrl(svg: string): string {
  return imageUrl(`data:image/svg+xml,${encodeURIComponent(svg)}`)
}

/** Build an aspect-preserving tide line whose crest remains a separate image. */
function createTideRail(mode: TideRailMode, edge: TideRailEdge): string {
  const day = mode === 'day'
  const id = `${mode}-${edge}`
  const primary = day ? '#78c9f5' : '#3568d5'
  const pearl = day ? '#f9fdff' : '#dbe8ff'
  const gold = day ? '#d7b45e' : '#cda95a'
  const glow = day ? '#a9e5ff' : '#477dff'
  const flip = edge === 'bottom' ? ' transform="translate(0 52) scale(1 -1)"' : ''

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 52" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="rail-${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${primary}" stop-opacity=".12"/><stop offset=".16" stop-color="${primary}" stop-opacity=".82"/><stop offset=".5" stop-color="${pearl}"/><stop offset=".84" stop-color="${primary}" stop-opacity=".82"/><stop offset="1" stop-color="${primary}" stop-opacity=".12"/></linearGradient><filter id="glow-${id}" x="-10%" y="-100%" width="120%" height="300%"><feGaussianBlur stdDeviation="1.4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g${flip} fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M-60 9 C90 5 150 22 300 16 S545 7 690 17 C735 20 764 17 800 12 C836 17 865 20 910 17 S1155 7 1300 16 S1510 5 1660 9" stroke="url(#rail-${id})" stroke-width="1.65" vector-effect="non-scaling-stroke" filter="url(#glow-${id})"/><path d="M-40 17 C105 28 230 9 390 18 S640 27 730 19 M870 19 C960 27 1210 9 1370 18 S1535 28 1640 17" stroke="${gold}" stroke-opacity=".68" stroke-width=".95" vector-effect="non-scaling-stroke"/><path d="M-20 23 C165 14 250 31 430 21 S655 15 728 23 M872 23 C945 15 1170 31 1350 21 S1535 14 1620 23" stroke="${pearl}" stroke-opacity=".6" stroke-width=".72" vector-effect="non-scaling-stroke"/><g fill="${pearl}" stroke="${gold}" stroke-width=".75" vector-effect="non-scaling-stroke"><path d="M116 13 l4 4 -4 4 -4-4z"/><path d="M360 18 l3 3 -3 3 -3-3z"/><path d="M1240 18 l3 3 -3 3 -3-3z"/><path d="M1484 13 l4 4 -4 4 -4-4z"/></g><g fill="${glow}" opacity=".92"><circle cx="206" cy="21" r="1.7"/><circle cx="506" cy="14" r="1.3"/><circle cx="1094" cy="14" r="1.3"/><circle cx="1394" cy="21" r="1.7"/></g><path d="M704 17 C742 26 758 30 776 27 M824 27 C842 30 858 26 896 17" stroke="${gold}" stroke-opacity=".76" stroke-width="1.1" vector-effect="non-scaling-stroke"/></g></svg>`
}

/** Build the compact floating ribbon below the sidebar companion. */
function createSidebarSwag(mode: TideRailMode): string {
  const day = mode === 'day'
  const primary = day ? '#75c8f4' : '#3970df'
  const deep = day ? '#3e8bca' : '#102d79'
  const pearl = day ? '#fbfeff' : '#dce8ff'
  const gold = day ? '#d7b45f' : '#d2ae61'
  const glow = day ? '#aeeaff' : '#5889ff'

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 72" preserveAspectRatio="xMidYMid meet"><defs><linearGradient id="swag-${mode}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${primary}" stop-opacity=".12"/><stop offset=".18" stop-color="${primary}"/><stop offset=".5" stop-color="${pearl}"/><stop offset=".82" stop-color="${primary}"/><stop offset="1" stop-color="${primary}" stop-opacity=".12"/></linearGradient><linearGradient id="tail-${mode}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${pearl}"/><stop offset="1" stop-color="${deep}"/></linearGradient><filter id="swag-glow-${mode}" x="-15%" y="-40%" width="130%" height="190%"><feGaussianBlur stdDeviation="1.25" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M-12 20 C12 5 31 36 57 22 C78 10 95 35 118 24 C130 18 134 31 140 43 C146 31 150 18 162 24 C185 35 202 10 223 22 C249 36 268 5 292 20" stroke="url(#swag-${mode})" stroke-width="2.2" vector-effect="non-scaling-stroke" filter="url(#swag-glow-${mode})"/><path d="M-10 34 C16 47 34 18 61 35 C83 48 101 21 122 34 C132 40 136 47 140 54 C144 47 148 40 158 34 C179 21 197 48 219 35 C246 18 264 47 290 34" stroke="${gold}" stroke-opacity=".78" stroke-width="1.15" vector-effect="non-scaling-stroke"/><path d="M-8 27 C22 18 36 44 69 28 C91 18 108 42 127 31 M153 31 C172 42 189 18 211 28 C244 44 258 18 288 27" stroke="${pearl}" stroke-opacity=".72" stroke-width=".8" vector-effect="non-scaling-stroke"/><g stroke="${gold}" stroke-width=".8" vector-effect="non-scaling-stroke"><path d="M42 35 V47"/><path d="M238 35 V47"/></g><g fill="${pearl}" stroke="${gold}" stroke-width=".75" vector-effect="non-scaling-stroke"><circle cx="42" cy="50" r="3"/><circle cx="238" cy="50" r="3"/><path d="M79 25 l3.5 3.5 -3.5 3.5 -3.5-3.5z"/><path d="M201 25 l3.5 3.5 -3.5 3.5 -3.5-3.5z"/></g><path d="M126 38 C132 37 136 40 140 47 C144 40 148 37 154 38 C151 47 146 52 140 53 C134 52 129 47 126 38Z" fill="url(#tail-${mode})" stroke="${gold}" stroke-width="1" vector-effect="non-scaling-stroke" filter="url(#swag-glow-${mode})"/><g fill="${glow}"><circle cx="20" cy="29" r="1.4"/><circle cx="103" cy="22" r="1.2"/><circle cx="177" cy="22" r="1.2"/><circle cx="260" cy="29" r="1.4"/></g></g></svg>`
}

function maidLacePalette(mode: TideRailMode): {
  fabric: string
  ribbon: string
  deep: string
  gold: string
  pearl: string
  glow: string
} {
  return mode === 'day'
    ? { fabric: '#fbfeff', ribbon: '#8fd5f7', deep: '#397fb9', gold: '#d7b45e', pearl: '#ffffff', glow: '#bcefff' }
    : { fabric: '#758bd0', ribbon: '#182f77', deep: '#081d55', gold: '#c9a45a', pearl: '#dce9ff', glow: '#739fff' }
}

/** Build compact maid-apron lace around the existing whale medallion. */
export function createMaidLaceCrown(mode: TideRailMode, edge: MaidLaceEdge): string {
  const { fabric, ribbon, deep, gold, pearl, glow } = maidLacePalette(mode)
  const top = edge === 'top'
  const day = mode === 'day'
  const width = top ? 520 : 460
  const center = width / 2
  const id = `${mode}-${edge}-maid-lace`
  const inner = center - 31
  const outer = 8
  const density = top ? 1 : 0.78
  const dayRuffle = `<g data-lace-motif="ruffle" fill="url(#fabric-${id})" stroke="${gold}" stroke-width=".8"><path d="M${outer} 8 C54 3 78 14 112 11 S174 4 ${inner - 8} 13 L${inner - 8} 26 C${inner - 31} 33 ${inner - 52} 28 ${inner - 72} 37 C${inner - 96} 43 ${inner - 116} 31 ${inner - 139} 39 C${inner - 167} 42 ${inner - 190} 30 ${outer} 29Z"/><path d="M${width - outer} 8 C${width - 54} 3 ${width - 78} 14 ${width - 112} 11 S${width - 174} 4 ${width - inner + 8} 13 L${width - inner + 8} 26 C${width - inner + 31} 33 ${width - inner + 52} 28 ${width - inner + 72} 37 C${width - inner + 96} 43 ${width - inner + 116} 31 ${width - inner + 139} 39 C${width - inner + 167} 42 ${width - inner + 190} 30 ${width - outer} 29Z"/></g>`
  const nightRuffle = `<g data-lace-motif="ruffle" fill="url(#fabric-${id})" stroke="${gold}" stroke-width=".85"><path d="M${outer} 7 Q49 2 86 10 T151 8 T${inner - 8} 12 L${inner - 8} 24 L${inner - 34} 38 L${inner - 61} 28 L${inner - 91} 43 L${inner - 121} 29 L${inner - 153} 40 L${outer} 27Z"/><path d="M${width - outer} 7 Q${width - 49} 2 ${width - 86} 10 T${width - 151} 8 T${width - inner + 8} 12 L${width - inner + 8} 24 L${width - inner + 34} 38 L${width - inner + 61} 28 L${width - inner + 91} 43 L${width - inner + 121} 29 L${width - inner + 153} 40 L${width - outer} 27Z"/></g>`
  const dayEyelets = `<g data-lace-motif="floral-eyelet" fill="none" stroke="${deep}" stroke-opacity=".58" stroke-width=".7">${[-177, -131, -88, 88, 131, 177].map(offset => `<circle cx="${center + offset}" cy="25" r="3.4"/><path d="M${center + offset - 4} 25h8M${center + offset} 21v8"/>`).join('')}</g>`
  const nightEyelets = `<g data-lace-motif="moon-star-eyelet" fill="${pearl}" stroke="${gold}" stroke-width=".55"><path d="M${center - 176} 22 q8 7 15-1 q-4 12-15 1Z"/><path d="M${center + 176} 22 q-8 7-15-1 q4 12 15 1Z"/><path d="M${center - 118} 25 l2 4 4 .5-3 3 .8 4-3.8-2-3.8 2 .8-4-3-3 4-.5Z"/><path d="M${center + 118} 25 l2 4 4 .5-3 3 .8 4-3.8-2-3.8 2 .8-4-3-3 4-.5Z"/></g>`

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 60" preserveAspectRatio="xMidYMid meet" data-maid-lace-depth="44"><defs><linearGradient id="fabric-${id}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${fabric}" stop-opacity="${day ? '.96' : '.82'}"/><stop offset="1" stop-color="${ribbon}" stop-opacity="${density}"/></linearGradient><linearGradient id="bow-${id}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${pearl}"/><stop offset=".45" stop-color="${ribbon}"/><stop offset="1" stop-color="${deep}"/></linearGradient><filter id="soft-${id}" x="-10%" y="-30%" width="120%" height="170%"><feGaussianBlur stdDeviation=".8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g fill="none" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke">${day ? dayRuffle : nightRuffle}<path d="M${outer} 14 C72 7 126 20 ${inner - 7} 16 M${width - outer} 14 C${width - 72} 7 ${width - 126} 20 ${width - inner + 7} 16" stroke="${pearl}" stroke-width="1.1" stroke-dasharray="1 5"/>${day ? dayEyelets : nightEyelets}<g data-lace-motif="shell-rosette" fill="${pearl}" stroke="${gold}" stroke-width=".65"><path d="M${center - 74} 15 c-9-8-17 3-12 11 c5-6 10-4 12 1 c2-5 7-7 12-1 c5-8-3-19-12-11Z"/><path d="M${center + 74} 15 c9-8 17 3 12 11 c-5-6-10-4-12 1 c-2-5-7-7-12-1 c-5-8 3-19 12-11Z"/></g><g data-lace-motif="satin-bow" fill="url(#bow-${id})" stroke="${gold}" stroke-width=".85" filter="url(#soft-${id})"><path d="M${center - 25} 13 C${center - 45} 2 ${center - 51} 22 ${center - 28} 27 C${center - 39} 35 ${center - 32} 42 ${center - 17} 31Z"/><path d="M${center + 25} 13 C${center + 45} 2 ${center + 51} 22 ${center + 28} 27 C${center + 39} 35 ${center + 32} 42 ${center + 17} 31Z"/></g><g fill="${pearl}" stroke="${gold}" stroke-width=".55"><circle cx="${center - 209}" cy="18" r="2"/><circle cx="${center - 150}" cy="22" r="1.6"/><circle cx="${center - 102}" cy="18" r="2.2"/><circle cx="${center + 102}" cy="18" r="2.2"/><circle cx="${center + 150}" cy="22" r="1.6"/><circle cx="${center + 209}" cy="18" r="2"/></g><g fill="${glow}"><circle cx="${center - 54}" cy="7" r="1.2"/><circle cx="${center + 54}" cy="7" r="1.2"/></g></g></svg>`
}

/** Build one compact maid-headdress corner flourish. */
export function createMaidLaceCluster(mode: TideRailMode, side: MaidLaceSide): string {
  const { fabric, ribbon, deep, gold, pearl, glow } = maidLacePalette(mode)
  const day = mode === 'day'
  const id = `${mode}-${side}-maid-cluster`
  const mirror = side === 'right' ? ' transform="translate(128 0) scale(-1 1)"' : ''
  const special = day
    ? `<g data-lace-motif="floral-eyelet" fill="none" stroke="${deep}" stroke-width=".6"><circle cx="82" cy="27" r="3"/><path d="M78 27h8M82 23v8"/></g>`
    : `<g data-lace-motif="crescent-shell" fill="${pearl}" stroke="${gold}" stroke-width=".6"><path d="M76 24 q9 8 17-2 q-4 14-17 2Z"/></g>`

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 44" preserveAspectRatio="xMidYMid meet" data-maid-lace-depth="44"><defs><linearGradient id="cluster-${id}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${fabric}"/><stop offset=".52" stop-color="${ribbon}"/><stop offset="1" stop-color="${deep}"/></linearGradient></defs><g${mirror} fill="none" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"><g data-lace-motif="side-ruffle" fill="url(#cluster-${id})" stroke="${gold}" stroke-width=".8"><path d="M3 8 C19 1 37 6 48 16 C62 29 82 11 104 17 C113 20 120 18 126 14 L126 27 C108 25 101 39 84 33 C65 27 56 42 39 35 C23 30 15 40 4 31Z"/></g><g data-lace-motif="side-bow" fill="${ribbon}" stroke="${gold}" stroke-width=".75"><path d="M24 10 C6 3 7 24 26 23 C16 34 28 40 36 25 C46 39 58 31 47 21 C65 18 56 2 39 11Z"/></g><g data-lace-motif="side-rosette" fill="${pearl}" stroke="${gold}" stroke-width=".65"><path d="M36 13 c-8-7-15 3-10 10 c5-5 8-3 10 2 c2-5 6-7 11-2 c5-7-3-17-11-10Z"/></g>${special}<path d="M5 15 C36 8 65 28 126 18" stroke="${pearl}" stroke-width=".9" stroke-dasharray="1 5"/><circle cx="103" cy="21" r="1.8" fill="${glow}"/></g></svg>`
}

const DAY_TOP_TIDE_RAIL = svgUrl(createTideRail('day', 'top'))
const DAY_BOTTOM_TIDE_RAIL = svgUrl(createTideRail('day', 'bottom'))
const NIGHT_TOP_TIDE_RAIL = svgUrl(createTideRail('night', 'top'))
const NIGHT_BOTTOM_TIDE_RAIL = svgUrl(createTideRail('night', 'bottom'))
const DAY_SIDEBAR_SWAG = svgUrl(createSidebarSwag('day'))
const NIGHT_SIDEBAR_SWAG = svgUrl(createSidebarSwag('night'))
const DAY_TOP_MAID_LACE_CROWN = svgUrl(createMaidLaceCrown('day', 'top'))
const DAY_BOTTOM_MAID_LACE_CROWN = svgUrl(createMaidLaceCrown('day', 'bottom'))
const DAY_LEFT_MAID_LACE_CLUSTER = svgUrl(createMaidLaceCluster('day', 'left'))
const DAY_RIGHT_MAID_LACE_CLUSTER = svgUrl(createMaidLaceCluster('day', 'right'))
const NIGHT_TOP_MAID_LACE_CROWN = svgUrl(createMaidLaceCrown('night', 'top'))
const NIGHT_BOTTOM_MAID_LACE_CROWN = svgUrl(createMaidLaceCrown('night', 'bottom'))
const NIGHT_LEFT_MAID_LACE_CLUSTER = svgUrl(createMaidLaceCluster('night', 'left'))
const NIGHT_RIGHT_MAID_LACE_CLUSTER = svgUrl(createMaidLaceCluster('night', 'right'))

/** Crystal Atelier ornament set used by the resolved light theme. */
export const DEEP_WHALE_DAY_ORNAMENTS: DeepWhaleOrnamentTheme = {
  '--maid-top-trim-art': DAY_TOP_TIDE_RAIL,
  '--maid-bottom-trim-art': DAY_BOTTOM_TIDE_RAIL,
  '--maid-top-lace-raster-art': imageUrl(DEEP_WHALE_DAY_TOP_LACE),
  '--maid-bottom-lace-raster-art': imageUrl(DEEP_WHALE_DAY_BOTTOM_LACE),
  '--maid-top-flourish-art': imageUrl(DEEP_WHALE_DAY_SOFT_TOP_TRIM),
  '--maid-bottom-flourish-art': imageUrl(DEEP_WHALE_DAY_SOFT_BOTTOM_TRIM),
  '--maid-top-crown-art': DAY_TOP_MAID_LACE_CROWN,
  '--maid-bottom-crown-art': DAY_BOTTOM_MAID_LACE_CROWN,
  '--maid-left-cluster-art': DAY_LEFT_MAID_LACE_CLUSTER,
  '--maid-right-cluster-art': DAY_RIGHT_MAID_LACE_CLUSTER,
  '--maid-bottom-crest-art': imageUrl(DEEP_WHALE_DAY_MEDALLION),
  '--maid-center-crest-art': imageUrl(DEEP_WHALE_DAY_MEDALLION),
  '--maid-composer-rail-art': imageUrl(DEEP_WHALE_DAY_COMPOSER_RAIL),
  '--maid-content-frame-art': imageUrl(DEEP_WHALE_DAY_SOFT_CONTENT_FRAME),
  '--maid-new-session-art': imageUrl(DEEP_WHALE_DAY_SOFT_NEW_SESSION),
  '--maid-new-session-icon-art': imageUrl(DEEP_WHALE_DAY_MEDALLION),
  '--maid-sidebar-footer-art': DAY_SIDEBAR_SWAG,
  '--maid-sidebar-corner-art': imageUrl(DEEP_WHALE_DAY_SOFT_SIDEBAR_CORNER),
  '--maid-composer-frame-art': imageUrl(DEEP_WHALE_DAY_CONTENT_FRAME),
  '--maid-settings-frame-art': imageUrl(DEEP_WHALE_DAY_SOFT_SETTINGS),
  '--maid-workspace-crest-art': imageUrl(DEEP_WHALE_DAY_MEDALLION),
  '--maid-workspace-ribbon-art': imageUrl(DEEP_WHALE_DAY_SOFT_WORKSPACE),
}

/** Moon-Tide Observatory ornament set used by the resolved dark theme. */
export const DEEP_WHALE_NIGHT_ORNAMENTS: DeepWhaleOrnamentTheme = {
  '--maid-top-trim-art': NIGHT_TOP_TIDE_RAIL,
  '--maid-bottom-trim-art': NIGHT_BOTTOM_TIDE_RAIL,
  '--maid-top-lace-raster-art': imageUrl(DEEP_WHALE_NIGHT_TOP_LACE),
  '--maid-bottom-lace-raster-art': imageUrl(DEEP_WHALE_NIGHT_BOTTOM_LACE),
  '--maid-top-flourish-art': imageUrl(DEEP_WHALE_NIGHT_SOFT_TOP_TRIM),
  '--maid-bottom-flourish-art': imageUrl(DEEP_WHALE_NIGHT_SOFT_BOTTOM_TRIM),
  '--maid-top-crown-art': NIGHT_TOP_MAID_LACE_CROWN,
  '--maid-bottom-crown-art': NIGHT_BOTTOM_MAID_LACE_CROWN,
  '--maid-left-cluster-art': NIGHT_LEFT_MAID_LACE_CLUSTER,
  '--maid-right-cluster-art': NIGHT_RIGHT_MAID_LACE_CLUSTER,
  '--maid-bottom-crest-art': imageUrl(DEEP_WHALE_NIGHT_MEDALLION),
  '--maid-center-crest-art': imageUrl(DEEP_WHALE_NIGHT_MEDALLION),
  '--maid-composer-rail-art': imageUrl(DEEP_WHALE_NIGHT_COMPOSER_RAIL),
  '--maid-content-frame-art': imageUrl(DEEP_WHALE_NIGHT_SOFT_CONTENT_FRAME),
  '--maid-new-session-art': imageUrl(DEEP_WHALE_NIGHT_SOFT_NEW_SESSION),
  '--maid-new-session-icon-art': imageUrl(DEEP_WHALE_NIGHT_MEDALLION),
  '--maid-sidebar-footer-art': NIGHT_SIDEBAR_SWAG,
  '--maid-sidebar-corner-art': imageUrl(DEEP_WHALE_NIGHT_SOFT_SIDEBAR_CORNER),
  '--maid-composer-frame-art': imageUrl(DEEP_WHALE_NIGHT_CONTENT_FRAME),
  '--maid-settings-frame-art': imageUrl(DEEP_WHALE_NIGHT_SOFT_SETTINGS),
  '--maid-workspace-crest-art': imageUrl(DEEP_WHALE_NIGHT_MEDALLION),
  '--maid-workspace-ribbon-art': imageUrl(DEEP_WHALE_NIGHT_SOFT_WORKSPACE),
}
