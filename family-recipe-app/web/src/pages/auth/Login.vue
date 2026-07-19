<template>
  <div class="auth-page">
    <div class="auth-content">
      <div class="auth-logo">
        <svg viewBox="0 0 64 64" fill="none" class="logo-svg">
          <circle cx="32" cy="32" r="30" fill="#007AFF"/>
          <path d="M22 30C22 25 26 22 32 22C38 22 42 25 42 30V34C42 39 38 42 32 42C26 42 22 39 22 34V30Z" fill="white"/>
          <path d="M28 28H36" stroke="#007AFF" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M28 33H34" stroke="#007AFF" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
      </div>
      <h1 class="auth-title">家庭菜谱</h1>
      <p class="auth-sub">记录家的味道</p>

      <div class="auth-form">
        <div class="input-group">
          <input class="ios-input" v-model="form.username" placeholder="用户名" />
        </div>
        <div class="input-group">
          <input class="ios-input" v-model="form.password" type="password" placeholder="密码" />
        </div>
        <p v-if="error" class="err">{{ error }}</p>
        <button class="btn btn-primary btn-block mt-16" @click="onLogin" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
        <p class="auth-switch">
          还没有账号？<router-link to="/register" class="link">立即注册</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import { request } from '../../utils/request'

const router = useRouter()
const userStore = useUserStore()
const form = reactive({ username: '', password: '' })
const loading = ref(false)
const error = ref('')

async function onLogin() {
  if (!form.username || !form.password) { error.value = '请填写用户名和密码'; return }
  loading.value = true; error.value = ''
  try {
    const data = await request('/api/auth/login', { method: 'POST', body: form })
    userStore.setAuth(data.token, data.user)
    router.push('/')
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 20px; background: var(--bg);
}
.auth-content { width: 100%; max-width: 340px; text-align: center; }
.auth-logo { display: flex; justify-content: center; }
.logo-svg { width: 80px; height: 80px; }
.auth-title { font-size: 28px; font-weight: 700; margin-top: 16px; letter-spacing: -.5px; }
.auth-sub { color: var(--text3); margin-top: 6px; font-size: 15px; }
.auth-form { margin-top: 40px; text-align: left; }
.input-group { margin-bottom: 12px; }
.ios-input {
  width: 100%; padding: 14px 16px; border: none; border-radius: 14px;
  font-size: 16px; outline: none; background: #fff;
  box-shadow: 0 0 0 1px var(--separator);
  -webkit-appearance: none; transition: box-shadow .15s;
}
.ios-input:focus { box-shadow: 0 0 0 2px var(--primary); }
.err { color: var(--red); font-size: 13px; margin: 8px 0; }
.auth-switch { text-align: center; margin-top: 20px; color: var(--text3); font-size: 14px; }
.link { color: var(--primary); font-weight: 500; }
</style>
