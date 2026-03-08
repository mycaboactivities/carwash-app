'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Edificio, Plan } from '@/types';
import Link from 'next/link';

export default function LandingPage() {
  const [edificios, setEdificios] = useState<Edificio[]>([]);
  const [planes, setPlanes] = useState<Plan[]>([]);

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

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="text-xl font-bold text-blue-700">CarWash Pro</span>
          <div className="flex gap-4 items-center">
            <a href="#nosotros" className="text-sm text-gray-600 hover:text-blue-700 hidden sm:block">Nosotros</a>
            <a href="#ubicaciones" className="text-sm text-gray-600 hover:text-blue-700 hidden sm:block">Ubicaciones</a>
            <a href="#planes" className="text-sm text-gray-600 hover:text-blue-700 hidden sm:block">Planes</a>
            <Link
              href="/reservar"
              className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors"
            >
              Reservar ahora
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-blue-50 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            100% Tapatio - Hecho en Guadalajara
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-6">
            Tu auto impecable,<br />
            <span className="text-blue-700">sin salir de tu edificio</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Lavamos tu auto en el estacionamiento de tu edificio. Reserva en minutos,
            elige tu plan y paga en linea. Asi de facil.
          </p>
          <Link
            href="/reservar"
            className="inline-block bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-800 transition-colors shadow-lg shadow-blue-700/25"
          >
            Reservar mi lavado
          </Link>
        </div>
      </section>

      {/* Nosotros */}
      <section id="nosotros" className="py-16 bg-gray-50 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Nosotros</h2>
          <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto">Conoce la historia detras de CarWash Pro</p>

          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="bg-blue-700 text-white rounded-2xl p-8 text-center">
                <div className="text-5xl font-bold mb-2">CW</div>
                <div className="text-blue-200 text-sm">CarWash Pro</div>
                <div className="text-blue-200 text-xs mt-1">Guadalajara, Jalisco</div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-900">Emprendimiento 100% tapatio</h3>
              <p className="text-gray-600 leading-relaxed">
                CarWash Pro nacio en Guadalajara con una idea simple pero poderosa: llevar el lavado de autos
                directamente a donde estas. Somos un equipo joven y tapatio que entiende lo valioso que es tu tiempo.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Empezamos operando en Torre Cosmocrat, en la zona de Puerta de Hierro, y gracias a la confianza
                de nuestros clientes hemos crecido a mas ubicaciones en la Zona Metropolitana de Guadalajara.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Nuestro compromiso es ofrecer un servicio de calidad, puntual y sin complicaciones. Utilizamos
                productos biodegradables, tecnicas de lavado con bajo consumo de agua y un sistema de reservas
                que te permite agendar tu lavado en segundos.
              </p>

              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-700">500+</p>
                  <p className="text-xs text-gray-500">Lavados realizados</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-700">2</p>
                  <p className="text-xs text-gray-500">Ubicaciones</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-700">4.9</p>
                  <p className="text-xs text-gray-500">Calificacion</p>
                </div>
              </div>
            </div>
          </div>

          {/* Valores */}
          <div className="grid sm:grid-cols-3 gap-6 mt-16">
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Eco-friendly</h4>
              <p className="text-sm text-gray-600">Productos biodegradables y bajo consumo de agua en cada lavado.</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Puntualidad</h4>
              <p className="text-sm text-gray-600">Respetamos tu tiempo. Llegamos a la hora que reservaste, sin falta.</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Confianza</h4>
              <p className="text-sm text-gray-600">Tu auto en manos de profesionales. Seguro y asegurado.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Como funciona</h2>
          <p className="text-center text-gray-500 mb-12">En 3 simples pasos</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Elige tu edificio', desc: 'Selecciona el edificio donde esta estacionado tu auto.' },
              { step: '2', title: 'Escoge plan y horario', desc: 'Elige el tipo de lavado y el horario que mejor te convenga.' },
              { step: '3', title: 'Paga y listo', desc: 'Paga en linea de forma segura. Nosotros nos encargamos del resto.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-blue-700 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ubicaciones */}
      <section id="ubicaciones" className="py-16 bg-gray-50 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Nuestras ubicaciones</h2>
          <p className="text-center text-gray-500 mb-12">Presentes en las mejores torres de Guadalajara</p>

          {edificios.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {edificios.map((ed) => (
                <div key={ed.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{ed.nombre}</h3>
                      <p className="text-gray-600 text-sm mb-2">{ed.direccion}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Lunes a Sabado: {ed.horario_inicio.slice(0, 5)} - {ed.horario_fin.slice(0, 5)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">Cargando ubicaciones...</p>
          )}

          <p className="text-center text-sm text-gray-400 mt-8">Proximamente mas ubicaciones en la ZMG</p>
        </div>
      </section>

      {/* Planes */}
      <section id="planes" className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Planes de lavado</h2>
          <p className="text-center text-gray-500 mb-12">Elige el que mejor se adapte a tus necesidades</p>

          {planes.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {planes.map((plan, index) => (
                <div key={plan.id} className={`bg-white rounded-xl p-6 hover:shadow-md transition-shadow relative ${
                  index === 1 ? 'border-2 border-blue-700 shadow-md' : 'border border-gray-200'
                }`}>
                  {index === 1 && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-700 text-white text-xs font-medium px-3 py-1 rounded-full">
                      Mas popular
                    </div>
                  )}
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.nombre}</h3>
                  <p className="text-gray-600 text-sm mb-4">{plan.descripcion}</p>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-3xl font-bold text-blue-700">${plan.precio.toFixed(2)}</span>
                    <span className="text-sm text-gray-500">MXN</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-4">Duracion aprox: {plan.duracion_min} min</p>
                  <Link
                    href={`/reservar?plan=${plan.id}`}
                    className={`block text-center py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      index === 1
                        ? 'bg-blue-700 text-white hover:bg-blue-800'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Seleccionar
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">Cargando planes...</p>
          )}
        </div>
      </section>

      {/* CTA final */}
      <section className="py-16 bg-blue-700 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Listo para un auto impecable?</h2>
          <p className="text-blue-100 mb-8">
            Reserva tu lavado en menos de 2 minutos. Sin bajar de tu depa.
          </p>
          <Link
            href="/reservar"
            className="inline-block bg-white text-blue-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Reservar ahora
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-gray-100 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-8 mb-8">
            <div>
              <span className="text-lg font-bold text-blue-700">CarWash Pro</span>
              <p className="text-sm text-gray-500 mt-2">Emprendimiento 100% tapatio. Lavado de autos premium en el estacionamiento de tu edificio.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm mb-3">Ubicaciones</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>Torre Cosmocrat - Puerta de Hierro</li>
                <li>Torre Midtown - Col. Ladron de Guevara</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm mb-3">Contacto</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>contacto@carwashpro.mx</li>
                <li>+52 33 1234 5678</li>
                <li>Guadalajara, Jalisco, Mexico</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-sm text-gray-400">2026 CarWash Pro. Todos los derechos reservados.</span>
            <span className="text-sm text-gray-400">Hecho con orgullo en Guadalajara</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
