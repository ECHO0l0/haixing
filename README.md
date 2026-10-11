# 海行 · 船员学习空间

[打开海行](https://www.szq823.xyz) · [同步配置](cloud/接入说明.md) · [维护说明](cloud/维护与迁移.md)

海行是船员理论学习应用，支持网页、手机浏览器和 Windows 桌面版。

- 章节练习、自定义小测、模拟考试与练习续接。
- 错题复习、收藏笔记、章节进度与学习统计。
- 个性化主页、多端同步和离线学习。
- 手机布局、深色外观及学习备份。

## 开发

需要 Node.js 22 或更新版本。

```sh
npm ci
npm run build
npm run dev
```

本地访问 `http://127.0.0.1:4173`。

## 检查与部署

```sh
npx playwright install chromium
npm run check
```

构建产物位于 `dist/`。GitHub Actions 自动检查提交，Dependabot 定期提出依赖更新。Vercel 发布 `main` 分支。
