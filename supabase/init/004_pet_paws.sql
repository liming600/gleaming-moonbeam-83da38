-- ============================================
-- 宠友圈项目 - 第4步：击掌功能配置
-- 执行顺序：第4位（依赖 pets 表）
-- ============================================

-- 1. 创建 pet_paws 表（击掌记录）
CREATE TABLE IF NOT EXISTS pet_paws (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pet_id UUID REFERENCES pets(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建索引
CREATE INDEX IF NOT EXISTS idx_pet_paws_pet_id ON pet_paws(pet_id);
CREATE INDEX IF NOT EXISTS idx_pet_paws_user_id ON pet_paws(user_id);
CREATE INDEX IF NOT EXISTS idx_pet_paws_created_at ON pet_paws(created_at);

-- 3. 创建触发器函数：检查每天只能击掌一次
CREATE OR REPLACE FUNCTION check_paw_once_per_day()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pet_paws
    WHERE user_id = NEW.user_id
      AND pet_id = NEW.pet_id
      AND DATE(created_at) = DATE(NEW.created_at)
  ) THEN
    RAISE EXCEPTION '每天只能给同一只宠物击掌一次';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. 绑定触发器
DROP TRIGGER IF EXISTS trigger_check_paw_once_per_day ON pet_paws;
CREATE TRIGGER trigger_check_paw_once_per_day BEFORE INSERT ON pet_paws
FOR EACH ROW EXECUTE FUNCTION check_paw_once_per_day();

-- 5. 创建击掌计数视图
CREATE OR REPLACE VIEW pet_paws_count AS
SELECT pet_id, COUNT(*) AS paws_count
FROM pet_paws
GROUP BY pet_id;

-- 6. 启用 RLS
ALTER TABLE IF EXISTS pet_paws ENABLE ROW LEVEL SECURITY;

-- 7. 创建 RLS 策略
DROP POLICY IF EXISTS "Users can view pet paws count" ON pet_paws;
CREATE POLICY "Users can view pet paws count" ON pet_paws FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Users can view their own paws" ON pet_paws;
CREATE POLICY "Users can view their own paws" ON pet_paws FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create paws" ON pet_paws;
CREATE POLICY "Users can create paws" ON pet_paws FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
