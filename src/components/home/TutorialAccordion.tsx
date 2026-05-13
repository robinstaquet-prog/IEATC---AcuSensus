'use client';

// ─── Accordéon tutoriel AcuSensus — Section héro ─────────────────────────────

import * as Accordion from '@radix-ui/react-accordion';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const SECTIONS = [
  {
    id: 'synthese',
    title: `Qu'est-ce qu'une synthèse clinique ?`,
    content:
      `Chaque cas clinique peut recevoir plusieurs synthèses — des analyses structurées rédigées par des praticiens ou des experts. Chaque synthèse est organisée selon une grille de lecture spécifique à l'approche IEATC : Yin/Yang, Cinq Éléments, Tsang/Fou, Méridiens, Trois Foyers, 4 Énergies, Merveilleux Vaisseaux ou Grands Méridiens & Climats. Une même situation clinique peut ainsi être éclairée sous plusieurs angles complémentaires.`,
  },
  {
    id: 'apprentissage',
    title: `Pourquoi certains cas sont en mode Apprentissage ?`,
    content:
      `Un cas passe en mode Apprentissage lorsqu'il a été suffisamment validé par la communauté — ou directement labellisé par un expert de l'école. Ce mode permet de comparer son propre raisonnement avec les analyses de référence. Tous les cas ne sont pas immédiatement éligibles : ils doivent répondre à des critères de qualité et de complétude.`,
  },
  {
    id: 'voter',
    title: `À quoi sert de voter ?`,
    content:
      `Voter permet à la communauté de reconnaître les analyses les plus pertinentes et les mieux argumentées. Le poids d'un vote n'est pas uniforme : plus le votant est expérimenté (praticien, expert), plus son vote contribue fortement à la valeur d'une analyse. Cela permet de faire émerger naturellement les raisonnements cliniques les plus solides.`,
  },
  {
    id: 'qualifiee',
    title: `Qu'est-ce qu'une analyse qualifiée ?`,
    content:
      `Une analyse qualifiée est une synthèse qui a reçu suffisamment de reconnaissance de la communauté pour servir de référence pédagogique. Elle est identifiée par un badge distinctif et utilisée dans les cas d'apprentissage. C'est la marque que le raisonnement clinique présenté est jugé fiable et formateur par la communauté IEATC.`,
  },
  {
    id: 'participer',
    title: `Comment participer ?`,
    content:
      `Commencez par explorer les cas cliniques disponibles. Sur chaque cas, vous pouvez soumettre votre propre synthèse — en mode public (visible) ou anonyme — et voter pour les analyses des autres praticiens. Vous pouvez aussi vous entraîner en mode Apprentissage : rédigez votre analyse, puis comparez-la avec celles des experts pour affiner votre pensée clinique.`,
  },
];

export function TutorialAccordion() {
  return (
    <div className="mt-10 bg-slate-800/60 rounded-xl border border-slate-700/60 p-5">
      {/* Titre */}
      <div className="flex items-center gap-2 mb-4">
        <HelpCircle size={16} className="text-teal-400 shrink-0" />
        <h2 className="text-sm font-semibold text-slate-200">Comprendre AcuSensus</h2>
      </div>

      <Accordion.Root type="single" collapsible className="space-y-1">
        {SECTIONS.map((section) => (
          <Accordion.Item
            key={section.id}
            value={section.id}
            className="rounded-lg border border-slate-700/40 overflow-hidden"
          >
            <Accordion.Header>
              <Accordion.Trigger
                className={cn(
                  'group flex w-full items-center justify-between px-4 py-3 text-left',
                  'text-sm font-medium text-slate-200 hover:text-white',
                  'bg-slate-800/40 hover:bg-slate-700/60 transition-colors',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500',
                )}
              >
                <span>{section.title}</span>
                <ChevronDown
                  size={15}
                  className="shrink-0 text-slate-400 group-data-[state=open]:rotate-180 transition-transform duration-200"
                />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="overflow-hidden data-[state=open]:animate-[slideDown_150ms_ease-out] data-[state=closed]:animate-[slideUp_150ms_ease-in]">
              <div className="px-4 pb-4 pt-2 text-sm text-slate-300 leading-relaxed bg-slate-900/30">
                {section.content}
              </div>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </div>
  );
}
