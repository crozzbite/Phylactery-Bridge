<h1 align="center">🌉 Phylactery Bridge</h1>

<p align="center">
  <strong>The Gateway to Cognitive Software</strong><br>
  <em>The SaaS platform connecting users to the Phylactery AI Engine.</em>
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> &bull;
  <a href="#estructura">Estructura</a> &bull;
  <a href="#desarrollo">Desarrollo</a> &bull;
  <a href="#arquitectura">Arquitectura</a>
</p>

Este es el monorepo oficial de **Phylactery Bridge**, el núcleo comercial (SaaS) que enlaza y distribuye el acceso a los agentes y recursos orquestados por el motor de inteligencia de Phylactery.

---

## 📦 Estructura

- **`backend/`**: NestJS BFF (Backend for Frontend). Maneja Identidad, Facturación y Lógica de Negocio.
- **`frontend/`**: Angular v19 + TailwindCSS. Aplicación web de cara al usuario (PWA).
- **`docker-compose.yml`**: Infraestructura local (PostgreSQL, Redis).

## 🚀 Quick Start

### Requisitos

- Node.js 20+
- **Bun** (Required Package Manager)
- Docker & Docker Compose
- Stripe CLI (Opcional, para testing de webhooks)

### 1. Instalación

1. Clona el repositorio a tu máquina local.
2. Instala las dependencias en ambos dominios utilizando `bun`:
```bash
cd backend && bun install
cd ../frontend && bun install
```
3. Configura tus variables de entorno:
```bash
cp .env.example .env
# Actualiza .env con tus secretos locales
```

## 🛠️ Desarrollo

### 1. Infraestructura de Base
Inicia los servicios de PostgreSQL y Redis:
```bash
docker-compose up -d
```

### 2. Iniciar Backend (Puerto 3000)
```bash
cd backend
bun run start:dev
```

### 3. Iniciar Frontend (Puerto 4200)
```bash
cd frontend
bun run start
```

## 🧠 Arquitectura

Disponemos de documentación completa sobre el mapeo de puertos y la separación de dominios.
👉 Consulta el [TECHNICAL_ARCHITECTURE.md](./TECHNICAL_ARCHITECTURE.md) para más detalles.

---

<p align="center">
  <strong>Developed by SkullRender</strong><br>
  <em>Rational Creativity: Bones + Brain.</em>
</p>
