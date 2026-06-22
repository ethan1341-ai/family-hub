# 👨‍👩‍👧‍👦 家族成員圖

家族成員資料管理、聚餐通知與管理平台。

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 設置 Supabase

1. 前往 [Supabase](https://supabase.com) 建立免費帳號
2. 建立新專案
3. 進入專案設定，複製：
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `Anon Key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. 在 `.env.local` 貼上：

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. 建立資料庫 Schema

在 Supabase 的 SQL Editor 執行以下語句：

```sql
-- Users 表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  member_id UUID UNIQUE REFERENCES family_members(id),
  email TEXT,
  auth_provider TEXT NOT NULL CHECK (auth_provider IN ('email', 'google', 'line')),
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP
);

-- Family Members 表
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id),
  name TEXT NOT NULL,
  nickname TEXT,
  photo_url TEXT,
  birth_date DATE,
  gender TEXT CHECK (gender IN ('M', 'F')),
  industry TEXT,
  phone TEXT,
  line_id TEXT,
  email TEXT,
  notes TEXT,
  is_data_complete BOOLEAN DEFAULT FALSE,
  data_completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Family Relations 表
CREATE TABLE family_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  father_id UUID REFERENCES family_members(id),
  mother_id UUID REFERENCES family_members(id),
  spouse_id UUID REFERENCES family_members(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(member_id)
);

-- Events 表
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME,
  location TEXT NOT NULL,
  address TEXT,
  map_url TEXT,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'finished')),
  summary TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- RSVP 表
CREATE TABLE rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'attending', 'not-attending')),
  notes TEXT,
  responded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(event_id, member_id)
);

-- Event Photos 表
CREATE TABLE event_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 建立索引
CREATE INDEX idx_family_members_user_id ON family_members(user_id);
CREATE INDEX idx_events_created_by ON events(created_by);
CREATE INDEX idx_rsvps_event_id ON rsvps(event_id);
CREATE INDEX idx_rsvps_member_id ON rsvps(member_id);

-- 啟用 Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;
```

### 4. 啟用 Google OAuth

1. 在 Supabase 控制台 → Authentication → Providers
2. 啟用 Google provider
3. 設置 Google OAuth credentials（需要 Google Cloud 帳號）

### 5. 啟動開發伺服器

```bash
npm run dev
```

訪問 [http://localhost:3000](http://localhost:3000)

## 功能清單

- [ ] 用戶認證（Google + Email）
- [ ] 成員資料管理
- [ ] 家族樹視圖
- [ ] 聚餐活動管理
- [ ] RSVP 統計
- [ ] 邀請連結
- [ ] 個人資料編輯
- [ ] 投影展示模式
- [ ] 現場補錄工具

## 技術棧

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **UI**: Tailwind CSS
- **State Management**: Zustand
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth

## 文件結構

```
src/
├── app/                    # Next.js App Router
├── components/
│   ├── shared/            # 共用元件
│   └── specific/          # 頁面特定元件
├── lib/
│   ├── supabase.ts       # Supabase client
│   ├── store.ts          # Zustand store
│   └── api.ts            # API helpers
├── types/                 # TypeScript 類型定義
└── styles/                # 全局樣式
```

## 開發流程

1. 功能開發在 `src/` 目錄
2. 保持乾淨的檔案結構
3. 使用 TypeScript 確保類型安全
4. 完成後在 localhost:3000 測試

## 部署

推薦部署到 [Vercel](https://vercel.com)：

```bash
git push origin main
```

Vercel 會自動部署最新版本。

---

有任何問題或改進建議，歡迎反饋！
