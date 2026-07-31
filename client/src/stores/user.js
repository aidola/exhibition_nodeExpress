import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi, getCurrentUser, updateUserAvatar } from '@/api'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || 'null'))

  const isLoggedIn = computed(() => !!token.value)
  const username = computed(() => userInfo.value?.username || '')
  const realName = computed(() => userInfo.value?.real_name || '')
  const role = computed(() => userInfo.value?.role || '')
  // 头像统一从 userInfo 读取，保持与服务端一致
  const avatar = computed(() => userInfo.value?.avatar || '')

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

  // 更新头像（同步到服务端 + 更新本地 userInfo）
  async function updateAvatar(url) {
    try {
      await updateUserAvatar(url)
    } catch {
      // 即使接口失败也更新本地显示，下次刷新会自动同步
    }
    userInfo.value = { ...userInfo.value, avatar: url }
    localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
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
    avatar,
    isLoggedIn,
    username,
    realName,
    role,
    login,
    fetchUserInfo,
    updateAvatar,
    logout,
  }
}, {
  persist: true,
})
