<template>
  <div class="page">
    <div class="header">
      <div class="header-top">
        <div class="flex-col">
          <span class="text-gray text-sm" v-if="userStore.currentFamily">{{ userStore.currentFamily.name }}</span>
          <span class="text-gray text-sm" v-else>未选择家庭</span>
        </div>
        <div class="flex gap-8">
          <router-link to="/search" class="nav-icon-btn">
            <svg viewBox="0 0 28 28" fill="none" class="nav-icon"><circle cx="12" cy="12" r="7" stroke="currentColor" stroke-width="2"/><path d="M17 17L23 23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </router-link>
        </div>
      </div>
      <div class="header-large-title">菜谱</div>
      <div class="cat-tabs">
        <span v-for="c in categories" :key="c" class="cat-pill" :class="{active: cat === c}" @click="cat = c; loadRecipes()">{{ c }}</span>
      </div>
    </div>

    <div class="page-pad">
      <div v-if="loading" class="text-center text-gray mt-20">
        <div class="loading-spinner"></div>
        <p class="mt-8">加载中...</p>
      </div>
      <div v-else-if="recipes.length === 0" class="empty">
        <div class="empty-icon">🍳</div>
        <p>还没有菜谱</p>
        <p class="text-sm mt-4">点击右上角添加第一道菜</p>
      </div>
      <div v-else>
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
            <div class="flex-between">
              <span class="text-gray text-sm">{{ r.author_name }}</span>
              <span v-if="r.avg_score" class="stars">★ {{ Number(r.avg_score).toFixed(1) }}</span>
            </div>
            <div class="flex gap-12 mt-4">
              <span class="text-gray text-sm">⏱ {{ r.total_time }}分钟</span>
              <span class="text-gray text-sm">¥{{ r.total_cost?.toFixed(1) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <router-link to="/recipe/create" class="fab" v-if="userStore.currentFamily">
      <svg viewBox="0 0 28 28" fill="none" class="fab-icon"><path d="M14 5V23M5 14H23" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
    </router-link>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useUserStore } from '../stores/user'
import * as api from '../utils/api'

const userStore = useUserStore()
const recipes = ref([])
const loading = ref(false)
const cat = ref('全部')
const categories = ['全部', '早餐', '午餐', '晚餐', '汤品', '凉菜', '主食', '小吃', '甜品']

function loadRecipes() {
  loading.value = true
  try {
    const fid = userStore.currentFamily?.id
    if (!fid) { recipes.value = []; return }
    recipes.value = api.getRecipes(fid, null, cat.value)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(loadRecipes)
watch(() => userStore.currentFamily?.id, loadRecipes)
</script>

<style scoped>
.nav-icon-btn {
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--gray6);
  display: flex; align-items: center; justify-content: center;
  color: var(--text);
}
.nav-icon { width: 20px; height: 20px; }
.cat-tabs { display: flex; gap: 8px; padding: 0 16px 12px; overflow-x: auto; -webkit-overflow-scrolling: touch; }
.cat-tabs::-webkit-scrollbar { display: none; }
.cat-pill {
  white-space: nowrap; padding: 6px 16px; border-radius: 18px;
  font-size: 14px; font-weight: 500;
  background: var(--gray6); color: var(--text3);
  transition: all .15s;
}
.cat-pill.active { background: var(--primary); color: #fff; }

.loading-spinner {
  width: 28px; height: 28px; border-radius: 50%;
  border: 3px solid var(--gray5);
  border-top-color: var(--primary);
  animation: spin .6s linear infinite;
  margin: 0 auto;
}
@keyframes spin { to { transform: rotate(360deg); } }

.fab {
  position: fixed; right: 20px; bottom: calc(95px + var(--safe-bottom));
  width: 56px; height: 56px; border-radius: 50%;
  background: var(--primary); color: #fff;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 16px rgba(0,122,255,.4);
  z-index: 50;
  transition: transform .1s;
}
.fab:active { transform: scale(.9); }
.fab-icon { width: 26px; height: 26px; }
</style>
