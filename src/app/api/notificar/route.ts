import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { enviarEmailConfirmacion, enviarEmailAdminNuevaReserva } from '@/lib/notifications';

// GET para debug - visita /api/notificar?conf=CW-XXXX-XXXX en el navegador
export async function GET(request: NextRequest) {
  const conf = request.nextUrl.searchParams.get('conf');

  return NextResponse.json({
    hasGmailUser: !!process.env.GMAIL_USER,
    hasGmailPass: !!process.env.GMAIL_APP_PASSWORD,
    hasAdminEmail: !!process.env.ADMIN_EMAIL,
    gmailUser: process.env.GMAIL_USER ? process.env.GMAIL_USER.slice(0, 5) + '***' : 'NOT SET',
    conf: conf || 'no conf param',
  });
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

    // Enviar emails
    const [emailCliente, emailAdmin] = await Promise.allSettled([
      enviarEmailConfirmacion(reserva),
      enviarEmailAdminNuevaReserva(reserva),
    ]);

    const clienteResult = emailCliente.status === 'fulfilled'
      ? { status: 'enviado', error: emailCliente.value.error ? String(emailCliente.value.error) : null }
      : { status: 'error', error: String((emailCliente as PromiseRejectedResult).reason) };

    const adminResult = emailAdmin.status === 'fulfilled'
      ? { status: 'enviado', error: emailAdmin.value.error ? String(emailAdmin.value.error) : null }
      : { status: 'error', error: String((emailAdmin as PromiseRejectedResult).reason) };

    return NextResponse.json({
      ok: true,
      emailCliente: clienteResult,
      emailAdmin: adminResult,
      hasGmailUser: !!process.env.GMAIL_USER,
      hasGmailPass: !!process.env.GMAIL_APP_PASSWORD,
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('Error enviando notificaciones:', errMsg);
    return NextResponse.json({ error: 'Error interno', detail: errMsg }, { status: 500 });
  }
}
