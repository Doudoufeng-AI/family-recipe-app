<template>
  <div class="page" v-if="recipe">
    <!-- 成品图轮播 -->
    <div class="gallery" v-if="images.length">
      <img v-for="(img, i) in images" :key="i" :src="img" v-show="i === curImg" class="gallery-img" />
      <div class="gallery-dots" v-if="images.length > 1">
        <span v-for="(img, i) in images" :key="i" :class="{dot: true, active: i === curImg}" @click="curImg = i"></span>
      </div>
    </div>
    <div v-else class="gallery-placeholder">{{ recipe.title[0] }}</div>

    <!-- 标题区 -->
    <div class="title-card">
      <h1 class="recipe-title">{{ recipe.title }}</h1>
      <div class="flex gap-8 mt-8">
        <span class="tag">{{ recipe.category }}</span>
      </div>
      <div class="stats-row mt-12">
        <div class="stat-item">
          <span class="stat-icon">⏱</span>
          <span class="stat-value">{{ recipe.total_time }}</span>
          <span class="stat-label">分钟</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-icon">💰</span>
          <span class="stat-value">{{ recipe.total_cost?.toFixed(2) }}</span>
          <span class="stat-label">元</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-icon">⭐</span>
          <span class="stat-value">{{ recipe.avg_score ? Number(recipe.avg_score).toFixed(1) : '—' }}</span>
          <span class="stat-label">{{ recipe.rating_count }}人</span>
        </div>
      </div>
      <div class="author-row mt-12">
        <div class="flex gap-8" style="align-items:center">
          <div class="avatar-wrap">
            <div class="avatar">{{ recipe.author_name[0] }}</div>
            <div v-if="authorIsChef" class="chef-hat">👑</div>
          </div>
          <div>
            <div class="text-sm font-medium">{{ recipe.author_name }}</div>
            <div class="text-gray text-sm">{{ authorIsChef ? '主厨' : '厨师' }}</div>
          </div>
        </div>
      </div>
      <p v-if="recipe.description" class="desc mt-12">{{ recipe.description }}</p>
    </div>

    <!-- 视频 -->
    <div v-if="recipe.video" class="card">
      <div class="section-title">做法视频</div>
      <video :src="recipe.video" controls class="video mt-8"></video>
    </div>

    <!-- 食材 -->
    <div v-if="ingredients.filter(i => i.type === 'ingredient').length">
      <div class="section-header">
        <span class="section-title">食材</span>
        <span class="text-gray text-sm">¥{{ ingCost('ingredient').toFixed(2) }}</span>
      </div>
      <div class="card" style="padding:0;overflow:hidden">
        <img v-if="ingredients.find(i => i.type === 'ingredient' && i.group_image)" :src="ingredients.find(i => i.type === 'ingredient').group_image" class="group-img" />
        <div class="ing-list">
          <div v-for="ing in ingredients.filter(i => i.type === 'ingredient')" :key="ing.id" class="ing-row">
            <span class="ing-name">{{ ing.name }}</span>
            <span class="ing-amount">{{ ing.amount }}{{ ing.unit }}</span>
            <span class="ing-cost">¥{{ ing.cost?.toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 调料 -->
    <div v-if="ingredients.filter(i => i.type === 'seasoning').length">
      <div class="section-header">
        <span class="section-title">调料</span>
        <span class="text-gray text-sm">¥{{ ingCost('seasoning').toFixed(2) }}</span>
      </div>
      <div class="card" style="padding:0;overflow:hidden">
        <img v-if="ingredients.find(i => i.type === 'seasoning' && i.group_image)" :src="ingredients.find(i => i.type === 'seasoning').group_image" class="group-img" />
        <div class="ing-list">
          <div v-for="ing in ingredients.filter(i => i.type === 'seasoning')" :key="ing.id" class="ing-row">
            <span class="ing-name">{{ ing.name }}</span>
            <span class="ing-amount">{{ ing.amount }}{{ ing.unit }}</span>
            <span class="ing-cost">¥{{ ing.cost?.toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 步骤 -->
    <div v-if="steps.length">
      <div class="section-header"><span class="section-title">做法步骤</span></div>
      <div class="card" style="padding:0;overflow:hidden">
        <div v-for="(st, i) in steps" :key="st.id" class="step">
          <div class="step-head">
            <span class="step-num">{{ i + 1 }}</span>
            <span class="text-gray text-sm" v-if="st.duration">⏱ {{ st.duration }}分钟</span>
          </div>
          <img v-if="st.image" :src="st.image" class="step-img mt-8" />
          <p class="step-desc">{{ st.description }}</p>
        </div>
      </div>
    </div>

    <!-- 评价 -->
    <div>
      <div class="section-header">
        <span class="section-title">评价 ({{ ratings.length }})</span>
        <button v-if="canRate" class="btn btn-outline btn-sm" @click="showRateModal = true">我要评价</button>
      </div>
      <div class="card" v-if="ratings.length === 0">
        <p class="text-gray text-sm text-center" style="padding:8px">暂无评价</p>
      </div>
      <div class="card" v-else style="padding:0;overflow:hidden">
        <div v-for="r in ratings" :key="r.id" class="rate-item">
          <div class="flex-between">
            <div class="flex gap-8" style="align-items:center">
              <div class="avatar sm">{{ r.nickname[0] }}</div>
              <span class="text-sm font-medium">{{ r.nickname }}</span>
            </div>
            <span class="stars">★ {{ r.score }}</span>
          </div>
          <p v-if="r.comment" class="rate-comment">{{ r.comment }}</p>
          <div v-if="isChef" class="mt-8">
            <button class="btn btn-gray btn-sm" @click="toggleVisible(r)">
              {{ r.visible ? '隐藏评价' : '展示评价' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作 -->
    <div class="bottom-bar">
      <button class="btn btn-outline" style="flex:1" @click="$router.push(`/order/create?recipe_id=${recipe.id}`)">点餐</button>
      <button v-if="canEdit" class="btn btn-primary" style="flex:1" @click="$router.push(`/recipe/${recipe.id}/edit`)">编辑</button>
      <button v-if="canEdit" class="btn btn-gray" @click="onDelete">删除</button>
    </div>

    <!-- 评价弹窗 -->
    <div class="modal-mask" v-if="showRateModal" @click.self="showRateModal = false">
      <div class="modal">
        <div class="flex-between mb-12">
          <span class="text-gray" @click="showRateModal = false">取消</span>
          <span class="font-bold" style="font-size:16px">评价菜品</span>
          <span class="text-primary" style="color:var(--primary);font-weight:600" @click="submitRating">发送</span>
        </div>
        <div class="flex gap-8 mb-12" style="justify-content:center;font-size:32px;padding:8px 0">
          <span v-for="n in 5" :key="n" @click="rateForm.score = n" :style="{color: n <= rateForm.score ? '#FFCC00' : '#E5E5EA'}">★</span>
        </div>
        <textarea class="input" v-model="rateForm.comment" placeholder="说说你的感受..." rows="3" style="resize:none"></textarea>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import * as api from '../../utils/api'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const recipe = ref(null)
const images = ref([])
const ingredients = ref([])
const steps = ref([])
const ratings = ref([])
const isChef = ref(false)
const curImg = ref(0)
const showRateModal = ref(false)
const rateForm = reactive({ score: 5, comment: '' })

const canEdit = computed(() => recipe.value?.author_id === userStore.user?.id)
const canRate = computed(() => recipe.value && recipe.value.author_id !== userStore.user?.id)
const authorIsChef = computed(() => {
  if (!recipe.value) return false
  return api.getUserRole(recipe.value.family_id, recipe.value.author_id) === 'chef'
})

function ingCost(type) {
  return ingredients.value.filter(i => i.type === type).reduce((s, i) => s + (i.cost || 0), 0)
}

function load() {
  try {
    const r = api.getRecipe(parseInt(route.params.id))
    recipe.value = r
    images.value = r.images || []
    ingredients.value = r.ingredients || []
    steps.value = r.steps || []
    const rt = api.getRatings(parseInt(route.params.id), userStore.user.id)
    ratings.value = rt.ratings
    isChef.value = rt.is_chef
  } catch (e) { console.error(e) }
}

function submitRating() {
  try {
    api.createRating(userStore.user.id, parseInt(route.params.id), rateForm.score, rateForm.comment)
    showRateModal.value = false
    rateForm.comment = ''
    load()
  } catch (e) { alert(e.message) }
}

function toggleVisible(r) {
  try {
    api.toggleRatingVisible(r.id, userStore.user.id)
    load()
  } catch (e) { alert(e.message) }
}

function onDelete() {
  if (!confirm('确定删除这个菜谱吗？')) return
  try {
    api.deleteRecipe(parseInt(route.params.id), userStore.user.id)
    router.push('/')
  } catch (e) { alert(e.message) }
}

onMounted(load)
</script>

<style scoped>
.gallery { position: relative; width: 100%; height: 300px; background: #000; }
.gallery-img { width: 100%; height: 300px; object-fit: cover; }
.gallery-dots { position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%); display: flex; gap: 6px; }
.dot { width: 8px; height: 8px; border-radius: 4px; background: rgba(255,255,255,.5); transition: all .2s; }
.dot.active { background: #fff; width: 24px; }
.gallery-placeholder { height: 220px; display: flex; align-items: center; justify-content: center; font-size: 80px; font-weight: 700; color: var(--primary); background: linear-gradient(135deg, #E3F0FF, #B8D7FF); }

.title-card { background: #fff; padding: 20px 16px; margin-bottom: 8px; }
.recipe-title { font-size: 26px; font-weight: 700; letter-spacing: -.5px; line-height: 1.2; }

.stats-row { display: flex; align-items: center; gap: 0; }
.stat-item { flex: 1; display: flex; align-items: baseline; gap: 4px; justify-content: center; }
.stat-icon { font-size: 16px; }
.stat-value { font-size: 22px; font-weight: 700; }
.stat-label { font-size: 13px; color: var(--text3); }
.stat-divider { width: 1px; height: 32px; background: var(--separator); }

.author-row { border-top: .5px solid var(--separator); padding-top: 12px; }
.avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #007AFF, #5856D6); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 17px; font-weight: 600; }
.avatar.sm { width: 32px; height: 32px; font-size: 14px; }
.avatar-wrap { position: relative; }
.chef-hat { position: absolute; top: -8px; right: -8px; font-size: 16px; }
.desc { color: var(--text2); font-size: 15px; line-height: 1.6; }

.section-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 4px 8px; }
.section-title { font-size: 20px; font-weight: 700; letter-spacing: -.3px; }
.video { width: 100%; border-radius: 12px; }
.group-img { width: 100%; max-height: 200px; object-fit: cover; }
.ing-list { padding: 4px 0; }
.ing-row { display: flex; align-items: center; padding: 12px 16px; border-bottom: .5px solid var(--separator); font-size: 15px; }
.ing-row:last-child { border-bottom: none; }
.ing-name { flex: 1; font-weight: 500; }
.ing-amount { color: var(--text3); margin-right: 16px; }
.ing-cost { font-weight: 600; color: var(--text); min-width: 60px; text-align: right; }

.step { padding: 16px; border-bottom: .5px solid var(--separator); }
.step:last-child { border-bottom: none; }
.step-head { display: flex; align-items: center; gap: 10px; }
.step-num { width: 28px; height: 28px; border-radius: 50%; background: var(--primary); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600; }
.step-img { width: 100%; max-height: 200px; object-fit: cover; border-radius: 12px; }
.step-desc { margin-top: 10px; font-size: 15px; line-height: 1.6; color: var(--text2); }

.rate-item { padding: 14px 16px; border-bottom: .5px solid var(--separator); }
.rate-item:last-child { border-bottom: none; }
.rate-comment { margin-top: 8px; font-size: 15px; color: var(--text2); line-height: 1.5; }
</style>
