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
import { streamChatClaude } from '../ai/anthropicClient';
import { generateStoriesWithClaude } from '../ai/generateStoriesWithClaude';
import { beatUserPrompt, systemPromptForAgent } from '../ai/prompts';
import { generateStories } from './storyGenerator';

type Listener = (state: SimulationState) => void;

interface SpeakerSpec {
  agentId: string;
  hint: string;
  fallbackMessage: string;
  fallbackTask: string;
  thinkingStatus?: AgentStatus;
  speakingStatus?: AgentStatus;
  kind?: ActivityItem['kind'];
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

function stageIndexOf(stage: StageId): number {
  if (stage === 'complete') return STAGES.length - 1;
  const idx = STAGES.findIndex((s) => s.id === stage);
  return idx >= 0 ? idx : 0;
}

/** Progress checkpoints per completed stage gate. */
const STAGE_PROGRESS: Record<StageId, number> = {
  discovery: 14,
  architecture: 28,
  story_breakdown: 48,
  planning: 66,
  implementation: 84,
  qa_planning: 96,
  complete: 100,
};

export interface SimulationOptions {
  brief: ProductBrief;
  apiKey?: string;
}

/**
 * Realtime simulation: stage gates driven by parallel Claude work.
 * Agents call the model concurrently; UI patches as each stream/promise races in.
 */
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
    this.storyPool = generateStories(brief, now);
    const aiMode = this.apiKey
      ? 'Claude live · parallel streams'
      : 'scripted fallback (add API key)';
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
    const product = this.state.brief.name.trim() || 'the product';
    const brief = this.state.brief;

