'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Reserva, EstadoReserva, Edificio } from '@/types';

const estadoColores: Record<EstadoReserva, string> = {
  pendiente: 'bg-yellow-100 text-yellow-700',
  confirmada: 'bg-blue-100 text-blue-700',
  en_proceso: 'bg-purple-100 text-purple-700',
  completada: 'bg-green-100 text-green-700',
  cancelada: 'bg-red-100 text-red-700',
};

const estadoSiguiente: Record<EstadoReserva, EstadoReserva | null> = {
  pendiente: 'confirmada',
  confirmada: 'en_proceso',
  en_proceso: 'completada',
  completada: null,
  cancelada: null,
};

export default function ReservasPage() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [edificios, setEdificios] = useState<Edificio[]>([]);
  const [filtroEdificio, setFiltroEdificio] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [detalle, setDetalle] = useState<Reserva | null>(null);

  async function cargar() {
    let query = supabase
      .from('reservas')
      .select('*, edificio:edificios(*), plan:planes(*)')
      .order('fecha', { ascending: false })
      .order('hora_inicio');

    if (filtroEdificio) query = query.eq('edificio_id', filtroEdificio);
    if (filtroEstado) query = query.eq('estado', filtroEstado);
    if (filtroFecha) query = query.eq('fecha', filtroFecha);

    const { data } = await query;
    if (data) setReservas(data);
  }

  useEffect(() => {
    supabase.from('edificios').select('*').then(({ data }) => {
      if (data) setEdificios(data);
    });
  }, []);

  useEffect(() => { cargar(); }, [filtroEdificio, filtroEstado, filtroFecha]);

  async function cambiarEstado(id: string, nuevoEstado: EstadoReserva) {
    await supabase.from('reservas').update({ estado: nuevoEstado }).eq('id', id);
    cargar();
    if (detalle?.id === id) {
      setDetalle({ ...detalle, estado: nuevoEstado });
    }
  }

  async function cancelarReserva(id: string) {
    await supabase.from('reservas').update({ estado: 'cancelada' }).eq('id', id);
    cargar();
    setDetalle(null);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Reservas</h1>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Edificio</label>
            <select value={filtroEdificio} onChange={(e) => setFiltroEdificio(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900">
              <option value="">Todos</option>
              {edificios.map((ed) => (
                <option key={ed.id} value={ed.id}>{ed.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Estado</label>
            <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900">
              <option value="">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="confirmada">Confirmada</option>
              <option value="en_proceso">En proceso</option>
              <option value="completada">Completada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Fecha</label>
            <input type="date" value={filtroFecha} onChange={(e) => setFiltroFecha(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900" />
          </div>
        </div>
      </div>

      {/* Lista de reservas */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Cliente</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Edificio</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Plan</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Total</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reservas.map((r) => {
                const siguiente = estadoSiguiente[r.estado];
                return (
                  <tr key={r.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3">
                      <button onClick={() => setDetalle(r)} className="font-medium text-gray-900 hover:text-blue-700">
                        {r.cliente_nombre}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{r.edificio?.nombre}</td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{r.plan?.nombre}</td>
                    <td className="px-4 py-3 text-gray-600">{r.fecha}<br/><span className="text-xs">{r.hora_inicio.slice(0, 5)}</span></td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${estadoColores[r.estado]}`}>
                        {r.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-900 font-medium hidden lg:table-cell">${r.total_pagado.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      {siguiente && (
                        <button onClick={() => cambiarEstado(r.id, siguiente)}
                          className="text-blue-700 hover:underline text-xs">
                          → {siguiente}
                        </button>
                      )}
                      {r.estado !== 'cancelada' && r.estado !== 'completada' && (
                        <button onClick={() => cancelarReserva(r.id)}
                          className="text-red-600 hover:underline text-xs">
                          Cancelar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {reservas.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No hay reservas</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de detalle */}
      {detalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setDetalle(null)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900">Detalle de reserva</h2>
              <button onClick={() => setDetalle(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Estado</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${estadoColores[detalle.estado]}`}>{detalle.estado}</span>
              </div>
              <hr />
              <div className="flex justify-between"><span className="text-gray-500">Cliente</span><span className="font-medium text-gray-900">{detalle.cliente_nombre}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="text-gray-900">{detalle.cliente_email}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Telefono</span><span className="text-gray-900">{detalle.cliente_telefono}</span></div>
              <hr />
              <div className="flex justify-between"><span className="text-gray-500">Edificio</span><span className="text-gray-900">{detalle.edificio?.nombre}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Plan</span><span className="text-gray-900">{detalle.plan?.nombre}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Fecha</span><span className="text-gray-900">{detalle.fecha}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Hora</span><span className="text-gray-900">{detalle.hora_inicio.slice(0, 5)}</span></div>
              <hr />
              <div className="flex justify-between"><span className="text-gray-500">Auto</span><span className="text-gray-900">{detalle.marca_auto} {detalle.modelo_auto}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Color</span><span className="text-gray-900">{detalle.color_auto}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Placas</span><span className="text-gray-900">{detalle.placa_auto}</span></div>
              {detalle.notas && (
                <div><span className="text-gray-500 block mb-1">Notas</span><p className="text-gray-900">{detalle.notas}</p></div>
              )}
              <hr />
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="text-gray-900">${(detalle.total_pagado - detalle.propina).toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Propina</span><span className="text-gray-900">${detalle.propina.toFixed(2)}</span></div>
              <div className="flex justify-between font-bold"><span className="text-gray-700">Total</span><span className="text-blue-700">${detalle.total_pagado.toFixed(2)}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
