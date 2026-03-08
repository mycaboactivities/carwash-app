import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const edificioId = searchParams.get('edificio_id');
  const fecha = searchParams.get('fecha');

  if (!edificioId || !fecha) {
    return NextResponse.json({ error: 'edificio_id y fecha son requeridos' }, { status: 400 });
  }

  // Obtener edificio
  const { data: edificio, error: edError } = await supabase
    .from('edificios')
    .select('*')
    .eq('id', edificioId)
    .single();

  if (edError || !edificio) {
    return NextResponse.json({ error: 'Edificio no encontrado' }, { status: 404 });
  }

  // Obtener reservas existentes para esa fecha y edificio (no canceladas)
  const { data: reservas } = await supabase
    .from('reservas')
    .select('hora_inicio')
    .eq('edificio_id', edificioId)
    .eq('fecha', fecha)
    .neq('estado', 'cancelada');

  // Generar slots
  const slots = [];
  const [inicioH, inicioM] = edificio.horario_inicio.split(':').map(Number);
  const [finH, finM] = edificio.horario_fin.split(':').map(Number);
  const inicioMin = inicioH * 60 + inicioM;
  const finMin = finH * 60 + finM;
  const duracion = edificio.duracion_slot_min;

  for (let min = inicioMin; min + duracion <= finMin; min += duracion) {
    const h = Math.floor(min / 60).toString().padStart(2, '0');
    const m = (min % 60).toString().padStart(2, '0');
    const hora = `${h}:${m}`;

    // Contar reservas en este slot
    const reservasEnSlot = (reservas || []).filter(
      (r) => r.hora_inicio.slice(0, 5) === hora
    ).length;

    slots.push({
      hora,
      disponible: reservasEnSlot < edificio.capacidad_simultanea,
    });
  }

  return NextResponse.json({ slots });
}