    try {
      // ── 1. Discovery: Aria + Marcus + Jordan in parallel ──────────────
      this.enterStage('discovery', {
        aria: { status: 'Thinking', task: `Framing vision for ${product}` },
        marcus: { status: 'Thinking', task: 'Listening for scope signals' },
        jordan: { status: 'Thinking', task: 'Spotting testable outcomes' },
      });
      await this.speakParallel(
        [
          {
            agentId: 'aria',
            hint: 'Kick off discovery: frame the outcome and ask the team to clarify before architecture.',
            fallbackMessage: `${product} is fog until we name the outcome. Clarity first — architecture after.`,
            fallbackTask: `Framing vision for ${product}`,
            thinkingStatus: 'Thinking',
            speakingStatus: 'Speaking',
          },
          {
            agentId: 'marcus',
            hint: 'Commit to closing discovery this session; assign owners to open questions; no zombie tickets.',
            fallbackMessage:
              'Discovery closes this session. Every open question gets an owner — no zombie tickets.',
            fallbackTask: 'Drafting discovery notes',
            thinkingStatus: 'Writing',
            speakingStatus: 'Speaking',
          },
          {
            agentId: 'jordan',
            hint: 'Name one testable outcome we must prove in v1 from the brief goals.',
            fallbackMessage: `Prove it: ${brief.goals.slice(0, 80) || 'the core journey works end-to-end'}. Soft verbs get rejected.`,
            fallbackTask: 'Drafting outcome checks',
            thinkingStatus: 'Thinking',
            speakingStatus: 'Speaking',
          },
        ],
        signal,
        token,
      );
      if (this.dead(token, signal)) return;
      await this.naturalPause(350, signal);

      // ── 2. Architecture: Priya + Leo + Sofia concurrent (Aria reviews) ─
      this.enterStage('architecture', {
        aria: { status: 'Reviewing', task: 'Reviewing priority stack' },
        priya: { status: 'Thinking', task: `Sketching system for ${product}` },
        leo: { status: 'Thinking', task: 'Mapping data boundaries' },
        sofia: { status: 'Thinking', task: 'Noting UX constraints' },
        marcus: { status: 'Idle', task: 'Waiting on architecture cut' },
        jordan: { status: 'Idle', task: 'Parking outcome notes' },
      });
      await this.speakParallel(
        [
          {
            agentId: 'priya',
            hint: 'Sketch the system shape: modular core, API edge, honor constraints from the brief. One clear tradeoff.',
            fallbackMessage: `Shape: modular core behind a thin API edge. Tradeoff — ${brief.constraints.slice(0, 80) || 'keep v1 lean'}. No platform theater.`,
            fallbackTask: `Documenting seams for ${product}`,
            thinkingStatus: 'Thinking',
            speakingStatus: 'Speaking',
          },
          {
            agentId: 'leo',
            hint: 'Propose API shape / contracts for this product — resources, errors, idempotency.',
            fallbackMessage:
              'Resource APIs, shared error envelope, idempotent writes. Contract first — then code.',
            fallbackTask: 'Drafting API contracts',
            thinkingStatus: 'Writing',
            speakingStatus: 'Speaking',
          },
          {
            agentId: 'sofia',
            hint: 'Call out phone-first UI constraints for the shell while architecture lands.',
            fallbackMessage:
              'Phone-first shell, readable empty states, motion that earns its keep. Tablet can wait.',
            fallbackTask: 'Checking flow against shell',
            thinkingStatus: 'Writing',
            speakingStatus: 'Speaking',
          },
        ],
        signal,
        token,
      );
      if (this.dead(token, signal)) return;
      await this.naturalPause(300, signal);

      // ── 3. Story breakdown: Claude stories + concurrent agent chatter ─
      this.enterStage('story_breakdown', {
        marcus: { status: 'Writing', task: 'Generating story backlog with Claude' },
        aria: { status: 'Reviewing', task: 'Validating story value' },
        priya: { status: 'Reviewing', task: 'Checking technical fit' },
        leo: { status: 'Writing', task: 'Splitting backend stories' },
        sofia: { status: 'Writing', task: 'Splitting frontend stories' },
        jordan: { status: 'Writing', task: 'Attaching acceptance seeds' },
      });
      this.pushActivity({
        agentId: 'system',
        message: 'Backlog generation started — stories will land as Claude returns.',
        kind: 'system',
      });

      // Fire story gen AND speaker lines at the same time
      const storyPromise = this.spawnStoriesLive(signal, token);
      const chatterPromise = this.speakParallel(
        [
          {
            agentId: 'marcus',
            hint: 'Drive story breakdown: everyone owns clarity, not just tickets. React as backlog forms.',
            fallbackMessage: `Breaking ${product} into shippable stories. Clarity is owned — tickets are just the receipt.`,
            fallbackTask: 'Driving story breakdown',
            thinkingStatus: 'Writing',
            speakingStatus: 'Speaking',
          },
          {
            agentId: 'leo',
            hint: 'Call out the backend stories you expect in the backlog (auth, API, data).',
            fallbackMessage: 'Auth, resource APIs, and data model — those three land first on my side.',
            fallbackTask: 'Claiming backend slice',
            thinkingStatus: 'Writing',
            speakingStatus: 'Speaking',
          },
          {
            agentId: 'sofia',
            hint: 'Call out the frontend stories you expect (shell, hero journey, empty/error).',
            fallbackMessage: 'Shell, hero journey, empty + error states — UI stories should mirror the API contracts.',
            fallbackTask: 'Claiming frontend slice',
            thinkingStatus: 'Writing',
            speakingStatus: 'Speaking',
          },
          {
            agentId: 'jordan',
            hint: 'Demand testable AC seeds on every story that lands.',
            fallbackMessage: 'Every story needs testable verbs. If AC is soft, it does not ship.',
            fallbackTask: 'Seeding acceptance criteria',
            thinkingStatus: 'Writing',
            speakingStatus: 'Speaking',
          },
        ],
        signal,
        token,
      );
      await Promise.allSettled([storyPromise, chatterPromise]);
      if (this.dead(token, signal)) return;
      await this.naturalPause(280, signal);

      // ── 4. Planning: move top stories + parallel reactions ────────────
      this.enterStage('planning', {
        marcus: { status: 'Thinking', task: 'Facilitating planning poker' },
        priya: { status: 'Thinking', task: 'Flagging dependency risks' },
        aria: { status: 'Thinking', task: 'Protecting product focus' },
        jordan: { status: 'Writing', task: 'Risk notes for QA' },
        leo: { status: 'Reviewing', task: 'Sizing API stories' },
        sofia: { status: 'Reviewing', task: 'Sizing UI stories' },
      });
      // Reactive board moves as soon as we enter planning
      this.moveStories([
        { id: 'story-1', status: 'ready' },
        { id: 'story-2', status: 'ready' },
        { id: 'story-3', status: 'ready' },
        { id: 'story-4', status: 'ready' },
        { id: 'story-5', status: 'ready' },
      ]);
      await this.speakParallel(
        [
          {
            agentId: 'marcus',
            hint: `Set the sprint goal: prove the core path for ${product} end-to-end. Note owners.`,
            fallbackMessage: `Sprint goal: prove ${product} end-to-end. Critical-path owners — talk to me by EOD if blocked.`,
            fallbackTask: 'Publishing sprint goal',
            thinkingStatus: 'Thinking',
            speakingStatus: 'Speaking',
            kind: 'status',
          },
          {
            agentId: 'priya',
            hint: 'Flag a key dependency risk (e.g. auth ↔ API coupling).',
            fallbackMessage:
              'Auth ↔ API is the coupling risk. Lock the auth contract before feature endpoints.',
            fallbackTask: 'Flagging dependency risks',
            thinkingStatus: 'Thinking',
            speakingStatus: 'Speaking',
          },
          {
            agentId: 'aria',
            hint: 'Protect product focus — cut anything that does not serve the north star.',
            fallbackMessage: `Keep ${product} pointed at the outcome. Nice-to-haves wait.`,
            fallbackTask: 'Guarding scope',
            thinkingStatus: 'Reviewing',
            speakingStatus: 'Speaking',
          },
        ],
        signal,
        token,
      );
      if (this.dead(token, signal)) return;
      this.moveStories([
        { id: 'story-1', status: 'in_progress' },
        { id: 'story-6', status: 'ready' },
        { id: 'story-7', status: 'ready' },
      ]);
      await this.naturalPause(250, signal);

      // ── 5. Implementation kickoff: Leo + Sofia + Marcus concurrent ────
      this.enterStage('implementation', {
        marcus: { status: 'Thinking', task: 'Kickoff stand-up' },
        leo: { status: 'Writing', task: 'Implementing API contracts' },
        sofia: { status: 'Writing', task: 'Building responsive shell' },
        jordan: { status: 'Writing', task: 'Drafting smoke tests' },
        aria: { status: 'Reviewing', task: 'Checking delivery against vision' },
        priya: { status: 'Reviewing', task: 'Guarding architectural seams' },
      });
      this.moveStories([
        { id: 'story-2', status: 'in_progress' },
        { id: 'story-5', status: 'in_progress' },
        { id: 'story-6', status: 'in_progress' },
        { id: 'story-7', status: 'in_progress' },
        { id: 'story-4', status: 'in_progress' },
      ]);
      await this.speakParallel(
        [
          {
            agentId: 'marcus',
            hint: 'Kick off implementation stand-up: focus auth, shell, contracts.',
            fallbackMessage:
              "Kickoff. Sequence: auth, shell, contracts. Ping me the moment you're blocked.",
            fallbackTask: 'Running kickoff',
            thinkingStatus: 'Thinking',
            speakingStatus: 'Speaking',
          },
          {
            agentId: 'leo',
            hint: 'Say what backend work you are starting first.',
            fallbackMessage:
              'Auth/session foundation next — stub providers, lock the token contract.',
            fallbackTask: 'Landing auth foundation',
            thinkingStatus: 'Writing',
            speakingStatus: 'Speaking',
          },
          {
            agentId: 'sofia',
            hint: 'Say what frontend scaffolding you are landing.',
            fallbackMessage:
              'Nav shell up, dark tokens in. Empty + error states before chrome polish.',
            fallbackTask: 'Shipping nav shell',
            thinkingStatus: 'Writing',
            speakingStatus: 'Speaking',
          },
          {
            agentId: 'jordan',
            hint: 'Status: which stories move to Review and what smoke covers first.',
            fallbackMessage:
              'Smoke on auth + shell first. Anything without AC stays out of Review.',
            fallbackTask: 'Wiring smoke coverage',
            thinkingStatus: 'Writing',
            speakingStatus: 'Speaking',
            kind: 'status',
          },
        ],
        signal,
        token,
      );
      if (this.dead(token, signal)) return;
      this.moveStories([
        { id: 'story-1', status: 'review' },
        { id: 'story-3', status: 'in_progress' },
        { id: 'story-8', status: 'ready' },
      ]);
      await this.naturalPause(250, signal);

      // ── 6. QA planning: Jordan + Marcus (+ Leo/Sofia reviewing) ───────
      this.enterStage('qa_planning', {
        jordan: { status: 'Writing', task: `Acceptance suite for ${product}` },
        marcus: { status: 'Reviewing', task: 'Confirming exit criteria' },
        leo: { status: 'Reviewing', task: 'Pairing on API edge cases' },
        sofia: { status: 'Reviewing', task: 'Pairing on UI edge cases' },
        priya: { status: 'Idle', task: 'On call for design questions' },
        aria: { status: 'Reviewing', task: 'Sign-off readiness' },
      });
      this.moveStories([
        { id: 'story-1', status: 'done' },
        { id: 'story-2', status: 'review' },
        { id: 'story-5', status: 'review' },
        { id: 'story-8', status: 'in_progress' },
      ]);
      await this.speakParallel(
        [
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
            fallbackMessage:
              'Exit: core journey green, zero P0s, AC signed. Clock starts now.',
            fallbackTask: 'Locking exit criteria',
            thinkingStatus: 'Reviewing',
            speakingStatus: 'Speaking',
          },
        ],
        signal,
        token,
      );
      if (this.dead(token, signal)) return;
      this.moveStories([
        { id: 'story-2', status: 'done' },
        { id: 'story-5', status: 'done' },
        { id: 'story-3', status: 'review' },
        { id: 'story-4', status: 'review' },
      ]);
      await this.naturalPause(280, signal);

