// Shared utility functions

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(iso))
}

export function formatDateRelative(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diffDays = Math.round((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays === -1) return 'Yesterday'
  if (diffDays > 0 && diffDays <= 30) return `In ${diffDays} days`
  if (diffDays < 0 && diffDays >= -30) return `${Math.abs(diffDays)} days ago`
  return formatDate(iso)
}

export function maskEIN(ein: string): string {
  // EIN format: XX-XXXXXXX -> XX-XXX####
  if (!ein) return ''
  return ein.replace(/(\d{2}-\d{3})(\d{4})/, '$1####')
}

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str
  return str.slice(0, maxLen) + '...'
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text)
}

export function entityTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    llc: 'LLC',
    trust: 'Trust',
    shelf_corp: 'Shelf Corp',
    corporation: 'Corporation',
    sole_proprietorship: 'Sole Prop',
    partnership: 'Partnership',
  }
  return labels[type] ?? type
}

export function fileTypeIcon(fileType: string): string {
  const icons: Record<string, string> = {
    pdf: '📄',
    docx: '📝',
    xlsx: '📊',
    jpg: '🖼️',
    png: '🖼️',
    other: '📁',
  }
  return icons[fileType] ?? icons.other
}
