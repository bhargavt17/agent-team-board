import { TEAM, STAGES, getAgent } from '../data/agents';
import {
  ActivityItem,
  AgentState,
  AgentStatus,
  ProductBrief,
  SimulationState,
  StageId,
  StoryStatus,
  UserStory,
} from '../types';
import { chatClaude } from '../ai/anthropicClient';
import { generateStoriesWithClaude } from '../ai/generateStoriesWithClaude';
import { beatUserPrompt, systemPromptForAgent } from '../ai/prompts';
import { generateStories } from './storyGenerator';

type Listener = (state: SimulationState) => void;

interface SpeakerBeat {
  agentId: string;
  hint: string;
  fallbackMessage: string;
  kind?: ActivityItem['kind'];
  /** Status while waiting on Claude */
  thinkingStatus?: AgentStatus;
  /** Status once message lands */
  speakingStatus?: AgentStatus;
  fallbackTask: string;
}

interface ScriptBeat {
  delayMs: number;
  stage?: StageId;
  /** Static agent patches applied after AI lines (or immediately if no speakers) */
  agents?: Partial<Record<string, { status: AgentStatus; task: string }>>;
  speakers?: SpeakerBeat[];
  stories?: { id: string; status?: StoryStatus }[];
  spawnStories?: boolean;
  progress?: number;
  systemActivity?: { message: string; kind?: ActivityItem['kind'] }[];
}

function idleAgents(): Record<string, AgentState> {
  return Object.fromEntries(
    TEAM.map((a) => [
      a.id,
      { id: a.id, status: 'Idle' as const, currentTask: 'Standing by' },
    ]),
  );
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    };
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

