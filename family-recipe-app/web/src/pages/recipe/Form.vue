<template>
  <div class="page">
    <div class="header">
      <div class="header-top">
        <span class="nav-back" @click="$router.back()">取消</span>
        <span class="header-title">{{ isEdit ? '编辑菜谱' : '新建菜谱' }}</span>
        <span class="nav-save" @click="submit" :class="{disabled: loading}">{{ loading ? '...' : '保存' }}</span>
      </div>
    </div>

    <div v-if="loadingData" class="text-center text-gray mt-20">
      <div class="loading-spinner"></div>
    </div>
    <div v-else>
      <!-- 基本信息 -->
      <div class="list-group">
        <div class="list-row" style="flex-direction:column;align-items:stretch;gap:8px">
          <span class="text-gray text-sm">菜名</span>
          <input class="ios-input-inline" v-model="form.title" placeholder="如：番茄炒蛋" />
        </div>
        <div class="list-row" style="flex-direction:column;align-items:stretch;gap:8px">
          <span class="text-gray text-sm">分类</span>
          <div class="cat-picker">
            <span v-for="c in cats" :key="c" class="cat-pill" :class="{active: form.category === c}" @click="form.category = c">{{ c }}</span>
          </div>
        </div>
        <div class="list-row" style="flex-direction:column;align-items:stretch;gap:8px">
          <span class="text-gray text-sm">做法介绍</span>
          <textarea class="ios-input-inline" v-model="form.description" rows="2" placeholder="简单介绍这道菜..." style="resize:none"></textarea>
        </div>
      </div>

      <!-- 成品照片 -->
      <div class="section-header"><span class="section-title">成品照片</span></div>
      <div class="card">
        <div class="flex gap-8" style="flex-wrap:wrap">
          <div v-for="(img, i) in form.images" :key="i" class="img-cell" @click="removeImage(i)">
            <img :src="img.preview" />
            <span class="remove-badge">×</span>
          </div>
          <label class="upload-box" v-if="form.images.length < 9">
            <input type="file" accept="image/*" multiple @change="onImages($event)" hidden />
            <svg viewBox="0 0 28 28" fill="none" class="upload-icon"><path d="M14 5V23M5 14H23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </label>
        </div>
      </div>

      <!-- 视频 -->
      <div class="section-header"><span class="section-title">做法视频</span><span class="text-gray text-sm">选填</span></div>
      <div class="card">
        <div class="flex gap-8">
          <div v-if="form.video" class="video-cell" @click="form.video = null">
            <video :src="form.video.preview"></video>
            <span class="remove-badge">×</span>
          </div>
          <label class="upload-box" v-if="!form.video">
            <input type="file" accept="video/*" @change="onVideo($event)" hidden />
            <svg viewBox="0 0 28 28" fill="none" class="upload-icon"><path d="M14 5V23M5 14H23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </label>
        </div>
      </div>

      <!-- 食材 -->
      <div class="section-header">
        <span class="section-title">食材</span>
        <button class="btn btn-outline btn-sm" @click="addIng('ingredient')">添加</button>
      </div>
      <div class="card" style="padding:12px 16px">
        <div class="label">食材合照 <span class="text-gray text-sm">选填</span></div>
        <div class="flex gap-8 mt-8 mb-12">
          <div v-if="form.ingredientImage" class="img-cell" @click="form.ingredientImage = null">
            <img :src="form.ingredientImage.preview" />
            <span class="remove-badge">×</span>
          </div>
          <label class="upload-box" v-if="!form.ingredientImage">
            <input type="file" accept="image/*" @change="onGroupImg($event, 'ingredient')" hidden />
            <svg viewBox="0 0 28 28" fill="none" class="upload-icon"><path d="M14 5V23M5 14H23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </label>
        </div>
        <div v-for="(ing, i) in ingList('ingredient')" :key="i" class="ing-form">
          <div class="flex gap-8">
            <input class="ios-input-inline" v-model="ing.name" placeholder="名称" style="flex:2" />
            <input class="ios-input-inline" v-model="ing.amount" placeholder="用量" style="flex:1" />
            <input class="ios-input-inline" v-model="ing.unit" placeholder="单位" style="flex:1" />
          </div>
          <div class="flex gap-8 mt-8">
            <input class="ios-input-inline" v-model.number="ing.price" type="number" placeholder="单价" style="flex:1" />
            <input class="ios-input-inline" v-model.number="ing.cost" type="number" placeholder="成本" style="flex:1" />
            <button class="btn btn-gray btn-sm" @click="removeIng('ingredient', i)">删除</button>
          </div>
        </div>
      </div>

      <!-- 调料 -->
      <div class="section-header">
        <span class="section-title">调料</span>
        <button class="btn btn-outline btn-sm" @click="addIng('seasoning')">添加</button>
      </div>
      <div class="card" style="padding:12px 16px">
        <div class="label">调料合照 <span class="text-gray text-sm">选填</span></div>
        <div class="flex gap-8 mt-8 mb-12">
          <div v-if="form.seasoningImage" class="img-cell" @click="form.seasoningImage = null">
            <img :src="form.seasoningImage.preview" />
            <span class="remove-badge">×</span>
          </div>
          <label class="upload-box" v-if="!form.seasoningImage">
            <input type="file" accept="image/*" @change="onGroupImg($event, 'seasoning')" hidden />
            <svg viewBox="0 0 28 28" fill="none" class="upload-icon"><path d="M14 5V23M5 14H23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </label>
        </div>
        <div v-for="(ing, i) in ingList('seasoning')" :key="i" class="ing-form">
          <div class="flex gap-8">
            <input class="ios-input-inline" v-model="ing.name" placeholder="名称" style="flex:2" />
            <input class="ios-input-inline" v-model="ing.amount" placeholder="用量" style="flex:1" />
            <input class="ios-input-inline" v-model="ing.unit" placeholder="单位" style="flex:1" />
          </div>
          <div class="flex gap-8 mt-8">
            <input class="ios-input-inline" v-model.number="ing.price" type="number" placeholder="单价" style="flex:1" />
            <input class="ios-input-inline" v-model.number="ing.cost" type="number" placeholder="成本" style="flex:1" />
            <button class="btn btn-gray btn-sm" @click="removeIng('seasoning', i)">删除</button>
          </div>
        </div>
      </div>

      <!-- 步骤 -->
      <div class="section-header">
        <span class="section-title">做法步骤</span>
        <button class="btn btn-outline btn-sm" @click="addStep">添加</button>
      </div>
      <div v-for="(st, i) in form.steps" :key="i" class="card step-card">
        <div class="flex-between mb-8">
          <span class="step-num">{{ i + 1 }}</span>
          <button class="btn btn-gray btn-sm" @click="form.steps.splice(i, 1)">删除</button>
        </div>
        <textarea class="ios-input-inline" v-model="st.description" rows="2" placeholder="描述这一步..." style="resize:none"></textarea>
        <div class="flex gap-8 mt-8" style="align-items:center">
          <label class="upload-box sm" v-if="!st.image">
            <input type="file" accept="image/*" @change="onStepImg($event, i)" hidden />
            <svg viewBox="0 0 28 28" fill="none" style="width:20px;height:20px"><path d="M14 5V23M5 14H23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </label>
          <div v-else class="img-cell sm" @click="st.image = null">
            <img :src="st.image.preview" />
            <span class="remove-badge">×</span>
          </div>
          <div class="flex gap-4" style="align-items:center">
            <input class="ios-input-inline" v-model.number="st.duration" type="number" placeholder="耗时" style="width:80px" />
            <span class="text-gray text-sm">分钟</span>
          </div>
        </div>
      </div>

      <!-- 汇总 -->
      <div class="section-header"><span class="section-title">汇总</span></div>
      <div class="list-group">
        <div class="list-row">
          <span>综合成本</span>
          <span class="font-bold" style="color:var(--primary);font-size:20px">¥{{ totalCost.toFixed(2) }}</span>
        </div>
        <div class="list-row">
          <span>总耗时</span>
          <span class="font-bold" style="font-size:17px">{{ totalTime }} 分钟</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import { request, fileUrl } from '../../utils/request'

