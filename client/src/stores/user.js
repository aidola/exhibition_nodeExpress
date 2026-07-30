import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi, getCurrentUser } from '@/api'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || 'null'))

  const isLoggedIn = computed(() => !!token.value)
  const username = computed(() => userInfo.value?.username || '')
  const realName = computed(() => userInfo.value?.real_name || '')
  const role = computed(() => userInfo.value?.role || '')

  // 登录
  async function login(username, password) {
    const res = await loginApi({ username, password })
    token.value = res.data.data.token
    userInfo.value = res.data.data.user
    localStorage.setItem('token', token.value)
    localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
    return res.data
  }

  // 获取用户信息
  async function fetchUserInfo() {
    try {
      const res = await getCurrentUser()
      userInfo.value = res.data.data
      localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
    } catch {
      logout()
    }
  }

  // 登出
  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    username,
    realName,
    role,
    login,
    fetchUserInfo,
    logout,
  }
}, {
  persist: true,
})
