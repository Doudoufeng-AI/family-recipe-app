<template>
  <div class="page home-page">
    <div class="header glass">
      <div class="header-top">
        <div class="flex-col" @click="showFamilyPicker = true">
          <span class="family-name">{{ userStore.currentFamily?.name || '选择家庭' }}</span>
          <span class="family-sub" v-if="userStore.currentFamily">{{ isChef ? '👑 主厨' : '家庭成员' }} · {{ todayText }}</span>
          <span class="family-sub" v-else>点击选择家庭</span>
        </div>
        <div class="flex gap-8">
          <router-link to="/search" class="nav-icon-btn">
            <svg viewBox="0 0 28 28" fill="none" style="width:20px;height:20px"><circle cx="12" cy="12" r="7" stroke="currentColor" stroke-width="2"/><path d="M17 17L23 23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </router-link>
        </div>
      </div>
    </div>

    <div class="page-pad">
      <!-- 今日点餐 -->
      <div class="section-header" style="padding-top:16px">
        <span class="section-title">今日点餐</span>
        <router-link to="/order/create" class="text-primary text-sm" v-if="userStore.currentFamily">+ 发起点餐</router-link>
      </div>

      <div v-if="todayOrders.length === 0" class="empty-card">
        <div class="empty-icon-small">🍽</div>
        <p class="text-gray text-sm">今天还没有人点餐</p>
        <router-link to="/order/create" class="btn btn-primary btn-sm mt-12" v-if="userStore.currentFamily">去点餐</router-link>
      </div>

      <div v-else class="today-orders">
        <div v-for="o in todayOrders" :key="o.id" class="order-banner" :style="{ background: o.cover ? '' : o.cover_color }" @click="$router.push(`/recipe/${o.recipe_id}`)">
          <img v-if="o.cover" :src="o.cover" class="order-cover" />
          <div v-else class="order-cover-placeholder">{{ o.recipe_title[0] }}</div>
          <div class="order-info">
            <div class="order-title">{{ o.recipe_title }}</div>
            <div class="order-meta">
              <span>{{ o.category }}</span>
              <span>⏱{{ o.total_time }}分钟</span>
              <span>¥{{ o.total_cost?.toFixed(1) }}</span>
            </div>
            <div class="order-bottom">
              <span class="orderer">{{ o.orderer_name }} 点的</span>
              <span class="status-pill" :class="o.status">{{ statusMap[o.status] }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 切换家庭查看今日点餐 -->
      <div class="section-header" v-if="allFamilies.length > 1">
        <span class="section-title">其他家庭今日</span>
      </div>
      <div v-if="allFamilies.length > 1" class="family-tabs">
        <span v-for="f in allFamilies" :key="f.id" class="family-tab" :class="{active: selectedFamilyId === f.id}" @click="switchFamily(f.id)">
          {{ f.name }}
        </span>
      </div>
      <div v-if="selectedFamilyId && selectedFamilyId !== userStore.currentFamily?.id" class="other-family-orders">
        <div v-if="otherFamilyOrders.length === 0" class="empty-card">
          <p class="text-gray text-sm">该家庭今天暂无点餐</p>
        </div>
        <div v-for="o in otherFamilyOrders" :key="o.id" class="order-banner small" :style="{ background: o.cover ? '' : o.cover_color }">
          <img v-if="o.cover" :src="o.cover" class="order-cover" />
          <div v-else class="order-cover-placeholder">{{ o.recipe_title[0] }}</div>
          <div class="order-info">
            <div class="order-title">{{ o.recipe_title }}</div>
            <div class="order-meta"><span>{{ o.orderer_name }}</span><span>{{ o.category }}</span></div>
          </div>
        </div>
      </div>

      <!-- 菜谱列表 -->
      <div class="section-header">
        <span class="section-title">家庭菜谱</span>
        <router-link to="/recipe/create" class="text-primary text-sm" v-if="userStore.currentFamily">+ 添加</router-link>
      </div>
      <div class="cat-tabs">
        <span v-for="c in categories" :key="c" class="cat-pill" :class="{active: cat === c}" @click="cat = c; loadRecipes()">{{ c }}</span>
      </div>

      <div v-if="loading" class="text-center text-gray mt-20">
        <div class="loading-spinner"></div>
      </div>
      <div v-else-if="recipes.length === 0" class="empty-card">
        <div class="empty-icon-small">🍳</div>
        <p class="text-gray text-sm">还没有菜谱，点击添加第一道菜</p>
      </div>
      <div v-else>
        <div v-for="r in recipes" :key="r.id" class="list-item" @click="$router.push(`/recipe/${r.id}`)">
          <img v-if="r.cover" :src="r.cover" class="list-thumb" />
          <div v-else class="list-thumb-placeholder" :style="{ background: r.cover_color || 'linear-gradient(135deg, #E3F0FF, #B8D7FF)' }">{{ r.title[0] }}</div>
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
      <svg viewBox="0 0 28 28" fill="none" style="width:26px;height:26px"><path d="M14 5V23M5 14H23" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
    </router-link>

    <!-- 家庭选择弹窗 -->
    <div class="modal-mask" v-if="showFamilyPicker" @click.self="showFamilyPicker = false">
      <div class="modal">
        <div class="flex-between mb-12">
          <span class="font-bold" style="font-size:17px">选择家庭</span>
          <span class="text-primary" style="color:var(--primary)" @click="showFamilyPicker = false">完成</span>
        </div>
        <div v-for="f in allFamilies" :key="f.id" class="family-pick" :class="{active: f.id === userStore.currentFamily?.id}" @click="selectFamily(f)">
          <div class="family-avatar-sm">{{ f.name[0] }}</div>
          <div style="flex:1">
            <div class="font-medium">{{ f.name }}</div>
            <div class="text-gray text-sm">{{ f.role === 'chef' ? '主厨' : '成员' }}</div>
          </div>
          <span v-if="f.id === userStore.currentFamily?.id" class="check-blue">✓</span>
        </div>
        <router-link to="/family/create" class="btn btn-outline btn-block mt-12">创建新家庭</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useUserStore } from '../stores/user'
