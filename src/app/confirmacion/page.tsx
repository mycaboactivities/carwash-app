'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ConfirmacionContent() {
  const searchParams = useSearchParams();
  const estado = searchParams.get('estado');
  const conf = searchParams.get('conf');
  const notificadoRef = useRef(false);

  useEffect(() => {
    if (estado === 'exitoso' && conf && !notificadoRef.current) {
      notificadoRef.current = true;
      fetch('/api/notificar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numero_confirmacion: conf }),
      }).catch(console.error);
    }
  }, [estado, conf]);

  if (estado === 'cancelado') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Pago cancelado</h1>
          <p className="text-gray-600 mb-6">Tu reserva no se completo. Puedes intentar nuevamente.</p>
          <Link
            href="/reservar"
            className="inline-block bg-blue-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-800 transition-colors"
          >
            Intentar de nuevo
          </Link>
        </div>
      </div>
    );
  }

  const nombre = searchParams.get('nombre');
  const plan = searchParams.get('plan');
  const edificio = searchParams.get('edificio');
  const fecha = searchParams.get('fecha');
  const hora = searchParams.get('hora');
  const total = searchParams.get('total');
  const auto = searchParams.get('auto');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-lg w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Reserva confirmada</h1>
          <p className="text-gray-500 text-sm">Tu lavado ha sido reservado exitosamente</p>
        </div>

        {(nombre || plan) && (
          <div className="bg-gray-50 rounded-xl p-5 mb-6 space-y-3">
            {nombre && (
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Cliente</span>
                <span className="text-gray-900 font-medium text-sm">{nombre}</span>
              </div>
            )}
            {plan && (
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Plan</span>
                <span className="text-gray-900 font-medium text-sm">{plan}</span>
              </div>
            )}
            {edificio && (
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Ubicacion</span>
                <span className="text-gray-900 font-medium text-sm">{edificio}</span>
              </div>
            )}
            {fecha && (
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Fecha</span>
                <span className="text-gray-900 font-medium text-sm">{fecha}</span>
              </div>
            )}
            {hora && (
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Hora</span>
                <span className="text-gray-900 font-medium text-sm">{hora}</span>
              </div>
            )}
            {auto && (
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Auto</span>
                <span className="text-gray-900 font-medium text-sm">{auto}</span>
              </div>
            )}
            {total && (
              <div className="border-t border-gray-200 pt-3 flex justify-between">
                <span className="text-gray-900 font-semibold">Total pagado</span>
                <span className="text-gray-900 font-bold">${parseFloat(total).toFixed(2)} MXN</span>
              </div>
            )}
          </div>
        )}

        <p className="text-sm text-gray-500 text-center mb-6">
          Recibiras un email y un mensaje de WhatsApp con los detalles de tu reserva.
        </p>

        <div className="text-center">
          <Link
            href="/"
            className="inline-block bg-blue-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-800 transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmacionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Cargando...</p></div>}>
      <ConfirmacionContent />
    </Suspense>
  );
}
