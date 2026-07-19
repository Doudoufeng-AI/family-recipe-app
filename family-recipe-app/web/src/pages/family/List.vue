<template>
  <div class="page">
    <div class="header">
      <div class="header-top">
        <span></span>
        <span class="header-title">家庭</span>
        <router-link to="/family/create" class="nav-action">添加</router-link>
      </div>
      <div class="header-large-title">我的家庭</div>
    </div>
    <div class="page-pad">
      <div v-if="loading" class="text-center text-gray mt-20">加载中...</div>
      <div v-else-if="families.length === 0" class="empty">
        <div class="empty-icon">🏠</div>
        <p>还没有家庭</p>
        <router-link to="/family/create" class="btn btn-primary mt-16" style="padding:10px 24px">创建家庭</router-link>
      </div>
      <div v-else>
        <div class="list-group-title" v-if="families.length > 1">点击切换当前家庭</div>
        <div v-for="f in families" :key="f.id" class="family-item" :class="{current: f.id === userStore.currentFamily?.id}" @click="selectFamily(f)">
          <div class="family-info">
            <div class="family-avatar">{{ f.name[0] }}</div>
            <div style="flex:1">
              <div class="family-name">{{ f.name }}</div>
              <div class="flex gap-8 mt-4">
                <span class="tag" v-if="f.role === 'chef'">主厨</span>
                <span class="tag tag-green" v-else>成员</span>
              </div>
            </div>
          </div>
          <div class="invite-code" @click.stop="copyCode(f.invite_code)">
            <span class="text-gray text-sm">邀请码</span>
            <span class="code-text">{{ f.invite_code }}</span>
          </div>
        </div>
      </div>

      <div class="list-group-title mt-16">加入家庭</div>
      <div class="card">
        <p class="text-sm text-gray mb-12">输入邀请码加入其他家庭</p>
        <div class="flex gap-8">
          <input class="input" v-model="joinCode" placeholder="6位邀请码" style="flex:1;text-transform:uppercase" />
          <button class="btn btn-primary" @click="joinFamily">加入</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import { request } from '../../utils/request'

const router = useRouter()
const userStore = useUserStore()
const families = ref([])
const loading = ref(false)
const joinCode = ref('')

async function load() {
  loading.value = true
  try {
    const data = await request('/api/families/mine')
    families.value = data.families
    if (families.value.length > 0 && !userStore.currentFamily) {
      userStore.setFamily(families.value[0])
    }
  } catch (e) {} finally { loading.value = false }
}

function selectFamily(f) {
  userStore.setFamily(f)
  router.push(`/family/${f.id}`)
}

function copyCode(code) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(code)
    alert(`邀请码 ${code} 已复制`)
  } else {
    alert(`邀请码：${code}`)
  }
}

async function joinFamily() {
  if (!joinCode.value.trim()) { alert('请输入邀请码'); return }
  try {
    const data = await request('/api/families/join', { method: 'POST', body: { invite_code: joinCode.value.toUpperCase() } })
    userStore.setFamily(data.family)
    joinCode.value = ''
    await load()
    router.push(`/family/${data.family.id}`)
  } catch (e) { alert(e.message) }
}

onMounted(load)
</script>

<style scoped>
.nav-action { color: var(--primary); font-size: 16px; font-weight: 500; }
.family-item { background: #fff; border-radius: 14px; padding: 16px; margin-bottom: 10px; }
.family-item.current { box-shadow: 0 0 0 2px var(--primary); }
.family-info { display: flex; gap: 12px; align-items: center; }
.family-avatar { width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #007AFF, #5856D6); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 600; }
.family-name { font-size: 17px; font-weight: 600; }
.invite-code { display: flex; justify-content: space-between; align-items: center; margin-top: 12px; padding-top: 12px; border-top: .5px solid var(--separator); }
.code-text { font-size: 18px; font-weight: 700; letter-spacing: 2px; font-family: 'SF Mono', monospace; }
</style>
