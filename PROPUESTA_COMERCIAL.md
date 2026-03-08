# PROPUESTA COMERCIAL
## Plataforma de Reservas y Gestión — CarWash Pro

---

**Fecha:** 8 de marzo de 2026
**Preparado para:** [Nombre del Cliente]
**Preparado por:** [Tu Nombre / Tu Empresa]
**Vigencia:** 30 días naturales

---

## 1. RESUMEN EJECUTIVO

Desarrollo e implementación de una **plataforma web completa** para la gestión de un negocio de lavado de autos en edificios residenciales. La solución incluye sitio público, sistema de reservas en línea con pagos integrados, panel de administración, y notificaciones automatizadas.

**Inversión total: $10,000.00 MXN**

---

## 2. ALCANCE DEL PROYECTO

### 2.1 Sitio Web Público (Landing Page)

| Elemento | Detalle |
|----------|---------|
| Página principal | Diseño moderno y responsivo con secciones de valor |
| Sección "Nosotros" | Historia, misión, valores y estadísticas del negocio |
| Sección "Cómo funciona" | Proceso explicado en 3 pasos visuales |
| Ubicaciones | Listado dinámico de edificios activos con dirección y horarios |
| Planes y precios | Catálogo de servicios con precios, duración y descripción |
| Call-to-Action | Botones estratégicos para convertir visitantes en reservas |
| Footer | Información de contacto, ubicaciones y enlaces |

### 2.2 Sistema de Reservas en Línea (5 pasos)

| Paso | Funcionalidad |
|------|---------------|
| 1. Selección de edificio | Listado con dirección y horarios de operación |
| 2. Selección de plan | Planes con nombre, descripción, precio y duración |
| 3. Fecha y hora | Calendario con disponibilidad en tiempo real según capacidad |
| 4. Datos del cliente y vehículo | Nombre, email, teléfono, marca, modelo, color, placas |
| 5. Resumen y pago | Resumen completo, sistema de propinas, redirección a pago |

### 2.3 Pasarela de Pagos (Clip)

- Integración completa con **Payclip API v2**
- Cobro en línea con tarjeta de crédito/débito
- Webhook de confirmación automática de pago
- Manejo de pagos exitosos, cancelados y expirados
- Token de seguridad para validación de webhooks
- Expiración automática de pagos (24 horas)

### 2.4 Notificaciones Automatizadas

| Canal | Destinatario | Contenido |
|-------|-------------|-----------|
| Email (Resend) | Cliente | Confirmación de reserva con todos los detalles |
| Email (Resend) | Administrador | Alerta de nueva reserva |
| WhatsApp (Twilio) | Cliente | Mensaje de confirmación con detalles de la cita |

### 2.5 Panel de Administración

#### Dashboard
- Métricas en tiempo real: reservas del día, pendientes, ingresos, edificios activos
- Tabla de próximas reservas con filtros

#### Gestión de Edificios (CRUD completo)
- Crear, editar, activar/desactivar edificios
- Configurar horarios de operación
- Duración de slots y capacidad simultánea

#### Gestión de Planes de Lavado (CRUD completo)
- Crear, editar, activar/desactivar planes
- Nombre, descripción, precio y duración

#### Gestión de Reservas
- Filtros avanzados por edificio, estado y fecha
- Vista detallada de cada reserva (cliente, vehículo, pago)
- Flujo de estados: Pendiente → Confirmada → En Proceso → Completada
- Opción de cancelación manual
- Desglose de subtotal, propina y total

### 2.6 Sistema de Disponibilidad

- Cálculo automático de slots disponibles
- Respeta horarios de operación del edificio
- Gestión de capacidad simultánea (múltiples lavados al mismo tiempo)
- Bloqueo de horarios ya reservados

### 2.7 Base de Datos y Seguridad

- Base de datos PostgreSQL en la nube (Supabase)
- Row Level Security (RLS) — acceso granular por rol
- Autenticación segura para el panel admin
- Índices optimizados para consultas de disponibilidad y reportes
- Número de confirmación único por reserva (formato CW-DDMM-XXXX)

---

## 3. TECNOLOGÍAS UTILIZADAS

| Componente | Tecnología |
|-----------|------------|
| Frontend | Next.js 14 (React) con App Router |
| Estilos | Tailwind CSS (diseño responsivo) |
| Backend/API | Next.js API Routes (serverless) |
| Base de datos | PostgreSQL (Supabase) |
| Autenticación | Supabase Auth |
| Pagos | Payclip API v2 |
| Email | Resend API |
| WhatsApp | Twilio API |
| Hosting | AWS / Vercel (según preferencia) |
| Lenguaje | TypeScript (tipado estricto) |

