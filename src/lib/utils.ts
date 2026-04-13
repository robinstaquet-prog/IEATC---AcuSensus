import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAgeRange(age: number): string {
  if (age < 12) return 'Enfant';
  if (age < 18) return 'Adolescent';
  if (age < 30) return 'Jeune adulte';
  if (age < 60) return 'Adulte';
  return 'Senior';
}

export function complexityLabel(level: number): string {
  const labels = ['', 'Simple', 'Accessible', 'Intermédiaire', 'Complexe', 'Expert'];
  return labels[level] ?? 'Inconnu';
}

export function validationLabel(status: string): string {
  const map: Record<string, string> = {
    draft: 'Brouillon',
    'under-review': 'En révision',
    validated: 'Validé',
    exemplary: 'Exemplaire',
  };
  return map[status] ?? status;
}

export function confidenceLabel(level: string): string {
  const map: Record<string, string> = {
    low: 'Faible',
    moderate: 'Modérée',
    high: 'Élevée',
    'very-high': 'Très élevée',
  };
  return map[level] ?? level;
}

export function sourceTypeLabel(type: string): string {
  const map: Record<string, string> = {
    human: 'Praticien',
    'ai-assisted': 'Assisté par IA',
    editorial: 'Éditorial',
    mixed: 'Mixte',
  };
  return map[type] ?? type;
}