const props = defineProps({ recipeId: { type: [String, Number], default: null } })
const emit = defineEmits(['saved'])
const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const loadingData = ref(false)
const isEdit = computed(() => !!props.recipeId)
const cats = ['早餐', '午餐', '晚餐', '汤品', '凉菜', '主食', '小吃', '甜品']

const form = reactive({
  title: '', category: '午餐', description: '',
  images: [], video: null, ingredientImage: null, seasoningImage: null,
  ingredients: [], steps: []
})

const totalCost = computed(() => form.ingredients.reduce((s, i) => s + (parseFloat(i.cost) || 0), 0))
const totalTime = computed(() => form.steps.reduce((s, st) => s + (parseInt(st.duration) || 0), 0))

function ingList(type) { return form.ingredients.filter(x => x.type === type) }
function filePreview(file) { return URL.createObjectURL(file) }
function onImages(e) { Array.from(e.target.files).forEach(f => form.images.push({ file: f, preview: filePreview(f) })) }
function onVideo(e) { if (e.target.files[0]) form.video = { file: e.target.files[0], preview: filePreview(e.target.files[0]) } }
function onGroupImg(e, type) { if (e.target.files[0]) form[type === 'ingredient' ? 'ingredientImage' : 'seasoningImage'] = { file: e.target.files[0], preview: filePreview(e.target.files[0]) } }
function onStepImg(e, i) { if (e.target.files[0]) form.steps[i].image = { file: e.target.files[0], preview: filePreview(e.target.files[0]) } }
function removeImage(i) { form.images.splice(i, 1) }
function addIng(type) { form.ingredients.push({ type, name: '', amount: '', unit: '', price: 0, cost: 0 }) }
function removeIng(type, idx) {
  const list = form.ingredients.filter(x => x.type === type)
  const realIdx = form.ingredients.indexOf(list[idx])
  form.ingredients.splice(realIdx, 1)
}
function addStep() { form.steps.push({ description: '', duration: 0, image: null }) }

