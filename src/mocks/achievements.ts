import type { Achievement } from '@/types'

export const allAchievements: Achievement[] = [
  {
    id: 'ach-first-action',
    title: 'Primeira Ação',
    description: 'Registrou sua primeira ação sustentável.',
    icon: 'Star',
  },
  {
    id: 'ach-5-actions',
    title: 'Agente Verde',
    description: 'Concluiu 5 ações sustentáveis.',
    icon: 'Award',
  },
  {
    id: 'ach-10-actions',
    title: 'Guardião da Terra',
    description: 'Concluiu 10 ações sustentáveis.',
    icon: 'Shield',
  },
  {
    id: 'ach-first-post',
    title: 'Voz da Natureza',
    description: 'Realizou sua primeira publicação.',
    icon: 'MessageSquare',
  },
  {
    id: 'ach-5-posts',
    title: 'Influenciador Ecológico',
    description: 'Realizou 5 publicações.',
    icon: 'Megaphone',
  },
]
