// 纯前端版家庭菜谱 App - 使用浏览器 localStorage 存储
// 数据存在本地浏览器中，不需要后端服务器

const STORAGE_KEY = 'family_recipe_data'

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch { return {} }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function genId() {
  return Date.now() + Math.floor(Math.random() * 1000)
}

function genCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

// 用户注册
export function register(username, password, nickname) {
  const data = load()
  if (!data.users) data.users = {}
  if (data.users[username]) throw new Error('用户名已存在')
  const id = genId()
  data.users[username] = { id, username, password, nickname, avatar: null, created_at: new Date().toISOString() }
  save(data)
  return { id, username, nickname }
}

// 用户登录
export function login(username, password) {
  const data = load()
  if (!data.users || !data.users[username]) throw new Error('用户不存在')
  if (data.users[username].password !== password) throw new Error('密码错误')
  return { id: data.users[username].id, username, nickname: data.users[username].nickname }
}

// 获取用户信息
export function getUser(userId) {
  const data = load()
  const user = Object.values(data.users || {}).find(u => u.id === userId)
  return user
}

// 创建家庭
export function createFamily(userId, name) {
  const data = load()
  if (!data.families) data.families = {}
  if (!data.familyMembers) data.familyMembers = []
  const id = genId()
  const code = genCode()
  data.families[id] = { id, name, invite_code: code, creator_id: userId, head_chef_id: userId, created_at: new Date().toISOString() }
  data.familyMembers.push({ family_id: id, user_id: userId, role: 'chef', joined_at: new Date().toISOString() })
  save(data)
  return data.families[id]
}

// 加入家庭
export function joinFamily(userId, inviteCode) {
  const data = load()
  const family = Object.values(data.families || {}).find(f => f.invite_code === inviteCode.toUpperCase())
  if (!family) throw new Error('邀请码无效')
  const existing = (data.familyMembers || []).find(m => m.family_id === family.id && m.user_id === userId)
  if (existing) throw new Error('你已经是该家庭成员')
  data.familyMembers.push({ family_id: family.id, user_id: userId, role: 'member', joined_at: new Date().toISOString() })
  save(data)
  return family
}

// 我的家庭列表
export function getMyFamilies(userId) {
  const data = load()
  const memberRecords = (data.familyMembers || []).filter(m => m.user_id === userId)
  return memberRecords.map(m => ({ ...data.families[m.family_id], role: m.role }))
}

// 家庭成员
export function getFamilyMembers(familyId) {
  const data = load()
  const members = (data.familyMembers || []).filter(m => m.family_id === familyId)
  return members.map(m => {
    const user = data.users[Object.keys(data.users).find(k => data.users[k].id === m.user_id)]
    return { id: user.id, username: user.username, nickname: user.nickname, avatar: user.avatar, role: m.role, joined_at: m.joined_at }
  })
}

// 设置主厨
export function setChef(familyId, userId, creatorId) {
  const data = load()
  const family = data.families[familyId]
  if (family.creator_id !== creatorId) throw new Error('只有创建者可以设置主厨')
  data.familyMembers.forEach(m => {
    if (m.family_id === familyId) m.role = m.user_id === userId ? 'chef' : 'member'
  })
  family.head_chef_id = userId
  save(data)
  return family
}

// 创建菜谱
export function createRecipe(userId, familyId, recipe) {
  const data = load()
  if (!data.recipes) data.recipes = []
  const id = genId()
  const totalCost = (recipe.ingredients || []).reduce((s, i) => s + (parseFloat(i.cost) || 0), 0)
  const totalTime = (recipe.steps || []).reduce((s, st) => s + (parseInt(st.duration) || 0), 0)
  const newRecipe = {
    id, family_id: familyId, author_id: userId,
    title: recipe.title, category: recipe.category, description: recipe.description || '',
    images: recipe.images || [], video: recipe.video || null,
    ingredients: recipe.ingredients || [], steps: recipe.steps || [],
    total_cost: totalCost, total_time: totalTime,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  }
  data.recipes.push(newRecipe)
  save(data)
  return newRecipe
}

// 菜谱列表
export function getRecipes(familyId, keyword, category) {
  const data = load()
  let recipes = (data.recipes || []).filter(r => r.family_id === familyId)
  if (keyword) {
    recipes = recipes.filter(r =>
      r.title.includes(keyword) ||
      (r.ingredients || []).some(i => i.name.includes(keyword))
    )
  }
  if (category && category !== '全部') {
    recipes = recipes.filter(r => r.category === category)
  }
  return recipes.map(r => {
    const user = getUser(r.author_id)
    const ratings = (data.ratings || []).filter(rt => rt.recipe_id === r.id && rt.visible)
    const avgScore = ratings.length ? ratings.reduce((s, r) => s + r.score, 0) / ratings.length : null
    return {
      ...r,
      author_name: user?.nickname || '未知',
      cover: r.images?.[0] || null,
      avg_score: avgScore,
      rating_count: ratings.length
    }
  })
}

