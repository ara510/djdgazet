// Palette de couleurs par secteur de veille — utilisée pour les pastilles/chips
// affichées à côté des titres (dashboard veille) et réutilisable ailleurs.
// Environnement = vert (demandé), le reste suit une teinte distincte par secteur.
export const SECTOR_COLORS: Record<string, string> = {
  politique:     '#C62828', // rouge
  economie:      '#F59E0B', // ambre / or
  international: '#3949AB', // indigo
  social:        '#8E24AA', // violet
  environnement: '#2E7D32', // vert
  agriculture:   '#689F38', // vert olive
  tourisme:      '#00897B', // turquoise
  mines:         '#6D4C41', // brun
  telecoms:      '#0288D1', // bleu ciel
  autre:         '#607D8B', // gris bleuté
};

/** Couleur pleine d'un secteur (fallback gris bleuté). */
export function sectorColor(value?: string | null): string {
  return (value && SECTOR_COLORS[value]) || '#607D8B';
}

/** Fond translucide (même teinte, ~12 % d'opacité) pour l'arrière-plan des pastilles. */
export function sectorTint(value?: string | null): string {
  return sectorColor(value) + '1F';
}
