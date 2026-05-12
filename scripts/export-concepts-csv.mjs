// Script d'export — tous les concepts IEATC + équivalences sémantiques → CSV LibreOffice
// Usage : node scripts/export-concepts-csv.mjs

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcFile = join(__dirname, '../src/data/normalisation.ts');
const outFile = join(__dirname, '../concepts-ieatc.csv');

const src = readFileSync(srcFile, 'utf-8');

// ═══════════════════════════════════════════════════════════════════════════════
// 1. Extraire EQUIVALENCES_SEMANTIQUES  (phrase → enrichissement)
// ═══════════════════════════════════════════════════════════════════════════════

const equivSection = src.match(
  /const EQUIVALENCES_SEMANTIQUES[\s\S]*?\n\];\n/
)?.[0] ?? '';

const equivs = [];
const eqRe = /\[\s*'([^']+)'\s*,\s*'([^']+)'\s*\]/g;
let eqM;
while ((eqM = eqRe.exec(equivSection)) !== null) {
  equivs.push({ phrase: eqM[1], tags: eqM[2] });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. Extraire tous les ConceptIeatc (id, label, categorie, patterns)
// ═══════════════════════════════════════════════════════════════════════════════

// On extrait chaque bloc {...} dans les arrays connues
const conceptArrayNames = [
  'FAMILLES_DIAG', 'SYNDROMES_IEATC', 'ORGANES_LOCA',
  'STRATEGIES_IEATC', 'PATHOLOGIES_IEATC',
];

const concepts = [];

for (const arrName of conceptArrayNames) {
  // Trouver la section de l'array — on cherche "= [" à la fin de la déclaration
  const startRe = new RegExp(`export const ${arrName}[^=]*=\\s*\\[`);
  const startMatch = startRe.exec(src);
  if (!startMatch) continue;
  const startIdx = startMatch.index + startMatch[0].length;

  // Trouver le ] fermant (bonne profondeur, en ignorant ceux dans les strings/patterns)
  let depth = 1;
  let endIdx = startIdx;
  for (let i = startIdx; i < src.length && depth > 0; i++) {
    if (src[i] === "'" || src[i] === '`') {
      // Sauter les strings
      const q = src[i];
      i++;
      while (i < src.length && src[i] !== q) {
        if (src[i] === '\\') i++; // skip escaped
        i++;
      }
      continue;
    }
    if (src[i] === '[') depth++;
    if (src[i] === ']') depth--;
    endIdx = i;
  }
  const arrayBody = src.slice(startIdx, endIdx);

  // Extraire chaque objet {...} — fermeture = ligne avec },
  const objRe = /\{\s*\n([\s\S]*?)\n\s*\}/g;
  let objM;
  while ((objM = objRe.exec(arrayBody)) !== null) {
    const block = objM[1];
    const id = (block.match(/id:\s*'([^']+)'/))?.[1] ?? '';
    // label peut être entre ' ou ` et peut contenir des apostrophes échappées
    let label = (block.match(/label:\s*'((?:[^'\\]|\\.)+)'/))?.[1]
             ?? (block.match(/label:\s*`([^`]+)`/))?.[1] ?? '';
    label = label.replace(/\\'/g, "'");
    const cat = (block.match(/categorie:\s*'([^']+)'/))?.[1] ?? '';

    // Extraire les patterns
    const patternsMatch = block.match(/patterns:\s*\[([\s\S]*?)\]/);
    let patterns = [];
    if (patternsMatch) {
      const raw = patternsMatch[1].replace(/\/\/[^\n]*/g, '');
      const pm = raw.match(/'([^']+)'/g);
      if (pm) patterns = pm.map(s => s.slice(1, -1));
    }

    if (!id || !cat) continue;
    concepts.push({ id, label, cat, patterns });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. Correspondances MTC connues (IEATC → MTC standard)
// ═══════════════════════════════════════════════════════════════════════════════

const MTC_MAP = {
  // Familles diagnostiques
  vide_yang:            'Yang Xu (阳虚)',
  vide_yin:             'Yin Xu (阴虚)',
  vide_qi:              'Qi Xu (气虚)',
  vide_sang:            'Xue Xu (血虚)',
  exces_yin:            'Yin Shi (阴实)',
  exces_yang:           'Yang Shi (阳实)',
  feu_vide:             'Xu Huo — Feu du vide (虚火)',
  chaleur:              'Shi Re — Chaleur plénitude (实热)',
  froid_interne:        'Han — Froid (寒)',
  humidite:             'Shi — Humidité (湿)',
  humidite_chaleur:     'Shi Re (湿热)',
  humidite_froid:       'Han Shi (寒湿)',
  vent_interne:         'Nei Feng — Vent interne (内风)',
  vent_externe:         'Wai Feng — Vent externe (外风)',
  secheresse:           'Zao — Sécheresse (燥)',
  stagnation_qi:        'Qi Zhi (气滞)',
  stagnation_sang:      'Xue Yu (血瘀)',
  obstruction_meridien: 'Jing Luo Zu — Obstruction méridien',
  plenitude_oe:         'Wei Qi Shi — Plénitude de Wei Qi',
  // Syndromes
  stagnation_qi_foie:     'Gan Qi Yu Jie (肝气郁结)',
  yang_foie_montant:      'Gan Yang Shang Kang (肝阳上亢)',
  vide_yang_rein:         'Shen Yang Xu (肾阳虚)',
  vide_yin_rein:          'Shen Yin Xu (肾阴虚)',
  vide_qi_rate:           'Pi Qi Xu (脾气虚)',
  vide_qi_poumon:         'Fei Qi Xu (肺气虚)',
  vide_yin_poumon:        'Fei Yin Xu (肺阴虚)',
  vide_yin_estomac:       'Wei Yin Xu (胃阴虚)',
  vide_yin_coeur:         'Xin Yin Xu (心阴虚)',
  vide_sang_coeur:        'Xin Xue Xu (心血虚)',
  vide_sang_foie:         'Gan Xue Xu (肝血虚)',
  vent_interne_foie:      'Gan Feng Nei Dong (肝风内动)',
  feu_foie:               'Gan Huo (肝火)',
  humidite_rate:          'Pi Shi (脾湿)',
  tan_phlegme:            'Tan (痰)',
  shen_perturbe:          'Shen Bu Ning (神不宁)',
  paradoxe_oe_iong:       'Wei Ying Bu He (卫营不和)',
  oreille_rein_shao_yang: 'Er — Oreille / Shen (Rein)',
  // Localisations / Organes
  foyer_superieur:  'Shang Jiao (上焦)',
  foyer_moyen:      'Zhong Jiao (中焦)',
  foyer_inferieur:  'Xia Jiao (下焦)',
  coeur:            'Xin (心)',
  foie:             'Gan (肝)',
  rate:             'Pi (脾)',
  rein:             'Shen (肾)',
  poumon:           'Fei (肺)',
  vb:               'Dan (胆)',
  vessie:           'Pang Guang (膀胱)',
  intestin_grele:   'Xiao Chang (小肠)',
  gros_intestin:    'Da Chang (大肠)',
  triple_rec:       'San Jiao (三焦)',
  maitre_coeur:     'Xin Bao (心包)',
  shao_yang:        'Shao Yang (少阳)',
  yang_ming:        'Yang Ming (阳明)',
  tai_yin:          'Tai Yin (太阴)',
  jue_yin:          'Jue Yin (厥阴)',
  shao_yin:         'Shao Yin (少阴)',
  tai_yang:         'Tai Yang (太阳)',
  // Vaisseaux
  ren_mai:      'Ren Mai (任脉)',
  chong_mai:    'Chong Mai (冲脉)',
  dai_mai:      'Dai Mai (带脉)',
  yang_qiao:    'Yang Qiao Mai (阳跷脉)',
  yin_qiao:     'Yin Qiao Mai (阴跷脉)',
  yang_wei_mo:  'Yang Wei Mai (阳维脉)',
  yin_wei_mo:   'Yin Wei Mai (阴维脉)',
  // Éléments
  element_eau:    'Shui (水)',
  element_bois:   'Mu (木)',
  element_feu:    'Huo (火)',
  element_terre:  'Tu (土)',
  element_metal:  'Jin (金)',
  // Stratégies
  equilibrer_yy:                   'Tiao He Yin Yang (调和阴阳)',
  tonifier_yang_general:           'Bu Yang (补阳)',
  tonifier_yin_general:            'Bu Yin (补阴)',
  tonifier_yang_rein:              'Wen Bu Shen Yang (温补肾阳)',
  nourrir_yin_rein:                'Zi Shen Yin (滋肾阴)',
  disperser_yang_foie:             'Ping Gan Qian Yang (平肝潜阳)',
  traiter_yang_apparent:           'Zi Yin Jiang Huo (滋阴降火)',
  traiter_yin_apparent:            'Wen Yang Qu Han (温阳祛寒)',
  disperser_fong:                  'Xi Feng — Calmer/éteindre le Vent (熄风)',
  disperser_foyer_moyen:           'Xie Zhong Jiao (泻中焦)',
  tonifier_foyer_inferieur:        'Bu Xia Jiao (补下焦)',
  tonifier_foyer_superieur:        'Bu Shang Jiao (补上焦)',
  lever_humidite:                  'Qu Shi (祛湿)',
  liberer_meridien:                'Tong Jing Luo (通经络)',
  pacifier_shen:                   'An Shen (安神)',
  tonifier_iong:                   'Bu Ying Qi (补营气)',
  disperser_oe:                    'Xie Wei Qi (泻卫气)',
  nourrir_sang:                    'Bu Xue (补血)',
  calmer_bois:                     'Ping Gan (平肝)',
  consolider_terre:                'Bu Tu (补土)',
  eliminer_tan:                    'Hua Tan (化痰)',
  tonifier_qi_rate:                'Bu Pi Qi (补脾气)',
  rechauffer_rate:                 'Wen Pi (温脾)',
  nourrir_yin_estomac:             'Zi Wei Yin (滋胃阴)',
  tonifier_qi_poumon:              'Bu Fei Qi (补肺气)',
  nourrir_yin_poumon:              'Zi Fei Yin (滋肺阴)',
  nourrir_yin_coeur:               'Zi Xin Yin (滋心阴)',
  nourrir_sang_coeur:              'Bu Xin Xue (补心血)',
  nourrir_yin_foie:                'Zi Gan Yin (滋肝阴)',
  harmoniser_foie_rate:            'Shu Gan Jian Pi (疏肝健脾)',
  consolider_yang_ming:            'Bu Yang Ming',
  sudation:                        'Han Fa (汗法)',
  purgation:                       'Xia Fa (下法)',
  relancer_cycle_sheng:            'Shui Sheng Mu — Eau engendre Bois',
  relancer_cycle_sheng_bois_feu:   'Mu Sheng Huo — Bois engendre Feu',
  relancer_cycle_sheng_feu_terre:  'Huo Sheng Tu — Feu engendre Terre',
  relancer_cycle_sheng_terre_metal:'Tu Sheng Jin — Terre engendre Métal',
  relancer_cycle_sheng_metal_eau:  'Jin Sheng Shui — Métal engendre Eau',
  debloquer_cycles_cheng:          'Sheng Ke — Cycle d\'engendrement global',
  traiter_ko_pathologique:         'Ke — Cycle de contrôle pathologique',
  corriger_cycle_rae:              'Fan Ke — Contre-attaque / Ko inversé',
  traiter_tae_yang:                'Tai Yang (太阳)',
  traiter_chao_yang:               'Shao Yang (少阳)',
  traiter_tae_yin:                 'Tai Yin (太阴)',
  traiter_chao_yin:                'Shao Yin (少阴)',
  traiter_jue_yin:                 'Jue Yin (厥阴)',
};

// ═══════════════════════════════════════════════════════════════════════════════
// 4. Catégories lisibles
// ═══════════════════════════════════════════════════════════════════════════════

const CAT_ORDER = ['famille_diag', 'syndrome', 'organe', 'localisation', 'vaisseau', 'element', 'strategie', 'pathologie'];
const CAT_LABELS = {
  famille_diag: '1 — Famille diagnostique',
  syndrome:     '2 — Syndrome',
  organe:       '3 — Organe / Zang-Fu',
  vaisseau:     '3 — Vaisseau merveilleux',
  localisation: '3 — Localisation / Axe',
  element:      '3 — Élément (5E)',
  strategie:    '4 — Stratégie thérapeutique',
  pathologie:   '5 — Pathologie / Motif',
};

concepts.sort((a, b) => {
  const oa = CAT_ORDER.indexOf(a.cat);
  const ob = CAT_ORDER.indexOf(b.cat);
  if (oa !== ob) return (oa === -1 ? 99 : oa) - (ob === -1 ? 99 : ob);
  return a.label.localeCompare(b.label, 'fr');
});

// ═══════════════════════════════════════════════════════════════════════════════
// 5. Mapper les EQUIVALENCES → concepts
//    Pour chaque concept, on cherche quelles phrases d'EQUIVALENCES
//    ont un enrichissement qui contient un de ses patterns.
// ═══════════════════════════════════════════════════════════════════════════════

function conceptEquivPhrases(concept) {
  const phrases = [];
  for (const eq of equivs) {
    // Le champ enrichissement contient des tags séparés par des espaces.
    // Un concept matche si un de ses patterns est un sous-ensemble du texte enrichi.
    const enrichNorm = ` ${eq.tags} `;
    for (const pat of concept.patterns) {
      if (enrichNorm.includes(` ${pat} `)) {
        phrases.push(eq.phrase);
        break;
      }
    }
  }
  return phrases;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. Écriture CSV (séparateur ;, compatible LibreOffice)
// ═══════════════════════════════════════════════════════════════════════════════

function csvCell(s) {
  if (!s) return '';
  const escaped = String(s).replace(/"/g, '""');
  return `"${escaped}"`;
}

const header = [
  'Catégorie',
  'ID',
  'Label IEATC',
  'Correspondance MTC',
  'Patterns directs',
  'Expressions sémantiques reconnues',
];

const rows = [header.map(csvCell).join(';')];

for (const c of concepts) {
  const mtc = MTC_MAP[c.id] ?? '';
  const patternsStr = c.patterns.join(' | ');
  const equivPhrases = conceptEquivPhrases(c);
  const equivStr = equivPhrases.join(' | ');

  rows.push([
    CAT_LABELS[c.cat] ?? c.cat,
    c.id,
    c.label,
    mtc,
    patternsStr,
    equivStr,
  ].map(csvCell).join(';'));
}

// Ligne vide + section EQUIVALENCES complète
rows.push('');
rows.push('');
rows.push([
  csvCell('─── TABLE DES EQUIVALENCES SEMANTIQUES ───'),
  '', '', '', '', '',
].join(';'));
rows.push([
  csvCell('Expression écrite par le praticien'),
  '', '',
  csvCell('Tags enrichis (termes canoniques injectés)'),
  '', '',
].join(';'));

for (const eq of equivs) {
  rows.push([
    csvCell(eq.phrase),
    '', '',
    csvCell(eq.tags),
    '', '',
  ].join(';'));
}

const csv = '\uFEFF' + rows.join('\n');
writeFileSync(outFile, csv, 'utf-8');

console.log(`✓ ${concepts.length} concepts + ${equivs.length} équivalences sémantiques`);
console.log(`→ ${outFile}`);

// Résumé
const counts = {};
for (const c of concepts) {
  const k = CAT_LABELS[c.cat] ?? c.cat;
  counts[k] = (counts[k] ?? 0) + 1;
}
for (const [cat, n] of Object.entries(counts)) {
  console.log(`  ${cat}: ${n}`);
}
