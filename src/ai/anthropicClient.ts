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

export interface StreamChatOptions extends ChatOptions {
  /** Fired for each text delta as tokens arrive. */
  onDelta?: (chunk: string, fullSoFar: string) => void;
}

interface AnthropicContentBlock {
  type: string;
  text?: string;
}

interface AnthropicResponse {
  content?: AnthropicContentBlock[];
  error?: { message?: string; type?: string };
}

function authHeaders(apiKey: string): Record<string, string> {
  return {
    'x-api-key': apiKey.trim(),
    'anthropic-version': ANTHROPIC_VERSION,
    'content-type': 'application/json',
    // Helps when Expo web hits the API directly (may still CORS-block).
    'anthropic-dangerous-direct-browser-access': 'true',
  };
}

function extractText(data: AnthropicResponse): string {
  return (data.content ?? [])
    .filter((b) => b.type === 'text' && typeof b.text === 'string')
    .map((b) => b.text!.trim())
    .join('\n')
    .trim();
}

async function parseError(res: Response): Promise<never> {
  const raw = await res.text();
  let data: AnthropicResponse = {};
  try {
    data = JSON.parse(raw) as AnthropicResponse;
  } catch {
    // ignore
  }
  const msg =
    data.error?.message || raw.slice(0, 180) || `Claude HTTP ${res.status}`;
  throw new ClaudeError(msg, res.status);
}

/** Non-streaming chat (used for JSON story generation). */
export async function chatClaude(opts: ChatOptions): Promise<string> {
  const key = opts.apiKey.trim();
  if (!key) throw new ClaudeError('Missing Anthropic API key');

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: authHeaders(key),
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: opts.maxTokens ?? 280,
      system: opts.system,
      messages: [{ role: 'user', content: opts.user }],
    }),
    signal: opts.signal,
  });

  if (!res.ok) await parseError(res);

  const raw = await res.text();
  let data: AnthropicResponse = {};
  try {
    data = JSON.parse(raw) as AnthropicResponse;
  } catch {
    throw new ClaudeError('Invalid Claude JSON');
  }

  const text = extractText(data);
  if (!text) throw new ClaudeError('Empty Claude response');
  return text;
}

/**
 * Streaming chat via Anthropic SSE.
 * Falls back to non-streaming if the runtime has no ReadableStream body.
 */
export async function streamChatClaude(opts: StreamChatOptions): Promise<string> {
  const key = opts.apiKey.trim();
  if (!key) throw new ClaudeError('Missing Anthropic API key');

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: authHeaders(key),
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: opts.maxTokens ?? 160,
      stream: true,
      system: opts.system,
      messages: [{ role: 'user', content: opts.user }],
    }),
    signal: opts.signal,
  });

  if (!res.ok) await parseError(res);

  const body = res.body;
  if (!body || typeof (body as ReadableStream<Uint8Array>).getReader !== 'function') {
    // No stream support — read full payload (Anthropic may still wrap SSE as text).
    const raw = await res.text();
    const streamed = parseSseText(raw, opts.onDelta);
    if (streamed) return streamed;
    // Or a non-stream JSON body if the server ignored stream:true
    try {
      const data = JSON.parse(raw) as AnthropicResponse;
      const text = extractText(data);
      if (text) {
        opts.onDelta?.(text, text);
        return text;
      }
    } catch {
      // fall through
    }
    throw new ClaudeError('Empty Claude stream');
  }

  const reader = (body as ReadableStream<Uint8Array>).getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let full = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const parts = buffer.split('\n');
    buffer = parts.pop() ?? '';

    for (const line of parts) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === '[DONE]') continue;
      try {
        const evt = JSON.parse(payload) as {
          type?: string;
          delta?: { type?: string; text?: string };
          error?: { message?: string };
        };
        if (evt.error?.message) throw new ClaudeError(evt.error.message);
        if (
          evt.type === 'content_block_delta' &&
          evt.delta?.type === 'text_delta' &&
          typeof evt.delta.text === 'string'
        ) {
          const chunk = evt.delta.text;
          full += chunk;
          opts.onDelta?.(chunk, full);
        }
      } catch (e) {
        if (e instanceof ClaudeError) throw e;
        // skip malformed SSE lines
      }
    }
  }

  if (!full.trim()) throw new ClaudeError('Empty Claude stream');
  return full.trim();
}

/** Parse a complete SSE body (when fetch returns the whole stream as text). */
function parseSseText(
  raw: string,
  onDelta?: (chunk: string, fullSoFar: string) => void,
): string {
  let full = '';
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('data:')) continue;
    const payload = trimmed.slice(5).trim();
    if (!payload || payload === '[DONE]') continue;
    try {
      const evt = JSON.parse(payload) as {
        type?: string;
        delta?: { type?: string; text?: string };
      };
      if (
        evt.type === 'content_block_delta' &&
        evt.delta?.type === 'text_delta' &&
        typeof evt.delta.text === 'string'
      ) {
        full += evt.delta.text;
        onDelta?.(evt.delta.text, full);
      }
    } catch {
      // ignore
    }
  }
  return full.trim();
}

/** Strip optional ```json fences and parse. */
export function parseJsonLoose<T>(text: string): T {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  }
  return JSON.parse(cleaned) as T;
}
