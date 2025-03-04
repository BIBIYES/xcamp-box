import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/views/PostHomeView.vue'),
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/LoginView.vue'),
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('@/views/ProfileView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/post/:id',
      name: 'PostDetail',
      component: () => import('@/views/PostDetailView.vue'),
    },
  ],
})

// 全局前置守卫
router.beforeEach((to) => {
  const userStore = useUserStore()

  // 如果用户已登录且要访问登录页面，则重定向到首页
  if (to.path === '/login' && userStore.isLoggedIn) {
    return { path: '/' }
  }

  // 检查是否需要登录权限
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    // 保存尝试访问的页面路径
    return { path: '/login' }
  }
  
  // 必须返回 true 或 undefined 以继续导航
  return true
})

export default router
