<template>
  <div class="page">
    <div class="header">
      <div class="header-top">
        <span></span>
        <span class="header-title">我的</span>
        <span></span>
      </div>
    </div>

    <!-- 用户卡片 -->
    <div class="profile-card">
      <div class="profile-avatar">{{ userStore.user?.nickname?.[0] }}</div>
      <div class="profile-name">{{ userStore.user?.nickname }}</div>
      <div class="profile-id">@{{ userStore.user?.username }}</div>
      <div v-if="userStore.currentFamily" class="mt-12">
        <span class="tag">{{ userStore.currentFamily.name }}</span>
      </div>
    </div>

    <!-- 菜单组1 -->
    <div class="list-group-title">菜谱</div>
    <div class="list-group">
      <div class="list-row" @click="$router.push('/recipe/create')">
        <div class="row-icon" style="background:#E3F0FF;color:var(--primary)">🍳</div>
        <span style="flex:1">上传菜谱</span>
        <svg viewBox="0 0 12 12" fill="none" style="width:12px;height:12px;color:var(--gray3)"><path d="M4 2L8 6L4 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      </div>
      <div class="list-row" @click="$router.push('/search')">
        <div class="row-icon" style="background:#FFF4E5;color:var(--orange)">🔍</div>
        <span style="flex:1">搜索菜谱</span>
        <svg viewBox="0 0 12 12" fill="none" style="width:12px;height:12px;color:var(--gray3)"><path d="M4 2L8 6L4 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      </div>
    </div>

    <!-- 菜单组2 -->
    <div class="list-group-title">家庭与排名</div>
    <div class="list-group">
      <div class="list-row" @click="$router.push('/family')">
        <div class="row-icon" style="background:#E8F8EC;color:var(--green)">🏠</div>
        <span style="flex:1">家庭管理</span>
        <svg viewBox="0 0 12 12" fill="none" style="width:12px;height:12px;color:var(--gray3)"><path d="M4 2L8 6L4 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      </div>
      <div class="list-row" @click="$router.push('/ranking')">
        <div class="row-icon" style="background:#FFF8E1;color:var(--yellow)">🏆</div>
        <span style="flex:1">排行榜</span>
        <svg viewBox="0 0 12 12" fill="none" style="width:12px;height:12px;color:var(--gray3)"><path d="M4 2L8 6L4 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      </div>
    </div>

    <!-- 菜单组3 -->
    <div class="list-group-title">其他</div>
    <div class="list-group">
      <div class="list-row" @click="onResetDemo">
        <div class="row-icon" style="background:#FFF4E5;color:var(--orange)">🔄</div>
        <span style="flex:1">重置演示数据</span>
        <svg viewBox="0 0 12 12" fill="none" style="width:12px;height:12px;color:var(--gray3)"><path d="M4 2L8 6L4 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      </div>
      <div class="list-row" @click="showAbout = true">
        <div class="row-icon" style="background:#F4ECFF;color:var(--purple)">ℹ️</div>
        <span style="flex:1">关于</span>
        <svg viewBox="0 0 12 12" fill="none" style="width:12px;height:12px;color:var(--gray3)"><path d="M4 2L8 6L4 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      </div>
    </div>

    <div class="list-group">
      <div class="list-row" @click="onLogout" style="justify-content:center">
        <span style="color:var(--red);font-weight:500">退出登录</span>
      </div>
    </div>

    <div class="text-center text-gray text-sm mt-16 mb-16" style="opacity:.6">家庭菜谱 v1.0</div>

    <!-- 关于弹窗 -->
    <div class="modal-mask modal-centered" v-if="showAbout" @click.self="showAbout = false">
      <div class="modal">
        <div class="text-center">
          <div class="auth-logo" style="font-size:48px">🍳</div>
          <h3 class="text-xl mt-8">家庭菜谱</h3>
          <p class="text-gray text-sm mt-4">版本 1.0.0</p>
        </div>
        <p class="text-sm mt-16" style="line-height:1.6;color:var(--text2)">
          记录家的味道，分享每一道爱的美食。<br>
          支持菜谱管理、多家庭、点餐、评分评价、排名。
        </p>
        <button class="btn btn-primary btn-block mt-16" @click="showAbout = false">知道了</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import * as api from '../utils/api'

const router = useRouter()
const userStore = useUserStore()
const showAbout = ref(false)

function onResetDemo() {
  if (!confirm('确定重置演示数据吗？这将清空当前所有数据并重新初始化演示数据。')) return
  localStorage.removeItem('family_recipe_data')
  api.initDemoData()
  alert('演示数据已重置，请重新登录')
  userStore.logout()
  router.push('/login')
}

function onLogout() {
  if (!confirm('确定退出登录吗？')) return
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.profile-card { text-align: center; padding: 32px 16px 24px; }
.profile-avatar { width: 88px; height: 88px; border-radius: 50%; background: linear-gradient(135deg, #007AFF, #5856D6); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 36px; font-weight: 600; margin: 0 auto; }
.profile-name { font-size: 22px; font-weight: 700; margin-top: 12px; }
.profile-id { color: var(--text3); font-size: 14px; margin-top: 4px; }
.row-icon { width: 30px; height: 30px; border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
</style>
