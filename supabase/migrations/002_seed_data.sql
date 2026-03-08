-- Insertar edificios
INSERT INTO edificios (nombre, direccion, horario_inicio, horario_fin, duracion_slot_min, capacidad_simultanea, activo) VALUES
('Torre Cosmocrat', 'Av. Patria 1501, Puerta de Hierro, 45116 Zapopan, Jalisco', '08:00', '18:00', 60, 2, true),
('Torre Midtown', 'Av. Mexico 2500, Col. Ladron de Guevara, 44600 Guadalajara, Jalisco', '07:00', '19:00', 60, 2, true);

-- Insertar planes de lavado
INSERT INTO planes (nombre, descripcion, precio, duracion_min, activo) VALUES
('Lavado Express', 'Lavado exterior con agua a presion, shampoo automotriz y secado a mano. Ideal para mantener tu auto limpio entre lavados completos.', 149.00, 30, true),
('Lavado Completo', 'Lavado exterior completo + aspirado interior, limpieza de tablero, cristales por dentro y aromatizante. El favorito de nuestros clientes.', 299.00, 60, true),
('Detallado Premium', 'Todo lo del lavado completo + encerado de carroceria, acondicionado de plasticos, limpieza de vestiduras y motor. Tu auto como nuevo.', 549.00, 120, true);
