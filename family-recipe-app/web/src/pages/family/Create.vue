<template>
  <div class="page">
    <div class="header">
      <div class="header-top">
        <span class="nav-back" @click="$router.back()">取消</span>
        <span class="header-title">创建家庭</span>
        <span></span>
      </div>
    </div>
    <div class="page-pad">
      <div class="section-header" style="padding-top:0"><span class="section-title">家庭信息</span></div>
      <div class="list-group">
        <div class="list-row" style="flex-direction:column;align-items:stretch;gap:8px">
          <span class="text-gray text-sm">家庭名称</span>
          <input class="ios-input-inline" v-model="name" placeholder="如：张家小厨房" />
        </div>
      </div>
      <button class="btn btn-primary btn-block mt-16" @click="submit" :disabled="loading">
        {{ loading ? '创建中...' : '创建家庭' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import * as api from '../../utils/api'

const router = useRouter()
const userStore = useUserStore()
const name = ref('')
const loading = ref(false)

async function submit() {
  if (!name.value) { alert('请输入家庭名称'); return }
  loading.value = true
  try {
    const family = api.createFamily(userStore.user.id, name.value)
    userStore.setFamily(family)
    router.push('/family')
  } catch (e) { alert(e.message) } finally { loading.value = false }
}
</script>

<style scoped>
.nav-back { color: var(--primary); font-size: 16px; }
.ios-input-inline { width: 100%; padding: 12px 14px; border: none; border-radius: 10px; font-size: 16px; outline: none; background: var(--gray6); -webkit-appearance: none; }
.ios-input-inline:focus { background: #fff; box-shadow: 0 0 0 1.5px var(--primary); }
.section-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 4px 8px; }
.section-title { font-size: 22px; font-weight: 700; letter-spacing: -.3px; }
</style>
