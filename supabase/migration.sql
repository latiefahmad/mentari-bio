-- =============================================
-- Migration: Rumah Belajar Mentari
-- Jalankan di Supabase SQL Editor
-- =============================================

-- Tabel admin credentials
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel konten (key-value JSON per kategori)
CREATE TABLE IF NOT EXISTS site_content (
  key VARCHAR(50) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel program belajar
CREATE TABLE IF NOT EXISTS programs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  level VARCHAR(10) NOT NULL,
  title VARCHAR(100) NOT NULL,
  subtitle VARCHAR(100),
  subjects TEXT[],
  is_featured BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel jadwal belajar
CREATE TABLE IF NOT EXISTS schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  day VARCHAR(50) NOT NULL,
  time VARCHAR(50) NOT NULL,
  description VARCHAR(100),
  sort_order INT DEFAULT 0
);

-- Tabel galeri
CREATE TABLE IF NOT EXISTS gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  caption VARCHAR(200),
  width INT,
  height INT,
  file_size INT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel testimoni
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  author_name VARCHAR(100) NOT NULL,
  author_role VARCHAR(100),
  stars SMALLINT DEFAULT 5 CHECK (stars BETWEEN 1 AND 5),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SEED DATA DEFAULT
-- =============================================

-- Admin user (password: mentari123)
-- Hash dibuat dengan bcrypt cost 12
-- Ganti password setelah pertama login!
INSERT INTO admin_users (username, password_hash)
VALUES ('admin', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8e')
ON CONFLICT (username) DO NOTHING;

-- Konten default
INSERT INTO site_content (key, value) VALUES
('hero', '{
  "name": "Rumah Belajar Mentari",
  "tagline": "\"Mari membuat belajar lebih menyenangkan\"",
  "tag": "Lembaga Bimbingan Belajar",
  "statStudents": "100+",
  "statYears": "5+",
  "statTeachers": "10+"
}'),
('about', '{
  "desc": "Rumah Belajar Mentari adalah lembaga bimbingan belajar yang berdedikasi untuk membantu siswa meraih prestasi terbaik mereka. Kami percaya bahwa setiap anak memiliki potensi luar biasa yang perlu dikembangkan dengan cara yang menyenangkan dan efektif.",
  "features": [
    {"icon": "ph-chalkboard-teacher", "title": "Pengajar Berpengalaman", "desc": "Tenaga pengajar profesional dan berpengalaman di bidangnya"},
    {"icon": "ph-smiley", "title": "Belajar Menyenangkan", "desc": "Metode pembelajaran interaktif yang membuat siswa semangat belajar"},
    {"icon": "ph-chart-line-up", "title": "Hasil Terbukti", "desc": "Ratusan siswa telah meningkatkan prestasi akademik mereka"}
  ]
}'),
('location', '{
  "name": "Rumah Belajar Mentari",
  "address": "Jl. Contoh No. 123, Kota Anda",
  "note": "Hubungi kami untuk informasi lokasi lengkap"
}'),
('links', '{
  "wa": "6285733408212",
  "ig": "rb.mentari",
  "waMsg": "Halo Rumah Belajar Mentari! Saya ingin mendaftar sebagai siswa baru. Mohon informasi lebih lanjut 🙏"
}'),
('footer', '{
  "name": "Rumah Belajar Mentari",
  "tagline": "\"Mari membuat belajar lebih menyenangkan\"",
  "copy": "Made with 💖 Rumah Belajar Mentari"
}')
ON CONFLICT (key) DO NOTHING;

-- Program belajar default
INSERT INTO programs (level, title, subtitle, subjects, is_featured, sort_order) VALUES
('SD', 'Sekolah Dasar', 'Kelas 1 – 6', ARRAY['Matematika', 'Bahasa Indonesia', 'IPA & IPS', 'Bahasa Inggris'], FALSE, 1),
('SMP', 'Sekolah Menengah Pertama', 'Kelas 7 – 9', ARRAY['Matematika', 'IPA Terpadu', 'Bahasa Inggris', 'Persiapan UN'], TRUE, 2),
('SMA', 'Sekolah Menengah Atas', 'Kelas 10 – 12', ARRAY['Matematika & Fisika', 'Kimia & Biologi', 'Bahasa Inggris', 'Persiapan SNBT'], FALSE, 3);

-- Jadwal belajar default
INSERT INTO schedules (day, time, description, sort_order) VALUES
('Senin – Jumat', '14.00 – 17.00 WIB', 'Sesi Sore (Reguler)', 1),
('Sabtu', '08.00 – 12.00 WIB', 'Sesi Pagi (Weekend)', 2),
('Fleksibel', 'Sesuai Kesepakatan', 'Privat / Online', 3);

-- Testimoni default
INSERT INTO testimonials (text, author_name, author_role, stars, sort_order) VALUES
('"Nilai matematika anak saya naik drastis setelah belajar di Rumah Belajar Mentari. Pengajarnya sabar dan metodenya mudah dipahami."', 'Ibu Ani', 'Orang tua siswa SD', 5, 1),
('"Belajar di sini menyenangkan! Saya jadi lebih percaya diri menghadapi ujian. Terima kasih Rumah Belajar Mentari!"', 'Budi', 'Siswa SMP Kelas 9', 5, 2);

-- =============================================
-- STORAGE BUCKET (jalankan di Supabase Dashboard > Storage)
-- Atau via SQL:
-- =============================================
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('gallery', 'gallery', true)
-- ON CONFLICT (id) DO NOTHING;