function buildScript(brief: ProductBrief): ScriptBeat[] {
  const product = brief.name.trim() || 'the product';
  return [
    {
      delayMs: 500,
      stage: 'discovery',
      progress: 4,
      speakers: [
        {
          agentId: 'aria',
          hint: 'Kick off discovery: frame the outcome and ask the team to clarify before architecture.',
          fallbackMessage: `${product} is fog until we name the outcome. Clarity first — architecture after.`,
          fallbackTask: `Framing vision for ${product}`,
          thinkingStatus: 'Thinking',
          speakingStatus: 'Speaking',
        },
      ],
      agents: {
        marcus: { status: 'Thinking', task: 'Listening for scope signals' },
      },
    },
    {
      delayMs: 1800,
      progress: 12,
      speakers: [
        {
          agentId: 'aria',
          hint: 'Lock goals and non-goals from the brief in one crisp update.',
          fallbackMessage: `North star locked: ${brief.goals.slice(0, 100) || 'deliver a focused MVP'}. Anything that doesn't serve it is noise.`,
          fallbackTask: 'Capturing goals & non-goals',
          thinkingStatus: 'Writing',
          speakingStatus: 'Speaking',
        },
        {
          agentId: 'marcus',
          hint: 'Commit to closing discovery this session; no zombie tickets.',
          fallbackMessage: 'Discovery closes this session. Every open question gets an owner — no zombie tickets.',
          fallbackTask: 'Drafting discovery notes',
          thinkingStatus: 'Writing',
          speakingStatus: 'Speaking',
        },
      ],
      agents: {
        jordan: { status: 'Thinking', task: 'Spotting testable outcomes' },
      },
    },
    {
      delayMs: 2000,
      stage: 'architecture',
      progress: 22,
      speakers: [
        {
          agentId: 'priya',
          hint: 'Sketch the system shape: modular core, API edge, honor constraints from the brief.',
          fallbackMessage: `Shape: modular core behind a thin API edge. Tradeoff — ${brief.constraints.slice(0, 80) || 'keep v1 lean'}. No platform theater.`,
          fallbackTask: `Sketching system for ${product}`,
          thinkingStatus: 'Thinking',
          speakingStatus: 'Speaking',
        },
      ],
      agents: {
        aria: { status: 'Reviewing', task: 'Reviewing priority stack' },
        leo: { status: 'Thinking', task: 'Mapping data boundaries' },
        sofia: { status: 'Thinking', task: 'Noting UX constraints' },
        marcus: { status: 'Idle', task: 'Waiting on architecture cut' },
      },
    },
    {
      delayMs: 2200,
      progress: 32,
      speakers: [
        {
          agentId: 'leo',
          hint: 'Propose API shape / contracts for this product.',
          fallbackMessage: 'Resource APIs, shared error envelope, idempotent writes. Contract first — then code.',
          fallbackTask: 'Drafting API contracts',
          thinkingStatus: 'Writing',
          speakingStatus: 'Speaking',
        },
        {
          agentId: 'sofia',
          hint: 'Call out phone-first UI constraints for the shell.',
          fallbackMessage: 'Phone-first shell, readable empty states, motion that earns its keep. Tablet can wait.',
          fallbackTask: 'Checking flow against shell',
          thinkingStatus: 'Reviewing',
          speakingStatus: 'Speaking',
        },
      ],
      agents: {
        priya: { status: 'Writing', task: 'Documenting service boundaries' },
      },
    },
    {
      delayMs: 2000,
      stage: 'story_breakdown',
      progress: 42,
      spawnStories: true,
      speakers: [
        {
          agentId: 'marcus',
          hint: 'Drive story breakdown: everyone owns clarity, not just tickets.',
          fallbackMessage: `Breaking ${product} into shippable stories. Clarity is owned — tickets are just the receipt.`,
          fallbackTask: 'Driving story breakdown',
          thinkingStatus: 'Thinking',
          speakingStatus: 'Speaking',
        },
      ],
      agents: {
        aria: { status: 'Reviewing', task: 'Validating story value' },
        priya: { status: 'Reviewing', task: 'Checking technical fit' },
        leo: { status: 'Writing', task: 'Splitting backend stories' },
        sofia: { status: 'Writing', task: 'Splitting frontend stories' },
        jordan: { status: 'Writing', task: 'Attaching acceptance seeds' },
      },
      systemActivity: [
        { message: 'User stories drafted into the backlog.', kind: 'story' },
      ],
    },
    {
      delayMs: 1800,
      progress: 52,
      stories: [
        { id: 'story-1', status: 'ready' },
        { id: 'story-2', status: 'ready' },
        { id: 'story-3', status: 'ready' },
      ],
      speakers: [
        {
          agentId: 'jordan',
          hint: 'Harden acceptance criteria on the top vision/domain stories — testable verbs only.',
          fallbackMessage: 'AC tightened on vision + domain — testable verbs only. Prove it or rewrite it.',
          fallbackTask: 'Hardening acceptance criteria',
          thinkingStatus: 'Reviewing',
          speakingStatus: 'Speaking',
        },
        {
          agentId: 'marcus',
          hint: 'Move the top three stories into Ready and note ordering by risk.',
          fallbackMessage: 'Top three → Ready. Owners named; risk order published.',
          fallbackTask: 'Ordering backlog by risk',
          thinkingStatus: 'Writing',
          speakingStatus: 'Speaking',
          kind: 'status',
        },
      ],
      agents: {
        leo: { status: 'Reviewing', task: 'Sizing API stories' },
        sofia: { status: 'Reviewing', task: 'Sizing UI stories' },
      },
    },
    {
      delayMs: 2000,
      stage: 'planning',
      progress: 62,
      stories: [
        { id: 'story-4', status: 'ready' },
        { id: 'story-5', status: 'ready' },
        { id: 'story-1', status: 'in_progress' },
      ],
      speakers: [
        {
          agentId: 'marcus',
          hint: `Set the sprint goal: prove the core path for ${product} end-to-end.`,
          fallbackMessage: `Sprint goal: prove ${product} end-to-end. Critical-path owners — talk to me by EOD if blocked.`,
          fallbackTask: 'Facilitating planning poker',
          thinkingStatus: 'Thinking',
          speakingStatus: 'Speaking',
        },
        {
          agentId: 'priya',
          hint: 'Flag a key dependency risk (e.g. auth ↔ API coupling).',
          fallbackMessage: 'Auth ↔ API is the coupling risk. Lock the auth contract before feature endpoints.',
          fallbackTask: 'Flagging dependency risks',
          thinkingStatus: 'Thinking',
          speakingStatus: 'Speaking',
        },
      ],
      agents: {
        aria: { status: 'Thinking', task: 'Protecting product focus' },
        leo: { status: 'Idle', task: 'Estimate submitted' },
        sofia: { status: 'Idle', task: 'Estimate submitted' },
        jordan: { status: 'Writing', task: 'Risk notes for QA' },
      },
    },
    {
      delayMs: 1800,
      progress: 72,
      stories: [
        { id: 'story-2', status: 'in_progress' },
        { id: 'story-5', status: 'in_progress' },
        { id: 'story-6', status: 'ready' },
        { id: 'story-7', status: 'ready' },
      ],
      speakers: [
        {
          agentId: 'marcus',
          hint: 'Confirm the board is updated: owners clear, dependencies tagged.',
          fallbackMessage: "Board's live. Owners named, deps tagged — nothing orphaned.",
          fallbackTask: 'Publishing sprint board',
          thinkingStatus: 'Writing',
          speakingStatus: 'Speaking',
          kind: 'status',
        },
      ],
      agents: {
        leo: { status: 'Thinking', task: 'Prepping auth foundation' },
        sofia: { status: 'Thinking', task: 'Prepping navigation shell' },
        jordan: { status: 'Reviewing', task: 'Mapping stories → test cases' },
      },
    },
    {
      delayMs: 2000,
      stage: 'implementation',
      progress: 82,
      stories: [
        { id: 'story-1', status: 'review' },
        { id: 'story-3', status: 'in_progress' },
        { id: 'story-6', status: 'in_progress' },
        { id: 'story-7', status: 'in_progress' },
        { id: 'story-4', status: 'in_progress' },
      ],
      speakers: [
        {
          agentId: 'marcus',
          hint: 'Kick off implementation stand-up: focus auth, shell, contracts.',
          fallbackMessage: "Kickoff. Sequence: auth, shell, contracts. Ping me the moment you're blocked.",
          fallbackTask: 'Kickoff stand-up',
          thinkingStatus: 'Thinking',
          speakingStatus: 'Speaking',
        },
        {
          agentId: 'leo',
          hint: 'Say what backend work you are starting first.',
          fallbackMessage: 'Auth/session foundation next — stub providers, lock the token contract.',
          fallbackTask: 'Implementing API contracts',
          thinkingStatus: 'Writing',
          speakingStatus: 'Speaking',
        },
        {
          agentId: 'sofia',
          hint: 'Say what frontend scaffolding you are landing.',
          fallbackMessage: 'Nav shell up, dark tokens in. Empty + error states before chrome polish.',
          fallbackTask: 'Building responsive shell',
          thinkingStatus: 'Writing',
          speakingStatus: 'Speaking',
        },
      ],
      agents: {
        aria: { status: 'Reviewing', task: 'Checking delivery against vision' },
        priya: { status: 'Reviewing', task: 'Guarding architectural seams' },
        jordan: { status: 'Writing', task: 'Drafting smoke tests' },
      },
    },
    {
      delayMs: 2200,
      progress: 90,
      stories: [
        { id: 'story-1', status: 'done' },
        { id: 'story-2', status: 'review' },
        { id: 'story-5', status: 'review' },
        { id: 'story-8', status: 'ready' },
      ],
      speakers: [
        {
          agentId: 'jordan',
          hint: 'Status update on what moved to Done/Review and that QA plan is next.',
          fallbackMessage: 'Vision → Done. Domain model in Review. QA plan next — prove the happy path.',
          fallbackTask: 'Aligning on QA plan',
          thinkingStatus: 'Reviewing',
          speakingStatus: 'Speaking',
          kind: 'status',
        },
      ],
      agents: {
        aria: { status: 'Idle', task: 'Vision check complete' },
        marcus: { status: 'Reviewing', task: 'Unblocking cross-team asks' },
        priya: { status: 'Writing', task: 'Architecture decision record' },
        leo: { status: 'Writing', task: 'Landing API happy paths' },
        sofia: { status: 'Reviewing', task: 'Polish empty & error states' },
      },
    },
    {
      delayMs: 2000,
      stage: 'qa_planning',
      progress: 96,
      stories: [
        { id: 'story-2', status: 'done' },
        { id: 'story-5', status: 'done' },
        { id: 'story-8', status: 'in_progress' },
        { id: 'story-3', status: 'review' },
        { id: 'story-4', status: 'review' },
      ],
      speakers: [
        {
          agentId: 'jordan',
          hint: `Publish the QA plan for ${product}: happy path, abuse cases, goal checks.`,
          fallbackMessage: `QA plan live for ${product}: happy path, abuse cases, goal checks. Soft verbs get rejected.`,
          fallbackTask: `Acceptance suite for ${product}`,
          thinkingStatus: 'Writing',
          speakingStatus: 'Speaking',
        },
        {
          agentId: 'marcus',
          hint: 'State exit criteria in one tight line.',
          fallbackMessage: 'Exit: core journey green, zero P0s, AC signed. Clock starts now.',
          fallbackTask: 'Confirming exit criteria',
          thinkingStatus: 'Reviewing',
          speakingStatus: 'Speaking',
        },
      ],
      agents: {
        leo: { status: 'Reviewing', task: 'Pairing on API edge cases' },
        sofia: { status: 'Reviewing', task: 'Pairing on UI edge cases' },
        priya: { status: 'Idle', task: 'On call for design questions' },
        aria: { status: 'Reviewing', task: 'Sign-off readiness' },
      },
    },
    {
      delayMs: 1600,
      stage: 'complete',
      progress: 100,
      stories: [
        { id: 'story-3', status: 'done' },
        { id: 'story-8', status: 'review' },
      ],
      speakers: [
        {
          agentId: 'aria',
          hint: 'Close the session: thank the team, confirm stories planned and QA ready.',
          fallbackMessage: `${product} is pointed. Stories planned, owners clear, QA armed. Signal over noise — well done.`,
          fallbackTask: 'Closing the session',
          thinkingStatus: 'Thinking',
          speakingStatus: 'Speaking',
        },
      ],
      agents: {
        marcus: { status: 'Idle', task: 'Board stable' },
        priya: { status: 'Idle', task: 'Architecture parked cleanly' },
        leo: { status: 'Idle', task: 'API work in flight' },
        sofia: { status: 'Idle', task: 'UI work in flight' },
        jordan: { status: 'Idle', task: 'QA plan ready for execution' },
      },
      systemActivity: [
        { message: 'Simulation complete — board remains interactive.', kind: 'system' },
      ],
    },
  ];
}

