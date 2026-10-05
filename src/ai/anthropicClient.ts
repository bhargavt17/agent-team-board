const API_URL = 'https://api.anthropic.com/v1/messages';
/** Claude Opus (max tier) for all agent beats + story JSON. */
export const CLAUDE_MODEL = 'claude-opus-5-5';
const ANTHROPIC_VERSION = '2023-06-01';

export class ClaudeError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ClaudeError';
    this.status = status;
  }
}

export interface ChatOptions {
  apiKey: string;
  system: string;
  user: string;
  maxTokens?: number;
  signal?: AbortSignal;
}

interface AnthropicContentBlock {
  type: string;
  text?: string;
}

interface AnthropicResponse {
  content?: AnthropicContentBlock[];
  error?: { message?: string; type?: string };
}

export async function chatClaude(opts: ChatOptions): Promise<string> {
  const key = opts.apiKey.trim();
  if (!key) {
    throw new ClaudeError('Missing Anthropic API key');
  }

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'x-api-key': key,
      'anthropic-version': ANTHROPIC_VERSION,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: opts.maxTokens ?? 280,
      system: opts.system,
      messages: [{ role: 'user', content: opts.user }],
    }),
    signal: opts.signal,
  });

  const raw = await res.text();
  let data: AnthropicResponse = {};
  try {
    data = JSON.parse(raw) as AnthropicResponse;
  } catch {
    // non-JSON body
  }

  if (!res.ok) {
    const msg =
      data.error?.message ||
      raw.slice(0, 180) ||
      `Claude HTTP ${res.status}`;
    throw new ClaudeError(msg, res.status);
  }

  const text = (data.content ?? [])
    .filter((b) => b.type === 'text' && typeof b.text === 'string')
    .map((b) => b.text!.trim())
    .join('\n')
    .trim();

  if (!text) {
    throw new ClaudeError('Empty Claude response');
  }
  return text;
}

/** Strip optional ```json fences and parse. */
export function parseJsonLoose<T>(text: string): T {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  }
  return JSON.parse(cleaned) as T;
}
