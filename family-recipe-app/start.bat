@echo off
chcp 65001 >nul
echo ========================================
echo   家庭菜谱 App 一键启动
echo ========================================
echo.

cd /d "%~dp0"

echo [1/4] 检查 Node.js...
where node >nul 2>nul
if errorlevel 1 (
    echo × 未检测到 Node.js，请先安装：https://nodejs.org
    pause
    exit /b 1
)
echo √ Node.js 已安装

echo.
echo [2/4] 安装后端依赖...
cd server
if not exist node_modules (
    call npm install --silent
)
echo √ 后端依赖就绪

echo.
echo [3/4] 检查前端构建...
if not exist web-dist\index.html (
    echo 正在编译前端...
    cd ..\web
    if not exist node_modules call npm install --silent
    call npm run build
    xcopy /E /I /Y dist ..\server\web-dist >nul
    cd ..\server
)
echo √ 前端就绪

echo.
echo [4/4] 启动服务...
echo.
echo ========================================
echo   服务地址: http://localhost:3000
echo   不要关闭此窗口！最小化即可。
echo ========================================
echo.
node src/app.js
pause
