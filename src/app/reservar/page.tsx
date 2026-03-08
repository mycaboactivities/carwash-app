'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Edificio, Plan, SlotDisponible } from '@/types';
import Link from 'next/link';

type Paso = 1 | 2 | 3 | 4 | 5;

function ReservarContent() {
  const searchParams = useSearchParams();
  const planIdParam = searchParams.get('plan');

  const [paso, setPaso] = useState<Paso>(1);
  const [edificios, setEdificios] = useState<Edificio[]>([]);
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [slots, setSlots] = useState<SlotDisponible[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  // Selecciones
  const [edificioId, setEdificioId] = useState('');
  const [planId, setPlanId] = useState(planIdParam || '');
  const [fecha, setFecha] = useState('');
  const [horaInicio, setHoraInicio] = useState('');

  // Datos del cliente
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [marcaAuto, setMarcaAuto] = useState('');
  const [modeloAuto, setModeloAuto] = useState('');
  const [colorAuto, setColorAuto] = useState('');
  const [placaAuto, setPlacaAuto] = useState('');
  const [notas, setNotas] = useState('');

  // Propina
  const [tipoPropina, setTipoPropina] = useState<'porcentaje' | 'custom' | 'none'>('none');
  const [porcentajePropina, setPorcentajePropina] = useState(0);
  const [propinaCustom, setPropinaCustom] = useState('');

  const planSeleccionado = planes.find((p) => p.id === planId);
  const edificioSeleccionado = edificios.find((e) => e.id === edificioId);

  const propina = tipoPropina === 'porcentaje'
    ? (planSeleccionado?.precio || 0) * (porcentajePropina / 100)
    : tipoPropina === 'custom'
    ? (Number(propinaCustom) || 0)
    : 0;

  const total = (planSeleccionado?.precio || 0) + propina;

  useEffect(() => {
    async function loadData() {
      const [edRes, plRes] = await Promise.all([
        supabase.from('edificios').select('*').eq('activo', true),
        supabase.from('planes').select('*').eq('activo', true).order('precio'),
      ]);
      if (edRes.data) setEdificios(edRes.data);
      if (plRes.data) setPlanes(plRes.data);
    }
    loadData();
  }, []);

  const cargarDisponibilidad = useCallback(async () => {
    if (!edificioId || !fecha) return;
    setCargando(true);
    try {
      const res = await fetch(`/api/disponibilidad?edificio_id=${edificioId}&fecha=${fecha}`);
      const data = await res.json();
      setSlots(data.slots || []);
    } catch {
      setSlots([]);
    }
    setCargando(false);
  }, [edificioId, fecha]);

  useEffect(() => {
    if (paso === 3 && edificioId && fecha) {
      cargarDisponibilidad();
    }
  }, [paso, edificioId, fecha, cargarDisponibilidad]);

  const hoy = new Date().toISOString().split('T')[0];

  async function handlePago() {
    setError('');
    setCargando(true);
    try {
      const res = await fetch('/api/clip/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          edificio_id: edificioId,
          plan_id: planId,
          fecha,
          hora_inicio: horaInicio,
          cliente_nombre: nombre,
          cliente_email: email,
          cliente_telefono: telefono,
          marca_auto: marcaAuto,
          modelo_auto: modeloAuto,
          color_auto: colorAuto,
          placa_auto: placaAuto,
          propina: Math.round(propina * 100) / 100,
          notas,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Error al crear la sesion de pago');
      }
    } catch {
      setError('Error de conexion. Intenta de nuevo.');
    }
    setCargando(false);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-blue-700">CarWash Pro</Link>
          <span className="text-sm text-gray-500">Paso {paso} de 5</span>
        </div>
      </nav>

      {/* Progress bar */}
      <div className="max-w-3xl mx-auto px-4 mt-6 mb-8">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((p) => (
            <div
              key={p}
              className={`h-2 flex-1 rounded-full transition-colors ${
                p <= paso ? 'bg-blue-700' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-16">
        {/* Paso 1: Seleccionar edificio */}
        {paso === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Selecciona tu edificio</h2>
            <div className="grid gap-4">
              {edificios.map((ed) => (
                <button
                  key={ed.id}
                  onClick={() => { setEdificioId(ed.id); setPaso(2); }}
                  className={`text-left p-5 rounded-xl border-2 transition-all ${
                    edificioId === ed.id
                      ? 'border-blue-700 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <h3 className="font-semibold text-gray-900">{ed.nombre}</h3>
                  <p className="text-sm text-gray-600 mt-1">{ed.direccion}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Horario: {ed.horario_inicio.slice(0, 5)} - {ed.horario_fin.slice(0, 5)}
                  </p>
                </button>
              ))}
              {edificios.length === 0 && (
                <p className="text-gray-500 text-center py-8">No hay edificios disponibles en este momento.</p>
              )}
            </div>
          </div>
        )}

        {/* Paso 2: Seleccionar plan */}
        {paso === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Elige tu plan de lavado</h2>
            <div className="grid gap-4">
              {planes.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => { setPlanId(plan.id); setPaso(3); }}
                  className={`text-left p-5 rounded-xl border-2 transition-all ${
                    planId === plan.id
                      ? 'border-blue-700 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{plan.nombre}</h3>
                      <p className="text-sm text-gray-600 mt-1">{plan.descripcion}</p>
                      <p className="text-xs text-gray-500 mt-2">Duracion: ~{plan.duracion_min} min</p>
                    </div>
                    <span className="text-2xl font-bold text-blue-700">${plan.precio.toFixed(2)}</span>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => setPaso(1)} className="mt-6 text-sm text-gray-500 hover:text-blue-700">
              ← Volver
            </button>
          </div>
        )}

        {/* Paso 3: Fecha y hora */}
        {paso === 3 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Elige fecha y hora</h2>
            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
              <input
                type="date"
                min={hoy}
                value={fecha}
                onChange={(e) => { setFecha(e.target.value); setHoraInicio(''); }}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900"
              />
            </div>

            {fecha && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <label className="block text-sm font-medium text-gray-700 mb-3">Horario disponible</label>
                {cargando ? (
                  <p className="text-gray-500 text-center py-4">Cargando disponibilidad...</p>
                ) : slots.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No hay horarios disponibles para esta fecha.</p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {slots.map((slot) => (
                      <button
                        key={slot.hora}
                        disabled={!slot.disponible}
                        onClick={() => setHoraInicio(slot.hora)}
                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                          !slot.disponible
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : horaInicio === slot.hora
                            ? 'bg-blue-700 text-white'
                            : 'bg-gray-50 text-gray-900 hover:bg-blue-50 hover:text-blue-700 border border-gray-200'
                        }`}
                      >
                        {slot.hora}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between mt-6">
              <button onClick={() => setPaso(2)} className="text-sm text-gray-500 hover:text-blue-700">
                ← Volver
              </button>
              <button
                disabled={!horaInicio}
                onClick={() => setPaso(4)}
                className="bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* Paso 4: Datos del cliente */}
        {paso === 4 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Tus datos</h2>
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <h3 className="font-medium text-gray-900">Datos personales</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Nombre completo *</label>
                  <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Email *</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Telefono (WhatsApp) *</label>
                  <input type="tel" value={telefono} onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 12);
                      let formatted = '';
                      if (digits.length > 0) formatted = '+' + digits.slice(0, 2);
                      if (digits.length > 2) formatted += ' ' + digits.slice(2, 5);
                      if (digits.length > 5) formatted += '-' + digits.slice(5, 8);
                      if (digits.length > 8) formatted += '-' + digits.slice(8, 12);
                      setTelefono(formatted);
                    }}
                    placeholder="+52 624-108-3291"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900" />
                </div>
              </div>

              <h3 className="font-medium text-gray-900 pt-4">Datos del auto</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Marca *</label>
                  <input type="text" value={marcaAuto} onChange={(e) => setMarcaAuto(e.target.value)}
                    placeholder="Toyota, Honda, etc."
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Modelo *</label>
                  <input type="text" value={modeloAuto} onChange={(e) => setModeloAuto(e.target.value)}
                    placeholder="Corolla, Civic, etc."
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Color *</label>
                  <input type="text" value={colorAuto} onChange={(e) => setColorAuto(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Placas *</label>
                  <input type="text" value={placaAuto} onChange={(e) => setPlacaAuto(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900" />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Notas adicionales (opcional)</label>
                <textarea value={notas} onChange={(e) => setNotas(e.target.value)}
                  rows={2} placeholder="Ej: El auto esta en el nivel 3, cajon 45"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900" />
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button onClick={() => setPaso(3)} className="text-sm text-gray-500 hover:text-blue-700">
                ← Volver
              </button>
              <button
                disabled={!nombre || !email || !telefono || !marcaAuto || !modeloAuto || !colorAuto || !placaAuto}
                onClick={() => setPaso(5)}
                className="bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* Paso 5: Resumen y propina */}
        {paso === 5 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Resumen de tu reserva</h2>

            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Edificio</span>
                <span className="font-medium text-gray-900">{edificioSeleccionado?.nombre}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Plan</span>
                <span className="font-medium text-gray-900">{planSeleccionado?.nombre}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Fecha</span>
                <span className="font-medium text-gray-900">{fecha}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Hora</span>
                <span className="font-medium text-gray-900">{horaInicio}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Auto</span>
                <span className="font-medium text-gray-900">{marcaAuto} {modeloAuto} - {colorAuto}</span>
              </div>
              <hr />
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Lavado</span>
                <span className="font-medium text-gray-900">${planSeleccionado?.precio.toFixed(2)}</span>
              </div>
            </div>

            {/* Propina */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
              <h3 className="font-medium text-gray-900 mb-3">Agrega una propina (opcional)</h3>
              <div className="flex gap-2 mb-3">
                {[10, 15, 20].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => { setTipoPropina('porcentaje'); setPorcentajePropina(pct); }}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                      tipoPropina === 'porcentaje' && porcentajePropina === pct
                        ? 'bg-blue-700 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
                <button
                  onClick={() => setTipoPropina('custom')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    tipoPropina === 'custom'
                      ? 'bg-blue-700 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Otro
                </button>
              </div>
              {tipoPropina === 'custom' && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">$</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={propinaCustom}
                    placeholder="0"
                    onChange={(e) => setPropinaCustom(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900"
                  />
                </div>
              )}
              <p className="text-sm text-gray-500 mt-2">
                Propina: ${propina.toFixed(2)}
              </p>
            </div>

            {/* Total */}
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-5 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total a pagar</span>
                <span className="text-2xl font-bold text-blue-700">${total.toFixed(2)}</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-between">
              <button onClick={() => setPaso(4)} className="text-sm text-gray-500 hover:text-blue-700">
                ← Volver
              </button>
              <button
                onClick={handlePago}
                disabled={cargando}
                className="bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 disabled:opacity-50 transition-colors"
              >
                {cargando ? 'Procesando...' : 'Continuar al pago'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReservarPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Cargando...</p></div>}>
      <ReservarContent />
    </Suspense>
  );
}
