# 海行 · 船员学习空间

[![Haixing checks](https://github.com/ECHO0l0/haixing/actions/workflows/ci.yml/badge.svg)](https://github.com/ECHO0l0/haixing/actions/workflows/ci.yml)

[打开海行](https://www.szq823.xyz) · [同步接入](cloud/接入说明.md) · [维护与迁移](cloud/维护与迁移.md)

海行是船员理论学习应用，支持网页、手机浏览器和 Windows 桌面版。当前应用版本为 **1.3.0**。

## 学习功能

- 按职务、版本和科目选择题库，搜索题干、选项和题号。
- 章节、顺序、随机、未学和背题练习；退出后继续上次的练习。
- 错题复习、收藏、笔记、原卷考试、自定义练习和限时小测。
- 章节圆环显示刷题进度，自定义练习与小测统一放在科目入口。
- 个人主页支持昵称、简介、内置头像和照片头像。
- 多端同步学习记录与个人资料，断网时本地保存，联网后补传。
- 手机布局、深色外观、大字阅读、学习统计、备份恢复和科目离线缓存。

本机学习记录保存在 IndexedDB。登录同一学习账号后可同步；首次登录可在“我的学习”中主动合并本机记录。清理浏览器数据或更换设备前，可以导出 JSON 备份。

## 本地开发

需要 Node.js 22 或更新版本。

```sh
git clone https://github.com/ECHO0l0/haixing.git
cd haixing
npm ci
npm run build
npm run dev
```

打开 `http://127.0.0.1:4173`。通过 `PORT` 环境变量可指定其他本机端口。纯静态开发服务器用于页面开发；真实云端请求由部署在 Vercel 的 `/api/cloud` 转发。

## 验证与构建

```sh
npm test
npx playwright install chromium
npm run check
```

`npm run check` 依次运行自动测试、生产构建和浏览器验收。浏览器测试会自动启动独立的本机服务器，结束后关闭服务器；Windows 本机优先使用已安装的 Chrome，其他环境使用 Playwright Chromium。也可通过 `HAIXING_BROWSER_EXECUTABLE` 指定浏览器路径。

浏览器验收覆盖两端合并、断网补传、重复上传、账号隔离、头像昵称同步、刷新位置恢复、输入保留、自定义练习续接和手机布局，截图写入 `test-results/`。这些验收使用模拟云接口；真实账号的云端验收见接入说明。

构建产物位于 `dist/`，包含应用、打包后的 SDK 和离线题库。Vercel 根据 `vercel.json` 运行 `npm run build` 并发布 `dist/`，云端中转函数位于 `api/cloud.js`。

## 目录

| 路径 | 用途 |
| --- | --- |
| `app.js`、`style.css`、`view.js`、`product.js` | 页面、交互和个人资料 |
| `core.js`、`practice.js` | 本机数据库、练习和考试 |
| `sync.js`、`sync-model.js`、`cloud-fetch.js` | 多端同步、事件合并和请求中转 |
| `sync-config.js` | Supabase 项目地址、公开客户端密钥和中转地址 |
| `cloud/haixing-sync.sql` | 海行云端数据库初始化脚本 |
| `vault/` | 离线题库与图片包 |
| `tests/` | 自动测试、浏览器和桌面验收 |
| `.github/` | 提交检查和依赖更新配置 |
| `archive/love-space/` | 原项目的历史资料 |

## 持续维护

推送到 `main` 或提交合并请求后，GitHub Actions 自动运行测试、构建和浏览器验收。Dependabot 每周检查 npm 依赖和 Actions 版本，更新通过合并请求审核。

题库和学习记录分别维护：修改题库资源后需检查题目数量、关联子题和离线缓存；修改同步逻辑后需验证账号隔离、增量合并和练习续接。商业内容的来源和授权应单独记录。

