# Supabase 配置指南

> 最后更新：2026-07-05  
> 适用版本：Supabase Web Dashboard

---

## 一、获取项目凭证

### 步骤 1：登录 Supabase Dashboard

访问 https://supabase.com/dashboard 登录你的账号

### 步骤 2：选择项目

点击你刚创建的项目进入项目配置页面

### 步骤 3：获取 API 凭证

1. 点击左侧菜单 **Settings** → **API**
2. 复制以下内容：

| 凭证名称 | 位置 | 用途 |
|----------|------|------|
| **Project URL** | 顶部 **URL** 字段 | 配置 `VITE_SUPABASE_URL` |
| **anon key** | **Project API keys** → **anon/public** | 配置 `VITE_SUPABASE_ANON_KEY` |

### 步骤 4：配置环境变量

在项目根目录创建 `.env` 文件：

```bash
# 创建 .env 文件
touch .env
```

将以下内容填入 `.env` 文件（替换为你的实际值）：

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## 二、创建数据库表

### 步骤 1：打开 SQL Editor

1. 点击左侧菜单 **SQL Editor**
2. 点击 **New query** 创建新查询

### 步骤 2：按顺序执行初始化脚本

依次执行 `supabase/init/` 目录下的脚本：

| 序号 | 文件名 | 内容 |
|------|--------|------|
| 1 | `001_init_extensions.sql` | 启用 uuid-ossp、pgcrypto 扩展 |
| 2 | `002_enums.sql` | 创建枚举类型 |
| 3 | `003_tables.sql` | 创建表结构 |
| 4 | `004_triggers.sql` | 创建基础触发器 |
| 5 | `005_indexes.sql` | 创建索引 |
| 6 | `006_rls_policies.sql` | 配置 RLS 策略 |

### 步骤 3：执行修复脚本（按需）

以下脚本用于修复特定问题，根据需要执行：

| 序号 | 文件名 | 内容 |
|------|--------|------|
| 7 | `007_fix_triggers.sql` | 修复用户同步触发器 |
| 8 | `008_fix_help_posts.sql` | 修复互助帖子采纳机制 |
| 9 | `009_fix_auth_triggers.sql` | 修复 Auth 登录触发器（解决登录 500 错误） |

> **注意**：`009_fix_auth_triggers.sql` 必须执行，否则会导致登录时报 500 错误 `"Database error granting user"`

### 步骤 4：验证表创建

1. 点击左侧菜单 **Table Editor**
2. 确认以下表已创建：
   - `users`
   - `pets`
   - `posts`
   - `comments`
   - `likes`
   - `help_posts`
   - `help_answers`
   - `follows`
   - `notifications`
   - `messages`

---

## 三、配置 Storage

### 步骤 1：创建 Storage Bucket

1. 点击左侧菜单 **Storage**
2. 点击 **New bucket**
3. 填写：
   - **Name**: `images`
   - **Public access**: ✅ 勾选 **Make public**
4. 点击 **Create bucket**

### 步骤 2：配置存储策略

1. 点击 **images** bucket 进入
2. 点击 **Policies** → **New policy**
3. 创建以下策略：

#### 策略 1：允许所有人读取图片

- **Name**: `Allow public read access`
- **Action**: `SELECT`
- **Target roles**: `public`
- **Using**: `bucket_id = 'images'`

#### 策略 2：允许认证用户上传图片

- **Name**: `Allow authenticated upload`
- **Action**: `INSERT`
- **Target roles**: `authenticated`
- **Using**: `bucket_id = 'images'`

---

## 四、配置 Auth

### 步骤 1：启用邮箱/密码认证

1. 点击左侧菜单 **Authentication** → **Providers**
2. 找到 **Email** 部分
3. 开启 **Email provider**
4. 配置：
   - **Confirm email**: ✅ 勾选（生产环境建议开启）
   - **Enable email confirmations**: ✅ 勾选

### 步骤 2：配置 Site URL

1. 点击左侧菜单 **Authentication** → **Settings**
2. 在 **Site URL** 中填入你的前端地址：
   - 开发环境：`http://localhost:5173`
   - 生产环境：你的部署地址

---

## 五、验证配置

### 步骤 1：测试连接

在项目中运行以下命令启动开发服务器：

```bash
cd pet-circle
npm run dev
```

访问 http://localhost:5173，检查是否能正常加载

### 步骤 2：测试认证

尝试注册/登录一个新账号，验证 Auth 是否正常工作

### 步骤 3：测试数据操作

尝试创建宠物、发布帖子、发布求助等操作，验证数据库写入是否正常

---

## 六、常见问题

### Q1：连接失败提示 "API key not provided"

**解决方案**：检查 `.env` 文件是否正确配置，确保 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY` 已正确填写

### Q2：RLS 策略导致数据无法读取

**解决方案**：检查 RLS 是否已启用，确认策略是否正确创建。可以临时禁用 RLS 测试数据是否可访问

### Q3：图片上传失败

**解决方案**：检查 Storage bucket 是否创建、是否设为公开、是否配置了正确的策略

### Q4：认证后无法创建数据

**解决方案**：检查用户是否已在 `users` 表中创建记录。注册时需要确保同时在 `users` 表中插入记录

---

## 七、完成配置后的下一步

1. ✅ 创建 Supabase 项目
2. ✅ 配置环境变量
3. ✅ 创建数据库表（执行 init 脚本）
4. ✅ 配置 Storage
5. ✅ 配置 Auth
6. ✅ 配置 RLS 策略
7. 📝 **测试功能**

---

*配置指南版本 v2.0 | 2026-07-05*