import { TEAM, STAGES } from '../data/agents';
import {
  ActivityItem,
  AgentState,
  ProductBrief,
  SimulationState,
  StageId,
  StoryStatus,
  UserStory,
} from '../types';
import { generateStories } from './storyGenerator';

type Listener = (state: SimulationState) => void;

interface ScriptBeat {
  delayMs: number;
  stage?: StageId;
  agents?: Partial<Record<string, { status: AgentState['status']; task: string }>>;
  activity?: { agentId: string; message: string; kind?: ActivityItem['kind'] }[];
  stories?: { id: string; status?: StoryStatus; append?: boolean }[];
  spawnStories?: boolean;
  progress?: number;
}

function idleAgents(): Record<string, AgentState> {
  return Object.fromEntries(
    TEAM.map((a) => [
      a.id,
      { id: a.id, status: 'Idle' as const, currentTask: 'Standing by' },
    ]),
  );
}

function buildScript(brief: ProductBrief): ScriptBeat[] {
  const product = brief.name.trim() || 'the product';
  return [
    {
      delayMs: 600,
      stage: 'discovery',
      progress: 4,
      agents: {
        aria: { status: 'Speaking', task: `Framing vision for ${product}` },
        marcus: { status: 'Thinking', task: 'Listening for scope signals' },
      },
      activity: [
        {
          agentId: 'aria',
          message: `Kickoff: ${product}. Let's clarify the outcome before we touch architecture.`,
          kind: 'chat',
        },
      ],
    },
    {
      delayMs: 2200,
      progress: 10,
      agents: {
        aria: { status: 'Writing', task: 'Capturing goals & non-goals' },
        marcus: { status: 'Writing', task: 'Drafting discovery notes' },
        jordan: { status: 'Thinking', task: 'Spotting testable outcomes' },
      },
      activity: [
        {
          agentId: 'aria',
          message: `Goals locked: ${brief.goals.slice(0, 120) || 'deliver a focused MVP'}.`,
          kind: 'chat',
        },
        {
          agentId: 'marcus',
          message: 'I want discovery closed in this session — no zombie tickets.',
          kind: 'chat',
        },
      ],
    },
    {
      delayMs: 2800,
      stage: 'architecture',
      progress: 18,
      agents: {
        aria: { status: 'Reviewing', task: 'Reviewing priority stack' },
        priya: { status: 'Speaking', task: `Sketching system for ${product}` },
        leo: { status: 'Thinking', task: 'Mapping data boundaries' },
        sofia: { status: 'Thinking', task: 'Noting UX constraints' },
        marcus: { status: 'Idle', task: 'Waiting on architecture cut' },
      },
      activity: [
        {
          agentId: 'priya',
          message: `Architecture pass: modular core, clear API edge, constraints noted — ${brief.constraints.slice(0, 90) || 'keep v1 lean'}.`,
          kind: 'chat',
        },
      ],
    },
    {
      delayMs: 3200,
      progress: 28,
      agents: {
        priya: { status: 'Writing', task: 'Documenting service boundaries' },
        leo: { status: 'Writing', task: 'Drafting API contracts' },
        sofia: { status: 'Reviewing', task: 'Checking flow against shell' },
      },
      activity: [
        {
          agentId: 'leo',
          message: 'Propose resource-oriented APIs with a shared error model.',
          kind: 'chat',
        },
        {
          agentId: 'sofia',
          message: 'UI shell should stay responsive on phone first — tablet/web as stretch.',
          kind: 'chat',
        },
      ],
    },
    {
      delayMs: 3000,
      stage: 'story_breakdown',
      progress: 38,
      spawnStories: true,
      agents: {
        marcus: { status: 'Speaking', task: 'Driving story breakdown' },
        aria: { status: 'Reviewing', task: 'Validating story value' },
        priya: { status: 'Reviewing', task: 'Checking technical fit' },
        leo: { status: 'Writing', task: 'Splitting backend stories' },
        sofia: { status: 'Writing', task: 'Splitting frontend stories' },
        jordan: { status: 'Writing', task: 'Attaching acceptance seeds' },
      },
      activity: [
        {
          agentId: 'marcus',
          message: `Breaking ${product} into shippable stories. Everyone owns clarity, not just tickets.`,
          kind: 'chat',
        },
        {
          agentId: 'system',
          message: 'User stories drafted into the backlog.',
          kind: 'story',
        },
      ],
    },
    {
      delayMs: 2600,
      progress: 48,
      stories: [
        { id: 'story-1', status: 'ready' },
        { id: 'story-2', status: 'ready' },
        { id: 'story-3', status: 'ready' },
      ],
      agents: {
        marcus: { status: 'Writing', task: 'Ordering backlog by risk' },
        jordan: { status: 'Reviewing', task: 'Hardening acceptance criteria' },
        leo: { status: 'Reviewing', task: 'Sizing API stories' },
        sofia: { status: 'Reviewing', task: 'Sizing UI stories' },
      },
      activity: [
        {
          agentId: 'jordan',
          message: 'AC tightened on the vision + domain stories — testable verbs only.',
          kind: 'chat',
        },
        {
          agentId: 'marcus',
          message: 'Moving top three into Ready.',
          kind: 'status',
        },
      ],
    },
    {
      delayMs: 2800,
      stage: 'planning',
      progress: 58,
      stories: [
        { id: 'story-4', status: 'ready' },
        { id: 'story-5', status: 'ready' },
        { id: 'story-1', status: 'in_progress' },
      ],
      agents: {
        marcus: { status: 'Speaking', task: 'Facilitating planning poker' },
        aria: { status: 'Thinking', task: 'Protecting product focus' },
        priya: { status: 'Thinking', task: 'Flagging dependency risks' },
        leo: { status: 'Idle', task: 'Estimate submitted' },
        sofia: { status: 'Idle', task: 'Estimate submitted' },
        jordan: { status: 'Writing', task: 'Risk notes for QA' },
      },
      activity: [
        {
          agentId: 'marcus',
          message: 'Sprint goal: prove the core path for ' + product + ' end-to-end.',
          kind: 'chat',
        },
        {
          agentId: 'priya',
          message: 'Watch the auth ↔ API coupling — sequence those carefully.',
          kind: 'chat',
        },
      ],
    },
    {
      delayMs: 3000,
      progress: 68,
      stories: [
        { id: 'story-2', status: 'in_progress' },
        { id: 'story-5', status: 'in_progress' },
        { id: 'story-6', status: 'ready' },
        { id: 'story-7', status: 'ready' },
      ],
      agents: {
        marcus: { status: 'Writing', task: 'Publishing sprint board' },
        leo: { status: 'Thinking', task: 'Prepping auth foundation' },
        sofia: { status: 'Thinking', task: 'Prepping navigation shell' },
        jordan: { status: 'Reviewing', task: 'Mapping stories → test cases' },
      },
      activity: [
        {
          agentId: 'marcus',
          message: 'Board updated. Owners clear. Dependencies tagged.',
          kind: 'status',
        },
      ],
    },
    {
      delayMs: 2800,
      stage: 'implementation',
      progress: 78,
      stories: [
        { id: 'story-1', status: 'review' },
        { id: 'story-3', status: 'in_progress' },
        { id: 'story-6', status: 'in_progress' },
        { id: 'story-7', status: 'in_progress' },
        { id: 'story-4', status: 'in_progress' },
      ],
      agents: {
        aria: { status: 'Reviewing', task: 'Checking delivery against vision' },
        marcus: { status: 'Speaking', task: 'Kickoff stand-up' },
        priya: { status: 'Reviewing', task: 'Guarding architectural seams' },
        leo: { status: 'Writing', task: 'Implementing API contracts' },
        sofia: { status: 'Writing', task: 'Building responsive shell' },
        jordan: { status: 'Writing', task: 'Drafting smoke tests' },
      },
      activity: [
        {
          agentId: 'marcus',
          message: 'Implementation kickoff. Focus: auth, shell, and contracts first.',
          kind: 'chat',
        },
        {
          agentId: 'leo',
          message: 'Starting Auth & session foundation — stubbing providers.',
          kind: 'chat',
        },
        {
          agentId: 'sofia',
          message: 'Navigation shell scaffolding up. Dark tokens applied.',
          kind: 'chat',
        },
      ],
    },
    {
      delayMs: 3200,
      progress: 88,
      stories: [
        { id: 'story-1', status: 'done' },
        { id: 'story-2', status: 'review' },
        { id: 'story-5', status: 'review' },
        { id: 'story-8', status: 'ready' },
      ],
      agents: {
        aria: { status: 'Idle', task: 'Vision check complete' },
        marcus: { status: 'Reviewing', task: 'Unblocking cross-team asks' },
        priya: { status: 'Writing', task: 'Architecture decision record' },
        leo: { status: 'Writing', task: 'Landing API happy paths' },
        sofia: { status: 'Reviewing', task: 'Polish empty & error states' },
        jordan: { status: 'Speaking', task: 'Aligning on QA plan' },
      },
      activity: [
        {
          agentId: 'jordan',
          message: 'Vision story Done. Domain model in Review. QA plan next.',
          kind: 'status',
        },
      ],
    },
    {
      delayMs: 3000,
      stage: 'qa_planning',
      progress: 95,
      stories: [
        { id: 'story-2', status: 'done' },
        { id: 'story-5', status: 'done' },
        { id: 'story-8', status: 'in_progress' },
        { id: 'story-3', status: 'review' },
        { id: 'story-4', status: 'review' },
      ],
      agents: {
        jordan: { status: 'Writing', task: `Acceptance suite for ${product}` },
        marcus: { status: 'Reviewing', task: 'Confirming exit criteria' },
        leo: { status: 'Reviewing', task: 'Pairing on API edge cases' },
        sofia: { status: 'Reviewing', task: 'Pairing on UI edge cases' },
        priya: { status: 'Idle', task: 'On call for design questions' },
        aria: { status: 'Reviewing', task: 'Sign-off readiness' },
      },
      activity: [
        {
          agentId: 'jordan',
          message: `QA plan live: happy path, abuse cases, and goal checks for ${product}.`,
          kind: 'chat',
        },
        {
          agentId: 'marcus',
          message: 'Exit criteria: core journey green, no P0 open, AC signed.',
          kind: 'chat',
        },
      ],
    },
    {
      delayMs: 2600,
      stage: 'complete',
      progress: 100,
      stories: [
        { id: 'story-3', status: 'done' },
        { id: 'story-8', status: 'review' },
      ],
      agents: {
        aria: { status: 'Speaking', task: 'Closing the session' },
        marcus: { status: 'Idle', task: 'Board stable' },
        priya: { status: 'Idle', task: 'Architecture parked cleanly' },
        leo: { status: 'Idle', task: 'API work in flight' },
        sofia: { status: 'Idle', task: 'UI work in flight' },
        jordan: { status: 'Idle', task: 'QA plan ready for execution' },
      },
      activity: [
        {
          agentId: 'aria',
          message: `${product} team aligned. Stories planned, owners clear, QA ready. Nice work, everyone.`,
          kind: 'chat',
        },
        {
          agentId: 'system',
          message: 'Simulation complete — board remains interactive.',
          kind: 'system',
        },
      ],
    },
  ];
}

