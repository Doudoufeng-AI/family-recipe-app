#!/bin/bash
# 一键启动家庭菜谱 App（本地生产模式）
set -e

cd "$(dirname "$0")"
cd server

echo "正在安装/检查后端依赖..."
npm install --silent

echo "正在检查前端构建产物..."
if [ ! -d "web-dist" ]; then
  echo "未发现 web-dist，正在编译前端..."
  cd ../web
  npm install --silent
  npm run build
  cp -r dist ../server/web-dist
  cd ../server
fi

echo "正在启动服务..."
npm start
