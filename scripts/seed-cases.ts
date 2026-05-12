// Script d'insertion des cas statiques dans Supabase
// Exécuter : npx tsx scripts/seed-cases.ts

import { createClient } from '@supabase/supabase-js';
import { CLINICAL_CASES } from '../src/data/cases';

const SUPABASE_URL = 'https://xmhbjytraxwjwfpryubn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_7Bnm3R-_7h2U2dwJY_X9Lg_cU9O221J';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  console.log(`Insertion de ${CLINICAL_CASES.length} cas dans Supabase...\n`);

  for (const cas of CLINICAL_CASES) {
    const { error } = await supabase.from('clinical_cases').upsert(
      {
        id: cas.id,
        slug: cas.slug,
        titre: cas.titre,
        statut: cas.statut,
        niveau_complexite: cas.niveauComplexite,
        age: cas.age ?? null,
        sexe: cas.sexe ?? null,
        cas_complet: cas.casComplet,
        exemplaire: cas.exemplaire,
        grille_principale: cas.grillePrincipale,
        tags: cas.tags,
        content: cas.content,
        auteur_id: cas.auteurId ?? null,
        date_creation: cas.dateCreation ?? null,
        date_publication: cas.datePublication ?? null,
      },
      { onConflict: 'id', ignoreDuplicates: false },
    );

    if (error) {
      console.error(`  ✗ ${cas.id} — ${cas.titre}`);
      console.error(`    Erreur: ${error.message}`);
    } else {
      console.log(`  ✓ ${cas.id} — ${cas.titre}`);
    }
  }

  console.log('\nTerminé.');
}

main().catch(console.error);
