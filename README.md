# Phylactery Bridge

This is the monorepo for **Phylactery Bridge**, the SaaS platform connecting users to the Phylactery AI Engine.

## Structure

- **backend/**: NestJS BFF (Backend for Frontend). Handles Identity, Billing, and Platform business logic.
- **frontend/**: Angular v19 + TailwindCSS. The user-facing web application (PWA).
- **docker-compose.yml**: Local infrastructure (PostgreSQL, Redis).

## Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Stripe CLI (optional, for webhook testing)

### Installation

1.  Clone the repository.
2.  Install dependencies for both projects:
    ```bash
    cd backend && npm install
    cd ../frontend && npm install
    ```
3.  Set up environment variables:
    ```bash
    cp .env.example .env
    # Update .env with your local secrets
    ```

### Development

1.  Start infrastructure:
    ```bash
    docker-compose up -d
    ```

2.  Start Backend (Port 3000):
    ```bash
    cd backend
    npm run start:dev
    ```

3.  Start Frontend (Port 4200):
    ```bash
    cd frontend
    npm start
    ```

## Architecture

See [TECHNICAL_ARCHITECTURE.md](./TECHNICAL_ARCHITECTURE.md) for details.