import * as api from '../utils/api'

const userStore = useUserStore()
const recipes = ref([])
const loading = ref(false)
const cat = ref('全部')
const categories = ['全部', '早餐', '午餐', '晚餐', '汤品', '凉菜', '主食', '小吃', '甜品']
const todayOrders = ref([])
const allFamilies = ref([])
const selectedFamilyId = ref(null)
const otherFamilyOrders = ref([])
const showFamilyPicker = ref(false)

const todayText = new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' })
const statusMap = { pending: '待确认', confirmed: '已确认', cooking: '制作中', done: '已完成', rejected: '已拒绝' }

const isChef = computed(() => {
  if (!userStore.currentFamily) return false
  return api.getUserRole(userStore.currentFamily.id, userStore.user.id) === 'chef'
})

function loadRecipes() {
  loading.value = true
  try {
    const fid = userStore.currentFamily?.id
    if (!fid) { recipes.value = []; return }
    recipes.value = api.getRecipes(fid, null, cat.value)
  } catch (e) { console.error(e) } finally { loading.value = false }
}

function loadTodayOrders() {
  const fid = userStore.currentFamily?.id
  if (!fid) { todayOrders.value = []; return }
  todayOrders.value = api.getTodayOrders(fid)
}

function loadAllFamilies() {
  allFamilies.value = api.getMyFamilies(userStore.user.id)
}

function switchFamily(fid) {
  selectedFamilyId.value = fid
  otherFamilyOrders.value = api.getTodayOrders(fid)
}

function selectFamily(f) {
  userStore.setFamily(f)
  showFamilyPicker.value = false
  loadRecipes()
  loadTodayOrders()
}

onMounted(() => {
  loadAllFamilies()
  loadRecipes()
  loadTodayOrders()
})
watch(() => userStore.currentFamily?.id, () => { loadRecipes(); loadTodayOrders() })
</script>

