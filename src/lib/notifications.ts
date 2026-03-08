import nodemailer from 'nodemailer';
import twilio from 'twilio';
import { Reserva } from '@/types';

function getMailTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

function getTwilioClient() {
  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

export async function enviarEmailConfirmacion(reserva: Reserva) {
  try {
    const transporter = getMailTransporter();
    const info = await transporter.sendMail({
      from: `"CarWash Pro" <${process.env.GMAIL_USER}>`,
      to: reserva.cliente_email,
      subject: `Reserva Confirmada - ${reserva.numero_confirmacion || 'CarWash'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px;">
          <div style="background: #1e40af; color: white; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Reserva Confirmada</h1>
            <p style="margin: 5px 0 0; opacity: 0.9;">${reserva.numero_confirmacion || ''}</p>
          </div>
          <div style="background: white; padding: 24px; border-radius: 0 0 12px 12px;">
            <p style="color: #374151; font-size: 16px;">Hola <strong>${reserva.cliente_nombre}</strong>,</p>
            <p style="color: #6b7280;">Tu reserva ha sido confirmada con los siguientes detalles:</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr><td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Edificio</td><td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #111827;">${reserva.edificio?.nombre || ''}</td></tr>
              <tr><td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Plan</td><td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #111827;">${reserva.plan?.nombre || ''}</td></tr>
              <tr><td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Fecha</td><td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #111827;">${reserva.fecha}</td></tr>
              <tr><td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Hora</td><td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #111827;">${reserva.hora_inicio}</td></tr>
              <tr><td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Auto</td><td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #111827;">${reserva.marca_auto} ${reserva.modelo_auto} - ${reserva.color_auto}</td></tr>
              <tr><td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Placas</td><td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #111827;">${reserva.placa_auto}</td></tr>
              <tr><td style="padding: 10px; color: #6b7280;">Total pagado</td><td style="padding: 10px; font-weight: bold; color: #1e40af; font-size: 18px;">$${reserva.total_pagado.toFixed(2)} MXN</td></tr>
            </table>
            <p style="color: #6b7280; font-size: 14px;">Gracias por tu preferencia. Te esperamos!</p>
          </div>
        </div>
      `,
    });
    return { data: info, error: null };
  } catch (error) {
    console.error('Error enviando email confirmacion:', error);
    return { data: null, error };
  }
}

export async function enviarEmailAdminNuevaReserva(reserva: Reserva) {
  try {
    const transporter = getMailTransporter();
    const info = await transporter.sendMail({
      from: `"CarWash Pro" <${process.env.GMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL || process.env.GMAIL_USER!,
      subject: `Nueva Reserva - ${reserva.cliente_nombre} | ${reserva.fecha} ${reserva.hora_inicio}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e40af;">Nueva Reserva Recibida</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Cliente</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${reserva.cliente_nombre}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Email</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${reserva.cliente_email}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Telefono</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${reserva.cliente_telefono}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Edificio</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${reserva.edificio?.nombre || ''}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Plan</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${reserva.plan?.nombre || ''}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Fecha/Hora</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${reserva.fecha} a las ${reserva.hora_inicio}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Auto</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${reserva.marca_auto} ${reserva.modelo_auto} ${reserva.color_auto} - ${reserva.placa_auto}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Total</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">$${reserva.total_pagado.toFixed(2)} (propina: $${reserva.propina.toFixed(2)})</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Confirmacion</td><td style="padding: 8px;">${reserva.numero_confirmacion || 'N/A'}</td></tr>
          </table>
        </div>
      `,
    });
    return { data: info, error: null };
  } catch (error) {
    console.error('Error enviando email admin:', error);
    return { data: null, error };
  }
}

export async function enviarWhatsAppConfirmacion(reserva: Reserva) {
  try {
    const message = await getTwilioClient().messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM!,
      to: `whatsapp:${reserva.cliente_telefono}`,
      body: `*CarWash Pro - Reserva Confirmada*\n\nHola ${reserva.cliente_nombre}! Tu reserva ha sido confirmada.\n\n*Detalles:*\nEdificio: ${reserva.edificio?.nombre || ''}\nPlan: ${reserva.plan?.nombre || ''}\nFecha: ${reserva.fecha}\nHora: ${reserva.hora_inicio}\nAuto: ${reserva.marca_auto} ${reserva.modelo_auto} ${reserva.color_auto}\nTotal: $${reserva.total_pagado.toFixed(2)} MXN\nConfirmacion: ${reserva.numero_confirmacion || 'N/A'}\n\nGracias por tu preferencia!`,
    });
    return { data: message, error: null };
  } catch (error) {
    console.error('Error enviando WhatsApp:', error);
    return { data: null, error };
  }
}
