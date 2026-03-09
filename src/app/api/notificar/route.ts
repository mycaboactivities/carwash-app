import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { enviarEmailConfirmacion, enviarEmailAdminNuevaReserva, enviarWhatsAppConfirmacion } from '@/lib/notifications';

// GET para debug y test - visita /api/notificar?conf=CW-XXXX-XXXX en el navegador
export async function GET(request: NextRequest) {
  const conf = request.nextUrl.searchParams.get('conf');

  if (!conf) {
    return NextResponse.json({
      hasGmailUser: !!process.env.GMAIL_USER,
      hasGmailPass: !!process.env.GMAIL_APP_PASSWORD,
      hasAdminEmail: !!process.env.ADMIN_EMAIL,
      gmailUser: process.env.GMAIL_USER ? process.env.GMAIL_USER.slice(0, 5) + '***' : 'NOT SET',
      uso: 'Agrega ?conf=CW-XXXX-XXXX para enviar email de prueba',
    });
  }

  try {
    const { data: reserva, error } = await supabase
      .from('reservas')
      .select('*, edificio:edificios(*), plan:planes(*)')
      .eq('numero_confirmacion', conf)
      .single();

    if (error || !reserva) {
      return NextResponse.json({ error: 'Reserva no encontrada', detail: error?.message, conf }, { status: 404 });
    }

    const [emailCliente, emailAdmin] = await Promise.allSettled([
      enviarEmailConfirmacion(reserva),
      enviarEmailAdminNuevaReserva(reserva),
    ]);

    return NextResponse.json({
      ok: true,
      conf,
      clienteEmail: reserva.cliente_email,
      emailCliente: emailCliente.status === 'fulfilled'
        ? { status: 'ok', error: emailCliente.value.error ? String(emailCliente.value.error) : null }
        : { status: 'fail', error: String((emailCliente as PromiseRejectedResult).reason) },
      emailAdmin: emailAdmin.status === 'fulfilled'
        ? { status: 'ok', error: emailAdmin.value.error ? String(emailAdmin.value.error) : null }
        : { status: 'fail', error: String((emailAdmin as PromiseRejectedResult).reason) },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error', detail: String(error) }, { status: 500 });
  }
}

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
      return NextResponse.json({ error: 'Reserva no encontrada', detail: error?.message }, { status: 404 });
    }

    // Actualizar estado a confirmada si estaba pendiente
    if (reserva.estado === 'pendiente') {
      await supabase
        .from('reservas')
        .update({ estado: 'confirmada' })
        .eq('id', reserva.id);
    }

    // Enviar emails y WhatsApp
    const [emailCliente, emailAdmin, whatsapp] = await Promise.allSettled([
      enviarEmailConfirmacion(reserva),
      enviarEmailAdminNuevaReserva(reserva),
      enviarWhatsAppConfirmacion(reserva),
    ]);

    const resultado = (r: PromiseSettledResult<{ data: unknown; error: unknown }>) =>
      r.status === 'fulfilled'
        ? { status: r.value.error ? 'error' : 'enviado', error: r.value.error ? String(r.value.error) : null }
        : { status: 'error', error: String((r as PromiseRejectedResult).reason) };

    return NextResponse.json({
      ok: true,
      emailCliente: resultado(emailCliente),
      emailAdmin: resultado(emailAdmin),
      whatsapp: resultado(whatsapp),
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('Error enviando notificaciones:', errMsg);
    return NextResponse.json({ error: 'Error interno', detail: errMsg }, { status: 500 });
  }
}
