import { storeToRefs } from 'pinia'
import { useToastStore } from '../stores/toast'

export type { Toast, ToastAction, ToastType } from '../stores/toast'

/** Zugriff auf den Toast-Store; `toasts` bleibt ein Ref. */
export function useToast() {
  const store = useToastStore()
  const { toasts } = storeToRefs(store)
  return {
    toasts,
    addToast: store.addToast,
    removeToast: store.removeToast,
    success: store.success,
    error: store.error,
    info: store.info,
  }
}
