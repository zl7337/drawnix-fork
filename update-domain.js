#!/usr/bin/env node

/**
 * 域名更新脚本
 * 用法: node update-domain.js your-new-domain.com
 */

const fs = require('fs');
const path = require('path');

const newDomain = process.argv[2];

if (!newDomain) {
  console.error('请提供新域名，例如: node update-domain.js drawnix-app.com');
  process.exit(1);
}

const newUrl = `https://${newDomain}`;

console.log(`正在更新域名为: ${newDomain}`);

// 需要更新的文件列表
const filesToUpdate = [
  'apps/web/index.html',
  'apps/web/public/manifest.json'
];

// 更新index.html
const indexHtmlPath = path.join(__dirname, 'apps/web/index.html');
let indexContent = fs.readFileSync(indexHtmlPath, 'utf8');

// 替换所有相关URL
indexContent = indexContent
  .replace(/https:\/\/drawnix-fork\.vercel\.app/g, newUrl)
  .replace(/content="https:\/\/[^"]*"/g, `content="${newUrl}"`)
  .replace(/href="https:\/\/[^"]*"/g, `href="${newUrl}"`);

fs.writeFileSync(indexHtmlPath, indexContent);
console.log('✅ 更新 index.html');

// 更新manifest.json
const manifestPath = path.join(__dirname, 'apps/web/public/manifest.json');
let manifestContent = fs.readFileSync(manifestPath, 'utf8');
const manifest = JSON.parse(manifestContent);

// 更新start_url和scope
manifest.start_url = "/";
manifest.scope = "/";

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log('✅ 更新 manifest.json');

console.log(`\n🎉 域名更新完成！`);
console.log(`新域名: ${newUrl}`);
console.log(`\n下一步:`);
console.log(`1. 在域名注册商处配置DNS解析`);
console.log(`2. 在Vercel中绑定域名: ${newDomain}`);
console.log(`3. 等待DNS生效(通常5-30分钟)`);
console.log(`4. 运行: git add . && git commit -m "更新域名为${newDomain}" && git push`);
