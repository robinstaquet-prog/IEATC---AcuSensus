// ─── Normalisation des codes de points d'acupuncture ─────────────────────────
// Accepte des saisies libres et produit un code normalisé "chiffre puis lettres".
// Détecte aussi les suffixes d'action (t = tonifié, d = dispersé, h = harmonisé,
// dt = dispersé puis tonifié, t ch = tonifié chauffé, gros sel = 8JM uniquement).
//
// Aliases méridiens :
//   RM / VC → JM  (Jenn Mo = Ren Mai = Vaisseau Conception)
//   DM / VG → TM  (Tou Mo = Du Mai = Vaisseau Gouverneur)
//
// Exemples :
//   "11Vt"      → { code: "11V",  action: "tonification" }
//   "R3"        → { code: "3R",   action: undefined }
//   "v11 t"     → { code: "11V",  action: "tonification" }
//   "3 R d"     → { code: "3R",   action: "dispersion" }
//   "33 vb"     → { code: "33VB", action: undefined }
//   "4gi h"     → { code: "4GI",  action: "harmonisation" }
//   "9c dt"     → { code: "9C",   action: "dispersion_puis_tonification" }
//   "36 E t ch" → { code: "36E",  action: "tonification_chauffee" }
//   "12 JM t"   → { code: "12JM", action: "tonification" }
//   "12 RM t"   → { code: "12JM", action: "tonification" }  (RM normalisé → JM)
//   "8JM gros sel" → { code: "8JM", action: "gros_sel" }

export type PointAction =
  | 'tonification'
  | 'dispersion'
  | 'harmonisation'
  | 'tonification_chauffee'
  | 'dispersion_chauffee'
  | 'dispersion_puis_tonification'
  | 'gros_sel';

export interface NormalizedPoint {
  code: string;                  // ex: "11V", "3R", "33VB", "12JM"
  action?: PointAction;          // si détectée à partir d'un suffixe
  display: string;               // ex: "11V tonifié", "3R", "9C dispersé puis tonifié"
  ambigu: boolean;               // true si on n'a pas su parser proprement
  raw: string;                   // saisie d'origine
}

const ACTION_LABELS: Record<PointAction, string> = {
  tonification: 'tonifié',
  dispersion: 'dispersé',
  harmonisation: 'harmonisé',
  tonification_chauffee: 'tonifié chauffé',
  dispersion_chauffee: 'dispersé chauffé',
  dispersion_puis_tonification: 'dispersé puis tonifié',
  gros_sel: 'gros sel',
};

// Aliases méridiens : notation alternative → notation IEATC canonique
const MERIDIEN_ALIASES: Record<string, string> = {
  RM: 'JM',   // Ren Mai → Jenn Mo
  DM: 'TM',   // Du Mai  → Tou Mo
  VC: 'JM',   // Vaisseau Conception (nomenclature MTC) → JM
  VG: 'TM',   // Vaisseau Gouverneur (nomenclature MTC) → TM
  RTE: 'RT',  // Rate (notation longue) → RT
};

// Méridiens reconnus (lettres seules), du plus long au plus court pour matcher
// d'abord "VB", "GI", "TR" avant les lettres simples.
const MERIDIENS = [
  'RTE', 'VB', 'GI', 'TR', 'IG', 'MC', 'RT',
  'JM', 'TM', 'VC', 'VG', 'RM', 'DM',
  'P', 'E', 'C', 'V', 'R', 'F',
];

// Set unique, trié par longueur décroissante
const MERIDIENS_SET = Array.from(new Set(MERIDIENS)).sort((a, b) => b.length - a.length);

// Détecte un suffixe d'action en fin de chaîne (après un espace ou collé).
function extractAction(s: string): { rest: string; action?: PointAction } {
  const trimmed = s.trim();

  // "gros sel" / "gros_sel" / "gros-sel" = action spéciale (8JM uniquement)
  const mGrosSel = trimmed.match(/^(.*?)\s+gros[_\s-]sel$/i);
  if (mGrosSel && mGrosSel[1].trim()) {
    return { rest: mGrosSel[1].trim(), action: 'gros_sel' };
  }

  // "t ch" (avec espace entre t et ch) = tonification chauffée
  const mTch = trimmed.match(/^(.*?)\s+t\s+ch$/i);
  if (mTch && mTch[1].trim()) {
    return { rest: mTch[1].trim(), action: 'tonification_chauffee' };
  }

  // Suffixes standard : tch, tc, dt, td, t, d, h
  const m = trimmed.match(/^(.*?)[\s]*(tch|tc|dt|td|t|d|h)$/i);
  if (!m) return { rest: trimmed };
  const rest = m[1].trim();
  const sfx = m[2].toLowerCase();
  // Si le "reste" ne contient ni chiffre ni lettre méridien, on n'a pas vraiment un suffixe
  if (!rest) return { rest: trimmed };
  let action: PointAction | undefined;
  if (sfx === 'tch' || sfx === 'tc') action = 'tonification_chauffee';
  else if (sfx === 't') action = 'tonification';
  else if (sfx === 'd') action = 'dispersion';
  else if (sfx === 'h') action = 'harmonisation';
  else if (sfx === 'dt' || sfx === 'td') action = 'dispersion_puis_tonification';
  return { rest, action };
}

// Sépare chiffres et lettres dans une chaîne (sans suffixe d'action).
function parseDigitsAndLetters(s: string): { digits: string; letters: string } | null {
  const cleaned = s.replace(/\s+/g, '');
  // Chiffres puis lettres
  let m = cleaned.match(/^(\d+)([A-Za-z]+)$/);
  if (m) return { digits: m[1], letters: m[2].toUpperCase() };
  // Lettres puis chiffres
  m = cleaned.match(/^([A-Za-z]+)(\d+)$/);
  if (m) return { digits: m[2], letters: m[1].toUpperCase() };
  return null;
}

// Vérifie que les lettres correspondent à un méridien connu (ou un alias)
function isKnownMeridien(letters: string): boolean {
  const upper = letters.toUpperCase();
  return MERIDIENS_SET.includes(upper) || upper in MERIDIEN_ALIASES;
}

// Normalise les lettres : applique les aliases (RM→JM, VC→JM, DM→TM, VG→TM)
function normalizeMeridien(letters: string): string {
  const upper = letters.toUpperCase();
  return MERIDIEN_ALIASES[upper] ?? upper;
}

export function normalizePoint(raw: string): NormalizedPoint {
  const original = raw;
  const { rest, action } = extractAction(raw);

  // Cas où l'utilisateur a tapé "11V" sans suffixe : on tente directement
  let parsed = parseDigitsAndLetters(rest);
  // Cas tordu : "v11t" → extractAction prend le t, "v11" reste
  if (!parsed) {
    parsed = parseDigitsAndLetters(raw.replace(/\s+/g, ''));
  }

  if (!parsed) {
    // Point non reconnu : on le passe tel quel (points hors méridiens, Ashi, etc.)
    return {
      code: raw.trim(),
      action,
      display: action ? `${raw.trim()} ${ACTION_LABELS[action]}` : raw.trim(),
      ambigu: true,
      raw: original,
    };
  }

  const meridienNorm = normalizeMeridien(parsed.letters);
  const code = `${parsed.digits}${meridienNorm}`;
  const ambigu = !isKnownMeridien(parsed.letters);
  const display = action
    ? `${code} ${ACTION_LABELS[action]}`
    : code;

  return { code, action, display, ambigu, raw: original };
}
