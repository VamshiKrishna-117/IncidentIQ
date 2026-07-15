# IncidentIQ — AI Incident Command Center

**Live:** [incident-iq-xi.vercel.app](https://incident-iq-xi.vercel.app)

A real-time incident management platform powered by AI, built with Next.js 16 and Supabase. Designed for SRE and DevOps teams to triage, analyze, and resolve production incidents from a single dashboard.

## Tech Stack

| Layer        | Technology |
|-------------|-----------|
| Framework   | Next.js 16 (App Router, React 19, TypeScript 5) |
| Styling     | Tailwind CSS v4 + `tailwind-merge` |
| State       | Zustand (UI state), TanStack React Query (server state) |
| Database    | Supabase (PostgreSQL, realtime subscriptions, storage) |
| AI          | Groq SDK (`llama-3.3-70b-versatile`), Google Gemini (`gemini-2.0-flash`) |
| Charts      | Recharts |
| Forms       | React Hook Form + Zod |
| UI Primitives | Radix UI (Select, Dialog, DropdownMenu, Toast, Tooltip, Tabs, Accordion) |
| Icons      | Lucide React |
| Testing    | Vitest, Playwright |
| Linting    | ESLint, Prettier (with `prettier-plugin-tailwindcss`) |

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js 16 App Router                 │
│  ┌──────────┐ ┌───────────┐ ┌────────┐ ┌─────────────┐ │
│  │ Dashboard │ │ Incidents │ │  AI    │ │ Settings /   │ │
│  │  + KPI    │ │ + Triage  │ │Analyst │ │ Infra / etc  │ │
│  └──────────┘ └───────────┘ └────────┘ └─────────────┘ │
├─────────────────────────────────────────────────────────┤
│  TanStack Query (caching, revalidation, mutations)       │
│  Zustand (sidebar, create-incident modal, etc.)          │
│  Supabase SSR client + Realtime subscriptions            │
├─────────────────────────────────────────────────────────┤
│  /api/incidents  /api/incidents/[id]/ai  /api/upload    │
│  /api/incidents/[id]/updates                             │
├─────────────────────────────────────────────────────────┤
│           Supabase (PostgreSQL + Realtime + Storage)     │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Incidents** are created via a modal form → POST to `/api/incidents` → stored in Supabase → realtime broadcast to all connected clients.
2. **Updates** are posted inline on the incident detail page → stored in `incident_updates` → pushed via Supabase realtime channels.
3. **AI Analysis** sends the incident context (title, description, update timeline) to the configured provider (Groq or Gemini) → structured JSON response → stored in `ai_results` → displayed in the AI Summary panel.
4. **File uploads** use `/api/upload` which streams files to Supabase Storage (`incident-attachments` bucket) via the service role key.
5. **Realtime** subscriptions deliver live updates for incidents, updates, and AI results without polling.

## Features

- **Dashboard** — KPI cards (active incidents, MTTR, latency, uptime), live triage queue with P0–P3 priority filters, live feed of updates
- **Incident Management** — create, search, filter by priority/status/service, batch-select and bulk-resolve, inline assignee/status editing
- **Incident Detail** — dedicated page with live timeline (markdown: code blocks, images, file attachments), AI summary panel, status flow (Open → Investigating → Identified → Monitoring → Resolved), assignee editing, Link PR integration
- **AI-Powered Analysis** — selectable provider (Groq Llama 3 / Gemini Flash / Rule-Based Fallback), auto-analysis for critical incidents, root cause, blast radius, recommended actions, priority review
- **Infrastructure Mesh** — real-time service health cards with CPU, memory, latency, error rate, heartbeat monitoring
- **Analytics** — incident volume trends, priority distribution (donut chart), resolution status (stacked bar), MTTR tracking, time range filtering (24h/7d/30d)
- **Settings** — theme (dark-only with light/system coming-soon), AI provider config, auto-refresh interval, notification toggle, system info (version + git hash), database/realtime health checks
- **Responsive** — full mobile support with auto-hiding sidebar, bottom navigation bar, touch-optimized targets, adaptive layouts

### AI Provider Selection

The AI provider is read from the `settings` table at analysis time. The flow is:

1. User selects provider in Settings → AI Config (saved to `settings.ai_provider`)
2. On analysis, the API route reads this setting
3. `callAI()` in `@/lib/ai.ts` tries the preferred provider first, falls back to the other LLM, then to the keyword-matching fallback engine
4. Image markdown (`![...](...)`) is stripped from update messages before being sent to the LLM, and also stripped at display time for safety

## Database Schema

The Supabase project (`uqsrvnrgfkcadidsitdw.supabase.co`) uses the following migrations:

### Tables

| Table | Purpose |
|-------|---------|
| `incidents` | Core incident records with priority, status, assignee, service |
| `incident_updates` | Timeline entries (USER, SYSTEM, AI types) linked to incidents |
| `ai_results` | Cached AI analysis results with structured JSON metadata |
| `services` | Infrastructure service health metrics (latency, CPU, memory, error rate) |
| `settings` | Key-value store for app configuration (theme, AI provider, etc.) |
| `notifications` | Notification records for incident events |

### Key Relationships

```
incidents (1) ── incident_updates (many)
incidents (1) ── ai_results (many)
incidents (1) ── notifications (many, optional)
```

### Storage Bucket

- **`incident-attachments`** — public bucket (20 MB file limit) for file uploads attached to timeline updates

### Realtime Publication

The `supabase_realtime` publication includes: `incidents`, `incident_updates`, `ai_results`, and `notifications`.

### Running Migrations

Migrations must be run manually via the Supabase Dashboard SQL editor (no Supabase CLI available in this environment). Files are located in `supabase/migrations/`:

```sql
-- Execute in order:
20240705000001_core.sql
20240705000002_notifications.sql
20240706000001_storage.sql
```

## Setup

### Prerequisites

- Node.js 20+
- A Supabase project (free tier works)
- API keys for Groq and/or Gemini (optional — falls back to rule-based engine)

### Clone & Install

```bash
git clone <repo-url>
cd incidentiq
npm install
```

### Environment Variables

Create `.env.local` in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# AI Providers (at least one required for LLM analysis)
GROQ_API_KEY=gsk_...
GEMINI_API_KEY=AIza...
```

> **Note:** The `SUPABASE_SERVICE_ROLE_KEY` is required for server-side file uploads to the `incident-attachments` bucket.

### Database

1. Create a Supabase project
2. Run the migration SQL files in `supabase/migrations/` in order via the Supabase Dashboard SQL editor
3. (Optional) Run `supabase/seed.sql` to populate sample incident data

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run Vitest unit/integration tests |
| `npm run test:watch` | Vitest watch mode |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run test:all` | Run unit + E2E tests |

## Project Structure

```
src/
├── app/                     # Next.js App Router pages
│   ├── ai-assistant/        # AI analysis overview page
│   ├── analytics/           # Metrics and charts
│   ├── api/                 # API routes
│   │   ├── incidents/       # CRUD + AI + updates endpoints
│   │   └── upload/          # File upload to Supabase Storage
│   ├── dashboard/           # Incidents table with filters
│   ├── incidents/[id]/      # Incident detail page
│   ├── infrastructure/      # Service mesh health
│   ├── settings/            # App configuration
│   └── support/             # FAQ and resources
├── components/
│   ├── ai/                  # AI analysis card
│   ├── analytics/           # KPI metric component
│   ├── dashboard/           # KPI cards, triage queue, live feed
│   ├── incident-detail/     # Header, timeline, composer, AI panel
│   ├── incidents/           # Status badge, priority badge, table cells
│   ├── infrastructure/      # Service card
│   ├── layout/              # Sidebar, header, mobile nav, app shell
│   ├── settings/            # Tab panels
│   ├── shared/              # Loading, error, empty states, confirm modal
│   └── ui/                  # Button, card, badge, select, skeleton, etc.
├── hooks/                   # Custom hooks (incidents, settings, toast, system health)
├── lib/                     # Utilities, AI client, Supabase clients, CSV export
├── stores/                  # Zustand UI store
└── types/                   # TypeScript type definitions
```

## Key Design Decisions

- **Dark theme locked**: Light and System modes show a "coming soon" toast; `data-theme="dark"` is always applied
- **AI analysis is cached**: Results are stored in `ai_results` to avoid re-querying the LLM on every page load; click "Regenerate" to force a new analysis
- **Notifications silently degrade**: If the `notifications` table doesn't exist, inserts fail silently via `.catch(() => {})`
- **File uploads are server-side**: Files go through `/api/upload` using `SUPABASE_SERVICE_ROLE_KEY`, not direct client-side uploads
- **Mobile responsive**: Sidebar auto-hides below 1024px with hamburger toggle; bottom nav bar on mobile; all components adapted with proper touch targets (`max-sm:min-h-[44px]`)
- **Milestone commits**: `978e71d` marks the web-only baseline; `a9e9fba` marks completion of mobile responsive work

## Deployment

Deploy as a standard Next.js application:

```bash
npm run build
npm run start
```

For Vercel deployment, set all environment variables in the Vercel project dashboard. The `NEXT_PUBLIC_GIT_HASH` is automatically injected at build time via `next.config.ts`.
