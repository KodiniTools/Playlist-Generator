<template>
  <div class="landing-page">
    <!-- Page Header Navigation -->
    <header class="page-header">
      <div class="header-container">
        <div class="header-logo">
          <span class="logo-icon">🎵</span>
          <span class="logo-text">Playlist Generator</span>
        </div>
        <nav class="header-nav">
          <router-link to="/" class="nav-link active">{{ t('nav_home') }}</router-link>
          <router-link to="/app" class="nav-link">{{ t('nav_app') }}</router-link>
          <router-link to="/faq" class="nav-link">{{ t('nav_faq') }}</router-link>
          <router-link to="/blog" class="nav-link">{{ t('nav_blog') }}</router-link>
        </nav>
        <div class="header-controls">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">{{ t('hero_title') }}</h1>
        <p class="hero-subtitle">{{ t('hero_subtitle') }}</p>
        <p class="hero-description">{{ t('hero_description') }}</p>
        <div class="hero-buttons">
          <router-link to="/app" class="btn btn-primary">
            {{ t('hero_cta') }}
          </router-link>
          <a href="#features" class="btn btn-secondary">
            {{ t('hero_learn_more') }}
          </a>
        </div>
      </div>

      <!-- Feature Cards Grid -->
      <div class="feature-cards">
        <div class="feature-card">
          <div class="card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 17H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <path d="M15 3h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-4"/>
              <path d="M12 7v10"/>
              <path d="m9 10 3-3 3 3"/>
              <path d="m9 14 3 3 3-3"/>
            </svg>
          </div>
          <h3>{{ t('feature1_title') }}</h3>
          <p>{{ t('feature1_desc') }}</p>
        </div>

        <div class="feature-card">
          <div class="card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h3>{{ t('feature2_title') }}</h3>
          <p>{{ t('feature2_desc') }}</p>
        </div>

        <div class="feature-card">
          <div class="card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="4" y1="9" x2="20" y2="9"/>
              <line x1="4" y1="15" x2="20" y2="15"/>
              <line x1="10" y1="3" x2="8" y2="21"/>
              <line x1="16" y1="3" x2="14" y2="21"/>
            </svg>
          </div>
          <h3>{{ t('feature3_title') }}</h3>
          <p>{{ t('feature3_desc') }}</p>
        </div>
      </div>
    </section>

    <!-- Features Details Section -->
    <section id="features" class="details-section">
      <div class="section-header">
        <h2>{{ t('details_title') }}</h2>
        <p>{{ t('details_subtitle') }}</p>
      </div>

      <div class="details-grid">
        <div class="detail-item">
          <div class="detail-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
          <h3>{{ t('detail1_title') }}</h3>
          <p>{{ t('detail1_desc') }}</p>
        </div>

        <div class="detail-item">
          <div class="detail-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <line x1="3" y1="9" x2="21" y2="9"/>
              <line x1="3" y1="15" x2="21" y2="15"/>
              <line x1="9" y1="3" x2="9" y2="21"/>
            </svg>
          </div>
          <h3>{{ t('detail2_title') }}</h3>
          <p>{{ t('detail2_desc') }}</p>
        </div>

        <div class="detail-item">
          <div class="detail-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="M6 8h.001"/>
              <path d="M10 8h.001"/>
              <path d="M14 8h.001"/>
              <path d="M18 8h.001"/>
              <path d="M8 12h.001"/>
              <path d="M12 12h.001"/>
              <path d="M16 12h.001"/>
              <path d="M7 16h10"/>
            </svg>
          </div>
          <h3>{{ t('detail3_title') }}</h3>
          <p>{{ t('detail3_desc') }}</p>
        </div>

        <div class="detail-item">
          <div class="detail-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="4"/>
              <path d="M12 2v2"/>
              <path d="M12 20v2"/>
              <path d="m4.93 4.93 1.41 1.41"/>
              <path d="m17.66 17.66 1.41 1.41"/>
              <path d="M2 12h2"/>
              <path d="M20 12h2"/>
              <path d="m6.34 17.66-1.41 1.41"/>
              <path d="m19.07 4.93-1.41 1.41"/>
            </svg>
          </div>
          <h3>{{ t('detail4_title') }}</h3>
          <p>{{ t('detail4_desc') }}</p>
        </div>

        <div class="detail-item">
          <div class="detail-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
          </div>
          <h3>{{ t('detail5_title') }}</h3>
          <p>{{ t('detail5_desc') }}</p>
        </div>

        <div class="detail-item">
          <div class="detail-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/>
            </svg>
          </div>
          <h3>{{ t('detail6_title') }}</h3>
          <p>{{ t('detail6_desc') }}</p>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="cta-content">
        <h2>{{ t('cta_title') }}</h2>
        <p>{{ t('cta_desc') }}</p>
        <router-link to="/app" class="btn btn-primary btn-large">
          {{ t('cta_button') }}
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useTranslation } from '../composables/useTranslation'
import LanguageSwitcher from '../components/LanguageSwitcher.vue'
import ThemeSwitcher from '../components/ThemeSwitcher.vue'

const { t } = useTranslation()
</script>

<style scoped>
.landing-page {
  padding-top: 0;
}

/* Page Header */
.page-header {
  background: linear-gradient(135deg, rgba(12, 12, 16, 0.95), rgba(22, 22, 28, 0.95));
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-color);
}

.light-theme .page-header {
  background: linear-gradient(135deg, rgba(245, 245, 245, 0.95), rgba(232, 232, 232, 0.95));
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 15px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--text-color);
}

.logo-icon {
  font-size: 1.5rem;
}

.header-nav {
  display: flex;
  gap: 30px;
}

