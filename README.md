# AcuSensus

**Plateforme de pensée clinique IEATC**

Base de cas cliniques structurés, commentés selon les grilles de lecture IEATC (Yin/Yang, Cinq Éléments, Zang/Fu, Méridiens…). Mode entraînement avec participation privée, révélation de l'analyse, lexique IEATC.

---

## Stack

- **Next.js 16** (App Router, Turbopack, SSG)
- **TypeScript** strict
- **Tailwind CSS v4** (configuration CSS-only via `@theme {}`)
- **Supabase** (Auth + PostgreSQL + RLS) — mode démo localStorage en MVP
- **Lucide React** (icônes)

---

## Démarrage rapide

```bash
npm install
npm run dev
# → http://localhost:3000
```

```bash
npm run build   # build de production
npm start       # serveur de production
```

---

## Structure du projet

```
src/
├── app/
│   ├── page.tsx              # Accueil
│   ├── cas/
│   │   ├── page.tsx          # Liste des cas (filtres, chips grilles)
│   │   └── [id]/
│   │       ├── page.tsx      # Fiche cas — serveur (SSG + metadata)
│   │       └── CasDetailClient.tsx  # Phase A/B, révélation, participation
│   ├── lexique/page.tsx      # Lexique IEATC
│   ├── profil/page.tsx       # Espace personnel (participations)
│   └── statistiques/page.tsx # Stats globales
├── components/
│   ├── ieatc/
│   │   ├── AcuPoint.tsx      # Règle absolue : code + nom + technique ensemble
│   │   ├── GridBadge.tsx     # Badge coloré par grille de lecture
│   │   ├── ParticipationForm.tsx  # Formulaire participation privée
│   │   └── PoulsDisplay.tsx  # Affichage spécial prise de pouls (acte central)
│   ├── layout/
│   │   ├── Navbar.tsx        # Navigation + auth
│   │   └── Footer.tsx
│   └── ui/                   # Composants génériques (button, input, card…)
├── data/
│   ├── cases.ts              # 5 cas cliniques IEATC (corpus réel)
│   ├── grilles.ts            # 7 grilles de lecture IEATC
│   ├── lexique.ts            # Termes IEATC avec correspondances MTC
│   └── index.ts              # Exports + computeGlobalStats()
├── lib/
│   ├── auth-context.tsx      # AuthProvider (demo → Supabase-ready)
│   ├── participation-store.ts # localStorage → Supabase abstraction
│   └── utils.ts
└── types/index.ts            # Types IEATC complets
```

---

## Grilles de lecture IEATC

| Ordre | ID | Nom | Couleur |
|-------|----|-----|---------|
| 1 | `yin_yang` | Yin / Yang | Slate |
| 2 | `trois_foyers` | Trois Foyers | Teal |
| 3 | `cinq_elements` | Cinq Éléments | Amber |
| 4 | `zang_fu` | Zang / Fu | Indigo |
| 5 | `meridiens` | Méridiens | Emerald |
| 6 | `kan_che` | Kan/Che (Troncs & Branches) | Violet |
| 7 | `constitutionnel` | Constitutionnel / Émotionnel | Rose |

**Règle IEATC** : Yin/Yang TOUJOURS en premier — oriente tout le raisonnement.

---

## Migration vers Supabase (production)

### 1. Créer le projet Supabase

1. Aller sur [supabase.com](https://supabase.com) → New project
2. Récupérer les variables d'environnement dans **Settings → API**

### 2. Variables d'environnement

Créer `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...
SUPABASE_SERVICE_ROLE_KEY=eyJhb...  # côté serveur uniquement
```

### 3. Appliquer le schéma SQL

Dans l'éditeur SQL de Supabase → exécuter `supabase/schema.sql`.

Le schéma crée :
- `users` — profils liés à Supabase Auth
- `clinical_cases` — cas cliniques (JSONB pour le contenu)
- `clinical_analyses` — analyses par cas et grille
- `user_participations` — **RLS strict** : jamais visible par d'autres
- `lexique_termes` — termes du lexique IEATC
- Trigger : création automatique du profil à l'inscription
- Fonction `upsert_participation` — sécurisée via RLS
- Fonction `increment_view_count` — sécurisée

### 4. Brancher Supabase Auth dans le code

Dans `src/lib/auth-context.tsx`, remplacer les TODO :

```typescript
// TODO (production) :
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// signIn → supabase.auth.signInWithOAuth({ provider: 'google' })
// signOut → supabase.auth.signOut()
// getUser → supabase.auth.getUser()
```

### 5. Brancher le participation store

Dans `src/lib/participation-store.ts`, remplacer localStorage par :

```typescript
// upsertParticipation → supabase.rpc('upsert_participation', { ... })
// getAllParticipations → supabase.from('user_participations').select(...)
//   .eq('user_id', userId)  ← RLS filtre automatiquement
```

### 6. Seed des données initiales

```sql
-- Exécuter dans l'éditeur SQL Supabase après le schéma
-- Insérer les cas depuis src/data/cases.ts (format JSON)
insert into clinical_cases (id, slug, titre, statut, ..., content)
values ('cas-001', 'florence-28-ans-...', ..., '{"motif": "...", ...}'::jsonb);
```

---

## Règles architecturales IEATC

### AcuPoint — règle absolue
Les points d'acupuncture sont TOUJOURS affichés avec `code + nom + technique` ensemble.
Utiliser `<AcuPointInline>`, `<AcuPointCard>`, ou `<AcuPointList>` — jamais du texte brut.

### Prise de pouls — traitement central
La prise de pouls est l'acte CENTRAL en IEATC. Toujours utiliser `<PoulsDisplay>` avec fond sombre.

### UserParticipation — confidentialité absolue
Les participations sont PRIVÉES. Ne jamais exposer de données d'autres utilisateurs.
En production : RLS Supabase garantit que `user_id = auth.uid()` sur toutes les requêtes.

### Grilles — terminologie IEATC
Toujours utiliser "grille" (pas "cadre" ni "framework"). Respecter l'ordre YY → 3F → 5E → ZF → M → KC → C.

---

## Roadmap V2

- [ ] Soumission de nouveaux cas par les membres (formulaire + workflow validation)
- [ ] Page admin : gestion des cas, statuts, rôles
- [ ] Statistiques avancées : associations motif ↔ points, clustering inter-cas
- [ ] Recherche fulltext via `pg_trgm` (Supabase)
- [ ] Export PDF d'une fiche cas
- [ ] Intégration IA : analyse assistée, suggestions de points