async function loadRecipe() {
  if (!props.recipeId) return
  loadingData.value = true
  try {
    const data = await request(`/api/recipes/${props.recipeId}`)
    const r = data.recipe
    form.title = r.title; form.category = r.category; form.description = r.description
    form.images = data.images.map(img => ({ preview: fileUrl(img.image_path), path: img.image_path }))
    if (r.video_path) form.video = { preview: fileUrl(r.video_path), path: r.video_path }
    const ingImg = data.ingredients.find(i => i.type === 'ingredient' && i.group_image_path)
    if (ingImg) form.ingredientImage = { preview: fileUrl(ingImg.group_image_path), path: ingImg.group_image_path }
    const seaImg = data.ingredients.find(i => i.type === 'seasoning' && i.group_image_path)
    if (seaImg) form.seasoningImage = { preview: fileUrl(seaImg.group_image_path), path: seaImg.group_image_path }
    form.ingredients = data.ingredients.map(i => ({ type: i.type, name: i.name, amount: i.amount, unit: i.unit, price: i.price, cost: i.cost, group_image_path: i.group_image_path }))
    form.steps = data.steps.map(s => ({ description: s.description, duration: s.duration, image: s.image_path ? { preview: fileUrl(s.image_path), path: s.image_path } : null }))
  } catch (e) { alert(e.message) } finally { loadingData.value = false }
}

