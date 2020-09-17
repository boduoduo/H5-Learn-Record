import Vue from 'vue'
// import VueRouter from 'vue-router'
import VueRouter from './NueRouter'

Vue.use(VueRouter)

const routes = [
  {
    name: 'home',
    path: '/home',
    component: () => import('../views/Home.vue')
  },
  {
    name: 'about',
    path: '/about',
    component: () => import('../views/About.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router