export interface SimulationOptions {
  brief: ProductBrief;
  apiKey?: string;
}

export class SimulationEngine {
  private state: SimulationState;
  private listeners = new Set<Listener>();
  private storyPool: UserStory[] = [];
  private apiKey: string;
  private abort: AbortController | null = null;
  private runToken = 0;

  constructor(opts: SimulationOptions) {
    const brief = opts.brief;
    const now = Date.now();
    this.apiKey = (opts.apiKey ?? '').trim();
    // Local fallback pool until Claude stories arrive (or if no key).
    this.storyPool = generateStories(brief, now);
    const aiMode = this.apiKey ? 'Claude live' : 'scripted fallback (add API key)';
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
          message: `Ops room online — ${aiMode}. Assembling team for ${brief.name || 'new product'}.`,
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
    this.stop();
    this.abort = new AbortController();
    const token = ++this.runToken;
    void this.run(token, this.abort.signal);
  }

  stop(): void {
    this.abort?.abort();
    this.abort = null;
    this.runToken += 1;
    if (this.state.running) {
      this.patch({ running: false });
    }
  }

  private async run(token: number, signal: AbortSignal): Promise<void> {
    const script = buildScript(this.state.brief);
    try {
      for (const beat of script) {
        if (token !== this.runToken || signal.aborted) return;
        await sleep(beat.delayMs, signal);
        if (token !== this.runToken || signal.aborted) return;
        await this.applyBeat(beat, signal);
      }
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') return;
      this.pushActivity({
        agentId: 'system',
        message: 'Simulation hitch — continuing with available updates.',
        kind: 'system',
      });
      this.patch({ running: false });
    }
  }

