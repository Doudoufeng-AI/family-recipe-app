import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'

const routes = [
  { path: '/', name: 'home', component: () => import('../pages/Home.vue'), meta: { auth: true } },
  { path: '/login', name: 'login', component: () => import('../pages/auth/Login.vue') },
  { path: '/register', name: 'register', component: () => import('../pages/auth/Register.vue') },
  { path: '/search', name: 'search', component: () => import('../pages/Search.vue'), meta: { auth: true } },
  { path: '/recipe/:id', name: 'recipeDetail', component: () => import('../pages/recipe/Detail.vue'), meta: { auth: true } },
  { path: '/recipe/create', name: 'recipeCreate', component: () => import('../pages/recipe/Create.vue'), meta: { auth: true } },
  { path: '/recipe/:id/edit', name: 'recipeEdit', component: () => import('../pages/recipe/Edit.vue'), meta: { auth: true } },
  { path: '/family', name: 'familyList', component: () => import('../pages/family/List.vue'), meta: { auth: true } },
  { path: '/family/create', name: 'familyCreate', component: () => import('../pages/family/Create.vue'), meta: { auth: true } },
  { path: '/family/:id', name: 'familyDetail', component: () => import('../pages/family/Detail.vue'), meta: { auth: true } },
  { path: '/order', name: 'orderList', component: () => import('../pages/order/List.vue'), meta: { auth: true } },
  { path: '/order/create', name: 'orderCreate', component: () => import('../pages/order/Create.vue'), meta: { auth: true } },
  { path: '/ranking', name: 'ranking', component: () => import('../pages/Ranking.vue'), meta: { auth: true } },
  { path: '/profile', name: 'profile', component: () => import('../pages/Profile.vue'), meta: { auth: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  if (to.meta.auth && !userStore.isLogged) {
    next('/login')
  } else {
    next()
  }
})

export default router
