/**
 * Normalise un lien source saisi par le staff.
 * Sans schéma (http/https), un href est traité comme RELATIF par le navigateur :
 * « exemple.com/article » ouvrirait mg-headlines.com/exemple.com/article → retour à l'accueil.
 * On préfixe donc https:// quand le schéma manque.
 */
export function normalizeExternalUrl(raw?: string | null): string {
  const s = (raw ?? '').trim();
  if (!s) return '';
  // Schémas déjà explicites ou liens internes intentionnels : on ne touche pas.
  if (/^(https?:|mailto:|tel:)/i.test(s) || s.startsWith('/') || s.startsWith('#')) return s;
  // Protocol-relative //exemple.com → https:
  if (s.startsWith('//')) return 'https:' + s;
  return 'https://' + s;
}