      // ── 7. Complete ───────────────────────────────────────────────────
      this.enterStage('complete', {
        aria: { status: 'Thinking', task: 'Closing the session' },
        marcus: { status: 'Idle', task: 'Board stable' },
        priya: { status: 'Idle', task: 'Architecture parked cleanly' },
        leo: { status: 'Idle', task: 'API work in flight' },
        sofia: { status: 'Idle', task: 'UI work in flight' },
        jordan: { status: 'Idle', task: 'QA plan ready for execution' },
      });
      this.moveStories([
        { id: 'story-3', status: 'done' },
        { id: 'story-8', status: 'review' },
      ]);
      await this.speakParallel(
        [
          {
            agentId: 'aria',
            hint: 'Close the session: thank the team, confirm stories planned and QA ready.',
            fallbackMessage: `${product} is pointed. Stories planned, owners clear, QA armed. Signal over noise — well done.`,
            fallbackTask: 'Session closed',
            thinkingStatus: 'Thinking',
            speakingStatus: 'Speaking',
          },
        ],
        signal,
        token,
      );
      if (this.dead(token, signal)) return;

      this.setAgent('aria', 'Idle', 'Vision parked');
      this.pushActivity({
        agentId: 'system',
        message: 'Simulation complete — board remains interactive.',
        kind: 'system',
      });
      this.patch({
        progress: 100,
        running: false,
        stage: 'complete',
        stageIndex: stageIndexOf('complete'),
      });
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

