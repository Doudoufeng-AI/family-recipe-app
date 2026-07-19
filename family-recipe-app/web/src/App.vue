<template>
  <router-view />
  <nav class="tabbar" v-if="showTabbar">
    <router-link v-for="t in tabs" :key="t.path" :to="t.path" class="tab-item" :class="{active: $route.path === t.path}">
      <svg class="tab-icon" viewBox="0 0 28 28" fill="none" v-html="t.icon"></svg>
      <span class="tab-label">{{ t.label }}</span>
    </router-link>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from './stores/user'

const route = useRoute()
const userStore = useUserStore()

// SF Symbols 风格的 SVG 路径
const icons = {
  home: `<path d="M4 13L14 4L24 13V23C24 23.5 23.5 24 23 24H17V17H11V24H5C4.5 24 4 23.5 4 23V13Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
  family: `<circle cx="10" cy="10" r="3.5" stroke-width="2"/><circle cx="19" cy="10" r="3.5" stroke-width="2"/><path d="M3 23C3 19 6 17 10 17C14 17 17 19 17 23" stroke-width="2" stroke-linecap="round"/><path d="M16 17C16 17 17.5 16.5 19 16.5C22.5 16.5 25 18.5 25 22.5" stroke-width="2" stroke-linecap="round"/>`,
  order: `<path d="M7 6C7 5 7.5 4.5 8 4.5H20C20.5 4.5 21 5 21 6V23L14 19.5L7 23V6Z" stroke-width="2" stroke-linejoin="round"/><path d="M11 10H17" stroke-width="2" stroke-linecap="round"/><path d="M11 14H15" stroke-width="2" stroke-linecap="round"/>`,
  ranking: `<path d="M6 20H10V14H6V20Z" stroke-width="2" stroke-linejoin="round"/><path d="M12 20H16V8H12V20Z" stroke-width="2" stroke-linejoin="round"/><path d="M18 20H22V11H18V20Z" stroke-width="2" stroke-linejoin="round"/><path d="M5 23H23" stroke-width="2" stroke-linecap="round"/>`,
  profile: `<circle cx="14" cy="10" r="4.5" stroke-width="2"/><path d="M5 23C5 18.5 9 16 14 16C19 16 23 18.5 23 23" stroke-width="2" stroke-linecap="round"/>`
}

const tabs = [
  { path: '/', icon: icons.home, label: '菜谱' },
  { path: '/family', icon: icons.family, label: '家庭' },
  { path: '/order', icon: icons.order, label: '点餐' },
  { path: '/ranking', icon: icons.ranking, label: '排名' },
  { path: '/profile', icon: icons.profile, label: '我的' }
]

const showTabbar = computed(() => {
  if (!userStore.token) return false
  return ['/', '/family', '/order', '/ranking', '/profile'].includes(route.path)
})
</script>

<style>
.tabbar {
  position: fixed; bottom: 0; left: 50%; transform: translateX(-50%);
  width: 100%; max-width: 500px;
  background: rgba(255,255,255,.82);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border-top: .5px solid rgba(60,60,67,.12);
  display: flex; z-index: 100;
  padding-bottom: env(safe-area-inset-bottom, 0px);
  height: 83px;
}
.tab-item {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 2px;
  color: var(--text3); font-size: 10px;
  padding-top: 6px;
}
.tab-icon {
  width: 28px; height: 28px;
  stroke: var(--text3);
  fill: none;
  transition: all .15s;
}
.tab-item.active {
  color: var(--primary);
}
.tab-item.active .tab-icon {
  stroke: var(--primary);
}
.tab-label {
  font-size: 10px; font-weight: 500;
}
</style>
