import { Resend } from 'resend';
import twilio from 'twilio';
import { Reserva } from '@/types';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

function getTwilioClient() {
  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

export async function enviarEmailConfirmacion(reserva: Reserva) {
  const { data, error } = await getResend().emails.send({
    from: 'CarWash <noreply@tucarwash.com>',
    to: reserva.cliente_email,
    subject: 'Confirmacion de tu reserva - CarWash',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1e40af;">Reserva Confirmada</h1>
        <p>Hola <strong>${reserva.cliente_nombre}</strong>,</p>
        <p>Tu reserva ha sido confirmada con los siguientes detalles:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Edificio</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${reserva.edificio?.nombre || ''}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Plan</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${reserva.plan?.nombre || ''}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Fecha</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${reserva.fecha}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Hora</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${reserva.hora_inicio}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Auto</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${reserva.marca_auto} ${reserva.modelo_auto} - ${reserva.color_auto}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Total pagado</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">$${reserva.total_pagado.toFixed(2)}</td></tr>
        </table>
        <p style="color: #6b7280;">Gracias por tu preferencia.</p>
      </div>
    `,
  });

  if (error) console.error('Error enviando email:', error);
  return { data, error };
}

export async function enviarEmailAdminNuevaReserva(reserva: Reserva) {
  const adminEmail = process.env.ADMIN_EMAIL!;
  const { data, error } = await getResend().emails.send({
    from: 'CarWash <noreply@tucarwash.com>',
    to: adminEmail,
    subject: `Nueva reserva - ${reserva.cliente_nombre}`,
    html: `
      <div style="font-family: sans-serif;">
        <h2>Nueva Reserva Recibida</h2>
        <p><strong>Cliente:</strong> ${reserva.cliente_nombre}</p>
        <p><strong>Email:</strong> ${reserva.cliente_email}</p>
        <p><strong>Telefono:</strong> ${reserva.cliente_telefono}</p>
        <p><strong>Edificio:</strong> ${reserva.edificio?.nombre || ''}</p>
        <p><strong>Plan:</strong> ${reserva.plan?.nombre || ''}</p>
        <p><strong>Fecha:</strong> ${reserva.fecha} a las ${reserva.hora_inicio}</p>
        <p><strong>Auto:</strong> ${reserva.marca_auto} ${reserva.modelo_auto} ${reserva.color_auto} - ${reserva.placa_auto}</p>
        <p><strong>Total:</strong> $${reserva.total_pagado.toFixed(2)} (propina: $${reserva.propina.toFixed(2)})</p>
      </div>
    `,
  });

  if (error) console.error('Error enviando email admin:', error);
  return { data, error };
}

export async function enviarWhatsAppConfirmacion(reserva: Reserva) {
  try {
    const message = await getTwilioClient().messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM!,
      to: `whatsapp:${reserva.cliente_telefono}`,
      body: `Hola ${reserva.cliente_nombre}! Tu reserva de lavado ha sido confirmada.\n\nDetalles:\nEdificio: ${reserva.edificio?.nombre || ''}\nPlan: ${reserva.plan?.nombre || ''}\nFecha: ${reserva.fecha}\nHora: ${reserva.hora_inicio}\nTotal: $${reserva.total_pagado.toFixed(2)}\n\nGracias por tu preferencia!`,
    });
    return { data: message, error: null };
  } catch (error) {
    console.error('Error enviando WhatsApp:', error);
    return { data: null, error };
  }
}
