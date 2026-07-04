-- ============================================
-- 宠友圈项目 - 第4步：创建触发器
-- 执行顺序：第4位（依赖表）
-- ============================================

-- ------------------------------
-- 全局触发器：updated_at自动更新
-- ------------------------------

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- users updated_at 触发器
DROP TRIGGER IF EXISTS users_set_updated_at ON users;
CREATE TRIGGER users_set_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- pets updated_at 触发器
DROP TRIGGER IF EXISTS pets_set_updated_at ON pets;
CREATE TRIGGER pets_set_updated_at BEFORE UPDATE ON pets
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- posts updated_at 触发器
DROP TRIGGER IF EXISTS posts_set_updated_at ON posts;
CREATE TRIGGER posts_set_updated_at BEFORE UPDATE ON posts
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- comments updated_at 触发器
DROP TRIGGER IF EXISTS comments_set_updated_at ON comments;
CREATE TRIGGER comments_set_updated_at BEFORE UPDATE ON comments
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- help_posts updated_at 触发器
DROP TRIGGER IF EXISTS help_posts_set_updated_at ON help_posts;
CREATE TRIGGER help_posts_set_updated_at BEFORE UPDATE ON help_posts
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- help_answers updated_at 触发器
DROP TRIGGER IF EXISTS help_answers_set_updated_at ON help_answers;
CREATE TRIGGER help_answers_set_updated_at BEFORE UPDATE ON help_answers
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------
-- 计数自动同步触发器
-- ------------------------------

-- 帖子点赞计数同步
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 帖子评论计数同步
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 求助帖回答计数同步
CREATE OR REPLACE FUNCTION update_help_answers_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE help_posts SET answers_count = answers_count + 1 WHERE id = NEW.help_post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE help_posts SET answers_count = GREATEST(0, answers_count - 1) WHERE id = OLD.help_post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 用户帖子计数同步
CREATE OR REPLACE FUNCTION update_user_posts_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE users SET posts_count = posts_count + 1 
    WHERE id = (SELECT owner_id FROM pets WHERE id = NEW.pet_id);
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE users SET posts_count = GREATEST(0, posts_count - 1) 
    WHERE id = (SELECT owner_id FROM pets WHERE id = OLD.pet_id);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 用户粉丝计数同步
CREATE OR REPLACE FUNCTION update_user_followers_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE users SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
    UPDATE users SET following_count = following_count + 1 WHERE id = NEW.follower_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE users SET followers_count = GREATEST(0, followers_count - 1) WHERE id = OLD.following_id;
    UPDATE users SET following_count = GREATEST(0, following_count - 1) WHERE id = OLD.follower_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 用户宠物计数同步
CREATE OR REPLACE FUNCTION update_user_pets_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE users SET pets_count = pets_count + 1 WHERE id = NEW.owner_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE users SET pets_count = GREATEST(0, pets_count - 1) WHERE id = OLD.owner_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------
-- 绑定计数触发器
-- ------------------------------

DROP TRIGGER IF EXISTS trigger_update_post_likes ON likes;
CREATE TRIGGER trigger_update_post_likes AFTER INSERT OR DELETE ON likes
FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

DROP TRIGGER IF EXISTS trigger_update_post_comments ON comments;
CREATE TRIGGER trigger_update_post_comments AFTER INSERT OR DELETE ON comments
FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

DROP TRIGGER IF EXISTS trigger_update_help_answers ON help_answers;
CREATE TRIGGER trigger_update_help_answers AFTER INSERT OR DELETE ON help_answers
FOR EACH ROW EXECUTE FUNCTION update_help_answers_count();

DROP TRIGGER IF EXISTS trigger_update_user_posts ON posts;
CREATE TRIGGER trigger_update_user_posts AFTER INSERT OR DELETE ON posts
FOR EACH ROW EXECUTE FUNCTION update_user_posts_count();

DROP TRIGGER IF EXISTS trigger_update_user_followers ON follows;
CREATE TRIGGER trigger_update_user_followers AFTER INSERT OR DELETE ON follows
FOR EACH ROW EXECUTE FUNCTION update_user_followers_count();

DROP TRIGGER IF EXISTS trigger_update_user_pets ON pets;
CREATE TRIGGER trigger_update_user_pets AFTER INSERT OR DELETE ON pets
FOR EACH ROW EXECUTE FUNCTION update_user_pets_count();

-- ------------------------------
-- auth用户同步触发器
-- ------------------------------

-- 创建/更新用户同步函数
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

-- 删除用户同步函数
CREATE OR REPLACE FUNCTION delete_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM users WHERE id = OLD.id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 绑定auth同步触发器
DROP TRIGGER IF EXISTS trigger_auth_user_insert ON auth.users;
CREATE TRIGGER trigger_auth_user_insert AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION sync_user_profile();

DROP TRIGGER IF EXISTS trigger_auth_user_update ON auth.users;
CREATE TRIGGER trigger_auth_user_update AFTER UPDATE ON auth.users
FOR EACH ROW EXECUTE FUNCTION sync_user_profile();

DROP TRIGGER IF EXISTS trigger_auth_user_delete ON auth.users;
CREATE TRIGGER trigger_auth_user_delete AFTER DELETE ON auth.users
FOR EACH ROW EXECUTE FUNCTION delete_user_profile();