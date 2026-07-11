-- ============================================
-- 宠友圈项目 - 修复步骤：规范互助帖子采纳机制
-- 执行顺序：第8位（依赖 help_posts 和 help_answers 表）
-- ============================================

-- 1. 添加 accepted_answer_id 列（用 UUID 引用替代文本存储）
ALTER TABLE IF EXISTS help_posts
  ADD COLUMN IF NOT EXISTS accepted_answer_id UUID REFERENCES help_answers(id) ON DELETE SET NULL;

-- 2. 尝试迁移已有数据：从 accepted_answer 文本匹配到 help_answers 的 ID
--    只迁移 accepted_answer 有值且 accepted_answer_id 为空的情况
DO $$
DECLARE
  r RECORD;
  matched_id UUID;
BEGIN
  FOR r IN
    SELECT id, accepted_answer
    FROM help_posts
    WHERE accepted_answer IS NOT NULL
      AND accepted_answer != ''
      AND accepted_answer_id IS NULL
  LOOP
    -- 尝试通过内容匹配找到对应的回答
    SELECT ha.id INTO matched_id
    FROM help_answers ha
    WHERE ha.help_post_id = r.id
      AND ha.content = r.accepted_answer
      AND ha.is_accepted = TRUE
    LIMIT 1;

    IF matched_id IS NOT NULL THEN
      UPDATE help_posts SET accepted_answer_id = matched_id WHERE id = r.id;
    END IF;
  END LOOP;
END $$;

-- 3. help_answers: 确保每个帖子最多一条被采纳的回答
CREATE UNIQUE INDEX IF NOT EXISTS idx_help_answers_one_accepted_per_post
  ON help_answers (help_post_id)
  WHERE is_accepted = TRUE;

-- 4. 创建触发器函数：接受回答时自动同步 help_posts 状态
CREATE OR REPLACE FUNCTION sync_help_post_on_answer_accepted()
RETURNS TRIGGER AS $$
BEGIN
  -- 当回答被标记为采纳时，自动将帖子状态改为已解决
  IF NEW.is_accepted = TRUE AND (OLD.is_accepted IS FALSE OR OLD.is_accepted IS NULL) THEN
    UPDATE help_posts
    SET status = 'resolved',
        accepted_answer_id = NEW.id,
        accepted_answer = NEW.content,
        updated_at = NOW()
    WHERE id = NEW.help_post_id;
  END IF;

  -- 当回答取消采纳时，清除帖子中的采纳引用
  IF NEW.is_accepted = FALSE AND OLD.is_accepted = TRUE THEN
    UPDATE help_posts
    SET status = 'open',
        accepted_answer_id = NULL,
        accepted_answer = NULL,
        updated_at = NOW()
    WHERE id = NEW.help_post_id AND accepted_answer_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. 绑定触发器
DROP TRIGGER IF EXISTS trigger_sync_help_post_on_accepted ON help_answers;
CREATE TRIGGER trigger_sync_help_post_on_accepted
  AFTER UPDATE OF is_accepted ON help_answers
  FOR EACH ROW EXECUTE FUNCTION sync_help_post_on_answer_accepted();

-- 6. 创建触发器函数：删除已采纳回答时清除帖子引用
CREATE OR REPLACE FUNCTION clean_help_post_on_answer_delete()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.is_accepted = TRUE THEN
    UPDATE help_posts
    SET status = 'open',
        accepted_answer_id = NULL,
        accepted_answer = NULL,
        updated_at = NOW()
    WHERE id = OLD.help_post_id AND accepted_answer_id = OLD.id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- 7. 绑定删除触发器
DROP TRIGGER IF EXISTS trigger_clean_help_post_on_delete ON help_answers;
CREATE TRIGGER trigger_clean_help_post_on_delete
  BEFORE DELETE ON help_answers
  FOR EACH ROW EXECUTE FUNCTION clean_help_post_on_answer_delete();

-- 8. 确保所有有 accepted_answer_id 的帖子状态为 resolved
UPDATE help_posts
SET status = 'resolved'
WHERE accepted_answer_id IS NOT NULL AND status != 'resolved';

-- 9. 同时用 accepted_answer_id 更新 is_accepted 标志位
UPDATE help_answers
SET is_accepted = TRUE
WHERE id IN (
  SELECT accepted_answer_id FROM help_posts WHERE accepted_answer_id IS NOT NULL
) AND is_accepted = FALSE;
