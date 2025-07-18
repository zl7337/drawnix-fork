#!/bin/bash
# Vercel 构建钩子 - 强制缓存刷新

echo "🚀 开始 Vercel 构建钩子..."

# 1. 设置构建时间戳
export BUILD_TIMESTAMP=$(date +%s)
echo "BUILD_TIMESTAMP=$BUILD_TIMESTAMP" >> $VERCEL_ENV

# 2. 更新 Service Worker 版本号
SW_FILE="apps/web/public/sw.js"
if [ -f "$SW_FILE" ]; then
    # 替换时间戳
    sed -i.bak "s/Date\.now()/$BUILD_TIMESTAMP/g" "$SW_FILE"
    echo "✅ Service Worker 时间戳已更新: $BUILD_TIMESTAMP"
fi

# 3. 更新版本检查器
VERSION_FILE="apps/web/src/utils/version-checker.ts"
if [ -f "$VERSION_FILE" ]; then
    # 添加构建时间戳
    sed -i.bak "s/export const BUILD_TIME.*/export const BUILD_TIME = '$BUILD_TIMESTAMP';/" "$VERSION_FILE"
    echo "✅ 版本检查器时间戳已更新"
fi

# 4. 输出构建信息
echo "🏗️ 构建信息:"
echo "  - 构建时间: $(date)"
echo "  - Git Commit: $VERCEL_GIT_COMMIT_SHA"
echo "  - 时间戳: $BUILD_TIMESTAMP"

echo "✅ Vercel 构建钩子完成"
