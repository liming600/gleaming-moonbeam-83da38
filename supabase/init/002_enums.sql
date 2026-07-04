-- ============================================
-- 宠友圈项目 - 第2步：创建自定义枚举类型
-- 执行顺序：第2位（依赖扩展）
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pet_gender') THEN
    CREATE TYPE pet_gender AS ENUM ('male', 'female', 'unknown');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'post_type') THEN
    CREATE TYPE post_type AS ENUM ('public', 'diary');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'post_mood') THEN
    CREATE TYPE post_mood AS ENUM ('happy', 'love', 'sad', 'lazy', 'angry', 'cool');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'help_zone') THEN
    CREATE TYPE help_zone AS ENUM ('experience', 'question', 'rescue', 'mutual');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'help_status') THEN
    CREATE TYPE help_status AS ENUM ('open', 'taken', 'resolved');
  END IF;
END $$;