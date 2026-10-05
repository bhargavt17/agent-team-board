# Agent Team Board

Polished **Expo / React Native** ops-room simulation. Enter a product brief and watch a six-person AI agent team (Director, EM, Architect, Backend, Frontend, QA) discover, architecture, story-break, plan, kick off implementation, and draft QA — live on the board.

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
- Timed client-side simulation (no LLM API required)
- Stages: Discovery → Architecture → Story breakdown → Planning → Impl. kickoff → QA planning
- Agent roster with live status (Thinking / Writing / Reviewing / Idle / Blocked / Speaking)
- Kanban story board: Backlog → Ready → In Progress → Review → Done
- Timestamped live activity feed grounded in your product brief
- Responsive layout for phone, tablet, and web

## Requirements

- Node 18+ (or Bun)
- Expo Go app on a phone, or a browser for web

## Run

```bash
cd agent-team-board
bun install          # or: npm install
npx expo start       # or: bun run start
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
```

## Typecheck

```bash
npx tsc --noEmit
```

## Project layout

```
App.tsx                 # Root: launch ↔ dashboard
src/
  theme.ts              # Design tokens
  types.ts
  data/agents.ts        # Team + stages
  simulation/
    engine.ts           # Timed state machine
    storyGenerator.ts   # Brief → user stories
  components/           # AgentCard, StoryBoard, ActivityFeed, …
  screens/              # LaunchScreen, DashboardScreen
```

## Notes

- Simulation is deterministic and local — stories and chat reference the brief you entered.
- Reanimated powers the status pulse dots; Safe Area + Linear Gradient polish the chrome.