// 菜谱详情
export function getRecipe(id) {
  const data = load()
  const recipe = (data.recipes || []).find(r => r.id === id)
  if (!recipe) throw new Error('菜谱不存在')
  const user = getUser(recipe.author_id)
  const ratings = (data.ratings || []).filter(rt => rt.recipe_id === id && rt.visible)
  const avgScore = ratings.length ? ratings.reduce((s, r) => s + r.score, 0) / ratings.length : null
  return {
    ...recipe,
    author_name: user?.nickname || '未知',
    author_avatar: user?.avatar || null,
    avg_score: avgScore,
    rating_count: ratings.length
  }
}

// 更新菜谱
export function updateRecipe(id, userId, updates) {
  const data = load()
  const recipe = (data.recipes || []).find(r => r.id === id)
  if (!recipe) throw new Error('菜谱不存在')
  if (recipe.author_id !== userId) throw new Error('只有作者可以编辑')
  const totalCost = (updates.ingredients || []).reduce((s, i) => s + (parseFloat(i.cost) || 0), 0)
  const totalTime = (updates.steps || []).reduce((s, st) => s + (parseInt(st.duration) || 0), 0)
  Object.assign(recipe, updates, { total_cost: totalCost, total_time: totalTime, updated_at: new Date().toISOString() })
  save(data)
  return recipe
}

// 删除菜谱
export function deleteRecipe(id, userId) {
  const data = load()
  const recipe = (data.recipes || []).find(r => r.id === id)
  if (!recipe) throw new Error('菜谱不存在')
  if (recipe.author_id !== userId) throw new Error('只有作者可以删除')
  data.recipes = data.recipes.filter(r => r.id !== id)
  data.ratings = (data.ratings || []).filter(r => r.recipe_id !== id)
  save(data)
}

// 提交评价
export function createRating(userId, recipeId, score, comment) {
  const data = load()
  if (!data.ratings) data.ratings = []
  const existing = data.ratings.find(r => r.recipe_id === recipeId && r.user_id === userId)
  if (existing) throw new Error('你已经评价过了')
  const id = genId()
  data.ratings.push({ id, recipe_id: recipeId, user_id: userId, score, comment, visible: true, created_at: new Date().toISOString() })
  save(data)
  return { id, success: true }
}

// 评价列表
export function getRatings(recipeId, userId) {
  const data = load()
  const ratings = (data.ratings || []).filter(r => r.recipe_id === recipeId)
  const recipe = (data.recipes || []).find(r => r.id === recipeId)
  const isChef = recipe && recipe.family_id
    ? (data.familyMembers || []).find(m => m.family_id === recipe.family_id && m.user_id === userId)?.role === 'chef'
    : false
  return {
    ratings: ratings.map(r => {
      const user = getUser(r.user_id)
      return { id: r.id, score: r.score, comment: r.comment, visible: r.visible, nickname: user?.nickname || '未知', created_at: r.created_at }
    }),
    is_chef: isChef
  }
}

// 切换评价可见性
export function toggleRatingVisible(ratingId, userId) {
  const data = load()
  const rating = (data.ratings || []).find(r => r.id === ratingId)
  if (!rating) throw new Error('评价不存在')
  const recipe = (data.recipes || []).find(r => r.id === rating.recipe_id)
  const member = (data.familyMembers || []).find(m => m.family_id === recipe.family_id && m.user_id === userId)
  if (member?.role !== 'chef') throw new Error('只有主厨可以操作')
  rating.visible = !rating.visible
  save(data)
  return { success: true }
}

// 发起点餐
export function createOrder(userId, familyId, recipeId, mealDate, note) {
  const data = load()
  if (!data.orders) data.orders = []
  const id = genId()
  data.orders.push({ id, family_id: familyId, user_id: userId, recipe_id: recipeId, meal_date: mealDate, note, status: 'pending', created_at: new Date().toISOString() })
  save(data)
  return { id, success: true }
}

