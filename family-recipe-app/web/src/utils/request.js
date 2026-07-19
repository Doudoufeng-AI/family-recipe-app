import { useUserStore } from '../stores/user'

const BASE = import.meta.env.VITE_API_BASE || ''

export async function request(url, options = {}) {
  const userStore = useUserStore()
  const headers = { ...(options.headers || {}) }
  if (userStore.token) headers['Authorization'] = `Bearer ${userStore.token}`

  const opts = { ...options, headers }
  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
    opts.body = JSON.stringify(options.body)
  }

  const res = await fetch(BASE + url, opts)
  const data = await res.json()
  if (!res.ok) {
    if (res.status === 401) {
      userStore.logout()
      window.location.href = '/login'
    }
    throw new Error(data.error || '请求失败')
  }
  return data
}

export function fileUrl(path) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return BASE + path
}

export function upload(url, formData) {
  return request(url, { method: 'POST', body: formData })
}
