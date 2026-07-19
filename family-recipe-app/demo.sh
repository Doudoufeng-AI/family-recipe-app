#!/bin/bash
# 一键演示：注册、创建家庭、上传菜谱、评分、点餐
set -e

BASE="http://localhost:3000"

echo "== 注册 =="
AUTH=$(curl -s -X POST "$BASE/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"123456","nickname":"演示主厨"}')
echo "$AUTH"
TOKEN=$(echo "$AUTH" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

echo "== 创建家庭 =="
FAM=$(curl -s -X POST "$BASE/api/families" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"温馨小家"}')
echo "$FAM"
FAM_ID=$(echo "$FAM" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')

echo "家庭邀请码: $(echo "$FAM" | grep -o '"invite_code":"[^"]*"' | cut -d'"' -f4)"

echo "== 上传菜谱 =="
RECIPE=$(curl -s -X POST "$BASE/api/recipes" \
  -H "Authorization: Bearer $TOKEN" \
  -F "family_id=$FAM_ID" \
  -F "title=红烧肉" \
  -F "category=晚餐" \
  -F "description=肥而不腻，入口即化" \
  -F 'ingredients=[{"type":"ingredient","name":"五花肉","amount":"500","unit":"克","price":30,"cost":30},{"type":"ingredient","name":"冰糖","amount":"30","unit":"克","price":0.5,"cost":0.5},{"type":"seasoning","name":"生抽","amount":"2","unit":"勺","price":1,"cost":1}]' \
  -F 'steps=[{"description":"五花肉切块焯水","duration":10},{"description":"炒糖色，下肉翻炒","duration":8},{"description":"加水小火慢炖40分钟","duration":40}]')
echo "$RECIPE"
RECIPE_ID=$(echo "$RECIPE" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')

echo "== 查看菜谱详情 =="
curl -s "$BASE/api/recipes/$RECIPE_ID" -H "Authorization: Bearer $TOKEN" | head -c 500
echo ""

echo "== 评分 =="
curl -s -X POST "$BASE/api/ratings" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"recipe_id\":$RECIPE_ID,\"score\":5,\"comment\":\"非常好吃！\"}"
echo ""

echo "== 发起点餐 =="
curl -s -X POST "$BASE/api/orders" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"family_id\":$FAM_ID,\"recipe_id\":$RECIPE_ID,\"meal_date\":\"2026-07-20\",\"note\":\"晚餐吃\"}"
echo ""

echo "== 菜品排名 =="
curl -s "$BASE/api/rankings/recipes?family_id=$FAM_ID" -H "Authorization: Bearer $TOKEN"
echo ""

echo "== 演示完成，请打开 http://localhost:3000 体验 =="
