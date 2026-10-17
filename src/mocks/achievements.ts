import type { Achievement } from '@/types'

export const allAchievements: Achievement[] = [
  {
    id: 'ach-first-action',
    title: 'Primeira Acao',
    description: 'Registrou sua primeira acao sustentavel.',
    icon: 'Star',
  },
  {
    id: 'ach-5-actions',
    title: 'Agente Verde',
    description: 'Concluiu 5 acoes sustentaveis.',
    icon: 'Award',
  },
  {
    id: 'ach-10-actions',
    title: 'Guardiao da Terra',
    description: 'Concluiu 10 acoes sustentaveis.',
    icon: 'Shield',
  },
  {
    id: 'ach-first-post',
    title: 'Voz da Natureza',
    description: 'Realizou sua primeira publicacao.',
    icon: 'MessageSquare',
  },
  {
    id: 'ach-5-posts',
    title: 'Influenciador Ecologico',
    description: 'Realizou 5 publicacoes.',
    icon: 'Megaphone',
  },
]
