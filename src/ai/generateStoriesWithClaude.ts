import { ProductBrief, UserStory } from '../types';
import { generateStories } from '../simulation/storyGenerator';
import { chatClaude, parseJsonLoose } from './anthropicClient';
import { storiesSystemPrompt, storiesUserPrompt } from './prompts';

interface ClaudeStory {
  key?: string;
  title?: string;
  description?: string;
  acceptanceCriteria?: string[];
  points?: number;
  assigneeId?: string;
}

interface ClaudeStoriesPayload {
  stories?: ClaudeStory[];
}

const VALID_ASSIGNEES = new Set([
  'aria',
  'marcus',
  'priya',
  'leo',
  'sofia',
  'jordan',
]);

const VALID_POINTS = new Set([2, 3, 5, 8]);

export async function generateStoriesWithClaude(
  brief: ProductBrief,
  apiKey: string,
  now: number,
  signal?: AbortSignal,
): Promise<{ stories: UserStory[]; source: 'claude' | 'fallback' }> {
  if (!apiKey.trim()) {
    return { stories: generateStories(brief, now), source: 'fallback' };
  }

  try {
    const raw = await chatClaude({
      apiKey,
      system: storiesSystemPrompt(),
      user: storiesUserPrompt(brief),
      maxTokens: 2200,
      signal,
    });
    const parsed = parseJsonLoose<ClaudeStoriesPayload>(raw);
    const list = Array.isArray(parsed.stories) ? parsed.stories : [];
    if (list.length < 4) {
      throw new Error('Too few stories from Claude');
    }

    const stories: UserStory[] = list.slice(0, 8).map((s, i) => {
      const assignee =
        typeof s.assigneeId === 'string' && VALID_ASSIGNEES.has(s.assigneeId)
          ? s.assigneeId
          : ['aria', 'priya', 'leo', 'sofia', 'marcus', 'leo', 'sofia', 'jordan'][i] ??
            'marcus';
      const points =
        typeof s.points === 'number' && VALID_POINTS.has(s.points) ? s.points : 5;
      const ac = Array.isArray(s.acceptanceCriteria)
        ? s.acceptanceCriteria.map(String).filter(Boolean).slice(0, 5)
        : [];
      while (ac.length < 2) {
        ac.push('Demonstrable acceptance agreed by the team');
      }
      return {
        id: `story-${i + 1}`,
        key: (s.key || `APP-${101 + i}`).toString().slice(0, 16),
        title: (s.title || `Story ${i + 1} for ${brief.name}`).toString().slice(0, 120),
        description: (
          s.description || `Work item supporting ${brief.name}`
        )
          .toString()
          .slice(0, 400),
        acceptanceCriteria: ac,
        points,
        assigneeId: assignee,
        status: 'backlog' as const,
        createdAt: now + i * 400,
      };
    });

    return { stories, source: 'claude' };
  } catch {
    return { stories: generateStories(brief, now), source: 'fallback' };
  }
}