.header-nav .nav-link {
  text-decoration: none;
  color: var(--muted-color);
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.header-nav .nav-link:hover,
.header-nav .nav-link.active {
  color: var(--accent-color);
  background: rgba(242, 226, 142, 0.1);
}

.light-theme .header-nav .nav-link:hover,
.light-theme .header-nav .nav-link.active {
  background: rgba(162, 134, 128, 0.1);
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

@media (max-width: 768px) {
  .header-nav {
    display: none;
  }

  .header-controls {
    gap: 10px;
  }
}

/* Hero Section */
.hero {
  min-height: calc(100vh - 70px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 60px 20px;
  text-align: center;
}

.hero-content {
  max-width: 800px;
  margin-bottom: 60px;
  animation: fade-in 0.8s ease-out;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--accent-color), var(--accent-secondary));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 20px;
  text-shadow: 0 0 40px var(--glow-color);
}

.hero-subtitle {
  font-size: 1.5rem;
  color: var(--text-color);
  margin-bottom: 15px;
  font-weight: 500;
}

.hero-description {
  font-size: 1.1rem;
  color: var(--muted-color);
  line-height: 1.8;
  margin-bottom: 30px;
}

.hero-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 15px 35px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, var(--accent-color), var(--accent-secondary));
  color: var(--accent-text-color);
  box-shadow: 0 4px 20px var(--shadow-color);
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px var(--shadow-color), 0 0 20px var(--glow-color);
}

.btn-secondary {
  background: transparent;
  color: var(--text-color);
  border: 2px solid var(--border-color);
}

.btn-secondary:hover {
  border-color: var(--accent-color);
  color: var(--accent-color);
  background: rgba(242, 226, 142, 0.05);
}

.light-theme .btn-secondary:hover {
  background: rgba(162, 134, 128, 0.05);
}

.btn-large {
  padding: 18px 45px;
  font-size: 1.1rem;
}

/* Feature Cards */
.feature-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  max-width: 1100px;
  width: 100%;
  padding: 0 20px;
  animation: slide-in 1s ease-out 0.3s both;
}

.feature-card {
  background: linear-gradient(135deg, rgba(22, 22, 28, 0.8), rgba(22, 22, 28, 0.6));
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 35px 25px;
  text-align: center;
  backdrop-filter: blur(15px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.light-theme .feature-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
}

.feature-card:hover {
  transform: translateY(-8px);
  border-color: var(--accent-color);
  box-shadow: 0 15px 40px var(--shadow-color), 0 0 20px var(--glow-color);
}

.feature-card .card-icon {
  width: 60px;
  height: 60px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, var(--accent-color), var(--accent-secondary));
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-text-color);
}

.feature-card .card-icon svg {
  width: 30px;
  height: 30px;
}

.feature-card h3 {
  font-size: 1.25rem;
  color: var(--text-color);
  margin-bottom: 12px;
  font-weight: 600;
}

.feature-card p {
  font-size: 0.95rem;
  color: var(--muted-color);
  line-height: 1.6;
}

/* Details Section */
.details-section {
  padding: 100px 20px;
  background: linear-gradient(180deg, transparent, rgba(22, 22, 28, 0.3), transparent);
}

.light-theme .details-section {
  background: linear-gradient(180deg, transparent, rgba(232, 232, 232, 0.5), transparent);
}

.section-header {
  text-align: center;
  max-width: 600px;
  margin: 0 auto 60px;
}

.section-header h2 {
  font-size: 2.5rem;
  color: var(--accent-color);
  margin-bottom: 15px;
  font-weight: 700;
}

.section-header p {
  font-size: 1.1rem;
  color: var(--muted-color);
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
  max-width: 1100px;
  margin: 0 auto;
}

.detail-item {
  text-align: center;
  padding: 30px 20px;
  border-radius: 16px;
  transition: all 0.3s ease;
}

.detail-item:hover {
  background: rgba(22, 22, 28, 0.4);
}

.light-theme .detail-item:hover {
  background: rgba(255, 255, 255, 0.6);
}

.detail-icon {
  width: 50px;
  height: 50px;
  margin: 0 auto 20px;
  color: var(--accent-color);
}

.detail-icon svg {
  width: 100%;
  height: 100%;
}

.detail-item h3 {
  font-size: 1.15rem;
  color: var(--text-color);
  margin-bottom: 10px;
  font-weight: 600;
}

.detail-item p {
  font-size: 0.9rem;
  color: var(--muted-color);
  line-height: 1.6;
}

/* CTA Section */
.cta-section {
  padding: 100px 20px;
  text-align: center;
}

.cta-content {
  max-width: 600px;
  margin: 0 auto;
  background: linear-gradient(135deg, rgba(22, 22, 28, 0.8), rgba(22, 22, 28, 0.6));
  border: 1px solid var(--border-color);
  border-radius: 25px;
  padding: 60px 40px;
  backdrop-filter: blur(15px);
}

.light-theme .cta-content {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.8));
}

.cta-content h2 {
  font-size: 2rem;
  color: var(--text-color);
  margin-bottom: 15px;
  font-weight: 700;
}

.cta-content p {
  font-size: 1.1rem;
  color: var(--muted-color);
  margin-bottom: 30px;
}

/* Responsive */
@media (max-width: 900px) {
  .feature-cards {
    grid-template-columns: 1fr;
    max-width: 400px;
  }

  .details-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 30px;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.2rem;
  }
}

@media (max-width: 600px) {
  .details-grid {
    grid-template-columns: 1fr;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-buttons {
    flex-direction: column;
    align-items: center;
  }

  .btn {
    width: 100%;
    max-width: 300px;
  }

  .section-header h2 {
    font-size: 1.8rem;
  }

  .cta-content {
    padding: 40px 25px;
  }

  .cta-content h2 {
    font-size: 1.5rem;
  }
}

/* Animations */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
