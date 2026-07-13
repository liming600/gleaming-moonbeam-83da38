-- ============================================
-- 宠友圈项目 - 通知插入策略
-- 允许认证用户向其他用户发送通知
-- ============================================

-- 允许认证用户插入通知（如点赞、评论、关注等）
DROP POLICY IF EXISTS "Allow insert on notifications" ON notifications;
CREATE POLICY "Allow insert on notifications" ON notifications FOR INSERT TO authenticated WITH CHECK (true);

-- 允许认证用户删除自己的通知
DROP POLICY IF EXISTS "Allow delete on notifications" ON notifications;
CREATE POLICY "Allow delete on notifications" ON notifications FOR DELETE TO authenticated USING (user_id = auth.uid());