<style scoped>
.home-page {
  background: linear-gradient(180deg, #FFF8F0 0%, #F2F2F7 280px);
  min-height: 100vh;
}
.family-name { font-size: 17px; font-weight: 600; }
.family-sub { font-size: 12px; color: var(--text3); margin-top: 2px; }
.nav-icon-btn { width: 36px; height: 36px; border-radius: 50%; background: var(--gray6); display: flex; align-items: center; justify-content: center; color: var(--text); }
.section-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 4px 8px; }
.section-title { font-size: 22px; font-weight: 700; letter-spacing: -.3px; }
.text-primary { color: var(--primary); font-weight: 500; }
.btn-sm { padding: 6px 14px; font-size: 13px; border-radius: 10px; }

.empty-card { text-align: center; padding: 24px 16px; background: rgba(255,255,255,.6); border-radius: 14px; margin-bottom: 12px; }
.empty-icon-small { font-size: 36px; margin-bottom: 8px; opacity: .5; }

.today-orders { display: flex; flex-direction: column; gap: 10px; margin-bottom: 8px; }
.order-banner { display: flex; gap: 12px; padding: 14px; border-radius: 16px; background: #fff; box-shadow: 0 2px 12px rgba(0,0,0,.06); }
.order-banner.small { padding: 10px; border-radius: 12px; }
.order-cover { width: 72px; height: 72px; border-radius: 12px; object-fit: cover; flex-shrink: 0; }
.order-cover-placeholder { width: 72px; height: 72px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 700; color: #fff; flex-shrink: 0; }
.order-info { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: space-between; }
.order-title { font-size: 17px; font-weight: 600; }
.order-meta { display: flex; gap: 12px; font-size: 13px; color: var(--text3); margin-top: 4px; }
.order-bottom { display: flex; justify-content: space-between; align-items: center; margin-top: 6px; }
.orderer { font-size: 13px; color: var(--text3); }
.status-pill { padding: 3px 10px; border-radius: 8px; font-size: 11px; font-weight: 600; }
.status-pill.pending { background: #FFF4E5; color: var(--orange); }
.status-pill.confirmed { background: #E3F0FF; color: var(--primary); }
.status-pill.cooking { background: #FFE8F0; color: var(--pink); }
.status-pill.done { background: #E8F8EC; color: var(--green); }

.family-tabs { display: flex; gap: 8px; overflow-x: auto; margin-bottom: 10px; }
.family-tab { white-space: nowrap; padding: 6px 14px; border-radius: 16px; font-size: 13px; background: rgba(255,255,255,.6); color: var(--text3); }
.family-tab.active { background: var(--primary); color: #fff; }
.other-family-orders { display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; }

.cat-tabs { display: flex; gap: 8px; overflow-x: auto; -webkit-overflow-scrolling: touch; padding-bottom: 8px; }
.cat-tabs::-webkit-scrollbar { display: none; }
.cat-pill { white-space: nowrap; padding: 6px 16px; border-radius: 18px; font-size: 14px; font-weight: 500; background: rgba(255,255,255,.6); color: var(--text3); transition: all .15s; }
.cat-pill.active { background: var(--primary); color: #fff; }

.loading-spinner { width: 28px; height: 28px; border-radius: 50%; border: 3px solid var(--gray5); border-top-color: var(--primary); animation: spin .6s linear infinite; margin: 0 auto; }
@keyframes spin { to { transform: rotate(360deg); } }

.fab { position: fixed; right: 20px; bottom: calc(95px + var(--safe-bottom)); width: 56px; height: 56px; border-radius: 50%; background: var(--primary); color: #fff; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 16px rgba(0,122,255,.4); z-index: 50; transition: transform .1s; }
.fab:active { transform: scale(.9); }

.family-pick { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 12px; margin-bottom: 6px; }
.family-pick.active { background: var(--primary-light); }
.family-avatar-sm { width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg, #007AFF, #5856D6); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 600; }
.check-blue { color: var(--primary); font-size: 20px; font-weight: 600; }
</style>
