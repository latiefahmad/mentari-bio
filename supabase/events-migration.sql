-- =============================================
-- Migration: Events / Program Lain
-- Jalankan di Supabase SQL Editor
-- =============================================

-- Tabel events (acara/program lain)
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  event_date DATE,
  category VARCHAR(100),
  is_published BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel foto per event
CREATE TABLE IF NOT EXISTS event_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  caption VARCHAR(200),
  width INT,
  height INT,
  file_size INT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk performa
CREATE INDEX IF NOT EXISTS idx_event_photos_event_id ON event_photos(event_id);
CREATE INDEX IF NOT EXISTS idx_events_sort_order ON events(sort_order);
CREATE INDEX IF NOT EXISTS idx_events_is_published ON events(is_published);