  private recentLines(limit = 4): string[] {
    return this.state.activity
      .filter((a) => a.kind === 'chat' || a.kind === 'status')
      .slice(0, limit)
      .map((a) => {
        const name = a.agentId === 'system' ? 'System' : getAgent(a.agentId).name.split(' ')[0];
        return `${name}: ${a.message}`;
      });
  }

  private pushActivity(item: {
    agentId: string;
    message: string;
    kind?: ActivityItem['kind'];
  }): void {
    const now = Date.now();
    const activity = [
      {
        id: `act-${now}-${Math.random().toString(36).slice(2, 7)}`,
        agentId: item.agentId,
        message: item.message,
        timestamp: now,
        kind: item.kind ?? 'chat',
      },
      ...this.state.activity,
    ].slice(0, 60);
    this.patch({ activity });
  }

  private async lineForSpeaker(
    speaker: SpeakerBeat,
    stage: StageId,
    signal: AbortSignal,
  ): Promise<{ message: string; task: string; fromAi: boolean }> {
    if (!this.apiKey) {
      return {
        message: speaker.fallbackMessage,
        task: speaker.fallbackTask,
        fromAi: false,
      };
    }
    try {
      const agent = getAgent(speaker.agentId);
      const text = await chatClaude({
        apiKey: this.apiKey,
        system: systemPromptForAgent(speaker.agentId),
        user: beatUserPrompt({
          agent,
          brief: this.state.brief,
          stage,
          hint: speaker.hint,
          recentActivity: this.recentLines(),
        }),
        maxTokens: 160,
        signal,
      });
      const message = text.replace(/^["']|["']$/g, '').trim() || speaker.fallbackMessage;
      return {
        message: message.slice(0, 280),
        task: speaker.fallbackTask,
        fromAi: true,
      };
    } catch {
      return {
        message: speaker.fallbackMessage,
        task: speaker.fallbackTask,
        fromAi: false,
      };
    }
  }

  private async applyBeat(beat: ScriptBeat, signal: AbortSignal): Promise<void> {
    const stageForAi = beat.stage ?? this.state.stage;

    // Show Thinking/Writing while awaiting Claude
    if (beat.speakers?.length) {
      const agents = { ...this.state.agents };
      for (const s of beat.speakers) {
        agents[s.agentId] = {
          id: s.agentId,
          status: s.thinkingStatus ?? 'Thinking',
          currentTask: s.fallbackTask,
        };
      }
      this.patch({ agents });
    }

    // Story spawn (Claude JSON with fallback)
    let stories = this.state.stories.map((s) => ({ ...s }));
    if (beat.spawnStories && stories.length === 0) {
      if (this.apiKey) {
        // Mark Marcus/Jordan busy while generating
        const agents = { ...this.state.agents };
        agents.marcus = {
          id: 'marcus',
          status: 'Writing',
          currentTask: 'Generating story backlog with Claude',
        };
        this.patch({ agents });
        this.pushActivity({
          agentId: 'system',
          message: 'Claude is drafting user stories…',
          kind: 'system',
        });
        const { stories: generated, source } = await generateStoriesWithClaude(
          this.state.brief,
          this.apiKey,
          Date.now(),
          signal,
        );
        this.storyPool = generated;
        this.pushActivity({
          agentId: 'system',
          message:
            source === 'claude'
              ? 'Story backlog generated by Claude.'
              : 'Story backlog using local fallback (Claude unavailable).',
          kind: 'system',
        });
      }
      stories = this.storyPool.map((s) => ({ ...s, status: 'backlog' as const }));
    }

    // Resolve speaker lines (parallel)
    const speakerResults: {
      speaker: SpeakerBeat;
      message: string;
      task: string;
    }[] = [];
    if (beat.speakers?.length) {
      const settled = await Promise.all(
        beat.speakers.map(async (speaker) => {
          const result = await this.lineForSpeaker(speaker, stageForAi, signal);
          return { speaker, ...result };
        }),
      );
      speakerResults.push(...settled);
    }

    if (signal.aborted) return;

    const agents = { ...this.state.agents };
    for (const r of speakerResults) {
      agents[r.speaker.agentId] = {
        id: r.speaker.agentId,
        status: r.speaker.speakingStatus ?? 'Speaking',
        currentTask: r.task,
      };
    }
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

    if (beat.stories) {
      for (const upd of beat.stories) {
        const idx = stories.findIndex((s) => s.id === upd.id);
        if (idx >= 0 && upd.status) {
          stories[idx] = { ...stories[idx], status: upd.status };
        }
      }
    }

    const activity = [...this.state.activity];
    const now = Date.now();
    for (const r of speakerResults) {
      activity.unshift({
        id: `act-${now}-${Math.random().toString(36).slice(2, 7)}`,
        agentId: r.speaker.agentId,
        message: r.message,
        timestamp: now,
        kind: r.speaker.kind ?? 'chat',
      });
    }
    if (beat.systemActivity) {
      for (const a of beat.systemActivity) {
        activity.unshift({
          id: `act-${now}-sys-${Math.random().toString(36).slice(2, 7)}`,
          agentId: 'system',
          message: a.message,
          timestamp: now,
          kind: a.kind ?? 'system',
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
