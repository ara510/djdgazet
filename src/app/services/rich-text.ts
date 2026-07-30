/**
 * Formatage léger des textes de veille / actu / récap :
 *   **gras** → <strong>, *italique* → <em>, ==surlignage== → <mark>.
 *
 * Source unique de vérité, utilisée PARTOUT où l'on affiche l'extrait d'une veille
 * (dashboard, accueil — cartes + modale, page secteur) pour un rendu cohérent.
 * Rendu via [innerHTML] : Angular assainit automatiquement (garde strong/em/mark,
 * retire tout script/handler), donc pas besoin de bypassSecurityTrustHtml.
 */
export function formatRecapText(text?: string | null): string {
  if (!text) return '';
  return text
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/==([^=]+)==/g, '<mark>$1</mark>');
}
