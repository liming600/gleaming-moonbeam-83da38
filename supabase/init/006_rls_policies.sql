-- ============================================
-- 宠友圈项目 - 第6步：创建行级安全策略
-- 执行顺序：第6位（依赖表和触发器）
-- ============================================

-- ------------------------------
-- 启用 RLS
-- ------------------------------

ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS help_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS help_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS messages ENABLE ROW LEVEL SECURITY;

-- ------------------------------
-- users 表 RLS 策略
-- ------------------------------

DROP POLICY IF EXISTS "Users can view their own profile" ON users;
CREATE POLICY "Users can view their own profile" ON users FOR SELECT TO authenticated USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own profile" ON users;
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE TO authenticated USING (id = auth.uid());

DROP POLICY IF EXISTS "Allow public view of user profiles" ON users;
CREATE POLICY "Allow public view of user profiles" ON users FOR SELECT TO public USING (true);

-- ------------------------------
-- pets 表 RLS 策略
-- ------------------------------

DROP POLICY IF EXISTS "Users can view their own pets" ON pets;
CREATE POLICY "Users can view their own pets" ON pets FOR SELECT TO authenticated USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can create pets" ON pets;
CREATE POLICY "Users can create pets" ON pets FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own pets" ON pets;
CREATE POLICY "Users can update their own pets" ON pets FOR UPDATE TO authenticated USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own pets" ON pets;
CREATE POLICY "Users can delete their own pets" ON pets FOR DELETE TO authenticated USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Allow public view of pets" ON pets;
CREATE POLICY "Allow public view of pets" ON pets FOR SELECT TO public USING (true);

-- ------------------------------
-- posts 表 RLS 策略
-- ------------------------------

DROP POLICY IF EXISTS "Allow public view of posts" ON posts;
CREATE POLICY "Allow public view of posts" ON posts FOR SELECT TO public USING (post_type = 'public');

DROP POLICY IF EXISTS "Users can view their own posts" ON posts;
CREATE POLICY "Users can view their own posts" ON posts FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM pets WHERE pets.id = posts.pet_id AND pets.owner_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can create posts" ON posts;
CREATE POLICY "Users can create posts" ON posts FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM pets WHERE pets.id = posts.pet_id AND pets.owner_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can update their own posts" ON posts;
CREATE POLICY "Users can update their own posts" ON posts FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM pets WHERE pets.id = posts.pet_id AND pets.owner_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can delete their own posts" ON posts;
CREATE POLICY "Users can delete their own posts" ON posts FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM pets WHERE pets.id = posts.pet_id AND pets.owner_id = auth.uid())
);

-- ------------------------------
-- comments 表 RLS 策略
-- ------------------------------

DROP POLICY IF EXISTS "Allow public view of comments" ON comments;
CREATE POLICY "Allow public view of comments" ON comments FOR SELECT TO public USING (
  EXISTS (SELECT 1 FROM posts WHERE posts.id = comments.post_id AND posts.post_type = 'public')
);

DROP POLICY IF EXISTS "Users can view comments on their posts" ON comments;
CREATE POLICY "Users can view comments on their posts" ON comments FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM posts JOIN pets ON posts.pet_id = pets.id WHERE posts.id = comments.post_id AND pets.owner_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can view their own comments" ON comments;
CREATE POLICY "Users can view their own comments" ON comments FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create comments" ON comments;
CREATE POLICY "Users can create comments" ON comments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
CREATE POLICY "Users can update their own comments" ON comments FOR UPDATE TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;
CREATE POLICY "Users can delete their own comments" ON comments FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ------------------------------
-- likes 表 RLS 策略
-- ------------------------------

DROP POLICY IF EXISTS "Allow view of likes" ON likes;
CREATE POLICY "Allow view of likes" ON likes FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM posts WHERE posts.id = likes.post_id AND (posts.post_type = 'public' OR EXISTS (SELECT 1 FROM pets WHERE pets.id = posts.pet_id AND pets.owner_id = auth.uid())))
);

DROP POLICY IF EXISTS "Users can view their own likes" ON likes;
CREATE POLICY "Users can view their own likes" ON likes FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create likes" ON likes;
CREATE POLICY "Users can create likes" ON likes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own likes" ON likes;
CREATE POLICY "Users can delete their own likes" ON likes FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ------------------------------
-- help_posts 表 RLS 策略
-- ------------------------------

