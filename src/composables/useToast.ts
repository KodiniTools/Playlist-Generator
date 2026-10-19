import { ref } from 'vue'

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

const toasts = ref<Toast[]>([])
let toastId = 0

/** Singleton-Liste der Benachrichtigungen. */
export function useToast() {
  const addToast = (
    message: string,
    type: ToastType = 'info',
    duration = 3000,
    action: ToastAction | null = null,
  ): number => {
    const id = ++toastId
    toasts.value.push({
      id,
      message,
      type, // 'success', 'error', 'info'
      duration,
      action, // optional { label: string, callback: () => void }
    })

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }

  const removeToast = (id: number) => {
    const index = toasts.value.findIndex((t) => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const success = (message: string, duration = 3000) => {
    return addToast(message, 'success', duration)
  }

  const error = (message: string, duration = 5000) => {
    return addToast(message, 'error', duration)
  }

  const info = (message: string, duration = 3000) => {
    return addToast(message, 'info', duration)
  }

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
  }
}
