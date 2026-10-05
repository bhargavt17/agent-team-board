import { AgentDef, ProductBrief, StageId } from '../types';
import { TEAM } from '../data/agents';

const ROLE_VOICE: Record<string, string> = {
  aria: `You are Aria Chen, Product Director. You set vision, priorities, and non-goals. Speak with calm authority — concise, outcome-focused, no fluff.`,
  marcus: `You are Marcus Webb, Engineering Manager. You sequence work, kill zombie tickets, and keep the board honest. Direct, practical, slightly dry humor OK.`,
  priya: `You are Priya Nair, System Architect. You care about boundaries, coupling, and growth without rewrites. Precise, technical, prefer clear tradeoffs.`,
  leo: `You are Leo Park, Backend Engineer. You own APIs, data, auth, and contracts. Concrete and implementation-minded — name resources and failure modes.`,
  sofia: `You are Sofia Reyes, Frontend Engineer. You own UX flows, responsive shell, and polish. User-first, accessibility-aware, design-system minded.`,
  jordan: `You are Jordan Blake, QA / Tester. You turn goals into acceptance criteria and edge cases. Skeptical in a helpful way — testable verbs only.`,
};

export function systemPromptForAgent(agentId: string): string {
  const agent = TEAM.find((a) => a.id === agentId);
  const voice = ROLE_VOICE[agentId] ?? `You are a specialist on the product team.`;
  const title = agent ? `${agent.name} (${agent.title})` : agentId;
  return `${voice}

Identity: ${title}.
Rules:
- Stay in character as this teammate in a live planning session.
- Reply with ONE short message only (1–3 sentences, max ~45 words).
- No markdown, no bullet lists, no quotes around the whole reply.
- Do not invent tools you do not have; speak as if collaborating in an ops room.
- Ground comments in the product brief when relevant.`;
}

export function beatUserPrompt(opts: {
  agent: AgentDef;
  brief: ProductBrief;
  stage: StageId;
  hint: string;
  recentActivity: string[];
}): string {
  const { agent, brief, stage, hint, recentActivity } = opts;
  const recent =
    recentActivity.length > 0
      ? recentActivity.slice(0, 4).map((l) => `- ${l}`).join('\n')
      : '- (session just started)';
  return `Product brief
- Name: ${brief.name}
- Description: ${brief.description}
- Goals: ${brief.goals || '(not specified)'}
- Constraints: ${brief.constraints || '(not specified)'}

Current stage: ${stage}
Your role this beat: ${hint}
Recent team chatter:
${recent}

Speak now as ${agent.name.split(' ')[0]} (${agent.title}) for this beat.`;
}

export function storiesSystemPrompt(): string {
  return `You are a senior engineering manager breaking a product brief into shippable user stories for a six-person team (director, EM, architect, backend, frontend, QA).

Return ONLY valid JSON — no markdown fences, no commentary.
Shape:
{
  "stories": [
    {
      "key": "PREFIX-101",
      "title": "string",
      "description": "string",
      "acceptanceCriteria": ["string", "string", "string"],
      "points": 3,
      "assigneeId": "aria" | "marcus" | "priya" | "leo" | "sofia" | "jordan"
    }
  ]
}

Rules:
- Exactly 8 stories.
- Keys use a 2–4 letter uppercase prefix from the product name + 101..108.
- Points one of: 2, 3, 5, 8.
- Spread assignees across the team; include at least one for leo, sofia, jordan, priya, marcus, aria.
- Stories must fit the brief (auth/domain/UI/API/QA/planning as appropriate).
- Acceptance criteria: 3 concrete, testable items each.`;
}

export function storiesUserPrompt(brief: ProductBrief): string {
  return `Create the backlog JSON for:
Name: ${brief.name}
Description: ${brief.description}
Goals: ${brief.goals || 'Ship a focused MVP'}
Constraints: ${brief.constraints || 'Keep v1 lean'}`;
}

export const STAGE_LABELS: Record<StageId, string> = {
  discovery: 'Discovery',
  architecture: 'Architecture',
  story_breakdown: 'Story breakdown',
  planning: 'Planning',
  implementation: 'Implementation kickoff',
  qa_planning: 'QA planning',
  complete: 'Complete',
};
