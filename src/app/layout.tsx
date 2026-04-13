import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AuthProvider } from '@/lib/auth-context';
import { ToastProvider } from '@/components/ui/Toast';
import { ClientRoot } from '@/components/layout/ClientRoot';

export const metadata: Metadata = {
  title: 'AcuSensus — Pensée clinique IEATC',
  description:
    'Plateforme professionnelle de formation à la pensée clinique IEATC. Base de cas cliniques commentés, multi-lectures, référentiel, lexique.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-50">
        <AuthProvider>
          <ToastProvider>
            {/* ClientRoot : initialisation côté client (seed localStorage, etc.) */}
            <ClientRoot>
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </ClientRoot>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
