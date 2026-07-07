-- ============================================
-- 宠友圈项目 - 第3步：创建数据库表结构
-- 执行顺序：第3位（依赖枚举）
-- ============================================

-- 1. users 表（扩展 auth.users）
ALTER TABLE IF EXISTS users 
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS posts_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pets_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. pets 表（宠物信息）
CREATE TABLE IF NOT EXISTS pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  breed TEXT,
  gender pet_gender DEFAULT 'unknown',
  birth_date DATE,
  weight NUMERIC,
  color TEXT,
  personality TEXT,
  posts INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  followers INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. posts 表（帖子）
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID REFERENCES pets(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  images TEXT[],
  tags TEXT[],
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  post_type post_type DEFAULT 'public',
  mood post_mood,
  location_address TEXT,
  location_latitude NUMERIC,
  location_longitude NUMERIC,
  date TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 为已存在的posts表补充缺失字段
ALTER TABLE IF EXISTS posts
  ADD COLUMN IF NOT EXISTS post_type post_type DEFAULT 'public',
  ADD COLUMN IF NOT EXISTS mood post_mood,
  ADD COLUMN IF NOT EXISTS location_address TEXT,
  ADD COLUMN IF NOT EXISTS location_latitude NUMERIC,
  ADD COLUMN IF NOT EXISTS location_longitude NUMERIC,
  ADD COLUMN IF NOT EXISTS date TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 4. comments 表（评论）
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE IF EXISTS comments
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 5. likes 表（点赞）
CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. help_posts 表（互助帖子）
CREATE TABLE IF NOT EXISTS help_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  zone help_zone NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  answers_count INTEGER DEFAULT 0,
  status help_status DEFAULT 'open',
  is_urgent BOOLEAN DEFAULT FALSE,
  accepted_answer TEXT,
  location_address TEXT,
  location_latitude NUMERIC,
  location_longitude NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE IF EXISTS help_posts
  ADD COLUMN IF NOT EXISTS zone help_zone DEFAULT 'experience',
  ADD COLUMN IF NOT EXISTS status help_status DEFAULT 'open',
  ADD COLUMN IF NOT EXISTS is_urgent BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS accepted_answer TEXT,
  ADD COLUMN IF NOT EXISTS location_address TEXT,
  ADD COLUMN IF NOT EXISTS location_latitude NUMERIC,
  ADD COLUMN IF NOT EXISTS location_longitude NUMERIC,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 7. help_answers 表（互助回答）
CREATE TABLE IF NOT EXISTS help_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  help_post_id UUID REFERENCES help_posts(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_accepted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE IF EXISTS help_answers
  ADD COLUMN IF NOT EXISTS is_accepted BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 8. follows 表（关注关系）
CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. notifications 表（通知）
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  related_id UUID,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. messages 表（私信）
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);