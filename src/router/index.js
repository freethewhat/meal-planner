import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../config/supabase'

const routes = [
  {
    path: '/',
    name: 'Today',
    component: () => import('../views/TodayView.vue')
  },
  {
    path: '/weekly',
    name: 'Weekly',
    component: () => import('../views/WeeklyView.vue')
  },
  {
    path: '/ingredients',
    name: 'Ingredients',
    component: () => import('../views/IngredientsView.vue')
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/AdminView.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      next('/')
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      if (user.email === 'matthew.c.sutton@gmail.com') {
        next()
      } else {
        next('/')
      }
    }
  } else {
    next()
  }
})

export default router 