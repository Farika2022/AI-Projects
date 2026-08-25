// Server-side proxy for the Anthropic Claude API.
//
// Used for two things in this app (both called from src/utils/claudeClient.ts):
//   1. "enhance"  — prompt engineering: rewrite the participant's raw edit
//      request (typed, voice-transcribed, or an inpainting note) into a
//      clearer, more specific instruction for the FLUX image model.
//   2. "evaluate" — output evaluation / validation: look at a generated
//      image next to the request and judge whether it actually delivers
//      what was asked for.
//
// The frontend treats
// "enabled: false" as "skip this step" and continues with the plain
// FLUX-only pipeline that existed before Claude was added — the app must
// keep working even with zero Claude credit.

const ANTHROPIC_ENDPOINT = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const DEFAULT_MODEL = process.env.CLAUDE_MODEL || 'claude-haiku-4-5-20251001';
const REQUEST_TIMEOUT_MS = 20000;

const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');
};

/** Always 200 — "Claude step unavailable, keep going without it." Never an error status. */
const disabled = (res, reason) => res.status(200).json({ enabled: false, reason });

const callClaude = async (body) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(ANTHROPIC_ENDPOINT, {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': ANTHROPIC_VERSION,
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || !data) {
      return { ok: false, status: response.status };
    }

    return { ok: true, data };
  } catch (error) {
    const isAbort = error instanceof Error && error.name === 'AbortError';
    return { ok: false, status: isAbort ? 'timeout' : 'network' };
  } finally {
    clearTimeout(timeout);
  }
};

const extractText = (data) => {
  const block = Array.isArray(data?.content) ? data.content.find((c) => c?.type === 'text') : null;
  return block?.text ? String(block.text) : '';
};

/** Claude is asked to return raw JSON, but strip code fences defensively in case it doesn't. */
const parseJsonLoose = (text) => {
  if (!text) return null;
  const cleaned = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
};

const METHOD_LABELS = {
  text: 'typed text',
  voice: 'a speech-to-text transcript',
  inpainting: 'a short note attached to a hand-painted mask area on the photo',
};

const handleEnhance = async (req, res) => {
  const { prompt, method } = req.body || {};

  if (typeof prompt !== 'string' || !prompt.trim()) {
    return disabled(res, 'missing_prompt');
  }

  const sourceLabel = METHOD_LABELS[method] || 'a user request';

  const systemPrompt = [
    'You are a prompt-engineering assistant for FLUX, an AI photo-editing model used in an app that lets people redesign photos of public spaces (parks, plazas, streets, bus stops, etc.).',
    'You take a short, informal edit request and rewrite it into ONE clear, specific, unambiguous image-editing instruction that FLUX can follow well.',
    'Rules:',
    '- Keep the original intent exactly. Never invent new elements the user did not ask for.',
    "- Prefer \"replace X with Y\" over \"remove X\" — removal-only instructions tend to fail on this model.",
    '- Where the request is vague, add reasonable concrete detail (materials, placement, lighting) without changing its meaning.',
    '- Keep it to 1-3 sentences.',
    '- If the request is unsafe, hateful, or unrelated to editing a public-space photo, do not rewrite it — set "safe" to false instead.',
    'Respond with ONLY a JSON object, no other text, in this exact shape:',
    '{"enhancedPrompt": string, "notes": string, "safe": boolean}',
  ].join('\n');

  const userMessage = `Input method: ${sourceLabel}\nRaw request: "${prompt.trim()}"`;

  const result = await callClaude({
    model: DEFAULT_MODEL,
    max_tokens: 400,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });

  if (!result.ok) {
    return disabled(res, `anthropic_${result.status}`);
  }

  const parsed = parseJsonLoose(extractText(result.data));
  if (!parsed || typeof parsed.enhancedPrompt !== 'string' || !parsed.enhancedPrompt.trim()) {
    return disabled(res, 'unparseable_response');
  }

  if (parsed.safe === false) {
    return res.status(200).json({
      enabled: true,
      safe: false,
      enhancedPrompt: prompt,
      notes:
        typeof parsed.notes === 'string' && parsed.notes.trim()
          ? parsed.notes.trim()
          : 'Flagged as out of scope for this app; using the original request unchanged.',
    });
  }

  return res.status(200).json({
    enabled: true,
    safe: true,
    enhancedPrompt: parsed.enhancedPrompt.trim(),
    notes: typeof parsed.notes === 'string' ? parsed.notes.trim() : '',
  });
};

const handleEvaluate = async (req, res) => {
  const { prompt, imageBase64, mediaType } = req.body || {};

  if (typeof prompt !== 'string' || !prompt.trim() || typeof imageBase64 !== 'string' || !imageBase64) {
    return disabled(res, 'missing_fields');
  }

  const systemPrompt = [
    'You are a quality-control reviewer for an AI photo-editing app. You are shown the instruction a user gave and the resulting edited photo.',
    'Judge only whether the image plausibly reflects the requested edit and looks like a coherent, undamaged photo (no obvious warping, duplicated objects, nonsense text, or missing requested elements).',
    'Respond with ONLY a JSON object, no other text, in this exact shape:',
    '{"matches": boolean, "score": number (1-5, 5 = excellent match and quality), "feedback": string (max 25 words, plain and specific)}',
  ].join('\n');

  const result = await callClaude({
    model: DEFAULT_MODEL,
    max_tokens: 250,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType || 'image/jpeg', data: imageBase64 } },
          { type: 'text', text: `Requested edit: "${prompt.trim()}"\n\nDoes this image deliver that edit well?` },
        ],
      },
    ],
  });

  if (!result.ok) {
    return disabled(res, `anthropic_${result.status}`);
  }

  const parsed = parseJsonLoose(extractText(result.data));
  if (!parsed || typeof parsed.score !== 'number') {
    return disabled(res, 'unparseable_response');
  }

  return res.status(200).json({
    enabled: true,
    matches: Boolean(parsed.matches),
    score: Math.max(1, Math.min(5, Math.round(parsed.score))),
    feedback: typeof parsed.feedback === 'string' ? parsed.feedback.trim().slice(0, 200) : '',
  });
};

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return disabled(res, 'no_api_key');
    }

    const action = req.body?.action;

    if (action === 'enhance') {
      return await handleEnhance(req, res);
    }

    if (action === 'evaluate') {
      return await handleEvaluate(req, res);
    }

    return disabled(res, 'unknown_action');
  } catch (error) {
    // Absolute last resort: never let this endpoint throw a 500 at the frontend.
    console.error('Claude proxy failed:', error);
    return disabled(res, 'internal_error');
  }
}
