-- ============================================
-- 宠友圈项目 - 修复步骤：重置触发器并修复字段约束
-- 先删除旧触发器
-- ============================================

DROP TRIGGER IF EXISTS trigger_auth_user_insert ON auth.users;
DROP TRIGGER IF EXISTS trigger_auth_user_update ON auth.users;
DROP TRIGGER IF EXISTS trigger_auth_user_delete ON auth.users;

-- 修复字段约束：允许触发器在auth.users创建前先填充users表
ALTER TABLE IF EXISTS users ALTER COLUMN name DROP NOT NULL;
ALTER TABLE IF EXISTS users ALTER COLUMN email DROP NOT NULL;
ALTER TABLE IF EXISTS users ALTER COLUMN avatar_url DROP NOT NULL;

-- 重新创建auth用户同步触发器
CREATE OR REPLACE FUNCTION sync_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', '用户_' || SUBSTRING(NEW.id FROM 1 FOR 8)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, '用户_' || SUBSTRING(NEW.id FROM 1 FOR 8)),
    avatar_url = EXCLUDED.avatar_url,
    updated_at = NOW();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION delete_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM users WHERE id = OLD.id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 重新绑定auth同步触发器
CREATE TRIGGER trigger_auth_user_insert AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION sync_user_profile();

CREATE TRIGGER trigger_auth_user_update AFTER UPDATE ON auth.users
FOR EACH ROW EXECUTE FUNCTION sync_user_profile();

CREATE TRIGGER trigger_auth_user_delete AFTER DELETE ON auth.users
FOR EACH ROW EXECUTE FUNCTION delete_user_profile();

-- ============================================
-- 回填：为 auth.users 中存在但 public.users 缺失的用户补齐记录
-- ============================================

INSERT INTO public.users (id, email, name, avatar_url, created_at, updated_at)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', '用户_' || LEFT(au.id::text, 8)),
  au.raw_user_meta_data->>'avatar_url',
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN public.users pu ON pu.id = au.id
WHERE pu.id IS NULL;
