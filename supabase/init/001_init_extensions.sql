-- ============================================
-- 宠友圈项目 - 第1步：初始化扩展
-- 执行顺序：第1位
-- ============================================

-- UUID生成函数扩展（用于uuid_generate_v4()）
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- pgcrypto扩展（用于加密和随机数生成）
CREATE EXTENSION IF NOT EXISTS pgcrypto;