DROP POLICY IF EXISTS "Allow public view of help posts" ON help_posts;
CREATE POLICY "Allow public view of help posts" ON help_posts FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Users can create help posts" ON help_posts;
CREATE POLICY "Users can create help posts" ON help_posts FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own help posts" ON help_posts;
CREATE POLICY "Users can update their own help posts" ON help_posts FOR UPDATE TO authenticated USING (author_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own help posts" ON help_posts;
CREATE POLICY "Users can delete their own help posts" ON help_posts FOR DELETE TO authenticated USING (author_id = auth.uid());

-- ------------------------------
-- help_answers 表 RLS 策略
-- ------------------------------

DROP POLICY IF EXISTS "Allow public view of help answers" ON help_answers;
CREATE POLICY "Allow public view of help answers" ON help_answers FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Users can create help answers" ON help_answers;
CREATE POLICY "Users can create help answers" ON help_answers FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own help answers" ON help_answers;
CREATE POLICY "Users can update their own help answers" ON help_answers FOR UPDATE TO authenticated USING (author_id = auth.uid());

DROP POLICY IF EXISTS "Post authors can accept answers" ON help_answers;
CREATE POLICY "Post authors can accept answers" ON help_answers FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM help_posts WHERE help_posts.id = help_answers.help_post_id AND help_posts.author_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can delete their own help answers" ON help_answers;
CREATE POLICY "Users can delete their own help answers" ON help_answers FOR DELETE TO authenticated USING (author_id = auth.uid());

-- ------------------------------
-- follows 表 RLS 策略
-- ------------------------------

DROP POLICY IF EXISTS "Users can view their own follows" ON follows;
CREATE POLICY "Users can view their own follows" ON follows FOR SELECT TO authenticated USING (follower_id = auth.uid());

DROP POLICY IF EXISTS "Users can view their followers" ON follows;
CREATE POLICY "Users can view their followers" ON follows FOR SELECT TO authenticated USING (following_id = auth.uid());

DROP POLICY IF EXISTS "Users can create follows" ON follows;
CREATE POLICY "Users can create follows" ON follows FOR INSERT TO authenticated WITH CHECK (follower_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own follows" ON follows;
CREATE POLICY "Users can delete their own follows" ON follows FOR DELETE TO authenticated USING (follower_id = auth.uid());

-- ------------------------------
-- notifications 表 RLS 策略
-- ------------------------------

DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- 禁止客户端直接插入/删除通知（仅允许数据库触发器生成）
DROP POLICY IF EXISTS "Allow insert on notifications" ON notifications;
DROP POLICY IF EXISTS "Allow delete on notifications" ON notifications;

-- ------------------------------
-- messages 表 RLS 策略
-- ------------------------------

DROP POLICY IF EXISTS "Users can view sent messages" ON messages;
CREATE POLICY "Users can view sent messages" ON messages FOR SELECT TO authenticated USING (sender_id = auth.uid());

DROP POLICY IF EXISTS "Users can view received messages" ON messages;
CREATE POLICY "Users can view received messages" ON messages FOR SELECT TO authenticated USING (receiver_id = auth.uid());

DROP POLICY IF EXISTS "Users can create messages" ON messages;
CREATE POLICY "Users can create messages" ON messages FOR INSERT TO authenticated WITH CHECK (sender_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own messages" ON messages;
CREATE POLICY "Users can delete their own messages" ON messages FOR DELETE TO authenticated USING (sender_id = auth.uid());

-- ------------------------------
-- Storage 存储桶 RLS 策略
-- ------------------------------

DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
CREATE POLICY "Allow public read access" 
ON storage.objects 
FOR SELECT 
TO public 
USING (bucket_id = 'images');

DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
CREATE POLICY "Allow authenticated uploads" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'images');

DROP POLICY IF EXISTS "Allow users to delete their own images" ON storage.objects;
CREATE POLICY "Allow users to delete their own images" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (bucket_id = 'images' AND ((metadata->>'user_id')::uuid = auth.uid()));