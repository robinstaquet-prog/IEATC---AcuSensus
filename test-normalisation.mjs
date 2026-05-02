/**
 * Test de démonstration du moteur de normalisation IEATC
 * Usage : node test-normalisation.mjs
 */

// ─── Copie inline des fonctions (sans les imports TS) ────────────────────────

function normaliserTexteIeatc(s) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function matchPattern(normalized, pattern) {
  return (` ${normalized} `).includes(` ${pattern} `);
}

const FAMILLES_DIAG = [
  { id: 'vide_yang', label: 'Vide de Yang', patterns: ['vide de yang','vide yang','yang vide','insuffisance yang','yang insuffisant','yang deficient','carence yang','manque de yang'] },
  { id: 'vide_yin', label: 'Vide de Yin', patterns: ['vide de yin','vide yin','yin vide','insuffisance yin','yin insuffisant','yin deficient','carence yin','manque de yin'] },
  { id: 'vide_qi', label: 'Vide de Qi', patterns: ['vide de qi','vide qi','qi vide','vide de tchi','tchi vide','insuffisance qi','qi insuffisant','insuffisance energetique','energie insuffisante'] },
  { id: 'vide_sang', label: 'Vide de Sang', patterns: ['vide de sang','vide sang','sang vide','insuffisance sang','sang insuffisant','sang non nourri'] },
  { id: 'vide_jing', label: 'Vide de Jing / Tsing', patterns: ['vide de jing','vide jing','jing vide','tsing vide','vide de tsing','insuffisance jing','jing epuise','tsing epuise','vide d essence'] },
  { id: 'vide_iong', label: "Vide d'Iong", patterns: ['iong insuffisante','iong vide','vide d iong','vide de iong','ying qi insuffisante','insuffisance iong'] },
  { id: 'exces_yin', label: 'Excès de Yin', patterns: ['exces de yin','exces yin','yin en exces','plenitude yin','plenitude de yin','trop de yin','yin trop fort','yin excessif'] },
  { id: 'exces_yang', label: 'Excès de Yang', patterns: ['exces de yang','exces yang','yang en exces','plenitude yang','plenitude de yang','yang local','yang en plenitude'] },
  { id: 'plenitude_oe', label: "Plénitude d'Oé", patterns: ['oe en plenitude','plenitude d oe','oé en plenitude','wei qi en exces','exces d oe'] },
  { id: 'stagnation_qi', label: 'Stagnation de Qi', patterns: ['stagnation de qi','stagnation qi','qi stagnant','stagnation energetique','stagnation d energie','energie stagnante','blocage de qi','qi bloque'] },
  { id: 'stagnation_sang', label: 'Stagnation de Sang', patterns: ['stagnation de sang','stagnation sang','sang stagnant','sang bloque','stase sanguine'] },
  { id: 'obstruction_meridien', label: 'Obstruction méridienne', patterns: ['obstruction du meridien','obstruction meridien','atteinte du meridien','atteinte meridien','meridien obstrue','meridien bloque','meridien atteint','vide du meridien','sequelle meridien'] },
  { id: 'chaleur', label: 'Chaleur', patterns: ['chaleur interne','chaleur de','chaleur dans','chaleur au','accumulation de chaleur','exces de chaleur','feu de','feu dans'] },
  { id: 'feu_vide', label: 'Feu du vide (Xu Huo)', patterns: ['feu du vide','chaleur de vide','feu de vide','xu huo','chaleur xu','chaleur vide','yang relatif ascendant'] },
  { id: 'humidite', label: 'Humidité', patterns: ['humidite interne','retention d humidite','accumulation d humidite','humidite de','humidite dans','humidite au','exces d humidite','humidite pathogene'] },
  { id: 'humidite_chaleur', label: 'Humidité-Chaleur', patterns: ['humidite chaleur','chaleur humidite','humidite et chaleur','chaleur et humidite'] },
  { id: 'humidite_froid', label: 'Humidité-Froid', patterns: ['humidite froid','froid humidite','humidite et froid','froid et humidite','froid humide'] },
  { id: 'froid_interne', label: 'Froid interne', patterns: ['froid interne','froid de','froid dans','froid au','invasion de froid','froid pathogene','accumulation de froid','manque de chaleur yang'] },
  { id: 'vent_interne', label: 'Vent interne', patterns: ['vent interne','vent du foie','vent interne du foie','agitation interne','yang monte en usurpateur','yang ascendant'] },
  { id: 'secheresse', label: 'Sécheresse', patterns: ['secheresse interne','secheresse de','manque de liquides','liquides insuffisants','jin ye insuffisants','jin ye vide'] },
];

