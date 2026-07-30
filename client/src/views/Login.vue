<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <el-icon :size="48" color="#409EFF"><PictureFilled /></el-icon>
        <h1>展会管理系统</h1>
        <p>Exhibition Management System</p>
      </div>

      <el-form ref="loginFormRef" :model="loginForm" :rules="rules" @keyup.enter="handleLogin" size="large">
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            prefix-icon="User"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            show-password
            placeholder="请输入密码"
            prefix-icon="Lock"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            class="login-btn"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登 录' }}
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-tips">
        <span>演示账号：admin / admin123</span>
      </div>
    </div>

    <div class="login-footer">
      <span>© 2024 展会管理系统 - Powered by Node.js + Vue 3 + Element Plus</span>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loginFormRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
  username: 'admin',
  password: 'admin123',
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const handleLogin = async () => {
  const valid = await loginFormRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    await userStore.login(loginForm.username, loginForm.password)
    ElMessage.success('登录成功')
    const redirect = route.query.redirect || '/dashboard'
    router.push(redirect)
  } catch {
    // 错误已在拦截器中处理
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 420px;
  padding: 40px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header h1 {
  font-size: 24px;
  color: #303133;
  margin: 12px 0 4px;
}

.login-header p {
  font-size: 13px;
  color: #909399;
}

.login-btn {
  width: 100%;
}

.login-tips {
  text-align: center;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

.login-tips span {
  font-size: 12px;
  color: #c0c4cc;
}

.login-footer {
  margin-top: 24px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
}
</style>
