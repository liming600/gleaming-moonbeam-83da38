DROP TRIGGER IF EXISTS trigger_auth_user_insert ON auth.users;
DROP TRIGGER IF EXISTS trigger_auth_user_update ON auth.users;
DROP TRIGGER IF EXISTS trigger_auth_user_delete ON auth.users;

ALTER TABLE users ALTER COLUMN name DROP NOT NULL;
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;
ALTER TABLE users ALTER COLUMN avatar_url DROP NOT NULL;
