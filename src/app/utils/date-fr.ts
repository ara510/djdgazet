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

// ── Date de naissance ───────────────────────────────────────────────────────────
// Des comptes étaient nés en 2073/2081/2096 : une année à 2 chiffres (« 21/09/96 ») était
// préfixée « 20 ». Le remède n'est PAS de mieux deviner le siècle — « 01/01/20 » peut être
// 1920 comme 2020, et deviner est précisément l'origine du bug. On exige donc l'année en
// entier pour une naissance, et on renvoie à l'écran la date telle qu'elle a été comprise.
// (`frToIso` garde son comportement pour les dates d'articles, où « 25 » = 2025.)

/** Âge minimum pour ouvrir un compte. */
export const MIN_AGE = 16;
/** Au-delà, c'est une faute de frappe, pas un lecteur. */
export const MAX_AGE = 110;

export type BirthDateIssue = 'shortyear' | 'invalid' | 'future' | 'young' | 'old';

/** Âge révolu à la date du jour, à partir d'une date ISO 'yyyy-mm-dd'. */
export function ageFromIso(iso: string): number | null {
  const m = iso.slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const [y, mo, d] = [+m[1], +m[2], +m[3]];
  const dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
  const now = new Date();
  let age = now.getFullYear() - y;
  const passed = now.getMonth() + 1 > mo || (now.getMonth() + 1 === mo && now.getDate() >= d);
  if (!passed) age -= 1;
  return age;
}

/** Analyse une date de naissance saisie en jj/mm/aaaa : ISO obtenu + nature du problème. */
export function parseBirthDate(fr?: string | null): { iso: string; age: number | null; issue: BirthDateIssue | null } {
  const text = (fr || '').trim();
  // Année à 2 chiffres : refusée explicitement plutôt que devinée.
  if (/^\d{1,2}\/\d{1,2}\/\d{2}$/.test(text)) return { iso: '', age: null, issue: 'shortyear' };
  const iso = frToIso(text);
  const age = iso ? ageFromIso(iso) : null;
  if (!iso || age === null) return { iso: '', age: null, issue: 'invalid' };
  if (age < 0)        return { iso, age, issue: 'future' };
  if (age < MIN_AGE)  return { iso, age, issue: 'young' };
  if (age > MAX_AGE)  return { iso, age, issue: 'old' };
  return { iso, age, issue: null };
}

/** Message prêt à afficher pour un problème de date de naissance. */
export function birthDateMessage(issue: BirthDateIssue, fr: boolean): string {
  switch (issue) {
    case 'shortyear': return fr
      ? `Écrivez l'année en entier : 21/09/1996, pas 21/09/96.`
      : `Write the full year: 21/09/1996, not 21/09/96.`;
    case 'future': return fr
      ? `Cette date est dans le futur. Vérifiez l'année de naissance.`
      : `That date is in the future. Check the birth year.`;
    case 'young': return fr
      ? `Vous devez avoir au moins ${MIN_AGE} ans pour créer un compte.`
      : `You must be at least ${MIN_AGE} to create an account.`;
    case 'old': return fr
      ? `Année de naissance improbable : vérifiez votre saisie.`
      : `Unlikely birth year: please check your entry.`;
    default: return fr
      ? `Date de naissance invalide (jj/mm/aaaa).`
      : `Invalid date of birth (dd/mm/yyyy).`;
  }
}

/** Renvoi visuel sous le champ : la date telle qu'elle a été comprise, + l'âge. */
export function birthDateEcho(fr: string | null | undefined, french: boolean): string {
  const { iso, age, issue } = parseBirthDate(fr);
  if (!iso || age === null || issue === 'future') return '';
  const label = new Date(iso).toLocaleDateString(french ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  return french ? `Compris : ${label} — ${age} ans` : `Read as: ${label} — ${age} years old`;
}
