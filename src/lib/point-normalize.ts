// ─── Normalisation des codes de points d'acupuncture ─────────────────────────
// Accepte des saisies libres et produit un code normalisé "chiffre puis lettres".
// Détecte aussi les suffixes d'action (t = tonifié, d = dispersé, h = harmonisé,
// dt = dispersé puis tonifié).
//
// Exemples :
//   "11Vt"   → { code: "11V", action: "tonification" }
//   "R3"     → { code: "3R",  action: undefined }
//   "v11 t"  → { code: "11V", action: "tonification" }
//   "3 R d"  → { code: "3R",  action: "dispersion" }
//   "33 vb"  → { code: "33VB", action: undefined }
//   "4gi h"  → { code: "4GI", action: "harmonisation" }
//   "9c dt"  → { code: "9C",  action: "dispersion_puis_tonification" }

export type PointAction =
  | 'tonification'
  | 'dispersion'
  | 'harmonisation'
  | 'tonification_chauffee'
  | 'dispersion_puis_tonification';

export interface NormalizedPoint {
  code: string;                  // ex: "11V", "3R", "33VB"
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
  dispersion_puis_tonification: 'dispersé puis tonifié',
};

// Méridiens reconnus (lettres seules), du plus long au plus court pour matcher
// d'abord "VB", "GI", "TR" avant les lettres simples.
const MERIDIENS = [
  'VB', 'VC', 'VG', 'GI', 'TR', 'IG',
  'P', 'GI', 'E', 'RT', 'C', 'IG', 'V', 'R', 'MC', 'TR', 'VB', 'F',
];

// Set unique, trié par longueur décroissante
const MERIDIENS_SET = Array.from(new Set(MERIDIENS)).sort((a, b) => b.length - a.length);

// Détecte un suffixe d'action en fin de chaîne (après un espace ou collé).
function extractAction(s: string): { rest: string; action?: PointAction } {
  const trimmed = s.trim();
  // 'dt' = dispersion puis tonification, 'tch'/'tc' = tonification chauffée
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

// Vérifie que les lettres correspondent à un méridien connu (insensible à l'ordre/casse)
function isKnownMeridien(letters: string): boolean {
  return MERIDIENS_SET.includes(letters.toUpperCase());
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
    return {
      code: raw.trim().toUpperCase(),
      action,
      display: raw.trim().toUpperCase(),
      ambigu: true,
      raw: original,
    };
  }

  const code = `${parsed.digits}${parsed.letters}`;
  const ambigu = !isKnownMeridien(parsed.letters);
  const display = action
    ? `${code} ${ACTION_LABELS[action]}`
    : code;

  return { code, action, display, ambigu, raw: original };
}
