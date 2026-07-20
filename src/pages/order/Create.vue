<template>
  <div class="page">
    <div class="header">
      <div class="header-top">
        <span class="nav-back" @click="$router.back()">取消</span>
        <span class="header-title">发起点餐</span>
        <span class="nav-save" @click="submit" :class="{disabled: loading2}">{{ loading2 ? '...' : '提交' }}</span>
      </div>
    </div>
    <div class="page-pad">
      <div class="section-header" style="padding-top:16px"><span class="section-title">选择菜品</span></div>
      <div v-if="loading" class="text-center text-gray mt-16">
        <div class="loading-spinner"></div>
      </div>
      <div v-else class="list-group">
        <div v-for="r in recipes" :key="r.id" class="list-row" :class="{selected: form.recipe_id === r.id}" @click="form.recipe_id = r.id">
          <img v-if="r.cover" :src="r.cover" class="pick-thumb" />
          <div v-else class="pick-thumb-placeholder">{{ r.title[0] }}</div>
          <div style="flex:1">
            <div class="font-medium">{{ r.title }}</div>
            <div class="text-gray text-sm mt-4">{{ r.category }} · ¥{{ r.total_cost?.toFixed(1) }}</div>
          </div>
          <div class="check-circle" v-if="form.recipe_id === r.id">
            <svg viewBox="0 0 24 24" fill="none" style="width:16px;height:16px"><path d="M5 12L10 17L19 8" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
        </div>
      </div>

      <div class="section-header"><span class="section-title">其他信息</span></div>
      <div class="list-group">
        <div class="list-row" style="flex-direction:column;align-items:stretch;gap:8px">
          <span class="text-gray text-sm">用餐日期</span>
          <input class="ios-input-inline" v-model="form.meal_date" type="date" />
        </div>
        <div class="list-row" style="flex-direction:column;align-items:stretch;gap:8px">
          <span class="text-gray text-sm">备注</span>
          <textarea class="ios-input-inline" v-model="form.note" rows="2" placeholder="如：少油、多辣..." style="resize:none"></textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import * as api from '../../utils/api'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const recipes = ref([])
const loading = ref(false)
const loading2 = ref(false)
const form = reactive({ recipe_id: route.query.recipe_id ? parseInt(route.query.recipe_id) : null, meal_date: '', note: '' })

function loadRecipes() {
  if (!userStore.currentFamily) return
  loading.value = true
  try {
    recipes.value = api.getRecipes(userStore.currentFamily.id, null, null)
  } catch (e) {} finally { loading.value = false }
}

function submit() {
  if (!form.recipe_id) { alert('请选择菜品'); return }
  loading2.value = true
  try {
    api.createOrder(userStore.user.id, userStore.currentFamily.id, form.recipe_id, form.meal_date, form.note)
    router.push('/order')
  } catch (e) { alert(e.message) } finally { loading2.value = false }
}

onMounted(loadRecipes)
</script>

<style scoped>
.nav-back { color: var(--primary); font-size: 16px; }
.nav-save { color: var(--primary); font-size: 16px; font-weight: 600; }
.nav-save.disabled { opacity: .5; }
.list-row.selected { background: var(--primary-light); }
.pick-thumb { width: 48px; height: 48px; border-radius: 10px; object-fit: cover; flex-shrink: 0; }
.pick-thumb-placeholder { width: 48px; height: 48px; border-radius: 10px; background: linear-gradient(135deg, #E3F0FF, #B8D7FF); display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 600; color: var(--primary); flex-shrink: 0; }
.check-circle { width: 24px; height: 24px; border-radius: 50%; background: var(--primary); display: flex; align-items: center; justify-content: center; }
.ios-input-inline { width: 100%; padding: 10px 14px; border: none; border-radius: 10px; font-size: 16px; outline: none; background: var(--gray6); -webkit-appearance: none; }
.ios-input-inline:focus { background: #fff; box-shadow: 0 0 0 1.5px var(--primary); }
.section-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 4px 8px; }
.section-title { font-size: 22px; font-weight: 700; letter-spacing: -.3px; }
.loading-spinner { width: 28px; height: 28px; border-radius: 50%; border: 3px solid var(--gray5); border-top-color: var(--primary); animation: spin .6s linear infinite; margin: 0 auto; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
