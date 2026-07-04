-- ============================================
-- 宠友圈项目 - 第5步：创建索引
-- 执行顺序：第5位（依赖表）
-- ============================================

-- ------------------------------
-- 宠物表索引
-- ------------------------------

CREATE INDEX IF NOT EXISTS idx_pets_owner_id ON pets(owner_id);
CREATE INDEX IF NOT EXISTS idx_pets_owner_id_created_at ON pets(owner_id, created_at DESC);

-- ------------------------------
-- 帖子表索引
-- ------------------------------

CREATE INDEX IF NOT EXISTS idx_posts_pet_id ON posts(pet_id);
CREATE INDEX IF NOT EXISTS idx_posts_pet_id_created_at ON posts(pet_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_type_created_at ON posts(post_type, created_at DESC);

-- ------------------------------
-- 评论表索引
-- ------------------------------

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id_created_at ON comments(post_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);

-- ------------------------------
-- 点赞表索引
-- ------------------------------

CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_likes_post_user_unique ON likes(post_id, user_id);

-- ------------------------------
-- 互助帖子索引
-- ------------------------------

CREATE INDEX IF NOT EXISTS idx_help_posts_author_id ON help_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_help_posts_zone ON help_posts(zone);
CREATE INDEX IF NOT EXISTS idx_help_posts_created_at ON help_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_help_posts_zone_created_at ON help_posts(zone, created_at DESC);

-- ------------------------------
-- 互助回答索引
-- ------------------------------

CREATE INDEX IF NOT EXISTS idx_help_answers_post_id ON help_answers(help_post_id);
CREATE INDEX IF NOT EXISTS idx_help_answers_post_id_created_at ON help_answers(help_post_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_help_answers_author_id ON help_answers(author_id);

-- ------------------------------
-- 关注表索引
-- ------------------------------

CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower_following_created ON follows(follower_id, following_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_follows_follower_following_unique ON follows(follower_id, following_id);

-- ------------------------------
-- 通知表索引
-- ------------------------------

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_created_at ON notifications(user_id, created_at DESC);

-- ------------------------------
-- 私信表索引
-- ------------------------------

CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver_created ON messages(sender_id, receiver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_sender_created ON messages(receiver_id, sender_id, created_at DESC);