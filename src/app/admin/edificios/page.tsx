'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Edificio } from '@/types';

const edificioVacio = {
  nombre: '', direccion: '', horario_inicio: '08:00', horario_fin: '18:00',
  duracion_slot_min: 60, capacidad_simultanea: 1, activo: true,
};

export default function EdificiosPage() {
  const [edificios, setEdificios] = useState<Edificio[]>([]);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<string | null>(null);
  const [form, setForm] = useState(edificioVacio);
  const [cargando, setCargando] = useState(false);

  async function cargar() {
    const { data } = await supabase.from('edificios').select('*').order('created_at', { ascending: false });
    if (data) setEdificios(data);
  }

  useEffect(() => { cargar(); }, []);

  function abrirNuevo() {
    setEditando(null);
    setForm(edificioVacio);
    setModal(true);
  }

  function abrirEditar(ed: Edificio) {
    setEditando(ed.id);
    setForm({
      nombre: ed.nombre,
      direccion: ed.direccion,
      horario_inicio: ed.horario_inicio.slice(0, 5),
      horario_fin: ed.horario_fin.slice(0, 5),
      duracion_slot_min: ed.duracion_slot_min,
      capacidad_simultanea: ed.capacidad_simultanea,
      activo: ed.activo,
    });
    setModal(true);
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    if (editando) {
      await supabase.from('edificios').update(form).eq('id', editando);
    } else {
      await supabase.from('edificios').insert(form);
    }
    setModal(false);
    setCargando(false);
    cargar();
  }

  async function toggleActivo(id: string, activo: boolean) {
    await supabase.from('edificios').update({ activo: !activo }).eq('id', id);
    cargar();
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edificios</h1>
        <button onClick={abrirNuevo} className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800">
          + Nuevo edificio
        </button>
      </div>

      {/* Lista */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Direccion</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Horario</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {edificios.map((ed) => (
                <tr key={ed.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-gray-900">{ed.nombre}</td>
                  <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{ed.direccion}</td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                    {ed.horario_inicio.slice(0, 5)} - {ed.horario_fin.slice(0, 5)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      ed.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {ed.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => abrirEditar(ed)} className="text-blue-700 hover:underline text-xs">Editar</button>
                    <button onClick={() => toggleActivo(ed.id, ed.activo)} className="text-gray-500 hover:underline text-xs">
                      {ed.activo ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
              {edificios.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No hay edificios registrados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setModal(false)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editando ? 'Editar edificio' : 'Nuevo edificio'}
            </h2>
            <form onSubmit={guardar} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Nombre *</label>
                <input type="text" required value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Direccion *</label>
                <input type="text" required value={form.direccion}
                  onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Hora inicio</label>
                  <input type="time" value={form.horario_inicio}
                    onChange={(e) => setForm({ ...form, horario_inicio: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Hora fin</label>
                  <input type="time" value={form.horario_fin}
                    onChange={(e) => setForm({ ...form, horario_fin: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Duracion slot (min)</label>
                  <input type="number" min="15" value={form.duracion_slot_min}
                    onChange={(e) => setForm({ ...form, duracion_slot_min: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Capacidad simultanea</label>
                  <input type="number" min="1" value={form.capacidad_simultanea}
                    onChange={(e) => setForm({ ...form, capacidad_simultanea: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="activo" checked={form.activo}
                  onChange={(e) => setForm({ ...form, activo: e.target.checked })}
                  className="rounded border-gray-300" />
                <label htmlFor="activo" className="text-sm text-gray-600">Activo</label>
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
