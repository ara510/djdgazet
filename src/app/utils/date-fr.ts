// Conversion entre le format ISO (yyyy-mm-dd, utilisé par le backend) et
// l'affichage jj/mm/aaaa attendu par l'utilisateur (les <input type="date">
// natifs s'affichent selon la locale du navigateur, souvent mm/jj — d'où ces
// champs texte au format français).

/** 'yyyy-mm-dd' → 'jj/mm/aaaa' (chaîne vide si invalide). */
export function isoToFr(iso?: string | null): string {
  if (!iso) return '';
  const m = iso.slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : '';
}

/** 'jj/mm/aaaa' (ou 'jj/mm/aa') → 'yyyy-mm-dd' (chaîne vide si invalide). */
export function frToIso(fr?: string | null): string {
  if (!fr) return '';
  const m = fr.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/);
  if (!m) return '';
  let [, d, mo, y] = m;
  if (y.length === 2) y = '20' + y;
  const day = +d, mon = +mo;
  if (day < 1 || day > 31 || mon < 1 || mon > 12) return '';
  return `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`;
}
