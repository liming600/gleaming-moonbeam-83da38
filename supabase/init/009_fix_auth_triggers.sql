-- ============================================
-- 宠友圈项目 - 第9步：修复 Auth 登录触发器
-- 执行顺序：第9位（依赖 003_tables 和 004_triggers）
-- 
-- 问题描述：
--   登录时 Supabase 返回 500 错误 "Database error granting user"
--   原因是 auth.users 表上的触发器执行失败
-- 
-- 修复方案：
--   1. 先禁用触发器，让登录能正常工作
--   2. 修复 users 表结构
--   3. 手动同步已有用户数据
--   4. 创建带异常处理的触发器，避免同步失败影响登录
-- ============================================

-- 1. 先禁用 auth.users 上的触发器
DROP TRIGGER IF EXISTS trigger_auth_user_insert ON auth.users;
DROP TRIGGER IF EXISTS trigger_auth_user_update ON auth.users;
DROP TRIGGER IF EXISTS trigger_auth_user_delete ON auth.users;

-- 2. 确保 users 表结构正确
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  bio TEXT,
  gender TEXT,
  age TEXT,
  posts_count INTEGER DEFAULT 0,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  pets_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE IF EXISTS users
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS age TEXT,
  ADD COLUMN IF NOT EXISTS posts_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pets_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. 手动同步 auth.users 到 public.users
INSERT INTO users (id, email, name, avatar_url, created_at, updated_at)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', '用户_' || LEFT(au.id::text, 8)),
  au.raw_user_meta_data->>'avatar_url',
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN users pu ON pu.id = au.id
WHERE pu.id IS NULL;

-- 4. 创建带异常处理的触发器函数
CREATE OR REPLACE FUNCTION sync_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  BEGIN
    INSERT INTO users (id, email, name, avatar_url)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'name', '用户_' || LEFT(NEW.id::text, 8)),
      NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = COALESCE(EXCLUDED.name, '用户_' || LEFT(NEW.id::text, 8)),
      avatar_url = EXCLUDED.avatar_url,
      updated_at = NOW();
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'sync_user_profile failed for user %: %', NEW.id, SQLERRM;
  END;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION delete_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  BEGIN
    DELETE FROM users WHERE id = OLD.id;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'delete_user_profile failed for user %: %', OLD.id, SQLERRM;
  END;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 5. 重新绑定触发器
CREATE TRIGGER trigger_auth_user_insert AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION sync_user_profile();

CREATE TRIGGER trigger_auth_user_update AFTER UPDATE ON auth.users
FOR EACH ROW EXECUTE FUNCTION sync_user_profile();

CREATE TRIGGER trigger_auth_user_delete AFTER DELETE ON auth.users
FOR EACH ROW EXECUTE FUNCTION delete_user_profile();