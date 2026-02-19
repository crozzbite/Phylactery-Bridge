# 🛠️ Phylactery Bridge: Technical Architecture (Enterprise Edition)
> **Philosophy:** "Titanium Bones (Python Engine) + Steel Spine (Node.js BFF) + Polished Skin (Angular UI)"

## 1. High-Level Architecture
Bridge is a **3-layer Hybrid BFF** application built on **Hexagonal Architecture** principles.

| Layer | Repo | Technology | Responsibility |
| :--- | :--- | :--- | :--- |
| **Skin** (Frontend) | `Phylactery-Bridge` | Angular v19+ (Stable), TailwindCSS, Signal Store | UX, Real-time Feedback, Secure Inputs |
| **Spine** (BFF) | `Phylactery-Bridge` | NestJS (Rest + SSE), BullMQ, Redis, PostgreSQL | Auth, Billing, Usage Tracking, Job Orchestration, Security Gateway |
| **Bones** (Engine) | `phylactery` | Python 3.13, FastAPI, LangGraph, Pinecone | AI Logic, Agent Orchestration, RAG, Prompt Guard |

```mermaid
graph TD
    User((User)) -->|HTTPS + WAF| CDN[Cloudflare CDN]
    CDN -->|Static Assets| S3[Storage Bucket]
    CDN -->|API Requests| LB[Load Balancer]
    
    subgraph "Secure Zone (VPC)"
        LB -->|Rate Limited| BFF[NestJS BFF Cluster]
        
        subgraph "BFF Layer (Hexagonal)"
            BFF -->|Auth| Guard[AuthGuard + Throttler]
            BFF -->|Domain| Domain[Domain Services]
            BFF -->|Async| Queue[BullMQ (Redis)]
        end
        
        Queue -->|Job Processing| Worker[Audit Worker]
        
        subgraph "Persistence"
            Domain -->|ORM| DB[(PostgreSQL + PGBouncer)]
            Domain -->|Cache| Redis[(Redis Cluster)]
        end
        
        Worker -->|Internal API| Engine[Phylactery Engine]
    end
    
    subgraph "External Services"
        Engine -->|LLM| OpenAI[OpenAI / Anthropic]
        BFF -->|Payments| Stripe[Stripe]
    end
```

## 2. Backend Architecture (The "Steel Spine")
We enforce **Clean Architecture** with strict module separation:

```
src/
├── core/           # Framework extensions (Interceptors, Filters, Guards)
├── shared/         # Utilities (Date, String, Math)
└── modules/
    ├── identity/   # Auth, Users, Roles
    ├── billing/    # Subscriptions, Invoices, Usage
    ├── audit/      # Core Domain: Audit Sessions, Reports
    └── llm-gateway/# Anti-Corruption Layer for AI Engine
```

### Key Considerations
1.  **Async-First:** All LLM interactions are asynchronous via **BullMQ**. No HTTP timeouts waiting for AI.
2.  **Security-First:**
    *   **Helmet:** Secure HTTP headers.
    *   **Throttler:** Global + Per-Endpoint Rate Limiting.
    *   **Zod:** Strict runtime validation for ALL inputs/outputs.
    *   **CSP:** Content Security Policy to prevent XSS.
3.  **Observability:**
    *   **OpenTelemetry:** Distributed tracing (BFF -> Engine).
    *   **Structured Logging:** JSON logs with Correlation IDs.
    *   **Health Checks:** `/health` endpoints for K8s/Docker.

## 3. Frontend Architecture (The "Polished Skin")
Targeting **Angular v20** (Future-Proof Strategy) using v19+ foundations today.

*   **Framework:** Angular v19 (Strict Standalone, ready for v20 Signals API).
*   **Styling:** TailwindCSS v4 + DaisyUI (Cyberpunk aesthetic).
*   **State Management:** **Signals** (Native) for local state, **SignalStore** (NgRx) for global state.
*   **Performance:** `OnPush` change detection everywhere. `@defer` for lazy loading components.
*   **Mobile Strategy:** **PWA First**. Native mobile wrapper (Capacitor/NativeScript) moved to Phase 2.5+
*   **Security:**
    *   Strict Input Sanitization (DOMPurify).
    *   HttpOnly Cookies for Auth Tokens (if possible) or secure LocalStorage encryption.

## 4. Integration Protocol (BFF <-> Engine)

### The "Air-Gapped" Protocol
The Engine never talks to the public internet directly.
1.  **Request:** BFF receives user prompt -> Enqueues Job -> Returns `job_id`.
2.  **Process:** Worker picks up Job -> Calls Engine `/api/v1/bridge/deliberate` (Internal Network).
3.  **Stream:** Engine streams tokens via SSE -> Worker aggregates or forwards via WebSocket to UI.
4.  **Completion:** Worker updates DB -> Triggers Webhook/Socket event to UI.

### AI Safety Layer
*   **Prompt Guard:** Input is scanned for Injection attacks *before* reaching the LLM.
*   **Output Sanitization:** LLM output is scanned for malicious patterns/PII *before* storing.
*   **Cost Tracking:** Every token is counted and billed to the `ValidationSession`.

## 5. Infrastructure & DevOps
*   **Docker:** Multi-stage production builds (Distroless images).
*   **CI/CD:** GitHub Actions (Lint -> Test -> Build -> Deploy).
*   **Database:** PostgreSQL with **Row Level Security (RLS)** capability (prepared for future Supabase migration if needed).

## 6. Testing Strategy ("The Safety Net")
*   **Unit:** Jest (Background) / Jasmine (Frontend). Coverage > 80%.
*   **Integration:** Supertest (API endpoints).
*   **E2E:** Cypress (Critical User Journeys: Login -> Pay -> Audit).
*   **Load:** K6 (Simulate 100 concurrent auditors).