const SYNDROMES_IEATC = [
  { id: 'vide_yang_rein', label: 'Vide de Yang du Rein', patterns: ['vide de yang du rein','vide yang rein','yang du rein vide','yang du rein insuffisant','rein yang vide','rein en vide de yang'] },
  { id: 'mingmen_insuffisant', label: 'Ming Men insuffisant', patterns: ['ming men insuffisant','ming men eteint','feu du ming men','feu de ming men','feu du rein','porte de la vie','ming men declinant'] },
  { id: 'vide_yin_rein', label: 'Vide de Yin du Rein', patterns: ['vide de yin du rein','vide yin rein','yin du rein vide','yin du rein insuffisant','rein yin vide','rein en vide de yin','insuffisance yin du rein','eau insuffisante','vide profond de l eau'] },
  { id: 'yang_foie_montant', label: 'Yang du Foie montant', patterns: ['yang du foie montant','yang foie montant','yang du foie en exces','prosperite du yang du foie','foie yang montant','yang montant du foie','yang monte','yang en usurpateur','bois non contenu'] },
  { id: 'vent_interne_foie', label: 'Vent interne du Foie', patterns: ['vent interne du foie','vent du foie','vent interne foie','pouls corde arc','vertiges vent interne'] },
  { id: 'feu_vide_xu', label: 'Feu du vide (Xu Huo)', patterns: ['feu du vide','chaleur de vide','chaleur vesperal','sueurs nocturnes vide'] },
  { id: 'bois_envahit_terre', label: 'Bois envahit Terre', patterns: ['bois envahit terre','foie envahit rate','bois sur terre','ko pathologique','foie agresse la rate','conflit bois terre','chaleur du bois debordant'] },
  { id: 'cycle_sheng_eau_bois', label: 'Cycle Sheng Eau→Bois brisé', patterns: ['eau ne nourrit plus bois','eau bois cycle sheng','cycle sheng eau bois','rein ne nourrit plus foie','eau insuffisante bois','insuffisance eau bois','bois mal nourri par l eau','foie mal nourri par le rein'] },
  { id: 'shen_perturbe', label: 'Shen perturbé', patterns: ['shen perturbe','coeur perturbe','shen trouble','insomnie palpitations','shen agite'] },
  { id: 'exces_yin_foyer_moyen', label: 'Excès de Yin au Foyer Moyen', patterns: ['exces yin foyer moyen','foyer moyen sature','rate surchargee','rate trop forte','rate en exces de yin','plenitude yin foyer moyen','plenitude au foyer moyen'] },
  { id: 'foyer_inferieur_vide_yang', label: 'Foyer Inférieur en vide de Yang', patterns: ['foyer inferieur vide de yang','foyer inferieur vide yang','vide yang foyer inferieur','vide de yang au foyer inferieur','foyer inferieur en vide','foyer inferieur insuffisant'] },
  { id: 'diarrhees_matinales', label: 'Diarrhées matinales — Ming Men', patterns: ['diarrhees matinales','diarrhee au petit matin','yang ming sans stimulus','souffles yang ne montent plus'] },
  { id: 'du_mai_insuffisant', label: 'Du Mai insuffisant', patterns: ['du mai insuffisant','du mai fragilise','yang ne monte plus le long du du mai','du mai vide','vaisseau gouverneur insuffisant'] },
  { id: 'ren_mai_fragilise', label: 'Ren Mai fragilisé', patterns: ['ren mai fragilise','ren mai insuffisant','yin insuffisant pour ancrer','yin de base insuffisant'] },
  { id: 'paradoxe_oe_iong', label: 'Paradoxe Oé/Iong', patterns: ['paradoxe yang local','paradoxe local general','vide yang general chaleur locale','iong vide oe plenitude'] },
  { id: 'tendons_foie_vb', label: 'Tendons — domaine Foie/VB', patterns: ['tendons non nourris','tendons insuffisamment nourris','tendons fragiles','foie ne gouverne plus les tendons','foie vb ne gouverne plus'] },
  { id: 'oreille_rein', label: 'Oreille — domaine Rein/Shao Yang', patterns: ['oreille interne','oreille rein','bourdonnements vide','feu vide irrite oreille'] },
];

