-- Crear enum para estado de reserva
CREATE TYPE estado_reserva AS ENUM ('pendiente', 'confirmada', 'en_proceso', 'completada', 'cancelada');

-- Tabla de edificios
CREATE TABLE edificios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  direccion TEXT NOT NULL,
  horario_inicio TIME NOT NULL DEFAULT '08:00',
  horario_fin TIME NOT NULL DEFAULT '18:00',
  duracion_slot_min INTEGER NOT NULL DEFAULT 60,
  capacidad_simultanea INTEGER NOT NULL DEFAULT 1,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla de planes de lavado
CREATE TABLE planes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT NOT NULL DEFAULT '',
  precio DECIMAL(10,2) NOT NULL,
  duracion_min INTEGER NOT NULL DEFAULT 60,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla de reservas
CREATE TABLE reservas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  edificio_id UUID NOT NULL REFERENCES edificios(id),
  plan_id UUID NOT NULL REFERENCES planes(id),
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  cliente_nombre TEXT NOT NULL,
  cliente_email TEXT NOT NULL,
  cliente_telefono TEXT NOT NULL,
  marca_auto TEXT NOT NULL,
  modelo_auto TEXT NOT NULL,
  color_auto TEXT NOT NULL,
  placa_auto TEXT NOT NULL,
  propina DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_pagado DECIMAL(10,2) NOT NULL DEFAULT 0,
  stripe_payment_id TEXT,
  estado estado_reserva NOT NULL DEFAULT 'pendiente',
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indices
CREATE INDEX idx_reservas_edificio_fecha ON reservas(edificio_id, fecha);
CREATE INDEX idx_reservas_estado ON reservas(estado);
CREATE INDEX idx_reservas_fecha ON reservas(fecha);

-- RLS (Row Level Security)
ALTER TABLE edificios ENABLE ROW LEVEL SECURITY;
ALTER TABLE planes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;

-- Politicas publicas de lectura para edificios y planes activos
CREATE POLICY "Edificios activos son publicos" ON edificios
  FOR SELECT USING (activo = true);

CREATE POLICY "Planes activos son publicos" ON planes
  FOR SELECT USING (activo = true);

-- Politica para insertar reservas (cualquier usuario anonimo puede crear)
CREATE POLICY "Cualquiera puede crear reservas" ON reservas
  FOR INSERT WITH CHECK (true);

-- Politica para leer reservas (solo usuarios autenticados - admin)
CREATE POLICY "Solo admin lee reservas" ON reservas
  FOR SELECT USING (auth.role() = 'authenticated');

-- Politicas de admin (usuarios autenticados pueden todo)
CREATE POLICY "Admin gestiona edificios" ON edificios
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin gestiona planes" ON planes
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin gestiona reservas" ON reservas
  FOR ALL USING (auth.role() = 'authenticated');
