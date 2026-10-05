# Agent Team Board

Polished **Expo / React Native** ops-room simulation. Enter a product brief and watch a six-person agent team (Director, EM, Architect, Backend, Frontend, QA) discover, architecture, story-break, plan, kick off implementation, and draft QA — live on the board.

Agents are powered by **Anthropic Claude** (`claude-opus-5-5`) when an API key is present, with graceful scripted fallbacks if the key is missing or a call fails.

Cross-platform: **iOS · Android · Web**.

## Team

| Role | Name | Focus |
|------|------|--------|
| Director | Aria Chen | Vision & priorities |
| Engineering Manager | Marcus Webb | Planning & sequencing |
| Architect | Priya Nair | System design |
| Backend Dev | Leo Park | APIs & data stories |
| Frontend Dev | Sofia Reyes | UI stories |
| QA / Tester | Jordan Blake | Test plans & AC |

## Features

- Cinematic dark ops-room UI with role color accents and pulse status indicators
- Launch form for product name, description, goals, constraints (+ example brief)
- **Claude-powered** agent chat + story JSON generation (Claude Opus 5.5)
- Thinking / Writing status while awaiting model responses
- Stages: Discovery → Architecture → Story breakdown → Planning → Impl. kickoff → QA planning
- Agent roster with live status (Thinking / Writing / Reviewing / Idle / Blocked / Speaking)
- Kanban story board: Backlog → Ready → In Progress → Review → Done
- Timestamped live activity feed grounded in your product brief
- Responsive layout for phone, tablet, and web

## Requirements

- Node 18+ (or Bun)
- Expo Go app on a phone, or a browser for web
- Anthropic API key (optional but recommended)

## API key

Provide a key in either place (never commit secrets):

1. **Env (recommended for local)** — copy `.env.example` → `.env`:

   ```bash
   EXPO_PUBLIC_ANTHROPIC_API_KEY=sk-ant-…
   ```

2. **Launch screen** — paste the key; it is saved in **AsyncStorage** on device.

Without a key, the simulation still runs using local scripted lines and `generateStories` fallback.

> **Web note:** browsers may block direct calls to `api.anthropic.com` (CORS). Native iOS/Android via Expo Go works with the Messages API. On web, failed calls fall back to scripted content.

## Run

```bash
cd agent-team-board
cp .env.example .env   # then paste your key
bun install            # or: npm install
npx expo start         # or: bun run start
```

Then:

- press `w` for **web**
- press `a` / `i` for Android / iOS simulator
- scan the QR code with **Expo Go** on a device

Scripts:

```bash
bun run start
bun run web
bun run android
bun run ios
bun run typecheck
```

## Typecheck

```bash
npx tsc --noEmit
```

## Project layout

```
App.tsx                 # Root: launch ↔ dashboard
src/
  theme.ts
  types.ts
  data/agents.ts
  ai/
    anthropicClient.ts  # Messages API (Claude Opus 5.5)
    prompts.ts          # Role + story prompts
    apiKey.ts           # env + AsyncStorage
    generateStoriesWithClaude.ts
  simulation/
    engine.ts           # Timed stages + Claude beats
    storyGenerator.ts   # Local story fallback
  components/
  screens/
```

## Notes

- Model: `claude-opus-5-5` for chat beats and story JSON.
- API: `POST https://api.anthropic.com/v1/messages` with `x-api-key` + `anthropic-version: 2023-06-01`.
- `.env` is gitignored; only `.env.example` is committed.
