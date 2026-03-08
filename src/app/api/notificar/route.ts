import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { enviarEmailConfirmacion, enviarEmailAdminNuevaReserva } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  try {
    const { numero_confirmacion } = await request.json();

    if (!numero_confirmacion) {
      return NextResponse.json({ error: 'Falta numero de confirmacion' }, { status: 400 });
    }

    // Buscar la reserva por numero de confirmacion
    const { data: reserva, error } = await supabase
      .from('reservas')
      .select('*, edificio:edificios(*), plan:planes(*)')
      .eq('numero_confirmacion', numero_confirmacion)
      .single();

    if (error || !reserva) {
      return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 });
    }

    // Evitar enviar duplicados - solo enviar si no se ha notificado antes
    if (reserva.notificado) {
      return NextResponse.json({ ok: true, message: 'Ya notificado previamente' });
    }

    // Marcar como notificado
    await supabase
      .from('reservas')
      .update({ notificado: true })
      .eq('id', reserva.id);

    // Enviar emails
    const [emailCliente, emailAdmin] = await Promise.allSettled([
      enviarEmailConfirmacion(reserva),
      enviarEmailAdminNuevaReserva(reserva),
    ]);

    return NextResponse.json({
      ok: true,
      emailCliente: emailCliente.status === 'fulfilled' ? 'enviado' : 'error',
      emailAdmin: emailAdmin.status === 'fulfilled' ? 'enviado' : 'error',
    });
  } catch (error) {
    console.error('Error enviando notificaciones:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