const ORGANES = [
  { id: 'rein', label: 'Rein', patterns: ['rein','reins'] },
  { id: 'foie', label: 'Foie', patterns: ['foie','hepatique'] },
  { id: 'rate', label: 'Rate', patterns: ['rate'] },
  { id: 'coeur', label: 'Cœur', patterns: ['coeur'] },
  { id: 'poumon', label: 'Poumon', patterns: ['poumon','poumons'] },
  { id: 'estomac', label: 'Estomac', patterns: ['estomac'] },
  { id: 'vb', label: 'Vésicule Biliaire', patterns: ['vesicule biliaire','vesicule','vb'] },
  { id: 'foyer_superieur', label: 'Foyer Supérieur', patterns: ['foyer superieur'] },
  { id: 'foyer_moyen', label: 'Foyer Moyen', patterns: ['foyer moyen'] },
  { id: 'foyer_inferieur', label: 'Foyer Inférieur', patterns: ['foyer inferieur'] },
  { id: 'du_mai', label: 'Du Mai', patterns: ['du mai'] },
  { id: 'ren_mai', label: 'Ren Mai', patterns: ['ren mai'] },
];

const STRATEGIES = [
  { id: 'nourrir_yin_rein', label: 'Nourrir le Yin du Rein', patterns: ['nourrir le yin du rein','nourrir yin rein','tonifier le yin du rein','soutenir le yin du rein','nourrir l eau','nourrir la base yin'] },
  { id: 'tonifier_yang_rein', label: 'Tonifier le Yang du Rein / Ming Men', patterns: ['tonifier le yang du rein','tonifier yang rein','tonifier ming men','ranimer le feu du ming men','ranimer ming men','augmenter le feu du ming men'] },
  { id: 'disperser_yang_foie', label: 'Disperser le Yang du Foie', patterns: ['disperser le yang du foie','abaisser le yang du foie','disperser yang foie','descendre le yang du foie','calmer le yang du foie'] },
  { id: 'clarifier_feu_vide', label: 'Clarifier le Feu du vide', patterns: ['clarifier le feu du vide','clarifier feu vide','traiter le feu du vide','nourrir le yin pour clarifier'] },
  { id: 'disperser_foyer_moyen', label: 'Disperser le Foyer Moyen', patterns: ['disperser le foyer moyen','lever l exces de yin au foyer moyen','disperser la plenitude du foyer moyen','vider le foyer moyen','abaisser le foyer moyen'] },
  { id: 'tonifier_foyer_inferieur', label: 'Tonifier le Foyer Inférieur', patterns: ['tonifier le foyer inferieur','soutenir le foyer inferieur','tonification foyer inferieur','renforcer le foyer inferieur'] },
  { id: 'relancer_cycle_sheng', label: 'Relancer le cycle Sheng Eau→Bois', patterns: ['relancer le cycle sheng','nourrir l eau pour relancer le bois','relancer cycle sheng','nourrir eau pour bois'] },
  { id: 'lever_humidite', label: "Lever l'humidité", patterns: ['lever l humidite','disperser l humidite','drainer l humidite','eliminer l humidite'] },
  { id: 'pacifier_vent_interne', label: 'Pacifier le Vent interne', patterns: ['pacifier le vent interne','pacifier vent interne','calmer le vent interne'] },
  { id: 'traitement_local', label: 'Traitement local (dernier temps)', patterns: ['traitement local','traitement local en dernier','traiter localement','traitement secondaire local'] },
  { id: 'tonifier_yang_general', label: 'Tonifier le Yang général', patterns: ['tonifier le yang general','tonification yang general','soutenir le yang general'] },
  { id: 'pacifier_shen', label: 'Pacifier le Shen', patterns: ['pacifier le shen','calmer le shen','apaiser le coeur','calmer le coeur','soutenir le coeur'] },
  { id: 'calmer_bois', label: 'Calmer le Bois', patterns: ['calmer le bois','calmer le foie','disperser le bois','apaiser le bois','drainer le foie'] },
  { id: 'tonifier_iong', label: "Tonifier l'Iong", patterns: ['tonifier l iong','tonification iong','nourrir l iong','soutenir l iong'] },
];