  private dead(token: number, signal: AbortSignal): boolean {
    return token !== this.runToken || signal.aborted;
  }

  private async naturalPause(ms: number, signal: AbortSignal): Promise<void> {
    try {
      await sleep(ms, signal);
    } catch {
      // aborted
    }
  }

  private enterStage(
    stage: StageId,
    agents: Partial<Record<string, { status: AgentStatus; task: string }>>,
  ): void {
    const next = { ...this.state.agents };
    for (const [id, patch] of Object.entries(agents)) {
      if (!patch) continue;
      next[id] = { id, status: patch.status, currentTask: patch.task };
    }
    this.patch({
      stage,
      stageIndex: stageIndexOf(stage),
      progress: Math.max(this.state.progress, STAGE_PROGRESS[stage] - 8),
      agents: next,
      running: stage !== 'complete',
    });
    this.pushActivity({
      agentId: 'system',
      message: `Stage → ${STAGES.find((s) => s.id === stage)?.label ?? stage}`,
      kind: 'system',
    });
  }

  /**
   * Fire all speakers concurrently. Each stream patches the UI as tokens arrive;
   * when a Promise settles, that agent flips to Speaking immediately (race).
   */
  private async speakParallel(
    speakers: SpeakerSpec[],
    signal: AbortSignal,
    token: number,
  ): Promise<void> {
    // Mark everyone Thinking/Writing immediately
    const agents = { ...this.state.agents };
    for (const s of speakers) {
      agents[s.agentId] = {
        id: s.agentId,
        status: s.thinkingStatus ?? 'Thinking',
        currentTask: s.fallbackTask,
      };
    }
    this.patch({ agents });

    await Promise.allSettled(
      speakers.map((speaker) => this.speakOne(speaker, signal, token)),
    );

    if (!this.dead(token, signal)) {
      this.patch({
        progress: Math.max(
          this.state.progress,
          STAGE_PROGRESS[this.state.stage] ?? this.state.progress,
        ),
      });
    }
  }

