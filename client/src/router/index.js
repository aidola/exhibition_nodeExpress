import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录', noAuth: true },
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '工作台', icon: 'Odometer' },
      },
      {
        path: 'exhibitions',
        name: 'Exhibitions',
        component: () => import('@/views/exhibitions/ExhibitionList.vue'),
        meta: { title: '展会管理', icon: 'OfficeBuilding' },
      },
      {
        path: 'customers',
        name: 'Customers',
        component: () => import('@/views/customers/CustomerList.vue'),
        meta: { title: '客户管理', icon: 'UserFilled' },
      },
      {
        path: 'events',
        name: 'Events',
        component: () => import('@/views/events/EventList.vue'),
        meta: { title: '活动管理', icon: 'Calendar' },
      },
      {
        path: 'registrations',
        name: 'Registrations',
        component: () => import('@/views/events/RegistrationList.vue'),
        meta: { title: '报名管理', icon: 'List' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫 - 认证检查
router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 展会管理系统` : '展会管理系统'

  const userStore = useUserStore()

  if (to.meta.noAuth) {
    if (userStore.token && to.path === '/login') {
      next('/dashboard')
    } else {
      next()
    }
  } else {
    if (!userStore.token) {
      next({ path: '/login', query: { redirect: to.fullPath } })
    } else {
      next()
    }
  }
})

export default router
