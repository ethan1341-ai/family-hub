-- Users 表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  auth_provider TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Family Members 表
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  nickname TEXT,
  photo_url TEXT,
  birth_date DATE,
  gender TEXT,
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
  member_id UUID NOT NULL UNIQUE REFERENCES family_members(id),
  father_id UUID REFERENCES family_members(id),
  mother_id UUID REFERENCES family_members(id),
  spouse_id UUID REFERENCES family_members(id)
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
  created_by_member_id UUID REFERENCES family_members(id),
  status TEXT DEFAULT 'draft',
  summary TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- RSVP 表
CREATE TABLE rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  member_id UUID NOT NULL REFERENCES family_members(id),
  status TEXT DEFAULT 'pending',
  notes TEXT,
  responded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(event_id, member_id)
);

-- Notifications 表
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES family_members(id),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  read_at TIMESTAMP,
  UNIQUE(event_id, member_id)
);

-- 建立索引
CREATE INDEX idx_family_members_user_id ON family_members(user_id);
CREATE INDEX idx_events_created_by ON events(created_by);
CREATE INDEX idx_rsvps_event_id ON rsvps(event_id);
CREATE INDEX idx_notifications_member_id ON notifications(member_id);
CREATE INDEX idx_notifications_event_id ON notifications(event_id);
