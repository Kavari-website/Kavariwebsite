-- ============================================
-- KAVARI - Supabase Database Schema
-- Ejecuta este script en el SQL Editor de tu panel Supabase
-- ============================================

-- Tabla de perfiles (extendida desde auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  birth_date DATE,
  country TEXT,
  preferred_destinations TEXT[],
  travel_budget TEXT DEFAULT 'moderado',
  travel_style TEXT DEFAULT 'mixto',
  languages TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de likes de países por usuario
CREATE TABLE IF NOT EXISTS pais_likes (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pais_code TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, pais_code)
);

-- Índice para consultas por usuario
CREATE INDEX IF NOT EXISTS idx_pais_likes_user ON pais_likes(user_id);

-- Tabla de registro de guías
CREATE TABLE IF NOT EXISTS guide_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  photo_url TEXT,
  country_code TEXT NOT NULL,
  description TEXT,
  languages TEXT,
  specialties TEXT,
  membership_tier TEXT CHECK (membership_tier IN ('silver','gold','diamond')),
  criminal_record_url TEXT,
  medical_record_url TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending','approved','rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_guide_country ON guide_registrations(country_code);
CREATE INDEX IF NOT EXISTS idx_guide_status ON guide_registrations(verification_status);
CREATE INDEX IF NOT EXISTS idx_guide_user ON guide_registrations(user_id);

-- ============================================
-- SOLICITUDES DE PAQUETES (index → formulario de plan de viaje)
-- Guarda cada reserva/solicitud de paquete enviada desde el index.
-- user_id es opcional: se rellena si el visitante tiene sesión iniciada.
-- ============================================
CREATE TABLE IF NOT EXISTS package_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  package_id TEXT,
  package_name TEXT,
  country_code TEXT,
  travel_date DATE,
  travelers INTEGER DEFAULT 1,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','contacted','done')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_package_requests_status ON package_requests(status);
CREATE INDEX IF NOT EXISTS idx_package_requests_user ON package_requests(user_id);

ALTER TABLE package_requests ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede enviar una solicitud de paquete (público)
CREATE POLICY "Anyone can insert package requests" ON package_requests
  FOR INSERT WITH CHECK (true);

-- Los usuarios pueden ver sus propias solicitudes (si están logueados)
CREATE POLICY "Users can view own package requests" ON package_requests
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- MENSAJES DE CONTACTO (contacto.html → formulario)
-- Guarda cada mensaje enviado desde el formulario de contacto.
-- ============================================
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT DEFAULT 'general',
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new','read','answered')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_user ON contact_messages(user_id);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede enviar un mensaje de contacto (público)
CREATE POLICY "Anyone can insert contact messages" ON contact_messages
  FOR INSERT WITH CHECK (true);

-- Los usuarios pueden ver sus propios mensajes (si están logueados)
CREATE POLICY "Users can view own contact messages" ON contact_messages
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- ACCESO ADMINISTRADOR (Panel de solicitudes en perfil.html)
-- El panel del sitio solo aparece para los emails listados abajo.
-- Si quieres otro administrador, cambia el email en ESTAS políticas
-- y también en la constante ADMIN_EMAILS del archivo js/admin-panel.js
-- ============================================
CREATE POLICY "Admin can view all package requests" ON package_requests
  FOR SELECT USING (auth.jwt() ->> 'email' = 'kavariwebsite@gmail.com');

CREATE POLICY "Admin can update all package requests" ON package_requests
  FOR UPDATE USING (auth.jwt() ->> 'email' = 'kavariwebsite@gmail.com');

CREATE POLICY "Admin can view all contact messages" ON contact_messages
  FOR SELECT USING (auth.jwt() ->> 'email' = 'kavariwebsite@gmail.com');

CREATE POLICY "Admin can update all contact messages" ON contact_messages
  FOR UPDATE USING (auth.jwt() ->> 'email' = 'kavariwebsite@gmail.com');

-- Políticas RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE guide_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pais_likes ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver su propio perfil
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Política: Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Política: Los usuarios pueden insertar su propio perfil
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Política: Los usuarios pueden ver sus propios likes
CREATE POLICY "Users can view own likes" ON pais_likes
  FOR SELECT USING (auth.uid() = user_id);

-- Política: Los usuarios pueden insertar sus propios likes
CREATE POLICY "Users can insert own likes" ON pais_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios pueden actualizar sus propios likes
-- (necesaria para que el upsert de setUserLike funcione con RLS)
CREATE POLICY "Users can update own likes" ON pais_likes
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios pueden eliminar sus propios likes
CREATE POLICY "Users can delete own likes" ON pais_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Política: Cualquiera puede ver guías aprobados
CREATE POLICY "Anyone can view approved guides" ON guide_registrations
  FOR SELECT USING (verification_status = 'approved');

-- Política: Los usuarios pueden registrar guías
CREATE POLICY "Users can register as guides" ON guide_registrations
  FOR INSERT WITH CHECK (true);

-- Storage Buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('guide-documents', 'guide-documents', false) ON CONFLICT DO NOTHING;

-- Políticas de Storage: Avatares públicos
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Políticas de Storage: Documentos de guías (privados)
CREATE POLICY "Users can upload guide documents" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'guide-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own guide documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'guide-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================
-- MEMORIA DEL ASISTENTE (chat)
-- Guarda el historial de conversación por usuario (opcional: RLS por auth.uid())
-- ============================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_key TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user','model')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_user_session ON chat_messages(user_id, session_key, created_at);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Los usuarios solo ven/insertan/borran sus propios mensajes
CREATE POLICY "Users can view own chat messages" ON chat_messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat messages" ON chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat messages" ON chat_messages
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- FIN DEL SCHEMA
-- ============================================
