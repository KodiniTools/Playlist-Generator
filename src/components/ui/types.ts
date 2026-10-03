/** Gemeinsame Typen der UI-Komponenten (src/components/ui). */

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'
export type ButtonType = 'button' | 'submit' | 'reset'

export type IconButtonVariant = 'ghost' | 'secondary' | 'primary'
export type ControlSize = 'sm' | 'md'

export type ToastType = 'success' | 'error' | 'info'
export type CalloutType = 'info' | 'success' | 'warning' | 'danger'

export type TextFieldType = 'text' | 'search' | 'email' | 'url' | 'password'

export interface SegmentedOption {
  value: string
  label: string
  disabled?: boolean
}

export type SelectOption = SegmentedOption

/** Ein Eintrag der Dateiliste. `duration` in Sekunden; null oder undefined = noch unbekannt. */
export interface FileListItem {
  id: string
  name: string
  size: number
  duration?: number | null
}

/** Beschriftungen der Dateiliste, alle mit deutschen Standardwerten. */
export interface FileListLabels {
  list: string
  selectAll: string
  include: string
  dragHandle: string
  play: string
  pause: string
  remove: string
  tracks: string
  approximate: string
  emptyTitle: string
  emptyText: string
}
