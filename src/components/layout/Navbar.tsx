'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  BarChart3,
  Home,
  Menu,
  X,
  User,
  LogIn,
  LogOut,
  Coins,
  FilePlus,
  GraduationCap,
  ChevronDown,
  Shield,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';

const NAV_LINKS = [
  { href: '/', label: 'Accueil', icon: Home },
  { href: '/cas', label: 'Cas cliniques', icon: BookOpen },
  { href: '/apprentissage', label: 'Apprentissage', icon: GraduationCap },
  { href: '/soumettre', label: 'Soumettre', icon: FilePlus },
  { href: '/statistiques', label: 'Stats', icon: BarChart3 },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, signOut, isLoading } = useAuth();
  const router = useRouter();

  // Ferme le dropdown si clic en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setDropdownOpen(false);
    setMobileOpen(false);
    await signOut();
    router.push('/connexion');
    router.refresh();
  };

  const displayName = user
    ? `${user.prenom} ${user.nom}`.trim() || user.pseudo || user.email
    : '';

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
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-slate-600 border-t-slate-400 rounded-full animate-spin" />
              ) : user ? (
                <>
                  {/* Points de vote */}
                  <span
                    title="Points de vote disponibles"
                    className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30"
                  >
                    <Coins size={12} />
                    {user.votePoints ?? 0}
                  </span>

                  {/* Dropdown utilisateur */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-white hover:bg-slate-700',
                        dropdownOpen && 'bg-slate-700 text-white',
                      )}
                    >
                      <User size={15} />
                      <span className="max-w-[120px] truncate">{displayName}</span>
                      <ChevronDown
                        size={13}
                        className={cn('transition-transform', dropdownOpen && 'rotate-180')}
                      />
                    </button>

                    {/* Menu déroulant */}
                    {dropdownOpen && (
                      <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50">
                        <Link
                          href="/profil"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <User size={15} className="text-slate-400" />
                          Mon profil
                        </Link>
                        {user.is_admin && (
                          <Link
                            href="/admin"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <Shield size={15} className="text-slate-400" />
                            Administration
                          </Link>
                        )}
                        <div className="border-t border-slate-100 my-1" />
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={15} />
                          Se déconnecter
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/connexion"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white border border-slate-500 hover:bg-slate-700 hover:border-slate-400 transition-colors"
                  >
                    <LogIn size={15} />
                    Connexion
                  </Link>
                  <Link
                    href="/inscription"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-teal-600 text-white hover:bg-teal-500 transition-colors"
                  >
                    S&apos;inscrire
                  </Link>
                </div>
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
                  <div className="px-3 py-2 flex items-center gap-2">
                    <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30">
                      <Coins size={11} />
                      {user.votePoints ?? 0} pts
                    </span>
                    <span className="text-sm text-white font-medium truncate">{displayName}</span>
                  </div>
                  <Link
                    href="/profil"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm hover:bg-slate-700"
                    style={{ color: 'white' }}
                  >
                    <User size={16} /> Mon profil
                  </Link>
                  {user.is_admin && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm hover:bg-slate-700"
                      style={{ color: 'white' }}
                    >
                      <Shield size={16} /> Administration
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-slate-400 hover:text-white"
                  >
                    <LogOut size={16} /> Se déconnecter
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/connexion"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-white border border-slate-500 hover:bg-slate-700 active:bg-slate-700 transition-colors"
                  >
                    <LogIn size={16} /> Connexion
                  </Link>
                  <Link
                    href="/inscription"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm bg-teal-600 text-white mt-1"
                  >
                    <User size={16} /> S&apos;inscrire
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
