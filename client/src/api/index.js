import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

const request = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response
      switch (status) {
        case 401:
          localStorage.removeItem('token')
          localStorage.removeItem('userInfo')
          router.push('/login')
          ElMessage.error(data.message || '登录已过期，请重新登录')
          break
        case 403:
          ElMessage.error('无权限执行此操作')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error(data.message || '服务器内部错误')
          break
        default:
          ElMessage.error(data.message || '请求失败')
      }
    } else {
      ElMessage.error('网络连接异常')
    }
    return Promise.reject(error)
  }
)

export default request

// ==================== 认证相关 ====================
export const login = (data) => request.post('/auth/login', data)
export const register = (data) => request.post('/auth/register', data)
export const getCurrentUser = () => request.get('/auth/me')
export const changePassword = (data) => request.put('/auth/change-password', data)

// ==================== 仪表盘 ====================
export const getDashboardStats = () => request.get('/dashboard')

// ==================== 展会管理 ====================
export const getExhibitions = (params) => request.get('/exhibitions', { params })
export const getAllExhibitions = () => request.get('/exhibitions/all')
export const getExhibitionDetail = (id) => request.get(`/exhibitions/${id}`)
export const createExhibition = (data) => request.post('/exhibitions', data)
export const updateExhibition = (id, data) => request.put(`/exhibitions/${id}`, data)
export const deleteExhibition = (id) => request.delete(`/exhibitions/${id}`)
export const getExhibitionStats = () => request.get('/exhibitions/stats')

// ==================== 客户管理 ====================
export const getCustomers = (params) => request.get('/customers', { params })
export const getCustomerDetail = (id) => request.get(`/customers/${id}`)
export const createCustomer = (data) => request.post('/customers', data)
export const updateCustomer = (id, data) => request.put(`/customers/${id}`, data)
export const deleteCustomer = (id) => request.delete(`/customers/${id}`)
export const batchImportCustomers = (data) => request.post('/customers/batch-import', data)
export const getCustomerStats = () => request.get('/customers/stats')

// ==================== 活动管理 ====================
export const getEvents = (params) => request.get('/events', { params })
export const getEventDetail = (id) => request.get(`/events/${id}`)
export const createEvent = (data) => request.post('/events', data)
export const updateEvent = (id, data) => request.put(`/events/${id}`, data)
export const deleteEvent = (id) => request.delete(`/events/${id}`)
export const eventRegister = (id, data) => request.post(`/events/${id}/register`, data)

// ==================== 报名管理 ====================
export const getRegistrations = (params) => request.get('/events/registrations', { params })
export const updateRegistration = (id, data) => request.put(`/events/registrations/${id}`, data)
