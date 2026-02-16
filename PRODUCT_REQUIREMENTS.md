# 📋 Product Requirements Document (PRD)
> **Product:** Phylactery Bridge
> **Phase:** MVP (Minimum Viable Product)

## 1. Core User Stories

### A. The "Deliberation" Flow (Killer Feature)
*   **As a User**, I want to submit a coding task so that I can get a solution.
*   **System Action:** Instead of answering immediately, the system MUST show:
    1.  **Architect's Plan:** A high-level breakdown.
    2.  **Auditor's Review:** A critique of the plan (security/perf).
    3.  **Final Code:** The synthesized solution.
*   **Acceptance Criteria:** The user sees the "Thinking Process" in real-time (streaming).

### B. Project Context (Memory)
*   **As a User**, I want to upload/paste my `package.json` or `README.md`.
*   **System Action:** The agents MUST use this context for all future answers in the session.
*   **Constraint:** Context window management (Phylactery Engine handles this).

### C. Export & Handoff
*   **As a User**, I want to copy the code blocks easily.
*   **As a User**, I want to "Save to Workspace" to revisit the discussion later.

## 2. UI/UX Requirements (SkullRender Aesthetic)
*   **Theme:** Dark Mode Default. High contrast. "Hacker/Cyberpunk" vibes but clean.
*   **Typography:** Monospace for code (Fira Code/JetBrains Mono), Sans for UI (Inter/Outfit).
*   **Feedback:** Micro-animations when Agents are "thinking" (e.g., a skull glowing or pulse waves).

## 3. Agent Personas (To be defined in Phylactery)
*   **The Architect:** Conservative, patterns-obsessed, "Clean Code" evangelist.
*   **The Auditor:** Paranoid, security-focused, "Devil's Advocate".
*   **The Builder:** Pragmatic, concise, focused on working code.

## 4. MVP Limitations (Not in Scope)
*   No GitHub Integration (Phase 2).
*   No Multi-user Collaboration (Phase 2).
*   No "Run Code" Sandbox (Phase 3).
