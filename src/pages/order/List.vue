<template>
  <div class="page">
    <div class="header">
      <div class="header-top">
        <span></span>
        <span class="header-title">点餐</span>
        <router-link to="/order/create" class="nav-action">发起</router-link>
      </div>
      <div class="header-large-title">点餐列表</div>
      <div class="seg-control">
        <span v-for="s in statuses" :key="s.v" class="seg-item" :class="{active: curStatus === s.v}" @click="curStatus = s.v; load()">{{ s.l }}</span>
      </div>
    </div>
    <div class="page-pad">
      <div v-if="loading" class="text-center text-gray mt-20">
        <div class="loading-spinner"></div>
      </div>
      <div v-else-if="orders.length === 0" class="empty">
        <div class="empty-icon">📋</div>
        <p>暂无点餐</p>
      </div>
      <div v-else>
        <div v-for="o in orders" :key="o.id" class="order-card">
          <div class="flex gap-12">
            <img v-if="o.cover" :src="o.cover" class="order-thumb" />
            <div v-else class="order-thumb-placeholder">{{ o.recipe_title[0] }}</div>
            <div style="flex:1;min-width:0">
              <div class="font-bold" style="font-size:17px">{{ o.recipe_title }}</div>
              <div class="text-gray text-sm mt-4">点餐人: {{ o.orderer_name }}</div>
              <div class="text-gray text-sm" v-if="o.meal_date">用餐: {{ o.meal_date }}</div>
              <div class="text-gray text-sm" v-if="o.note">备注: {{ o.note }}</div>
            </div>
            <span class="status-pill" :class="o.status">{{ statusMap[o.status] }}</span>
          </div>
          <div v-if="isChef || o.user_id === userStore.user?.id" class="flex gap-8 mt-12">
            <button v-if="isChef && o.status === 'pending'" class="btn btn-primary btn-sm" style="flex:1" @click="updateStatus(o, 'confirmed')">确认</button>
            <button v-if="isChef && o.status === 'pending'" class="btn btn-sm" style="flex:1;background:#FFEDED;color:var(--red)" @click="updateStatus(o, 'rejected')">拒绝</button>
            <button v-if="isChef && o.status === 'confirmed'" class="btn btn-primary btn-sm" style="flex:1" @click="updateStatus(o, 'cooking')">开始制作</button>
            <button v-if="isChef && o.status === 'cooking'" class="btn btn-primary btn-sm" style="flex:1" @click="updateStatus(o, 'done')">完成</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useUserStore } from '../../stores/user'
import { request, fileUrl } from '../../utils/request'

const userStore = useUserStore()
const orders = ref([])
const loading = ref(false)
const curStatus = ref('')
const statuses = [
  { v: '', l: '全部' }, { v: 'pending', l: '待确认' }, { v: 'confirmed', l: '已确认' }, { v: 'cooking', l: '制作中' }, { v: 'done', l: '已完成' }
]
const statusMap = { pending: '待确认', confirmed: '已确认', cooking: '制作中', done: '已完成', rejected: '已拒绝' }

const isChef = computed(() => userStore.currentFamily?.role === 'chef')

async function load() {
  if (!userStore.currentFamily) return
  loading.value = true
  try {
    const statusParam = curStatus.value || ''
    const data = await request(`/api/orders?family_id=${userStore.currentFamily.id}${statusParam ? '&status=' + statusParam : ''}`)
    orders.value = (data.orders || []).map(o => ({
      ...o,
      cover: o.cover ? fileUrl(o.cover) : null
    }))
  } catch (e) {} finally { loading.value = false }
}

async function updateStatus(o, status) {
  try {
    await request(`/api/orders/${o.id}`, { method: 'PUT', body: { status } })
    await load()
  } catch (e) { alert(e.message) }
}

onMounted(load)
watch(() => userStore.currentFamily?.id, load)
</script>

<style scoped>
.nav-action { color: var(--primary); font-size: 16px; font-weight: 500; }
.seg-control { display: flex; margin: 8px 16px 12px; background: var(--gray6); border-radius: 9px; padding: 2px; }
.seg-item { flex: 1; text-align: center; padding: 6px 8px; font-size: 13px; font-weight: 500; color: var(--text3); border-radius: 7px; transition: all .2s; }
.seg-item.active { background: #fff; color: var(--text); box-shadow: 0 1px 3px rgba(0,0,0,.1); }
.order-card { background: #fff; border-radius: 14px; padding: 16px; margin-bottom: 10px; }
.order-thumb { width: 64px; height: 64px; border-radius: 12px; object-fit: cover; flex-shrink: 0; }
.order-thumb-placeholder { width: 64px; height: 64px; border-radius: 12px; background: linear-gradient(135deg, #E3F0FF, #B8D7FF); display: flex; align-items: center; justify-content: center; font-size: 26px; font-weight: 600; color: var(--primary); flex-shrink: 0; }
.status-pill { padding: 4px 12px; border-radius: 10px; font-size: 12px; font-weight: 600; height: fit-content; white-space: nowrap; }
.status-pill.pending { background: #FFF4E5; color: var(--orange); }
.status-pill.confirmed { background: #E3F0FF; color: var(--primary); }
.status-pill.cooking { background: #FFE8F0; color: var(--pink); }
.status-pill.done { background: #E8F8EC; color: var(--green); }
.status-pill.rejected { background: #FFEDED; color: var(--red); }
.loading-spinner { width: 28px; height: 28px; border-radius: 50%; border: 3px solid var(--gray5); border-top-color: var(--primary); animation: spin .6s linear infinite; margin: 0 auto; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
