export type EstadoReserva = 'pendiente' | 'confirmada' | 'en_proceso' | 'completada' | 'cancelada';

export interface Edificio {
  id: string;
  nombre: string;
  direccion: string;
  horario_inicio: string;
  horario_fin: string;
  duracion_slot_min: number;
  capacidad_simultanea: number;
  activo: boolean;
  created_at: string;
}

export interface Plan {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  duracion_min: number;
  activo: boolean;
  created_at: string;
}

export interface Reserva {
  id: string;
  edificio_id: string;
  plan_id: string;
  fecha: string;
  hora_inicio: string;
  cliente_nombre: string;
  cliente_email: string;
  cliente_telefono: string;
  marca_auto: string;
  modelo_auto: string;
  color_auto: string;
  placa_auto: string;
  propina: number;
  total_pagado: number;
  clip_payment_request_id: string | null;
  numero_confirmacion: string | null;
  estado: EstadoReserva;
  notas: string | null;
  created_at: string;
  // Joined fields
  edificio?: Edificio;
  plan?: Plan;
}

export interface SlotDisponible {
  hora: string;
  disponible: boolean;
}