// ─── Couche 5 — Pathologies ───────────────────────────────────────────────────

const PATHOLOGIES = [
  { id: 'lombalgie',              label: 'Lombalgie / Douleur lombaire',           patterns: ['lombalgie','lombalgies','lumbago','douleur lombaire','douleurs lombaires','mal de dos','mal au dos','douleur au dos','douleur bas du dos'] },
  { id: 'cervicalgie',            label: 'Cervicalgie / Douleur cervicale',        patterns: ['cervicalgie','cervicalgies','douleur cervicale','douleurs cervicales','douleur au cou','raideur cervicale','torticolis','nuque douloureuse','nuque raide'] },
  { id: 'tendinite',              label: 'Tendinite / Tendinopathie',              patterns: ['tendinite','tendinites','tendinopathie','tendinose','epicondylite','epicondylites','epicondyle','epitrochleite','periarthrite','coiffe des rotateurs'] },
  { id: 'gonalgie',               label: 'Gonalgie / Douleur de genou',            patterns: ['gonalgie','gonalgies','douleur genou','douleur au genou','douleur du genou','genou douloureux','genou droit','genou gauche','chondropathie','menisque'] },
  { id: 'sciatique',              label: 'Sciatique / Névralgie sciatique',        patterns: ['sciatique','sciatalgie','nevralgique sciatique','irradiation sciatique','douleur irradiante jambe'] },
  { id: 'epaule_douloureuse',     label: 'Épaule douloureuse',                     patterns: ['epaule douloureuse','douleur epaule','douleur a l epaule','douleur de l epaule','blocage epaule','epaule bloquee','epaule droite','epaule gauche'] },
  { id: 'arthralgie',             label: 'Arthralgie / Arthrite',                  patterns: ['arthralgie','arthralgies','arthrite','arthrites','douleur articulaire','douleurs articulaires','polyarthrite','rhumatisme','rhumatismes'] },
  { id: 'cephalees',              label: 'Céphalées / Migraines',                  patterns: ['cephalee','cephalees','migraine','migraines','mal de tete','maux de tete','mal a la tete','douleur cephalique','cephalee temporale','cephalee frontale'] },
  { id: 'vertiges',               label: 'Vertiges / Étourdissements',             patterns: ['vertige','vertiges','etourdissement','etourdissements','sensation de vertige','instabilite','troubles de l equilibre'] },
  { id: 'acouphenes',             label: "Acouphènes / Bourdonnements d'oreille", patterns: ['acouphene','acouphenes','bourdonnement','bourdonnements','bourdonnement d oreille','tinnitus','sifflement oreille'] },
  { id: 'insomnie',               label: 'Insomnie / Troubles du sommeil',         patterns: ['insomnie','insomnies','trouble du sommeil','troubles du sommeil','difficulte a dormir','difficulte d endormissement','endormissement difficile','sommeil perturbe','reveil nocturne','reveils nocturnes'] },
  { id: 'anxiete',                label: 'Anxiété / Stress',                       patterns: ['anxiete','stress','angoisse','angoisses','agitation','burn out','burnout','epuisement professionnel'] },
  { id: 'depression',             label: 'Dépression / Mélancolie',                patterns: ['depression','depressions','deprime','abattement','melancolie','tristesse persistante'] },
  { id: 'diarrhees',              label: 'Diarrhées / Transit accéléré',           patterns: ['diarrhee','diarrhees','selles molles','selles liquides','transit accelere','colon irritable','intestin irritable','colite'] },
  { id: 'constipation',           label: 'Constipation',                           patterns: ['constipation','constipations','selles dures','transit lent'] },
  { id: 'ballonnements',          label: 'Ballonnements / Distension abdominale',  patterns: ['ballonnement','ballonnements','distension abdominale','gaz intestinaux','flatulences','meteorisme','ventre gonfle'] },
  { id: 'nausees',                label: 'Nausées / Vomissements',                 patterns: ['nausee','nausees','vomissement','vomissements','sensation de nausee','envie de vomir'] },
  { id: 'reflux',                 label: "Reflux / RGO / Brûlures d'estomac",     patterns: ['reflux','rgo','pyrosis','brulure estomac','brulures estomac','remontees acides','acidite gastrique','gastrite'] },
  { id: 'palpitations',           label: 'Palpitations / Arythmie',               patterns: ['palpitation','palpitations','tachycardie','arythmie','extrasystole','extrasystoles'] },
  { id: 'hypertension',           label: 'Hypertension artérielle (HTA)',          patterns: ['hypertension','hta','tension elevee','tension arterielle elevee','pression arterielle haute'] },
  { id: 'dysmenorrhee',           label: 'Dysménorrhée / Règles douloureuses',     patterns: ['dysmenorrhee','regles douloureuses','douleurs menstruelles','crampes menstruelles','douleur regles','douleur pendant les regles','algodysmenorrhee'] },
  { id: 'irregularite_menstruelle', label: 'Irrégularité menstruelle / Aménorrhée', patterns: ['amenorrhee','absence de regles','regles absentes','irregularite menstruelle','regles irregulieres','cycle irregulier','oligomenorrhee'] },
  { id: 'spm',                    label: 'Syndrome prémenstruel (SPM)',             patterns: ['spm','syndrome premenstruel','premenstruel','tension premenstruelle'] },
  { id: 'toux',                   label: 'Toux / Toux chronique',                  patterns: ['toux','toux chronique','toux seche','toux grasse','toux persistante'] },
  { id: 'asthme',                 label: 'Asthme / Dyspnée',                       patterns: ['asthme','dyspnee','essoufflement','difficulte respiratoire','oppression thoracique','souffle court'] },
  { id: 'sinusite',               label: 'Sinusite / Rhinite / Rhume',             patterns: ['sinusite','sinusites','rhinite','rhinites','congestion nasale','rhume chronique','rhino sinusite','ecoulement nasal'] },
  { id: 'pollakiurie',            label: 'Pollakiurie / Mictions fréquentes',      patterns: ['pollakiurie','mictions frequentes','envie frequente d uriner','incontinence urinaire','fuites urinaires','urgences mictionnelles'] },
  { id: 'nycturie',               label: 'Nycturie / Réveils nocturnes',           patterns: ['nycturie','se lever la nuit pour uriner','lever la nuit','mictions nocturnes','reveils pour uriner','envie d uriner la nuit'] },
  { id: 'fatigue',                label: 'Fatigue / Asthénie',                     patterns: ['fatigue','fatigues','asthenie','epuisement','manque d energie','fatigue chronique','fatigue generale','grande fatigue'] },
  { id: 'eczema',                 label: 'Eczéma / Prurit / Dermatite',            patterns: ['eczema','dermatite','prurit','demangeaison','demangeaisons','psoriasis','urticaire'] },
];