---

## 4. INFRAESTRUCTURA Y DESPLIEGUE

El proyecto será desplegado en infraestructura cloud con las siguientes características:

- **Hosting de aplicación:** AWS (Amplify / EC2) o Vercel
- **Base de datos:** Supabase Cloud (PostgreSQL administrado)
- **Dominio y SSL:** Configuración de dominio personalizado con certificado HTTPS
- **CDN:** Distribución global de contenido estático para carga rápida
- **Monitoreo:** Logs de errores y métricas de uso

---

## 5. ENTREGABLES

| # | Entregable | Formato |
|---|-----------|---------|
| 1 | Código fuente completo del proyecto | Repositorio Git |
| 2 | Sitio web público desplegado y funcional | URL en producción |
| 3 | Panel de administración operativo | URL protegida con acceso |
| 4 | Base de datos configurada con migraciones | Supabase Cloud |
| 5 | Integración de pagos con Clip configurada | API conectada |
| 6 | Notificaciones (Email + WhatsApp) configuradas | APIs conectadas |
| 7 | Documentación técnica básica | Archivo en repositorio |
| 8 | Credenciales de acceso admin | Entrega segura |

---

## 6. INVERSIÓN

| Concepto | Monto |
|----------|-------|
| Desarrollo de sitio web público (landing page) | $1,500.00 MXN |
| Sistema de reservas (5 pasos + disponibilidad) | $2,500.00 MXN |
| Integración de pasarela de pagos (Clip) | $1,500.00 MXN |
| Panel de administración completo | $2,000.00 MXN |
| Notificaciones (Email + WhatsApp) | $1,000.00 MXN |
| Despliegue, configuración y puesta en marcha | $1,000.00 MXN |
| Base de datos, seguridad y optimización | $500.00 MXN |
| **TOTAL** | **$10,000.00 MXN** |

> *Los precios incluyen IVA. No incluyen costos recurrentes de servicios terceros (Supabase, Clip, Resend, Twilio, dominio, hosting).*

---

## 7. COSTOS RECURRENTES (a cargo del cliente)

| Servicio | Costo estimado mensual |
|----------|----------------------|
| Supabase (base de datos) | Gratis (Free Tier) / ~$25 USD (Pro) |
| Vercel o AWS hosting | Gratis (Free Tier) / ~$20 USD (Pro) |
| Dominio (.com / .mx) | ~$150-300 MXN/año |
| Clip (comisión por transacción) | 3.6% + IVA por cobro |
| Resend (emails) | Gratis hasta 3,000/mes |
| Twilio WhatsApp | ~$0.05 USD por mensaje |

---

## 8. TIEMPOS DE ENTREGA

| Fase | Duración |
|------|----------|
| Desarrollo y pruebas | Completado |
| Configuración de servicios (Clip, Resend, Twilio) | 1-2 días |
| Despliegue en producción (AWS/Vercel) | 1 día |
| Pruebas finales y ajustes | 1-2 días |
| **Entrega total** | **3-5 días hábiles** |

---

## 9. GARANTÍA Y SOPORTE

- **30 días de garantía** contra bugs o defectos en el código entregado
- Corrección de errores sin costo adicional durante el período de garantía
- Soporte técnico básico por WhatsApp/Email durante la garantía
- Modificaciones o nuevas funcionalidades fuera del alcance se cotizan por separado

---

## 10. FORMA DE PAGO

| Pago | Monto | Momento |
|------|-------|---------|
| Anticipo (50%) | $5,000.00 MXN | Al aceptar la propuesta |
| Liquidación (50%) | $5,000.00 MXN | Al entregar en producción |

**Métodos aceptados:** Transferencia bancaria / Clip / Efectivo

---

## 11. CONDICIONES

1. El cliente proporcionará acceso a las cuentas de servicios terceros (Clip, dominio) o se crearán en conjunto.
2. El contenido (textos, imágenes, logotipos) será proporcionado por el cliente.
3. Cambios fuera del alcance definido en esta propuesta se cotizarán por separado.
4. La propuesta tiene vigencia de 30 días naturales a partir de la fecha de emisión.

---

## 12. ACEPTACIÓN

Al firmar este documento, ambas partes aceptan los términos y condiciones aquí descritos.

| | Cliente | Proveedor |
|--|---------|-----------|
| **Nombre** | _________________________ | _________________________ |
| **Firma** | _________________________ | _________________________ |
| **Fecha** | _________________________ | _________________________ |

---

*Documento generado el 8 de marzo de 2026.*
