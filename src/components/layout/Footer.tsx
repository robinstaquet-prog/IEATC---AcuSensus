import Link from 'next/link';

const FOOTER_LINKS = [
  {
    titre: 'Explorer',
    liens: [
      { href: '/cas', label: 'Cas cliniques' },
      { href: '/apprentissage', label: 'Mode Apprentissage' },
      { href: '/statistiques', label: 'Statistiques' },
    ],
  },
  {
    titre: 'Ressources',
    liens: [
      { href: '/lexique', label: 'Lexique IEATC' },
      { href: '/soumettre', label: 'Soumettre un cas' },
    ],
  },
  {
    titre: 'Compte',
    liens: [
      { href: '/connexion', label: 'Connexion' },
      { href: '/inscription', label: 'Créer un compte' },
      { href: '/profil', label: 'Mon profil' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-[#0f172a] border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-7 h-7 rounded-md bg-teal-500 flex items-center justify-center text-white font-bold text-sm">
                A
              </div>
              <span className="text-white font-semibold">AcuSensus</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-48">
              Plateforme communautaire de formation à la pensée clinique IEATC.
              Explorez, comparez, apprenez.
            </p>
          </div>

          {/* Colonnes de liens */}
          {FOOTER_LINKS.map((col) => (
            <div key={col.titre}>
              <h3 className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-3">
                {col.titre}
              </h3>
              <ul className="space-y-2">
                {col.liens.map((lien) => (
                  <li key={lien.href}>
                    <Link
                      href={lien.href}
                      className="text-slate-400 text-sm hover:text-slate-200 transition-colors"
                    >
                      {lien.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-500 text-xs">
            © {new Date().getFullYear()} AcuSensus — Usage pédagogique exclusif IEATC
          </p>
          <p className="text-slate-600 text-xs">
            Base de cas cliniques commentés · Multi-lectures · Pensée clinique structurée
          </p>
        </div>
      </div>
    </footer>
  );
}