// 点餐列表
export function getOrders(familyId, userId) {
  const data = load()
  let orders = (data.orders || []).filter(o => o.family_id === familyId)
  const members = (data.familyMembers || []).filter(m => m.family_id === familyId)
  const isChef = members.find(m => m.user_id === userId)?.role === 'chef'
  return {
    orders: orders.map(o => {
      const recipe = (data.recipes || []).find(r => r.id === o.recipe_id)
      const user = getUser(o.user_id)
      return {
        ...o,
        recipe_title: recipe?.title || '未知',
        category: recipe?.category || '',
        cover: recipe?.images?.[0] || null,
        orderer_name: user?.nickname || '未知',
        user_id: o.user_id
      }
    }),
    is_chef: isChef
  }
}

// 更新点餐状态
export function updateOrderStatus(orderId, status) {
  const data = load()
  const order = (data.orders || []).find(o => o.id === orderId)
  if (!order) throw new Error('点餐不存在')
  order.status = status
  save(data)
  return { success: true }
}

// 厨师排名
export function getChefRanking(familyId) {
  const data = load()
  const recipes = (data.recipes || []).filter(r => r.family_id === familyId)
  const chefMap = {}
  recipes.forEach(r => {
    if (!chefMap[r.author_id]) chefMap[r.author_id] = { id: r.author_id, recipe_count: 0, avg_score: 0, rating_count: 0, total_score: 0 }
    chefMap[r.author_id].recipe_count++
    const ratings = (data.ratings || []).filter(rt => rt.recipe_id === r.id && rt.visible)
    ratings.forEach(rt => {
      chefMap[r.author_id].total_score += rt.score
      chefMap[r.author_id].rating_count++
    })
  })
  const chefs = Object.values(chefMap).map(c => {
    const user = getUser(c.id)
    return {
      id: c.id, nickname: user?.nickname || '未知', avatar: user?.avatar,
      recipe_count: c.recipe_count,
      avg_score: c.rating_count ? c.total_score / c.rating_count : null,
      rating_count: c.rating_count
    }
  })
  chefs.sort((a, b) => (b.avg_score || 0) - (a.avg_score || 0))
  return { chefs }
}

// 菜品排名
export function getRecipeRanking(familyId) {
  const data = load()
  let recipes = (data.recipes || []).filter(r => r.family_id === familyId)
  recipes = recipes.map(r => {
    const ratings = (data.ratings || []).filter(rt => rt.recipe_id === r.id && rt.visible)
    const avgScore = ratings.length ? ratings.reduce((s, r) => s + r.score, 0) / ratings.length : null
    const user = getUser(r.author_id)
    return { id: r.id, title: r.title, category: r.category, total_cost: r.total_cost, total_time: r.total_time, author_name: user?.nickname || '未知', avg_score: avgScore, rating_count: ratings.length, cover: r.images?.[0] || null }
  })
  recipes.sort((a, b) => (b.avg_score || 0) - (a.avg_score || 0))
  return { recipes: recipes }
}

// 导入演示数据
export function initDemoData() {
  const data = load()
  if (data.users && Object.keys(data.users).length > 0) return false
  data.users = {}
  data.families = {}
  data.familyMembers = []
  data.recipes = []
  data.ratings = []
  data.orders = []

  const userId = genId()
  data.users['demo'] = { id: userId, username: 'demo', password: '123456', nickname: '演示主厨', avatar: null, created_at: new Date().toISOString() }
  const famId = genId()
  data.families[famId] = { id: famId, name: '温馨小家', invite_code: 'DEMO01', creator_id: userId, head_chef_id: userId, created_at: new Date().toISOString() }
  data.familyMembers.push({ family_id: famId, user_id: userId, role: 'chef', joined_at: new Date().toISOString() })
  const rId = genId()
  data.recipes.push({
    id: rId, family_id: famId, author_id: userId,
    title: '红烧肉', category: '晚餐', description: '肥而不腻，入口即化',
    images: [], video: null,
    ingredients: [
      { type: 'ingredient', name: '五花肉', amount: '500', unit: '克', price: 30, cost: 30 },
      { type: 'ingredient', name: '冰糖', amount: '30', unit: '克', price: 0.5, cost: 0.5 },
      { type: 'seasoning', name: '生抽', amount: '2', unit: '勺', price: 1, cost: 1 }
    ],
    steps: [
      { description: '五花肉切块焯水', duration: 10 },
      { description: '炒糖色，下肉翻炒', duration: 8 },
      { description: '加水小火慢炖40分钟', duration: 40 }
    ],
    total_cost: 31.5, total_time: 58,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  })
  data.ratings.push({ id: genId(), recipe_id: rId, user_id: userId, score: 5, comment: '非常好吃！', visible: true, created_at: new Date().toISOString() })
  data.orders.push({ id: genId(), family_id: famId, user_id: userId, recipe_id: rId, meal_date: '2026-07-20', note: '晚餐吃', status: 'pending', created_at: new Date().toISOString() })
  save(data)
  return true
}