export class SimulationEngine {
  private state: SimulationState;
  private listeners = new Set<Listener>();
  private timers: ReturnType<typeof setTimeout>[] = [];
  private storyPool: UserStory[] = [];

  constructor(brief: ProductBrief) {
    const now = Date.now();
    this.storyPool = generateStories(brief, now);
    this.state = {
      brief,
      stage: 'discovery',
      stageIndex: 0,
      startedAt: now,
      agents: idleAgents(),
      stories: [],
      activity: [
        {
          id: 'boot',
          agentId: 'system',
          message: `Ops room online — assembling team for ${brief.name || 'new product'}.`,
          timestamp: now,
          kind: 'system',
        },
      ],
      progress: 0,
      running: true,
    };
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  getState(): SimulationState {
    return this.state;
  }

  start(): void {
    const script = buildScript(this.state.brief);
    let elapsed = 0;
    script.forEach((beat) => {
      elapsed += beat.delayMs;
      const timer = setTimeout(() => this.applyBeat(beat), elapsed);
      this.timers.push(timer);
    });
  }

  stop(): void {
    this.timers.forEach(clearTimeout);
    this.timers = [];
    this.patch({ running: false });
  }

  private applyBeat(beat: ScriptBeat): void {
    const now = Date.now();
    const agents = { ...this.state.agents };
    if (beat.agents) {
      for (const [id, patch] of Object.entries(beat.agents)) {
        if (!patch) continue;
        agents[id] = {
          id,
          status: patch.status,
          currentTask: patch.task,
        };
      }
    }

    let stories = this.state.stories.map((s) => ({ ...s }));
    if (beat.spawnStories && stories.length === 0) {
      stories = this.storyPool.map((s) => ({ ...s, status: 'backlog' as const }));
    }
    if (beat.stories) {
      for (const upd of beat.stories) {
        const idx = stories.findIndex((s) => s.id === upd.id);
        if (idx >= 0 && upd.status) {
          stories[idx] = { ...stories[idx], status: upd.status };
        }
      }
    }

    const activity = [...this.state.activity];
    if (beat.activity) {
      for (const a of beat.activity) {
        activity.unshift({
          id: `act-${now}-${Math.random().toString(36).slice(2, 7)}`,
          agentId: a.agentId,
          message: a.message,
          timestamp: now,
          kind: a.kind ?? 'chat',
        });
      }
    }

    let stageIndex = this.state.stageIndex;
    let stage = this.state.stage;
    if (beat.stage) {
      stage = beat.stage;
      const idx = STAGES.findIndex((s) => s.id === beat.stage);
      stageIndex = idx >= 0 ? idx : stageIndex;
      if (beat.stage === 'complete') stageIndex = STAGES.length - 1;
    }

    this.patch({
      agents,
      stories,
      activity: activity.slice(0, 60),
      stage,
      stageIndex,
      progress: beat.progress ?? this.state.progress,
      running: beat.stage !== 'complete',
    });
  }

  private patch(partial: Partial<SimulationState>): void {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((l) => l(this.state));
  }
}
