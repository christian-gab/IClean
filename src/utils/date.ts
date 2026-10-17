export function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diff < 60) return 'agora mesmo'
  if (diff < 3600) return `${Math.floor(diff / 60)}min atras`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atras`
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d atras`
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

export function nowISO(): string {
  return new Date().toISOString()
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}
