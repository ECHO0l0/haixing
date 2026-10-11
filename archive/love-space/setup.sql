-- ================================================
-- 秘密花园 — 数据库初始化（先删旧表再建新表）
-- ================================================
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS activities;
DROP TABLE IF EXISTS garden;
DROP TABLE IF EXISTS pet;

-- 1. 宠物表
CREATE TABLE pet (
  id INTEGER PRIMARY KEY DEFAULT 1,
  name TEXT DEFAULT '小可爱',
  hunger INTEGER DEFAULT 100,
  happiness INTEGER DEFAULT 100,
  energy INTEGER DEFAULT 100,
  cleanliness INTEGER DEFAULT 100,
  last_fed TIMESTAMPTZ DEFAULT NOW(),
  last_played TIMESTAMPTZ DEFAULT NOW(),
  last_rested TIMESTAMPTZ DEFAULT NOW(),
  last_washed TIMESTAMPTZ DEFAULT NOW(),
  care_days INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO pet (id) VALUES (1);

-- 2. 花园表（9 块地）
CREATE TABLE garden (
  id SERIAL PRIMARY KEY,
  plot_index INTEGER NOT NULL UNIQUE,
  plant_type TEXT,
  planted_at TIMESTAMPTZ,
  watered_at TIMESTAMPTZ,
  stage INTEGER DEFAULT 0,
  water_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO garden (plot_index, stage, water_count) VALUES
  (0,0,0),(1,0,0),(2,0,0),(3,0,0),(4,0,0),(5,0,0),(6,0,0),(7,0,0),(8,0,0);

-- 3. 活动日志表（带用户名）
CREATE TABLE activities (
  id SERIAL PRIMARY KEY,
  icon TEXT DEFAULT '📝',
  user_name TEXT DEFAULT '',
  action TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 留言表
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  author TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Realtime（实时同步）
ALTER PUBLICATION supabase_realtime ADD TABLE pet;
ALTER PUBLICATION supabase_realtime ADD TABLE garden;
ALTER PUBLICATION supabase_realtime ADD TABLE activities;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- 6. RLS（私人项目，允许所有操作）
ALTER TABLE pet ENABLE ROW LEVEL SECURITY;
ALTER TABLE garden ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all" ON pet FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON garden FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON activities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON messages FOR ALL USING (true) WITH CHECK (true);
