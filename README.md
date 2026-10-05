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

- **Realtime parallel agents** — each stage fires multiple Claude calls concurrently (`Promise.allSettled`); UI updates as each stream/promise races in
- **Streaming activity** — Anthropic SSE token deltas update the feed and agent task lines live (falls back to typed scripted lines without a key)
- **Reactive story board** — backlog cards land as soon as Claude returns story JSON; status moves when stage work completes (not on a fake beat clock)
- Premium cinematic dark UI: ambient orbs/grid, glass panels, Reanimated entrances, pulse rings, thinking shimmer, press-scale CTAs
- Launch form for product name, description, goals, constraints (+ example brief)
- **Claude Opus 5.5** for chat + story JSON (personality prompts preserved)
- Stages gated by completed LLM work: Discovery → Architecture → Story breakdown → Planning → Impl. kickoff → QA planning
- Agent roster with live status + shimmer while waiting on Claude
- Kanban: Backlog → Ready → In Progress → Review → Done
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
