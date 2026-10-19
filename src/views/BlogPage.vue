<template>
  <div class="blog-page">
    <AppHeader />

    <article class="blog-container">
      <BlogArticleDe v-if="currentLanguage === 'de'" />
      <BlogArticleEn v-else />
    </article>
  </div>
</template>

<script setup lang="ts">
  import { useTranslation } from '../composables/useTranslation'
  import AppHeader from '../components/AppHeader.vue'
  import BlogArticleDe from '../components/blog/BlogArticleDe.vue'
  import BlogArticleEn from '../components/blog/BlogArticleEn.vue'

  const { currentLanguage } = useTranslation()
</script>

<style scoped>
  .blog-page {
    min-height: 100vh;
    background: var(--ds-surface-0);
    color: var(--ds-text);
  }

  .blog-container {
    max-width: 800px;
    margin: 0 auto;
    padding: var(--ds-space-16) var(--ds-gutter);
  }

  @media (max-width: 768px) {
    .blog-container {
      padding: var(--ds-space-10) var(--ds-space-4);
    }
  }

  @media (max-width: 480px) {
    .blog-container {
      padding: var(--ds-space-6) var(--ds-space-3);
    }
  }
</style>
