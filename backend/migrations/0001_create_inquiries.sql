CREATE TABLE IF NOT EXISTS inquiries (
  id TEXT PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  updated_at TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  name TEXT NOT NULL,
  organization TEXT NOT NULL,
  role TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  interest TEXT NOT NULL,
  destination TEXT,
  timeline TEXT,
  offer TEXT,
  diligence TEXT,
  application TEXT NOT NULL,
  message TEXT,
  referrer TEXT,
  page_url TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  user_timezone TEXT,
  ip_hash TEXT,
  user_agent TEXT,
  admin_notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_ip_hash ON inquiries(ip_hash, created_at);
