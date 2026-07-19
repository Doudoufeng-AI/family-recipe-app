<template>
  <div class="page">
    <div class="header">
      <div class="header-top">
        <span class="nav-back" @click="$router.back()">取消</span>
        <span class="header-title">搜索</span>
        <span></span>
      </div>
    </div>
    <div class="search-bar">
      <svg viewBox="0 0 28 28" fill="none" class="search-icon"><circle cx="12" cy="12" r="7" stroke="currentColor" stroke-width="2"/><path d="M17 17L23 23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      <input class="search-input" v-model="keyword" placeholder="搜索菜名或食材..." @keyup.enter="search" autofocus />
      <button class="search-btn" @click="search" v-if="keyword">搜索</button>
    </div>
    <div class="page-pad">
      <div v-if="searched && recipes.length === 0" class="empty">
        <div class="empty-icon">🔍</div>
        <p>没有找到相关菜谱</p>
      </div>
      <div v-for="r in recipes" :key="r.id" class="list-item" @click="$router.push(`/recipe/${r.id}`)">
        <img v-if="r.cover" :src="r.cover" class="list-thumb" />
        <div v-else class="list-thumb-placeholder">{{ r.title[0] }}</div>
        <div class="list-content">
          <div>
            <div class="list-title">{{ r.title }}</div>
            <div class="flex gap-8 mt-4">
              <span class="tag">{{ r.category }}</span>
            </div>
          </div>
          <div class="flex-between mt-4">
            <span class="text-gray text-sm">{{ r.author_name }}</span>
            <span v-if="r.avg_score" class="stars">★ {{ Number(r.avg_score).toFixed(1) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '../stores/user'
import * as api from '../utils/api'

const userStore = useUserStore()
const keyword = ref('')
const recipes = ref([])
const searched = ref(false)

function search() {
  if (!keyword.value.trim()) return
  try {
    const fid = userStore.currentFamily?.id
    if (!fid) return
    recipes.value = api.getRecipes(fid, keyword.value, null)
    searched.value = true
  } catch (e) { console.error(e) }
}
</script>

<style scoped>
.nav-back { color: var(--primary); font-size: 16px; }
.search-bar { display: flex; align-items: center; gap: 8px; padding: 8px 16px 12px; background: rgba(249,249,249,.8); backdrop-filter: blur(20px); }
.search-icon { width: 18px; height: 18px; color: var(--text3); flex-shrink: 0; }
.search-input { flex: 1; padding: 10px 14px; border: none; border-radius: 12px; font-size: 16px; outline: none; background: rgba(118,118,128,.12); -webkit-appearance: none; }
.search-input:focus { background: #fff; box-shadow: 0 0 0 1.5px var(--primary); }
.search-btn { color: var(--primary); font-size: 16px; font-weight: 600; white-space: nowrap; }
</style>