// ─── Moteur ──────────────────────────────────────────────────────────────────

function analyserTexte(texte) {
  const n = normaliserTexteIeatc(texte);
  const result = { familles: [], syndromes: [], organes: [], strategies: [], pathologies: [] };
  for (const c of FAMILLES_DIAG)  if (c.patterns.some(p => matchPattern(n, p))) result.familles.push(c.label);
  for (const c of SYNDROMES_IEATC) if (c.patterns.some(p => matchPattern(n, p))) result.syndromes.push(c.label);
  for (const c of ORGANES)        if (c.patterns.some(p => matchPattern(n, p))) result.organes.push(c.label);
  for (const c of STRATEGIES)     if (c.patterns.some(p => matchPattern(n, p))) result.strategies.push(c.label);
  for (const c of PATHOLOGIES)    if (c.patterns.some(p => matchPattern(n, p))) result.pathologies.push(c.label);
  return result;
}

// ─── Exemples ─────────────────────────────────────────────────────────────────

const EXEMPLES = [
  // Cas 1 — variantes d'écriture du même concept
  {
    titre: '3 façons d\'écrire la même chose → même résultat',
    textes: [
      'Vide de Yin du Rein',
      'Rein en vide de Yin',
      'Insuffisance du Yin rénal — Eau insuffisante',
    ],
  },
  // Cas 2 — entrée officielle du corpus
  {
    titre: 'Catégorie diagnostique réelle (cas Florence)',
    textes: [
      'Vide de Yang général — Foyer Inférieur',
      'Excès de Yin — Foyer Moyen (Rate)',
      'Atteinte du méridien Vésicule Biliaire par séquelles de mononucléose',
    ],
  },
  // Cas 3 — bilan énergétique libre
  {
    titre: 'Bilan énergétique libre (cas hypertension)',
    textes: [
      'Vide de Yin du Rein (cause profonde). Foie en excès de Yang — Feu montant au Cœur. Shen perturbé : insomnie, palpitations, irritabilité.',
    ],
  },
  // Cas 4 — stratégie thérapeutique
  {
    titre: 'Stratégie thérapeutique (cas diarrhées matinales)',
    textes: [
      'Ranimer le Feu du Ming Men. Soutenir le Yang du Rein. Relancer la montée des Souffles Yang vers le Foyer Moyen. Tonifier la Terre (Rate/Estomac).',
    ],
  },
  // Cas 5 — faux positif potentiel
  {
    titre: 'Résistance aux faux positifs',
    textes: [
      'Pratique intensive de la danse depuis 7 ans', // "rate" dans "pratique" ?
      'Encouragement de la communauté',              // "coeur" dans "encouragement" ?
      'Éventuellement traiter en 3 séances',         // "vent" dans "éventuellement" ?
    ],
  },
  // Cas 6 — Feu du vide — distinction critique
  {
    titre: 'Feu du vide vs Chaleur réelle — distinction critique',
    textes: [
      'Feu du vide ascendant — irrite l\'oreille via le Shao Yang',
      'Chaleur de la Vésicule Biliaire en plénitude',
    ],
  },
  // Cas 7 — Pathologies : convergence de termes
  {
    titre: 'Pathologies — tendinite = épicondylite (même entrée stats)',
    textes: [
      'Tendinite chronique du coude droit',
      'Épicondylite latérale — douleur irradiante avant-bras',
      'Tendinopathie insertionnelle épicondyle',
    ],
  },
  {
    titre: 'Pathologies — maux de tête = céphalées = migraine',
    textes: [
      'Migraines temporales récidivantes depuis 3 ans',
      'Maux de tête matinaux avec vertiges',
      'Céphalées frontales aggravées par le stress',
    ],
  },
  {
    titre: 'Pathologies — motif de consultation avec contexte IEATC',
    textes: [
      'Lombalgie chronique depuis 2 ans — terrain Yang vide',
      'Insomnie avec anxiété — Shen perturbé',
      'Diarrhées matinales + fatigue générale',
    ],
  },
  {
    titre: 'Résistance faux positifs pathologies',
    textes: [
      'Pratique du yoga depuis 5 ans',   // "toux" dans "pratique" ?
      'Bonne énergie générale',           // "nausée" ? non
      'Consultation de suivi en mars',    // rien
    ],
  },
];

