import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const currentFamily = ref(JSON.parse(localStorage.getItem('currentFamily') || 'null'))

  const isLogged = computed(() => !!token.value)

  function setAuth(t, u) {
    token.value = t
    user.value = u
    localStorage.setItem('token', t)
    localStorage.setItem('user', JSON.stringify(u))
  }
  function setFamily(f) {
    currentFamily.value = f
    localStorage.setItem('currentFamily', JSON.stringify(f))
  }
  function logout() {
    token.value = ''
    user.value = null
    currentFamily.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('currentFamily')
  }
  return { token, user, currentFamily, isLogged, setAuth, setFamily, logout }
})
