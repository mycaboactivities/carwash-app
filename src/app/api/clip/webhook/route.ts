import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { enviarEmailConfirmacion, enviarEmailAdminNuevaReserva, enviarWhatsAppConfirmacion } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  // Validar token de seguridad
  const token = request.nextUrl.searchParams.get('token');
  const expectedToken = process.env.CLIP_WEBHOOK_TOKEN;

  if (expectedToken && token !== expectedToken) {
    return NextResponse.json({ error: 'Token invalido' }, { status: 401 });
  }

  try {
    const body = await request.json();

    const {
      payment_request_id,
      resource_status,
      me_reference_id,
    } = body;

    // me_reference_id es el external_reference que enviamos (reserva.id)
    const reservaId = me_reference_id;

    if (!reservaId) {
      return NextResponse.json({ error: 'Sin referencia de reserva' }, { status: 400 });
    }

    // Validar que la reserva existe y tiene el payment_request_id correcto
    const { data: reservaExistente } = await supabase
      .from('reservas')
      .select('id, clip_payment_request_id')
      .eq('id', reservaId)
      .single();

    if (!reservaExistente) {
      return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 });
    }

    if (resource_status === 'COMPLETED') {
      // Actualizar reserva a confirmada
      await supabase
        .from('reservas')
        .update({
          estado: 'confirmada',
          clip_payment_request_id: payment_request_id,
        })
        .eq('id', reservaId);

      // Obtener reserva completa con edificio y plan
      const { data: reserva } = await supabase
        .from('reservas')
        .select('*, edificio:edificios(*), plan:planes(*)')
        .eq('id', reservaId)
        .single();

      if (reserva) {
        // Enviar notificaciones (no bloquear la respuesta)
        Promise.allSettled([
          enviarEmailConfirmacion(reserva),
          enviarEmailAdminNuevaReserva(reserva),
          enviarWhatsAppConfirmacion(reserva),
        ]).catch(console.error);
      }
    } else if (resource_status === 'CANCELED' || resource_status === 'EXPIRED') {
      // Cancelar la reserva
      await supabase
        .from('reservas')
        .update({ estado: 'cancelada' })
        .eq('id', reservaId);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error procesando webhook Clip:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