async function submit() {
  if (!form.title) { alert('请填写菜名'); return }
  if (!userStore.currentFamily) { alert('请先创建或加入一个家庭'); router.push('/family'); return }
  loading.value = true
  try {
    const fd = new FormData()
    fd.append('family_id', userStore.currentFamily.id)
    fd.append('title', form.title); fd.append('category', form.category); fd.append('description', form.description)
    fd.append('ingredients', JSON.stringify(form.ingredients.map(i => ({ ...i, cost: i.cost || 0, price: i.price || 0 }))))
    fd.append('steps', JSON.stringify(form.steps.map(s => ({ description: s.description, duration: s.duration || 0, image_path: s.image?.path || null }))))
    form.images.forEach(img => { if (img.file) fd.append('images', img.file) })
    if (form.video?.file) fd.append('video', form.video.file)
    if (form.ingredientImage?.file) fd.append('ingredient_image', form.ingredientImage.file)
    if (form.seasoningImage?.file) fd.append('seasoning_image', form.seasoningImage.file)
    form.steps.forEach(s => { if (s.image?.file) fd.append('step_images', s.image.file) })
    const url = isEdit.value ? `/api/recipes/${props.recipeId}` : '/api/recipes'
    const method = isEdit.value ? 'PUT' : 'POST'
    const data = await request(url, { method, body: fd })
    emit('saved', data)
    router.push(`/recipe/${isEdit.value ? props.recipeId : data.id}`)
  } catch (e) { alert(e.message) } finally { loading.value = false }
}

onMounted(loadRecipe)
</script>

<style scoped>
.nav-back { color: var(--primary); font-size: 16px; }
.nav-save { color: var(--primary); font-size: 16px; font-weight: 600; }
.nav-save.disabled { opacity: .5; }
.ios-input-inline { width: 100%; padding: 10px 12px; border: none; border-radius: 10px; font-size: 16px; outline: none; background: var(--gray6); -webkit-appearance: none; }
.ios-input-inline:focus { background: #fff; box-shadow: 0 0 0 1.5px var(--primary); }
.cat-picker { display: flex; flex-wrap: wrap; gap: 6px; }
.cat-pill { padding: 6px 16px; border-radius: 18px; font-size: 14px; background: var(--gray6); color: var(--text3); }
.cat-pill.active { background: var(--primary); color: #fff; }
.img-cell { position: relative; width: 80px; height: 80px; border-radius: 12px; overflow: hidden; }
.img-cell img { width: 100%; height: 100%; object-fit: cover; }
.img-cell.sm { width: 60px; height: 60px; border-radius: 10px; }
.remove-badge { position: absolute; top: -4px; right: -4px; width: 22px; height: 22px; border-radius: 50%; background: rgba(0,0,0,.6); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 14px; }
.video-cell { position: relative; width: 80px; height: 80px; border-radius: 12px; overflow: hidden; background: #000; }
.video-cell video { width: 100%; height: 100%; object-fit: cover; }
.upload-box { width: 80px; height: 80px; border: 2px dashed var(--gray4); border-radius: 12px; display: flex; align-items: center; justify-content: center; background: var(--gray6); cursor: pointer; }
.upload-box.sm { width: 60px; height: 60px; border-radius: 10px; }
.upload-icon { width: 24px; height: 24px; color: var(--gray2); }
.ing-form { padding: 10px 0; border-top: .5px solid var(--separator); }
.ing-form:first-of-type { border-top: none; }
.step-card { padding: 14px; }
.step-num { width: 28px; height: 28px; border-radius: 50%; background: var(--primary); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600; }
.section-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 4px 8px; }
.section-title { font-size: 22px; font-weight: 700; letter-spacing: -.3px; }
.loading-spinner { width: 28px; height: 28px; border-radius: 50%; border: 3px solid var(--gray5); border-top-color: var(--primary); animation: spin .6s linear infinite; margin: 0 auto; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
