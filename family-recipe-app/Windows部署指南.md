# 家庭菜谱 App - Windows 部署指南

> 你的 Windows 电脑当服务器，家人手机像用 App 一样使用，数据共享，外网也能访问，零成本永久使用。

---

## 第一步：安装 Node.js

1. 浏览器打开 https://nodejs.org
2. 点左边绿色 **"LTS"** 下载
3. 双击安装，一路下一步

---

## 第二步：下载项目

打开 cmd（按 `Win+R` → 输入 `cmd` → 回车），输入：
```
cd /d D:
git clone https://github.com/Doudoufeng-AI/family-recipe-app.git
```

> 如果提示 `git` 不是命令，去 https://git-scm.com 装一下 Git。
> 或者不装 Git：浏览器打开 https://github.com/Doudoufeng-AI/family-recipe-app → 绿色 "Code" → "Download ZIP" → 解压到 D 盘

---

## 第三步：启动 App

```
cd /d D:\family-recipe-app\family-recipe-app
start.bat
```

首次需要 3-5 分钟。看到 `服务地址: http://localhost:3000` 就成功了。

> ⚠️ 这个窗口不能关，最小化即可。

---

## 第四步：配置外网访问（cpolar 内网穿透）

家人在外面也要能用，需要把你的电脑暴露到公网。

### 4.1 安装 cpolar

1. 浏览器打开 https://www.cpolar.com → 注册（免费）
2. 下载 Windows 版：https://www.cpolar.com/download
3. 安装

### 4.2 创建隧道

1. 打开 cpolar → 登录
2. **隧道管理** → **创建隧道**
3. 填写：
   - 隧道名称：`recipe`
   - 本地端口：`3000`
   - 协议：`http`
4. 点 **创建** → 然后点 **启动**
5. 会显示一个公网地址，类似 `http://xxxx.r6.cpolar.cn`

**这个地址就是家人用的链接，记下来。**

> 免费版每次重启地址会变，变了在群里更新一下即可。

---

## 第五步：手机添加到桌面当 App 用

### 安卓

1. Chrome 打开公网地址
2. 右上角 **⋮** → **添加到主屏幕**
3. 桌面多一个图标，点开是全屏 App

### iPhone

1. Safari 打开公网地址
2. 底部 **分享 ⬆️** → **添加到主屏幕**
3. 桌面多一个图标

---

## 第六步：正式和家人一起用

1. **你先注册**：打开链接 → 注册 → 创建家庭 → 拿到邀请码
2. **邀请家人**：把公网地址 + 邀请码发到微信群
3. **家人加入**：打开链接 → 注册 → 输入邀请码加入家庭
4. **数据共享**：你上传的菜谱家人立刻能看到，大家点餐、评分都共享

---

## 日常使用

### 电脑重启后怎么启动？

```
cd /d D:\family-recipe-app\family-recipe-app
start.bat
```
然后打开 cpolar → 启动隧道 → 把地址发群里

> 建议在电源设置里**关闭电脑睡眠**，否则睡眠后服务断开。

### 数据备份

- 菜谱数据：`server\data\recipe.db`
- 图片视频：`server\uploads\`
- 定期复制这两个到 U 盘或网盘

---

## 常见问题

| 问题 | 解决 |
|------|------|
| 电脑关机了能用吗？ | 不能，电脑必须开着 |
| cpolar 地址变了？ | 免费版会变，在群里更新链接 |
| 端口 3000 被占？ | 改 app.js 最后一行端口号 |
| 家人数据不共享？ | 确认访问的是同一个公网地址 |
| 以后换 NAS？ | NAS 支持 Docker 就能迁移，到时问我 |

---

## 快速启动命令

```cmd
:: 首次
cd /d D:\family-recipe-app\family-recipe-app
start.bat

:: 以后每次（电脑重启后）
cd /d D:\family-recipe-app\family-recipe-app\server
node src/app.js
:: 然后启动 cpolar，把地址发群里
```
