'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { BookOpen, BarChart3, Home, Menu, X, User, LogIn, LogOut, Coins, FilePlus, GraduationCap } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';

const NAV_LINKS = [
  { href: '/', label: 'Accueil', icon: Home },
  { href: '/cas', label: 'Cas cliniques', icon: BookOpen },
  { href: '/apprentissage', label: 'Apprentissage', icon: GraduationCap },
  { href: '/soumettre', label: 'Soumettre', icon: FilePlus },
  { href: '/statistiques', label: 'Statistiques', icon: BarChart3 },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signIn, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-[#0f172a] shadow-lg">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-white font-bold text-sm group-hover:bg-teal-400 transition-colors">
              A
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-white font-semibold text-base tracking-tight">AcuSensus</span>
              <span className="text-slate-400 text-xs hidden sm:block">Pensée clinique IEATC</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-teal-600 text-white'
                      : 'hover:bg-slate-700',
                  )}
                  style={{ color: 'white' }}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Auth + mobile */}
          <div className="flex items-center gap-2">
            {/* Auth desktop */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <>
                  {/* Pastille discrète des points de vote */}
                  <span
                    title="Points de vote disponibles"
                    className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30"
                  >
                    <Coins size={12} />
                    {user.votePoints ?? 0}
                  </span>
                  <Link
                    href="/profil"
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      pathname === '/profil'
                        ? 'bg-teal-600 text-white'
                        : 'text-white/90 hover:bg-slate-700 hover:text-white',
                    )}
                  >
                    <User size={15} />
                    {user.pseudo}
                  </Link>
                  <button
                    onClick={signOut}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                  >
                    <LogOut size={14} />
                    Déconnexion
                  </button>
                </>
              ) : (
                <button
                  onClick={signIn}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-teal-600 text-white hover:bg-teal-500 transition-colors"
                >
                  <LogIn size={15} />
                  Connexion (démo)
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-slate-300 hover:text-white p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-slate-700 mt-2 space-y-1">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors',
                    isActive ? 'bg-teal-600' : 'hover:bg-slate-700',
                  )}
                  style={{ color: 'white' }}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-slate-700">
              {user ? (
                <>
                  <Link href="/profil" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm hover:bg-slate-700" style={{ color: 'white' }}>
                    <User size={16} /> Mon espace
                  </Link>
                  <button onClick={() => { signOut(); setMobileOpen(false); }} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-slate-400 hover:text-white">
                    <LogOut size={16} /> Déconnexion
                  </button>
                </>
              ) : (
                <button onClick={() => { signIn(); setMobileOpen(false); }} className="w-full text-left flex items-center gap-3 px-3 py-3 rounded-lg text-sm bg-teal-600 text-white">
                  <LogIn size={16} /> Connexion (démo)
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