  private async speakOne(
    speaker: SpeakerSpec,
    signal: AbortSignal,
    token: number,
  ): Promise<void> {
    if (this.dead(token, signal)) return;

    const activityId = `act-${speaker.agentId}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 6)}`;

    // Placeholder row so the feed shows the agent is live immediately
    this.upsertActivity({
      id: activityId,
      agentId: speaker.agentId,
      message: '…',
      timestamp: Date.now(),
      kind: speaker.kind ?? 'chat',
    });

    let message = speaker.fallbackMessage;

    if (this.apiKey) {
      try {
        const agent = getAgent(speaker.agentId);
        const text = await streamChatClaude({
          apiKey: this.apiKey,
          system: systemPromptForAgent(speaker.agentId),
          user: beatUserPrompt({
            agent,
            brief: this.state.brief,
            stage: this.state.stage,
            hint: speaker.hint,
            recentActivity: this.recentLines(),
          }),
          maxTokens: 160,
          signal,
          onDelta: (_chunk, full) => {
            if (this.dead(token, signal)) return;
            const partial = full.replace(/^["']|["']$/g, '').trim();
            if (!partial) return;
            this.upsertActivity({
              id: activityId,
              agentId: speaker.agentId,
              message: partial.slice(0, 280),
              timestamp: Date.now(),
              kind: speaker.kind ?? 'chat',
            });
            // Keep task line reflecting live speech
            this.setAgent(
              speaker.agentId,
              speaker.thinkingStatus ?? 'Writing',
              partial.slice(0, 72) || speaker.fallbackTask,
            );
          },
        });
        message =
          text.replace(/^["']|["']$/g, '').trim().slice(0, 280) ||
          speaker.fallbackMessage;
      } catch {
        message = speaker.fallbackMessage;
      }
    } else {
      // Scripted fallback: still feel live with a short typewriter
      await this.typewriterFallback(activityId, speaker, message, signal, token);
    }

    if (this.dead(token, signal)) return;

    this.upsertActivity({
      id: activityId,
      agentId: speaker.agentId,
      message,
      timestamp: Date.now(),
      kind: speaker.kind ?? 'chat',
    });
    this.setAgent(
      speaker.agentId,
      speaker.speakingStatus ?? 'Speaking',
      speaker.fallbackTask,
    );
  }

  private async typewriterFallback(
    activityId: string,
    speaker: SpeakerSpec,
    message: string,
    signal: AbortSignal,
    token: number,
  ): Promise<void> {
    const words = message.split(/\s+/);
    let built = '';
    for (let i = 0; i < words.length; i++) {
      if (this.dead(token, signal)) return;
      built = (built ? `${built} ` : '') + words[i];
      this.upsertActivity({
        id: activityId,
        agentId: speaker.agentId,
        message: built,
        timestamp: Date.now(),
        kind: speaker.kind ?? 'chat',
      });
      this.setAgent(
        speaker.agentId,
        speaker.thinkingStatus ?? 'Writing',
        built.slice(0, 72),
      );
      try {
        await sleep(28 + Math.floor(Math.random() * 40), signal);
      } catch {
        return;
      }
    }
  }

  /** Generate stories and push them onto the board as soon as Claude returns. */
  private async spawnStoriesLive(
    signal: AbortSignal,
    token: number,
  ): Promise<void> {
    if (this.dead(token, signal)) return;

    let stories: UserStory[] = [];
    let source: 'claude' | 'fallback' = 'fallback';

    if (this.apiKey) {
      const result = await generateStoriesWithClaude(
        this.state.brief,
        this.apiKey,
        Date.now(),
        signal,
      );
      stories = result.stories;
      source = result.source;
    } else {
      stories = this.storyPool.map((s) => ({ ...s, status: 'backlog' as const }));
    }

    if (this.dead(token, signal)) return;

    this.storyPool = stories;
    // Reveal cards quickly one-by-one so the board feels reactive to the payload
    const revealed: UserStory[] = [];
    for (const story of stories) {
      if (this.dead(token, signal)) return;
      revealed.push({ ...story, status: 'backlog' });
      this.patch({ stories: [...revealed] });
      this.pushActivity({
        agentId: 'system',
        message: `Story landed · ${story.key} — ${story.title}`,
        kind: 'story',
      });
      try {
        await sleep(90, signal);
      } catch {
        return;
      }
    }

    this.pushActivity({
      agentId: 'system',
      message:
        source === 'claude'
          ? 'Story backlog generated by Claude — board is live.'
          : 'Story backlog using local fallback (Claude unavailable).',
      kind: 'system',
    });
  }

  private moveStories(updates: { id: string; status: StoryStatus }[]): void {
    if (this.state.stories.length === 0) return;
    const stories = this.state.stories.map((s) => {
      const upd = updates.find((u) => u.id === s.id);
      return upd ? { ...s, status: upd.status } : s;
    });
    this.patch({ stories });
    const moved = updates.filter((u) =>
      this.state.stories.some((s) => s.id === u.id),
    );
    if (moved.length) {
      this.pushActivity({
        agentId: 'system',
        message: `Board update · ${moved
          .map((m) => `${m.id.replace('story-', '#')} → ${m.status}`)
          .slice(0, 4)
          .join(', ')}`,
        kind: 'story',
      });
    }
  }

  private recentLines(limit = 5): string[] {
    return this.state.activity
      .filter((a) => a.kind === 'chat' || a.kind === 'status')
      .filter((a) => a.message && a.message !== '…')
      .slice(0, limit)
      .map((a) => {
        const name =
          a.agentId === 'system'
            ? 'System'
            : getAgent(a.agentId).name.split(' ')[0];
        return `${name}: ${a.message}`;
      });
  }

  private setAgent(id: string, status: AgentStatus, task: string): void {
    this.patch({
      agents: {
        ...this.state.agents,
        [id]: { id, status, currentTask: task },
      },
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
    ].slice(0, 80);
    this.patch({ activity });
  }

  /** Insert or replace an activity row by id (used for streaming updates). */
  private upsertActivity(item: ActivityItem): void {
    const existing = this.state.activity.findIndex((a) => a.id === item.id);
    let activity: ActivityItem[];
    if (existing >= 0) {
      activity = this.state.activity.map((a) => (a.id === item.id ? item : a));
    } else {
      activity = [item, ...this.state.activity].slice(0, 80);
    }
    this.patch({ activity });
  }

  private patch(partial: Partial<SimulationState>): void {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((l) => l(this.state));
  }
}
