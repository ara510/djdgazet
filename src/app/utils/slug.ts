/**
 * Convertit un titre en slug lisible pour l'URL (« Mon Article, a la Une ! »
 * -> « mon-article-a-la-une »). Purement cosmetique : l'identifiant numerique
 * de l'article reste la cle de resolution, le slug n'est jamais interprete.
 */
export function slugify(title?: string | null): string {
  const s = (title ?? '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // retire les accents (NFD -> diacritiques isoles)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');
  return s || 'article';
}
