<template>
  <footer class="app-page__footer">
    <form
      action="https://www.paypal.com/donate"
      method="post"
      target="_top"
      class="app-page__donate"
    >
      <input type="hidden" name="hosted_button_id" value="8RGLGQ2BFMHU6" />
      <UiButton type="submit" variant="ghost" size="sm" :title="t('donate_title')">
        <template #icon>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.77.77 0 0 1 .757-.62h6.597c2.179 0 3.893.603 5.091 1.791.602.598 1.014 1.291 1.223 2.063.219.796.264 1.724.13 2.758l-.015.1v.46l.358.205c.302.167.543.361.729.583.306.366.508.815.601 1.333.096.532.086 1.166-.028 1.884-.13.828-.355 1.551-.668 2.147a4.467 4.467 0 0 1-1.081 1.393c-.426.37-.932.653-1.504.84-.559.182-1.192.273-1.882.273H14.1a.947.947 0 0 0-.937.803l-.036.21-.604 3.832-.028.168a.947.947 0 0 1-.936.803H7.076Z"
            />
          </svg>
        </template>
        {{ t('donate_button') }}
      </UiButton>
    </form>
    <UiButton variant="ghost" size="sm" :title="t('facebook_share_title')" @click="shareOnFacebook">
      <template #icon>
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
          />
        </svg>
      </template>
      {{ t('facebook_share') }}
    </UiButton>
  </footer>
</template>

<script setup lang="ts">
  import { UiButton } from '../ui'
  import { useTranslation } from '../../composables/useTranslation'

  /** Fußzeile der App-Seite: Spenden (PayPal) und auf Facebook teilen. */
  const { t } = useTranslation()

  const shareOnFacebook = () => {
    const url = encodeURIComponent(window.location.origin + window.location.pathname)
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      '_blank',
      'width=600,height=400,noopener,noreferrer',
    )
  }
</script>

<style scoped>
  .app-page__footer {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: var(--ds-space-3);
    flex-wrap: wrap;
    padding-top: var(--ds-space-5);
    border-top: var(--ds-border-width) solid var(--ds-border);
  }

  .app-page__donate {
    display: inline-flex;
  }
</style>