// ─── Affichage ────────────────────────────────────────────────────────────────

const C = { reset: '\x1b[0m', bold: '\x1b[1m', cyan: '\x1b[36m', green: '\x1b[32m', yellow: '\x1b[33m', magenta: '\x1b[35m', grey: '\x1b[90m', red: '\x1b[31m' };

for (const exemple of EXEMPLES) {
  console.log('\n' + C.bold + '═'.repeat(70) + C.reset);
  console.log(C.bold + C.cyan + exemple.titre + C.reset);
  console.log('═'.repeat(70));

  for (const texte of exemple.textes) {
    const r = analyserTexte(texte);
    const total = r.familles.length + r.syndromes.length + r.organes.length + r.strategies.length + r.pathologies.length;

    console.log('\n  ' + C.grey + '▸ Input  : ' + C.reset + texte);

    if (total === 0) {
      console.log('  ' + C.grey + '  → Aucun concept reconnu' + C.reset);
    } else {
      if (r.familles.length)    console.log('  ' + C.yellow  + '  Familles  : ' + C.reset + r.familles.join(', '));
      if (r.syndromes.length)   console.log('  ' + C.magenta + '  Syndromes : ' + C.reset + r.syndromes.join(', '));
      if (r.organes.length)     console.log('  ' + C.green   + '  Organes   : ' + C.reset + r.organes.join(', '));
      if (r.strategies.length)  console.log('  ' + C.cyan    + '  Stratégies: ' + C.reset + r.strategies.join(', '));
      if (r.pathologies.length) console.log('  ' + C.red     + '  Pathologie: ' + C.reset + r.pathologies.join(', '));
    }
  }
}

console.log('\n' + '═'.repeat(70) + '\n');
