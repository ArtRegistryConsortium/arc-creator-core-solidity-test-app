import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('./views/Home.vue')
  },
  {
    path: '/mint',
    name: 'Mint',
    component: () => import('./views/Mint.vue')
  },
  {
    path: '/token/:id',
    name: 'TokenDetails',
    component: () => import('./views/TokenDetails.vue')
  },
  {
    path: '/admin',
    name: 'AdminPanel',
    component: () => import('./views/AdminPanel.vue')
  },
  {
    path: '/creator',
    name: 'CreatorPanel',
    component: () => import('./views/CreatorPanel.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 