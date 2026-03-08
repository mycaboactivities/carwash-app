import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { createClipCheckout } from '@/lib/clip';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      edificio_id, plan_id, fecha, hora_inicio,
      cliente_nombre, cliente_email, cliente_telefono,
      marca_auto, modelo_auto, color_auto, placa_auto,
      propina, notas,
    } = body;

    // Validar campos requeridos
    if (!edificio_id || !plan_id || !fecha || !hora_inicio || !cliente_nombre || !cliente_email || !cliente_telefono || !marca_auto || !modelo_auto || !color_auto || !placa_auto) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    // Obtener plan para el precio
    const { data: plan, error: planError } = await supabase
      .from('planes')
      .select('*')
      .eq('id', plan_id)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ error: 'Plan no encontrado' }, { status: 404 });
    }

    // Obtener edificio para el nombre
    const { data: edificio } = await supabase
      .from('edificios')
      .select('nombre')
      .eq('id', edificio_id)
      .single();

    const totalPropina = Math.max(0, propina || 0);
    const totalPagar = plan.precio + totalPropina;

    // Generar numero de confirmacion: CW-DDMM-XXXX
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const hex = randomUUID().slice(0, 4).toUpperCase();
    const numeroConfirmacion = `CW-${dd}${mm}-${hex}`;

    // Crear reserva pendiente (generamos UUID para no necesitar .select() que requiere permiso de lectura)
    const reservaId = randomUUID();
    const { error: reservaError } = await supabase
      .from('reservas')
      .insert({
        id: reservaId,
        edificio_id, plan_id, fecha, hora_inicio,
        cliente_nombre, cliente_email, cliente_telefono,
        marca_auto, modelo_auto, color_auto, placa_auto,
        propina: totalPropina,
        total_pagado: totalPagar,
        estado: 'pendiente',
        notas: notas || null,
        numero_confirmacion: numeroConfirmacion,
      });

    if (reservaError) {
      console.error('Error insertando reserva:', reservaError);
      return NextResponse.json({ error: 'Error al crear la reserva', detail: reservaError.message }, { status: 500 });
    }

    // Crear Clip Checkout
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const webhookToken = process.env.CLIP_WEBHOOK_TOKEN || '';

    // Expirar en 24 horas
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().replace(/\.\d{3}Z$/, 'Z');

    const clipResponse = await createClipCheckout({
      amount: totalPagar,
      description: `${plan.nombre} - ${edificio?.nombre || 'CarWash'} | ${fecha} ${hora_inicio}`,
      successUrl: `${appUrl}/confirmacion?estado=exitoso&conf=${numeroConfirmacion}&nombre=${encodeURIComponent(cliente_nombre)}&plan=${encodeURIComponent(plan.nombre)}&edificio=${encodeURIComponent(edificio?.nombre || 'CarWash')}&fecha=${fecha}&hora=${hora_inicio}&total=${totalPagar}&auto=${encodeURIComponent(marca_auto + ' ' + modelo_auto + ' ' + color_auto)}`,
      errorUrl: `${appUrl}/confirmacion?estado=cancelado`,
      defaultUrl: appUrl,
      webhookUrl: `${appUrl}/api/clip/webhook?token=${webhookToken}`,
      externalReference: reservaId,
      customerName: cliente_nombre,
      customerEmail: cliente_email,
      customerPhone: cliente_telefono,
      expiresAt,
    });

    // Guardar el payment_request_id en la reserva
    await supabase
      .from('reservas')
      .update({ clip_payment_request_id: clipResponse.payment_request_id })
      .eq('id', reservaId);

    return NextResponse.json({ url: clipResponse.payment_request_url });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('Error creando checkout Clip:', errMsg);
    return NextResponse.json({ error: 'Error interno del servidor', detail: errMsg }, { status: 500 });
  }
}
