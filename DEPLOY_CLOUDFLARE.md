# Cloudflare Pages + D1 部署说明（纯页面操作为主）

本项目是静态 HTML/CSS/JS，后端使用 Cloudflare Pages Functions + D1 数据库。
下面以「尽量不使用命令行」为目标来说明。

## 0) 准备工作

- 一个 Cloudflare 账号（登录即可）。
- 代码已放在 GitHub/GitLab 仓库（Cloudflare Pages 需要关联仓库）。

## 1) 在 Cloudflare 页面创建 D1 数据库

1. 打开 Cloudflare 控制台。
2. 左侧选择 **Workers 和 Pages** → **D1**。
3. 点击 **Create database**（新建数据库）。
4. 名称建议填：`ai-course-db`（和文档一致）。
5. 创建完成后进入该数据库详情页。

## 2) 用网页控制台执行建表 SQL（不用命令行）

1. 在该 D1 数据库详情页，找到 **Console** 或 **Query**（SQL 控制台）。
2. 打开 `migrations/0001_init.sql` 文件，把里面的 SQL 全部复制进去。
3. 在控制台粘贴并执行。

如果执行成功，就说明数据库表已创建完成。

## 3) 创建 Pages 项目（网页操作）

1. 左侧选择 **Workers 和 Pages** → **Pages**。
2. 点击 **Create a project**（创建项目）。
3. 选择你的 Git 仓库并授权。
4. 构建设置：
   - **Framework preset**：选择 **None**（或不选）
   - **Build command**：留空
   - **Build output directory**：填写 `/`（仓库根目录）
5. 点击创建并等待首次部署完成。

## 4) 给 Pages 绑定 D1 数据库（网页操作）

1. 进入刚创建的 Pages 项目详情页。
2. 打开 **Settings** → **Functions** → **D1 database bindings**。
3. 点击 **Add binding**：
   - **Variable name**：填 `DB`（必须是 DB）
   - **D1 database**：选择刚刚创建的 `ai-course-db`
4. 保存设置。

## 5) 重新部署

绑定完成后重新部署：

- 方法 A（推荐）：在 Pages 项目里点 **Deployments** → **Retry deployment**。
- 方法 B：对仓库做一次提交并推送，自动触发部署。

## 6) 使用说明

1. 打开部署后的站点。
2. 进入 `admin.html`，首次会要求设置管理员密码。
3. 管理员登录后即可新增/重置学员账号密码。
4. 学员在 `course.html` 登录即可正常访问。

---

## 命令行方式（可选，不想用可跳过）

```bash
wrangler d1 create ai-course-db
wrangler d1 execute ai-course-db --file migrations/0001_init.sql --remote
wrangler pages deploy .
```
