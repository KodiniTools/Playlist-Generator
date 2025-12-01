<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="['toast', `toast-${toast.type}`]"
          @click="removeToast(toast.id)"
        >
          <span class="toast-icon">
            <svg v-if="toast.type === 'success'" viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            <svg v-else-if="toast.type === 'error'" viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
          </span>
          <span class="toast-message">{{ toast.message }}</span>
          <button class="toast-close" @click.stop="removeToast(toast.id)">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useToast } from '../composables/useToast'

const { toasts, removeToast } = useToast()
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 400px;
}

.toast {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
  background: var(--panel-color, #16161c);
  border: 1px solid var(--border-color, #5E5F69);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.toast:hover {
  transform: translateX(-5px);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
}

.toast-success {
  border-color: #7dd87d;
  background: linear-gradient(135deg, rgba(125, 216, 125, 0.15), rgba(125, 216, 125, 0.05));
}

.toast-success .toast-icon {
  color: #7dd87d;
}

.toast-error {
  border-color: #e57373;
  background: linear-gradient(135deg, rgba(229, 115, 115, 0.15), rgba(229, 115, 115, 0.05));
}

.toast-error .toast-icon {
  color: #e57373;
}

.toast-info {
  border-color: #64b5f6;
  background: linear-gradient(135deg, rgba(100, 181, 246, 0.15), rgba(100, 181, 246, 0.05));
}

.toast-info .toast-icon {
  color: #64b5f6;
}

.toast-icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.toast-message {
  flex: 1;
  color: var(--text-color, #AEAFB7);
  font-size: 0.95rem;
  line-height: 1.4;
}

.toast-close {
  background: none;
  border: none;
  color: var(--muted-color, #5E5F69);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  border-radius: 4px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.toast-close:hover {
  color: var(--text-color, #AEAFB7);
  background: rgba(255, 255, 255, 0.1);
}

/* Light theme adjustments */
.light-theme .toast {
  background: var(--panel-color, #ffffff);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.light-theme .toast-success {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.12), rgba(76, 175, 80, 0.04));
  border-color: #4caf50;
}

.light-theme .toast-success .toast-icon {
  color: #4caf50;
}

.light-theme .toast-error {
  background: linear-gradient(135deg, rgba(211, 47, 47, 0.12), rgba(211, 47, 47, 0.04));
  border-color: #d32f2f;
}

.light-theme .toast-error .toast-icon {
  color: #d32f2f;
}

.light-theme .toast-info {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.12), rgba(33, 150, 243, 0.04));
  border-color: #2196f3;
}

.light-theme .toast-info .toast-icon {
  color: #2196f3;
}

/* Animations */
.toast-enter-active {
  animation: toast-in 0.3s ease-out;
}

.toast-leave-active {
  animation: toast-out 0.3s ease-in;
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes toast-out {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}

/* Responsive */
@media (max-width: 480px) {
  .toast-container {
    left: 10px;
    right: 10px;
    bottom: 10px;
    max-width: none;
  }

  .toast {
    padding: 12px 14px;
  }
}
</style>
