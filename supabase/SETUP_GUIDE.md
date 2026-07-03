# Supabase 配置指南

> 最后更新：2026-07-01  
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

### 步骤 2：执行 Schema

将 `supabase/schema.sql` 文件中的所有内容复制到 SQL Editor 中，然后点击 **Run**

### 步骤 3：验证表创建

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
- **Using**: `true`

#### 策略 2：允许认证用户上传图片

- **Name**: `Allow authenticated upload`
- **Action**: `INSERT`
- **Target roles**: `authenticated`
- **Using**: `true`

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

## 五、配置 RLS 权限策略

### 步骤 1：启用 RLS

对于以下表，点击 **Table Editor** → 对应表 → **RLS** → **Enable RLS**：

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

### 步骤 2：创建权限策略

在 **SQL Editor** 中执行以下策略脚本：

```sql
-- Users 表策略
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Pets 表策略
CREATE POLICY "Users can view their own pets" ON pets
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can create their own pets" ON pets
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own pets" ON pets
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own pets" ON pets
  FOR DELETE USING (auth.uid() = owner_id);

-- Posts 表策略
CREATE POLICY "Public posts are viewable by everyone" ON posts
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own posts (including private)" ON posts
  FOR SELECT USING (
    auth.uid() = (SELECT owner_id FROM pets WHERE id = posts.pet_id)
  );

CREATE POLICY "Users can create posts for their pets" ON posts
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT owner_id FROM pets WHERE id = posts.pet_id)
  );

CREATE POLICY "Users can update their own posts" ON posts
  FOR UPDATE USING (
    auth.uid() = (SELECT owner_id FROM pets WHERE id = posts.pet_id)
  );

CREATE POLICY "Users can delete their own posts" ON posts
  FOR DELETE USING (
    auth.uid() = (SELECT owner_id FROM pets WHERE id = posts.pet_id)
  );

-- Comments 表策略
CREATE POLICY "Users can view comments on public posts" ON comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = comments.post_id 
      AND posts.is_public = true
    )
  );

CREATE POLICY "Users can view comments on their own posts" ON comments
  FOR SELECT USING (
    auth.uid() = (
      SELECT owner_id FROM pets 
      JOIN posts ON posts.pet_id = pets.id 
      WHERE posts.id = comments.post_id
    )
  );

CREATE POLICY "Users can create comments" ON comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Likes 表策略
CREATE POLICY "Users can view likes on public posts" ON likes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = likes.post_id 
      AND posts.is_public = true
    )
  );

CREATE POLICY "Users can toggle likes" ON likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" ON likes
  FOR DELETE USING (auth.uid() = user_id);

-- Help Posts 表策略
CREATE POLICY "Help posts are viewable by everyone" ON help_posts
  FOR SELECT USING (true);

CREATE POLICY "Users can create help posts" ON help_posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own help posts" ON help_posts
  FOR UPDATE USING (auth.uid() = author_id);

-- Help Answers 表策略
CREATE POLICY "Help answers are viewable by everyone" ON help_answers
  FOR SELECT USING (true);

CREATE POLICY "Users can create help answers" ON help_answers
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can accept answers on their posts" ON help_answers
  FOR UPDATE USING (
    auth.uid() = (
      SELECT author_id FROM help_posts 
      WHERE help_posts.id = help_answers.help_post_id
    )
  );

-- Follows 表策略
CREATE POLICY "Users can view their own follows" ON follows
  FOR SELECT USING (auth.uid() = follower_id);

CREATE POLICY "Users can follow other users" ON follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow other users" ON follows
  FOR DELETE USING (auth.uid() = follower_id);

-- Notifications 表策略
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can mark their notifications as read" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Messages 表策略
CREATE POLICY "Users can view messages they are involved in" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);
```

---

## 六、创建 RPC 函数

在 **SQL Editor** 中执行以下脚本创建辅助函数：

```sql
-- 增量函数
CREATE OR REPLACE FUNCTION increment(column_name TEXT) 
RETURNS INTEGER AS $$
BEGIN
  RETURN 1;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- 减量函数
CREATE OR REPLACE FUNCTION decrement(column_name TEXT) 
RETURNS INTEGER AS $$
BEGIN
  RETURN -1;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- 授予执行权限
GRANT EXECUTE ON FUNCTION increment(TEXT) TO PUBLIC;
GRANT EXECUTE ON FUNCTION decrement(TEXT) TO PUBLIC;
```

> **注意**：由于 Supabase 的 `supabase.rpc()` 调用方式限制，实际的计数更新逻辑需要调整。请使用以下替代方案更新 Service 层代码。

---

## 七、修正 Service 层代码

由于 Supabase 的 RPC 函数调用方式限制，需要修改 `postService.ts` 和 `helpService.ts` 中的计数更新逻辑：

### 修改 postService.ts

将：
```typescript
await supabase
  .from('posts')
  .update({ likes_count: supabase.rpc('increment', { column: 'likes_count' }) })
  .eq('id', postId)
```

改为：
```typescript
const { data: post } = await supabase
  .from('posts')
  .select('likes_count')
  .eq('id', postId)
  .single()

if (post) {
  await supabase
    .from('posts')
    .update({ likes_count: post.likes_count + 1 })
    .eq('id', postId)
}
```

### 修改 helpService.ts

将：
```typescript
await supabase
  .from('help_posts')
  .update({ answers_count: supabase.rpc('increment', { column: 'answers_count' }) })
  .eq('id', postId)
```

改为：
```typescript
const { data: helpPost } = await supabase
  .from('help_posts')
  .select('answers_count')
  .eq('id', postId)
  .single()

if (helpPost) {
  await supabase
    .from('help_posts')
    .update({ answers_count: helpPost.answers_count + 1 })
    .eq('id', postId)
}
```

---

## 八、验证配置

### 步骤 1：测试连接

在项目中运行以下命令启动开发服务器：

```bash
npm run dev
```

访问 http://localhost:5173，检查是否能正常加载

### 步骤 2：测试认证

尝试注册/登录一个新账号，验证 Auth 是否正常工作

### 步骤 3：测试数据操作

尝试创建宠物、发布帖子、发布求助等操作，验证数据库写入是否正常

---

## 九、常见问题

### Q1：连接失败提示 "API key not provided"

**解决方案**：检查 `.env` 文件是否正确配置，确保 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY` 已正确填写

### Q2：RLS 策略导致数据无法读取

**解决方案**：检查 RLS 是否已启用，确认策略是否正确创建。可以临时禁用 RLS 测试数据是否可访问

### Q3：图片上传失败

**解决方案**：检查 Storage bucket 是否创建、是否设为公开、是否配置了正确的策略

### Q4：认证后无法创建数据

**解决方案**：检查用户是否已在 `users` 表中创建记录。注册时需要确保同时在 `users` 表中插入记录

---

## 十、完成配置后的下一步

1. ✅ 创建 Supabase 项目
2. ✅ 配置环境变量
3. ✅ 创建数据库表
4. ✅ 配置 Storage
5. ✅ 配置 Auth
6. ✅ 配置 RLS 策略
7. ✅ 创建 RPC 函数
8. 📝 **修改 Service 层代码**（修正计数更新逻辑）
9. 📝 **更新 Store 对接真实 API**
10. 📝 **测试功能**

---

*配置指南版本 v1.0 | 2026-07-01*
