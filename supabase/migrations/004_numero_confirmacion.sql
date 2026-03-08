-- Agregar columna de numero de confirmacion
ALTER TABLE reservas ADD COLUMN numero_confirmacion TEXT UNIQUE;
