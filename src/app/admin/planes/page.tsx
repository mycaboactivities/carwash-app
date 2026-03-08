'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plan } from '@/types';

const planVacio = {
  nombre: '', descripcion: '', precio: 0, duracion_min: 60, activo: true,
};

export default function PlanesPage() {
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<string | null>(null);
  const [form, setForm] = useState(planVacio);
  const [cargando, setCargando] = useState(false);

  async function cargar() {
    const { data } = await supabase.from('planes').select('*').order('precio');
    if (data) setPlanes(data);
  }

  useEffect(() => { cargar(); }, []);

  function abrirNuevo() {
    setEditando(null);
    setForm(planVacio);
    setModal(true);
  }

  function abrirEditar(plan: Plan) {
    setEditando(plan.id);
    setForm({
      nombre: plan.nombre,
      descripcion: plan.descripcion,
      precio: plan.precio,
      duracion_min: plan.duracion_min,
      activo: plan.activo,
    });
    setModal(true);
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    if (editando) {
      await supabase.from('planes').update(form).eq('id', editando);
    } else {
      await supabase.from('planes').insert(form);
    }
    setModal(false);
    setCargando(false);
    cargar();
  }

  async function toggleActivo(id: string, activo: boolean) {
    await supabase.from('planes').update({ activo: !activo }).eq('id', id);
    cargar();
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Planes de lavado</h1>
        <button onClick={abrirNuevo} className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800">
          + Nuevo plan
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {planes.map((plan) => (
          <div key={plan.id} className={`bg-white rounded-xl border p-5 ${plan.activo ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-900">{plan.nombre}</h3>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                plan.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {plan.activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3">{plan.descripcion}</p>
            <p className="text-2xl font-bold text-blue-700 mb-1">${plan.precio.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mb-4">Duracion: ~{plan.duracion_min} min</p>
            <div className="flex gap-2">
              <button onClick={() => abrirEditar(plan)} className="text-blue-700 hover:underline text-xs">Editar</button>
              <button onClick={() => toggleActivo(plan.id, plan.activo)} className="text-gray-500 hover:underline text-xs">
                {plan.activo ? 'Desactivar' : 'Activar'}
              </button>
            </div>
          </div>
        ))}
        {planes.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-8">No hay planes registrados</div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setModal(false)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editando ? 'Editar plan' : 'Nuevo plan'}
            </h2>
            <form onSubmit={guardar} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Nombre *</label>
                <input type="text" required value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Descripcion</label>
                <textarea value={form.descripcion} rows={3}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  placeholder="Incluye lavado exterior, aspirado interior..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Precio *</label>
                  <input type="number" required min="0" step="0.01" value={form.precio}
                    onChange={(e) => setForm({ ...form, precio: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Duracion (min)</label>
                  <input type="number" min="15" value={form.duracion_min}
                    onChange={(e) => setForm({ ...form, duracion_min: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="plan-activo" checked={form.activo}
                  onChange={(e) => setForm({ ...form, activo: e.target.checked })}
                  className="rounded border-gray-300" />
                <label htmlFor="plan-activo" className="text-sm text-gray-600">Activo</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
                  Cancelar
                </button>
                <button type="submit" disabled={cargando}
                  className="flex-1 bg-blue-700 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-50">
                  {cargando ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
