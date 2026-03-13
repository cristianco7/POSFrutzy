# 🍦 POS Frutzy

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18-61DAFB.svg?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6.svg?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5-646CFF.svg?logo=vite)
![Supabase](https://img.shields.io/badge/Supabase-Realtime-3FCF8E.svg?logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC.svg?logo=tailwind-css)

**POS Frutzy** es un moderno Sistema de Punto de Venta (Point of Sale) diseñado a medida para heladerías y establecimientos de comida rápida. Optimizado para pantallas táctiles, tablets y teléfonos móviles (gracias a su integración PWA), permite una gestión fluida desde la toma del pedido hasta su entrega.

---

## ✨ Características Principales

- **📱 Diseño Mobile-First & PWA:** Totalmente responsivo, instalable en dispositivos móviles iOS y Android sin pasar por App Stores.
- **⚡ Sincronización en Tiempo Real:** Desarrollado con Supabase. Los pedidos tomados por los meseros aparecen instantáneamente en la pantalla de la Cocina sin necesidad de recargar.
- **📍 Gestión de Ubicaciones:** Toma de pedidos para espacios específicos: "Mesa 1-8", "Barra 1-4" o "Para Llevar".
- **🍦 Control Dinámico de Sabores:** ¿Se acabó el helado de Vainilla? Deshabilita el sabor con un clic desde el panel de administrador y bloqueará su venta en todos los dispositivos al instante.
- **👨‍🍳 Vista Dedicada de Cocina (Kitchen Display System):** Pantalla enfocada exclusivamente a los despachadores para ver, preparar y marcar pedidos como completados.
- **📊 Estadísticas Inteligentes:** El sistema analiza todos los pedidos que se archivan diariamente y calcula un Top 5 histórico de los productos y **sabores de helado** más elegidos por los clientes.
- **💵 Cierre de Caja Diario:** Simplifica la administración separando las ventas activas y archivándolas por turnos/días con un solo botón.

---

## 🛠️ Tecnologías Utilizadas

*   **Frontend**: React (Vite) + TypeScript
*   **Estilos**: Tailwind CSS + Componentes Base (UI Shadcn style)
*   **Íconos**: Lucide React
*   **Backend / Base de Datos**: Supabase (PostgreSQL + Realtime WebSockets)
*   **Gestión de Estado**: React Context API
*   **PWA**: `vite-plugin-pwa`

---

## 🚀 Instalación y Configuración Local

Si deseas correr este proyecto en tu propia máquina, sigue estos pasos:

### 1. Prerrequisitos
Asegúrate de tener instalado [Node.js](https://nodejs.org/) (versión 18+ recomendada) y `npm`. Necesitarás también una cuenta en [Supabase](https://supabase.com/).

### 2. Clonar el repositorio
```bash
git clone https://github.com/cristianco7/POSFrutzy.git
cd "POS FRUTZY"
```

### 3. Instalar dependencias
```bash
npm install
```

### 4. Configurar Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto y agrega tus credenciales de Supabase:
```env
VITE_SUPABASE_URL=tu_url_de_supabase_aqui
VITE_SUPABASE_ANON_KEY=tu_anon_key_de_supabase_aqui
```

### 5. Configurar Base de Datos (Supabase SQL)
En el *SQL Editor* de tu panel de Supabase, deberás ejecutar las siguientes queries para estructurar tus tablas:

<details>
<summary><b>Haz clic aquí para ver el código SQL requerido</b></summary>

```sql
-- Tabla principal de pedidos
create table orders (
  id uuid primary key default gen_random_uuid(),
  orderNumber int8,
  items jsonb,
  status text,
  total float8,
  location text,
  customerNote text,
  createdAt timestamptz default now(),
  updatedAt timestamptz default now(),
  archived_date timestamptz
);

-- Tabla para la gestión de disponibilidad de sabores
create table flavors (
    id text primary key,
    name text not null,
    color text not null,
    available boolean default true
);

-- Inserta los sabores por defecto
insert into flavors (id, name, color, available) values
    ('vanilla', 'Vainilla', 'hsl(42 100% 72%)', true),
    ('chocolate', 'Chocolate', 'hsl(20 60% 40%)', true),
    ('strawberry', 'Fresa', 'hsl(350 75% 65%)', true),
    ('mango', 'Mango', 'hsl(38 95% 58%)', true),
    ('oreo', 'Oreo', 'hsl(0 0% 25%)', true);
```
</details>

### 6. Ejecutar en modo desarrollo
```bash
npm run dev
```
La aplicación arrancará localmente, normalmente en `http://localhost:8080`.

---

## 📱 Uso como PWA (Instalación en móviles)

Para instalar el Punto de Venta en las tablets o celulares de los meseros:
1. Asegúrate de que tu aplicación esté subida a internet (deployada en Vercel, Netlify, etc.) y cuente con protocolo seguro **HTTPS**.
2. Abre la app desde Safari (iOS) o Chrome (Android).
3. Selecciona la opción de compartir del navegador y oprime **"Agregar a la pantalla de inicio"** (Add to Home Screen).
4. La aplicación se comportará a pantalla completa como una App nativa.

---

<p align="center">
  Hecho con ❤️ para potenciar las ventas y velocidad de atención.
</p>
