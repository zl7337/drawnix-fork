#!/bin/bash
# 🚀 Vercel 强制重新部署脚本

echo "🚀 正在触发 Vercel 强制重新部署..."

# 1. 提交当前更改
git add .
git commit -m "🔄 触发 Vercel 缓存清理部署 - $(date)"

# 2. 推送到 master 分支触发 Vercel 部署
git push origin develop
git checkout master
git merge develop
git push origin master

# 3. 切换回 develop 分支
git checkout develop

echo "✅ Vercel 强制重新部署已触发！"
echo "🌐 部署状态查看: https://vercel.com/dashboard"
echo "📱 预计 2-3 分钟后生效: https://drawnix-zl7337.top"

# 4. 等待并检查部署状态
echo "⏳ 等待 30 秒后检查部署状态..."
sleep 30

echo "🔍 检查新部署状态..."
curl -s "https://drawnix-zl7337.top/sw.js" | head -5
