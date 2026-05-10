# QA Copilot API Server

AI-powered QA analysis API server for the QA Copilot browser extension — accepts recorded browser sessions and returns structured QA reports via OpenAI.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at `/api`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `AI_INTEGRATIONS_OPENAI_BASE_URL` + `AI_INTEGRATIONS_OPENAI_API_KEY` — auto-provisioned via Replit AI Integrations

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- AI: OpenAI via Replit AI Integrations proxy (no user key needed)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI source of truth
- `artifacts/api-server/src/routes/analyze.ts` — AI analysis route handler
- `lib/integrations-openai-ai-server/` — OpenAI SDK client wrapper (auto-configured)
- `lib/api-zod/src/generated/api.ts` — Generated Zod schemas (`AnalyzeSessionBody`, `AnalyzeSessionResponse`, etc.)

## API Contract

### `POST /api/analyze`

Accepts a recorded QA Copilot browser session and returns an AI-generated QA report.

**Request:**
```json
{
  "actions": [
    { "type": "CLICK", "payload": { "text": "Submit" }, "timestamp": 1000, "id": "a1" }
  ],
  "sessionStart": 1000
}
```

**Response:**
```json
{
  "summary": "2-3 sentence overview",
  "bugs": [{ "title": "...", "severity": "high|medium|low|info", "detail": "..." }],
  "testSteps": ["step 1", "step 2"],
  "recommendations": ["rec 1"],
  "coverage": "1-2 sentences"
}
```

**Action types:** `CLICK`, `INPUT`, `PAGE_LOAD`, `PAGE_UNLOAD`, `API_CALL`, `API_ERROR`, `CONSOLE_ERROR`, `CONSOLE_WARN`, `STORAGE_CHANGE`, `SCREENSHOT`

## Browser Extension Integration

The QA Copilot Chrome extension (v2.0) connects by setting the Server URL in its ⚙ Settings panel:

1. Click the extension icon → ⚙ Settings
2. Select **Server (free)** mode
3. Enter this deployed app's URL (e.g. `https://your-app.replit.app`)
4. Click Save

The extension will then POST recorded sessions to `/api/analyze` instead of calling OpenAI directly.

## Architecture decisions

- Stateless analysis: no DB tables needed for the analyze endpoint — each request is self-contained
- The AI prompt mirrors the extension's direct-OpenAI prompt for consistent output shape
- Uses `gpt-5-mini` for cost-effective high-volume analysis
- Response is validated at the route level; JSON is parsed from AI output using regex to handle any extra whitespace/formatting
- Replit AI Integrations proxy provides OpenAI access with no user API key needed

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Always run `pnpm --filter @workspace/api-spec run codegen` after changing `openapi.yaml`
- `AI_INTEGRATIONS_OPENAI_BASE_URL` and `AI_INTEGRATIONS_OPENAI_API_KEY` are auto-set by Replit — never set them manually
- The `lib/integrations-openai-ai-server` template files were patched at `src/batch/utils.ts` (AbortError import) and `src/image/client.ts` (optional chaining)

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
