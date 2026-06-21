import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '../views/LandingPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: LandingPage,
    },
    {
      path: '/app',
      name: 'app',
      component: () => import('../views/AppPage.vue'),
    },
    {
      path: '/faq',
      name: 'faq',
      component: () => import('../views/FaqPage.vue'),
    },
    {
      path: '/blog',
      name: 'blog',
      component: () => import('../views/BlogPage.vue'),
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

const SHARED_SOURCES = ['audiokonverter', 'audionormalizer']

router.beforeEach((to, from, next) => {
  if (to.name === 'landing' && SHARED_SOURCES.includes(to.query.source as string)) {
    next({ name: 'app', query: { source: to.query.source } })
  } else {
    next()
  }
})

export default router
