'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

import { Reserva } from '@/types';

interface DashboardStats {
  reservasHoy: number;
  reservasPendientes: number;
  ingresosHoy: number;
  totalEdificios: number;
}

const estadoColores: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-700',
  confirmada: 'bg-blue-100 text-blue-700',
  en_proceso: 'bg-purple-100 text-purple-700',
  completada: 'bg-green-100 text-green-700',
  cancelada: 'bg-red-100 text-red-700',
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    reservasHoy: 0,
    reservasPendientes: 0,
    ingresosHoy: 0,
    totalEdificios: 0,
  });
  const [proximasReservas, setProximasReservas] = useState<Reserva[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      const hoy = new Date().toISOString().split('T')[0];

      const [reservasHoyRes, pendientesRes, edificiosRes, proximasRes] = await Promise.all([
        supabase
          .from('reservas')
          .select('total_pagado')
          .eq('fecha', hoy)
          .neq('estado', 'cancelada'),
        supabase
          .from('reservas')
          .select('id', { count: 'exact' })
          .in('estado', ['pendiente', 'confirmada']),
        supabase
          .from('edificios')
          .select('id', { count: 'exact' })
          .eq('activo', true),
        supabase
          .from('reservas')
          .select('*, edificio:edificios(nombre), plan:planes(nombre)')
          .gte('fecha', hoy)
          .neq('estado', 'cancelada')
          .order('fecha', { ascending: true })
          .order('hora_inicio', { ascending: true })
          .limit(10),
      ]);

      // Debug: si hay error en alguna query
      if (reservasHoyRes.error || pendientesRes.error || edificiosRes.error || proximasRes.error) {
        const errores = [
          reservasHoyRes.error?.message,
          pendientesRes.error?.message,
          edificiosRes.error?.message,
          proximasRes.error?.message,
        ].filter(Boolean).join(', ');
        setError(errores);
      }

      const reservasHoy = reservasHoyRes.data || [];
      const ingresosHoy = reservasHoy.reduce((sum, r) => sum + (r.total_pagado || 0), 0);

      setStats({
        reservasHoy: reservasHoy.length,
        reservasPendientes: pendientesRes.count || 0,
        ingresosHoy,
        totalEdificios: edificiosRes.count || 0,
      });

      setProximasReservas((proximasRes.data as Reserva[]) || []);
    }
    loadStats();
  }, []);

  const cards = [
    { label: 'Reservas hoy', value: stats.reservasHoy, color: 'bg-blue-50 text-blue-700' },
    { label: 'Pendientes', value: stats.reservasPendientes, color: 'bg-yellow-50 text-yellow-700' },
    { label: 'Ingresos hoy', value: `$${stats.ingresosHoy.toFixed(2)}`, color: 'bg-green-50 text-green-700' },
    { label: 'Edificios activos', value: stats.totalEdificios, color: 'bg-purple-50 text-purple-700' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6 text-sm">
          <strong>Error al cargar datos:</strong> {error}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className={`rounded-xl p-5 ${card.color}`}>
            <p className="text-sm font-medium opacity-80">{card.label}</p>
            <p className="text-2xl font-bold mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Próximas reservas */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Próximas reservas</h2>
        </div>
        {proximasReservas.length === 0 ? (
          <p className="px-5 py-8 text-center text-gray-500 text-sm">No hay reservas próximas</p>
        ) : (
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
                </tr>
              </thead>
              <tbody>
                {proximasReservas.map((r) => (
                  <tr key={r.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3 font-medium text-gray-900">{r.cliente_nombre}</td>
                    <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{r.edificio?.nombre}</td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{r.plan?.nombre}</td>
                    <td className="px-4 py-3 text-gray-600">{r.fecha}<br/><span className="text-xs">{r.hora_inicio?.slice(0, 5)}</span></td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${estadoColores[r.estado] || 'bg-gray-100 text-gray-700'}`}>
                        {r.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-900 font-medium hidden lg:table-cell">${r.total_pagado?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
