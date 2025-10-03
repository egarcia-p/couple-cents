-- Add new text column
ALTER TABLE transactions ADD COLUMN user_id_text text;
ALTER TABLE user_budget_settings ADD COLUMN user_id_text text;

-- Populate new column
UPDATE transactions
SET user_id_text = 'YSGr1B2neJZl5mUkTFhxplv0rfaP7JCU'
WHERE "userId" = '1';

UPDATE user_budget_settings
SET user_id_text = 'YSGr1B2neJZl5mUkTFhxplv0rfaP7JCU'
WHERE "userId" = '1';

UPDATE transactions
SET user_id_text = 'zvEGV8oZQPQiNKdnIZlMrZHxOymWsvWp'
WHERE "userId" = '2';

UPDATE user_budget_settings
SET user_id_text = 'zvEGV8oZQPQiNKdnIZlMrZHxOymWsvWp'
WHERE "userId" = '2';

-- Drop old column & rename new one
ALTER TABLE transactions DROP COLUMN "userId";
ALTER TABLE user_budget_settings DROP COLUMN "userId";

ALTER TABLE transactions RENAME COLUMN user_id_text TO "userId";
ALTER TABLE user_budget_settings RENAME COLUMN user_id_text TO "userId";
