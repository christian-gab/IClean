const iconClasses: Record<string, string> = {
  Award: 'fa-award',
  Bike: 'fa-person-biking',
  Droplet: 'fa-droplet',
  Droplets: 'fa-shower',
  Globe: 'fa-earth-americas',
  GlassWater: 'fa-glass-water',
  Leaf: 'fa-leaf',
  MapPin: 'fa-location-dot',
  Megaphone: 'fa-bullhorn',
  MessageSquare: 'fa-comment',
  Recycle: 'fa-recycle',
  RefreshCcw: 'fa-arrows-rotate',
  Shield: 'fa-shield-halved',
  ShoppingBag: 'fa-bag-shopping',
  Sprout: 'fa-seedling',
  Star: 'fa-star',
  Trees: 'fa-tree',
}

export function getFontAwesomeIcon(icon: string, fallback = 'fa-leaf'): string {
  return iconClasses[icon] ?? fallback
}
