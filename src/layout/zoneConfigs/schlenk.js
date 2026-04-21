// SCHLENK — Manifold + Bench Zones (Layout B from brainstorm)
// Hero: Plex (La) in a Schlenk flask with sidearm — top-left MEDIA zone.
// Bounds match apothecary.js shape (which is visually adjacent — both are lab-adjacent modes).
export default {
  MEDIA:    { bounds: [0.03, 0.05, 0.45, 0.30], layout: 'grid', cols: 4, heroId: 'plex',        heroSize: 'lg', cardSize: 'sm' },
  LIBRARY:  { bounds: [0.52, 0.05, 0.45, 0.30], layout: 'grid', cols: 4, heroId: 'audiobookshelf', heroSize: 'sm', cardSize: 'sm' },
  PIPELINE: { bounds: [0.03, 0.37, 0.45, 0.22], layout: 'grid', cols: 3, heroId: 'qbittorrent', heroSize: 'sm', cardSize: 'sm' },
  INFRA:    { bounds: [0.52, 0.37, 0.45, 0.28], layout: 'grid', cols: 5, cardSize: 'xs' },
  TOOLS:    { bounds: [0.03, 0.62, 0.94, 0.14], layout: 'grid', cols: 8, cardSize: 'xs' },
  BOTS:     { bounds: [0.03, 0.78, 0.94, 0.20], layout: 'grid', cols: 10, cardSize: 'xxs' },
};
