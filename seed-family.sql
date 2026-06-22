-- 插入主要成員
INSERT INTO family_members (name, nickname, is_data_complete) VALUES
  ('康傳長', '傳長', true),
  ('康謝美月', '美月', true),
  ('康志光', '志光', true),
  ('康勝卿', '勝卿', true),
  ('康翡珊', '翡珊', true),
  ('簡雅玲', '雅玲', true),
  ('康允豪', '允豪', true),
  ('黃明傑', '明傑', true),
  ('黄希奇', '希奇', true),
  ('黄米奇', '米奇', true),
  ('康彩雲', '彩雲', true),
  ('康月雲', '月雲', true),
  ('康素雲', '素雲', true),
  ('康美雲', '美雲', true),
  ('康麗雲', '麗雲', true)
ON CONFLICT DO NOTHING;

-- 建立家族關係
-- 康傳長 + 康謝美月 (夫妻)
INSERT INTO family_relations (member_id, spouse_id)
SELECT
  (SELECT id FROM family_members WHERE name = '康傳長' LIMIT 1),
  (SELECT id FROM family_members WHERE name = '康謝美月' LIMIT 1)
ON CONFLICT (member_id) DO UPDATE SET spouse_id = EXCLUDED.spouse_id;

INSERT INTO family_relations (member_id, spouse_id)
SELECT
  (SELECT id FROM family_members WHERE name = '康謝美月' LIMIT 1),
  (SELECT id FROM family_members WHERE name = '康傳長' LIMIT 1)
ON CONFLICT (member_id) DO UPDATE SET spouse_id = EXCLUDED.spouse_id;

-- 康志光 (父母：康傳長、康謝美月)
INSERT INTO family_relations (member_id, father_id, mother_id)
SELECT
  (SELECT id FROM family_members WHERE name = '康志光' LIMIT 1),
  (SELECT id FROM family_members WHERE name = '康傳長' LIMIT 1),
  (SELECT id FROM family_members WHERE name = '康謝美月' LIMIT 1)
ON CONFLICT (member_id) DO UPDATE SET
  father_id = EXCLUDED.father_id,
  mother_id = EXCLUDED.mother_id;

-- 康勝卿 (父母：康傳長、康謝美月)
INSERT INTO family_relations (member_id, father_id, mother_id)
SELECT
  (SELECT id FROM family_members WHERE name = '康勝卿' LIMIT 1),
  (SELECT id FROM family_members WHERE name = '康傳長' LIMIT 1),
  (SELECT id FROM family_members WHERE name = '康謝美月' LIMIT 1)
ON CONFLICT (member_id) DO UPDATE SET
  father_id = EXCLUDED.father_id,
  mother_id = EXCLUDED.mother_id;

-- 康翡珊 (父母：康傳長、康謝美月)
INSERT INTO family_relations (member_id, father_id, mother_id)
SELECT
  (SELECT id FROM family_members WHERE name = '康翡珊' LIMIT 1),
  (SELECT id FROM family_members WHERE name = '康傳長' LIMIT 1),
  (SELECT id FROM family_members WHERE name = '康謝美月' LIMIT 1)
ON CONFLICT (member_id) DO UPDATE SET
  father_id = EXCLUDED.father_id,
  mother_id = EXCLUDED.mother_id;

-- 康志光 + 簡雅玲 (夫妻)
INSERT INTO family_relations (member_id, spouse_id)
SELECT
  (SELECT id FROM family_members WHERE name = '康志光' LIMIT 1),
  (SELECT id FROM family_members WHERE name = '簡雅玲' LIMIT 1)
ON CONFLICT (member_id) DO UPDATE SET spouse_id = EXCLUDED.spouse_id;

INSERT INTO family_relations (member_id, spouse_id)
SELECT
  (SELECT id FROM family_members WHERE name = '簡雅玲' LIMIT 1),
  (SELECT id FROM family_members WHERE name = '康志光' LIMIT 1)
ON CONFLICT (member_id) DO UPDATE SET spouse_id = EXCLUDED.spouse_id;

-- 康允豪 (父母：康志光、簡雅玲)
INSERT INTO family_relations (member_id, father_id, mother_id)
SELECT
  (SELECT id FROM family_members WHERE name = '康允豪' LIMIT 1),
  (SELECT id FROM family_members WHERE name = '康志光' LIMIT 1),
  (SELECT id FROM family_members WHERE name = '簡雅玲' LIMIT 1)
ON CONFLICT (member_id) DO UPDATE SET
  father_id = EXCLUDED.father_id,
  mother_id = EXCLUDED.mother_id;

-- 康翡珊 + 黃明傑 (夫妻)
INSERT INTO family_relations (member_id, spouse_id)
SELECT
  (SELECT id FROM family_members WHERE name = '康翡珊' LIMIT 1),
  (SELECT id FROM family_members WHERE name = '黃明傑' LIMIT 1)
ON CONFLICT (member_id) DO UPDATE SET spouse_id = EXCLUDED.spouse_id;

INSERT INTO family_relations (member_id, spouse_id)
SELECT
  (SELECT id FROM family_members WHERE name = '黃明傑' LIMIT 1),
  (SELECT id FROM family_members WHERE name = '康翡珊' LIMIT 1)
ON CONFLICT (member_id) DO UPDATE SET spouse_id = EXCLUDED.spouse_id;

-- 黄希奇 (父母：康翡珊、黃明傑)
INSERT INTO family_relations (member_id, father_id, mother_id)
SELECT
  (SELECT id FROM family_members WHERE name = '黄希奇' LIMIT 1),
  (SELECT id FROM family_members WHERE name = '黃明傑' LIMIT 1),
  (SELECT id FROM family_members WHERE name = '康翡珊' LIMIT 1)
ON CONFLICT (member_id) DO UPDATE SET
  father_id = EXCLUDED.father_id,
  mother_id = EXCLUDED.mother_id;

-- 黄米奇 (父母：康翡珊、黃明傑)
INSERT INTO family_relations (member_id, father_id, mother_id)
SELECT
  (SELECT id FROM family_members WHERE name = '黄米奇' LIMIT 1),
  (SELECT id FROM family_members WHERE name = '黃明傑' LIMIT 1),
  (SELECT id FROM family_members WHERE name = '康翡珊' LIMIT 1)
ON CONFLICT (member_id) DO UPDATE SET
  father_id = EXCLUDED.father_id,
  mother_id = EXCLUDED.mother_id;

-- 康傳長的妹妹們 (父母關係暫時留空，因為不知道父母信息)
-- 康彩雲、康月雲、康素雲、康美雲、康麗雲 (這些需要手動設定父母)
