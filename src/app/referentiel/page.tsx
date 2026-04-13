import { redirect } from 'next/navigation';

// Le référentiel a été intégré au Lexique IEATC
export default function ReferentielPage() {
  redirect('/lexique');
}
