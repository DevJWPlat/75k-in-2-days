import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import TrackerView from '@/views/TrackerView.vue'
import TrackerLoginView from '@/views/TrackerLoginView.vue'
import NotFoundView from '@/views/NotFoundView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/tracker-login',
      name: 'tracker-login',
      component: TrackerLoginView,
    },
    {
      path: '/tracker',
      name: 'tracker',
      component: TrackerView,
      meta: {
        requiresTrackerAuth: true,
      },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundView,
    },
  ],
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresTrackerAuth) {
    const isAuthed = localStorage.getItem('tracker-auth') === 'true'

    if (!isAuthed) {
      next('/tracker-login')
      return
    }
  }

  next()
})

export default router