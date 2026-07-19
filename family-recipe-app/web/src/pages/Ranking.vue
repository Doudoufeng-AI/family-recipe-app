<template>
  <div class="page">
    <div class="header">
      <div class="header-top">
        <span></span>
        <span class="header-title">排行榜</span>
        <span></span>
      </div>
      <div class="header-large-title">排名</div>
      <div class="seg-control">
        <span class="seg-item" :class="{active: tab === 'recipes'}" @click="tab = 'recipes'">菜品榜</span>
        <span class="seg-item" :class="{active: tab === 'chefs'}" @click="tab = 'chefs'">厨师榜</span>
      </div>
    </div>
    <div class="page-pad">
      <!-- 菜品榜 -->
      <div v-if="tab === 'recipes'">
        <div v-if="recipes.length === 0" class="empty">
          <div class="empty-icon">🍽</div>
          <p>暂无排名数据</p>
        </div>
        <!-- 前三名领奖台 -->
        <div v-if="recipes.length >= 3" class="podium">
          <div class="podium-item second">
            <div class="podium-avatar">🥈</div>
            <div class="podium-name text-sm font-medium mt-4">{{ recipes[1].title }}</div>
            <div class="podium-score stars">★{{ recipes[1].avg_score ? Number(recipes[1].avg_score).toFixed(1) : '—' }}</div>
          </div>
          <div class="podium-item first">
            <div class="podium-avatar">🥇</div>
            <div class="podium-name text-sm font-medium mt-4">{{ recipes[0].title }}</div>
            <div class="podium-score stars">★{{ recipes[0].avg_score ? Number(recipes[0].avg_score).toFixed(1) : '—' }}</div>
          </div>
          <div class="podium-item third">
            <div class="podium-avatar">🥉</div>
            <div class="podium-name text-sm font-medium mt-4">{{ recipes[2].title }}</div>
            <div class="podium-score stars">★{{ recipes[2].avg_score ? Number(recipes[2].avg_score).toFixed(1) : '—' }}</div>
          </div>
        </div>
        <!-- 列表 -->
        <div v-for="(r, i) in recipes" :key="r.id" class="rank-item" @click="$router.push(`/recipe/${r.id}`)">
          <div class="rank-num" :class="rankClass(i)">{{ i + 1 }}</div>
          <img v-if="r.cover" :src="fileUrl(r.cover)" class="rank-thumb" />
          <div v-else class="rank-thumb-placeholder">{{ r.title[0] }}</div>
          <div style="flex:1;min-width:0">
            <div class="font-semibold" style="font-size:16px">{{ r.title }}</div>
            <div class="text-gray text-sm mt-4">{{ r.author_name }} · {{ r.rating_count }}人评分</div>
          </div>
          <div class="rank-score">
            <div class="stars">★{{ r.avg_score ? Number(r.avg_score).toFixed(1) : '—' }}</div>
          </div>
        </div>
      </div>

      <!-- 厨师榜 -->
      <div v-else>
        <div v-if="chefs.length === 0" class="empty">
          <div class="empty-icon">👨‍🍳</div>
          <p>暂无排名数据</p>
        </div>
        <div v-for="(c, i) in chefs" :key="c.id" class="rank-item">
          <div class="rank-num" :class="rankClass(i)">{{ i + 1 }}</div>
          <div class="rank-avatar">{{ c.nickname[0] }}</div>
          <div style="flex:1;min-width:0">
            <div class="font-semibold" style="font-size:16px">{{ c.nickname }}</div>
            <div class="text-gray text-sm mt-4">{{ c.recipe_count }}道菜 · {{ c.rating_count }}条评价</div>
          </div>
          <div class="rank-score">
            <div class="stars">★{{ c.avg_score ? Number(c.avg_score).toFixed(1) : '—' }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useUserStore } from '../stores/user'
import { request, fileUrl } from '../utils/request'

const userStore = useUserStore()
const tab = ref('recipes')
const recipes = ref([])
const chefs = ref([])

function rankClass(i) {
  return i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''
}

async function load() {
  const fid = userStore.currentFamily?.id || ''
  try {
    if (tab.value === 'recipes') {
      const data = await request(`/api/rankings/recipes?family_id=${fid}`)
      recipes.value = data.recipes
    } else {
      const data = await request(`/api/rankings/chefs?family_id=${fid}`)
      chefs.value = data.chefs
    }
  } catch (e) {}
}

onMounted(load)
watch(tab, load)
</script>

<style scoped>
.seg-control { display: flex; margin: 8px 16px 12px; background: var(--gray6); border-radius: 9px; padding: 2px; }
.seg-item { flex: 1; text-align: center; padding: 6px; font-size: 14px; font-weight: 500; color: var(--text3); border-radius: 7px; transition: all .2s; }
.seg-item.active { background: #fff; color: var(--text); box-shadow: 0 1px 3px rgba(0,0,0,.1); }

.podium { display: flex; justify-content: center; align-items: flex-end; gap: 8px; margin-bottom: 20px; padding: 0 8px; }
.podium-item { flex: 1; text-align: center; padding: 16px 8px; border-radius: 14px; background: #fff; }
.podium-item.first { height: 120px; background: linear-gradient(180deg, #FFF8E1, #FFFDE7); border: 2px solid #FFD700; }
.podium-item.second { height: 100px; background: linear-gradient(180deg, #F5F5F5, #FAFAFA); border: 2px solid #C0C0C0; }
.podium-item.third { height: 90px; background: linear-gradient(180deg, #FFF0E0, #FFF8F0); border: 2px solid #CD7F32; }
.podium-avatar { font-size: 32px; }
.podium-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.podium-score { margin-top: 4px; }

.rank-item { display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: #fff; border-radius: 14px; margin-bottom: 8px; }
.rank-item:active { background: var(--gray6); }
.rank-num { width: 30px; height: 30px; border-radius: 50%; background: var(--gray6); display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 700; flex-shrink: 0; color: var(--text3); }
.rank-num.gold { background: linear-gradient(135deg, #FFD700, #FFA000); color: #fff; }
.rank-num.silver { background: linear-gradient(135deg, #C0C0C0, #9E9E9E); color: #fff; }
.rank-num.bronze { background: linear-gradient(135deg, #CD7F32, #8D6E63); color: #fff; }
.rank-thumb { width: 50px; height: 50px; border-radius: 10px; object-fit: cover; flex-shrink: 0; }
.rank-thumb-placeholder { width: 50px; height: 50px; border-radius: 10px; background: linear-gradient(135deg, #E3F0FF, #B8D7FF); display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 600; color: var(--primary); flex-shrink: 0; }
.rank-avatar { width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, #007AFF, #5856D6); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 600; flex-shrink: 0; }
.rank-score { text-align: right; flex-shrink: 0; }
</style>
