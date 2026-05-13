// Génère le SQL d'insertion pour Supabase SQL Editor
import { CLINICAL_CASES } from '../src/data/cases';

for (const cas of CLINICAL_CASES) {
  const row = {
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
    view_count: cas.viewCount ?? 0,
    auteur_id: cas.auteurId ?? null,
    updated_at: new Date().toISOString(),
    date_creation: cas.dateCreation ?? null,
    date_publication: cas.datePublication ?? null,
  };
  const json = JSON.stringify(row).replace(/'/g, "''");
  console.log(`INSERT INTO clinical_cases SELECT * FROM json_populate_record(null::clinical_cases, '${json}') ON CONFLICT (id) DO UPDATE SET titre = EXCLUDED.titre, content = EXCLUDED.content, exemplaire = EXCLUDED.exemplaire;`);
}
