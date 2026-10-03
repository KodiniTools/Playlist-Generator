import type { Ref } from 'vue'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastAction {
  label: string
  callback: () => void
}

export interface Toast {
  id: number
  message: string
  type: ToastType
  duration: number
  action: ToastAction | null
}

/** Typdeklaration für useToast.js (Singleton-Liste der Benachrichtigungen). */
export function useToast(): {
  toasts: Ref<Toast[]>
  addToast(
    message: string,
    type?: ToastType,
    duration?: number,
    action?: ToastAction | null,
  ): number
  removeToast(id: number): void
  success(message: string, duration?: number): number
  error(message: string, duration?: number): number
  info(message: string, duration?: number): number
}
