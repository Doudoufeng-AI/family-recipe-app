<template>
  <div class="page" v-if="family">
    <div class="header">
      <div class="header-top">
        <span class="nav-back" @click="$router.back()"><svg viewBox="0 0 28 28" fill="none" style="width:24px;height:24px"><path d="M17 6L9 14L17 22" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
        <span class="header-title">家庭详情</span>
        <span></span>
      </div>
    </div>
    <div class="page-pad">
      <!-- 家庭信息 -->
      <div class="section-header" style="padding-top:16px"><span class="section-title">{{ family.name }}</span></div>
      <div class="list-group">
        <div class="list-row">
          <span>邀请码</span>
          <span class="font-bold" style="font-size:20px;letter-spacing:3px;font-family:'SF Mono',monospace">{{ family.invite_code }}</span>
        </div>
        <div class="list-row">
          <span>创建时间</span>
          <span class="text-gray text-sm">{{ family.created_at }}</span>
        </div>
      </div>

      <!-- 成员 -->
      <div class="section-header"><span class="section-title">家庭成员</span><span class="text-gray text-sm">{{ members.length }}人</span></div>
      <div class="list-group">
        <div v-for="m in members" :key="m.id" class="list-row">
          <div class="member-avatar" :class="{chef: m.role === 'chef'}">{{ m.nickname[0] }}</div>
          <div style="flex:1">
            <div class="font-medium">{{ m.nickname }}</div>
            <div class="text-gray text-sm">@{{ m.username }}</div>
          </div>
          <span v-if="m.role === 'chef'" class="chef-badge">主厨</span>
          <template v-if="isCreator && m.id !== family.creator_id">
            <button class="btn btn-gray btn-sm" @click="setChef(m)">设为主厨</button>
            <button class="btn btn-sm" style="background:#FFEDED;color:var(--red)" @click="removeMember(m)">移除</button>
          </template>
        </div>
      </div>

      <div class="text-center text-gray text-sm mt-16" v-if="family.creator_id === userStore.user?.id">
        你是家庭创建者，可以管理成员
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '../../stores/user'
import * as api from '../../utils/api'

const route = useRoute()
const userStore = useUserStore()
const family = ref(null)
const members = ref([])

const isCreator = computed(() => family.value?.creator_id === userStore.user?.id)

function load() {
  try {
    const fid = parseInt(route.params.id)
    members.value = api.getFamilyMembers(fid)
    const myFamilies = api.getMyFamilies(userStore.user.id)
    family.value = myFamilies.find(f => f.id === fid)
  } catch (e) { alert(e.message) }
}

function setChef(m) {
  if (!confirm(`确定将 ${m.nickname} 设为主厨吗？`)) return
  try {
    api.setChef(family.value.id, m.id, userStore.user.id)
    load()
  } catch (e) { alert(e.message) }
}

async function removeMember(m) {
  if (!confirm(`确定移除 ${m.nickname} 吗？`)) return
  alert('当前版本暂不支持移除成员')
}

onMounted(load)
</script>

<style scoped>
.nav-back { color: var(--primary); display: flex; align-items: center; }
.member-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #8E8E93, #AEAEB2); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 17px; font-weight: 600; flex-shrink: 0; }
.member-avatar.chef { background: linear-gradient(135deg, #FF9500, #FF6B00); }
.chef-badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 8px; font-size: 12px; font-weight: 600; background: #FFF4E5; color: var(--orange); margin-right: 8px; }
.section-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 4px 8px; }
.section-title { font-size: 22px; font-weight: 700; letter-spacing: -.3px; }
</style>
