// Frontend client for the optional Claude-powered steps of the editing
// pipeline: prompt engineering ("enhance") and output evaluation/validation
// ("evaluate"). Both talk to the server-side proxy at /api/claude/proxy-claude,
// which owns the actual Anthropic API key.
//
// Every function here is designed to NEVER throw and NEVER block generation:
// if the server has no ANTHROPIC_API_KEY, or the request fails for any
// reason (network error, timeout, rate limit, an unparseable response), we
// resolve to { enabled: false } and the caller falls back to the plain
// FLUX-only behavior the app had before Claude was added.

const CLAUDE_ENDPOINT = "/api/claude/proxy-claude";

export type ToolMethod = "text" | "voice" | "inpainting" | "dragdrop";

export interface EnhanceResult {
  enabled: boolean;
  safe?: boolean;
  enhancedPrompt?: string;
  notes?: string;
  reason?: string;
}

export interface EvaluateResult {
  enabled: boolean;
  matches?: boolean;
  score?: number;
  feedback?: string;
  reason?: string;
}

const postToClaudeProxy = async (
  body: Record<string, unknown>,
  timeoutMs: number
): Promise<{ enabled: boolean } & Record<string, unknown>> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(CLAUDE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      return { enabled: false, reason: `http_${response.status}` };
    }

    const data = await response.json().catch(() => null);
    if (!data || typeof data !== "object") {
      return { enabled: false, reason: "bad_response" };
    }

    return data as { enabled: boolean } & Record<string, unknown>;
  } catch (error) {
    // Covers network failure, the endpoint being unreachable in a bare
    // static-hosting setup, and our own AbortController timeout.
    console.warn("Claude proxy request failed; continuing without it.", error);
    return { enabled: false, reason: "network_error" };
  } finally {
    clearTimeout(timer);
  }
};

/**
 * Prompt engineering step: rewrite a raw user request (typed, voice-
 * transcribed, or an inpainting note) into a clearer FLUX instruction.
 * Never throws — resolves to { enabled: false } if Claude isn't available.
 */
export const enhancePrompt = async (
  prompt: string,
  method: ToolMethod
): Promise<EnhanceResult> => {
  if (!prompt.trim()) {
    return { enabled: false, reason: "empty_prompt" };
  }

  const result = await postToClaudeProxy({ action: "enhance", prompt, method }, 20000);
  return result as EnhanceResult;
};

/**
 * Output evaluation/validation step: judge a generated image against the
 * request that produced it. Expects a data: URL (e.g. from compressImage).
 * Never throws — resolves to { enabled: false } if Claude isn't available.
 */
export const evaluateResult = async (
  prompt: string,
  imageDataUrl: string
): Promise<EvaluateResult> => {
  const match = /^data:(.+?);base64,(.*)$/.exec(imageDataUrl || "");
  if (!match) {
    return { enabled: false, reason: "not_a_data_url" };
  }

  const [, mediaType, imageBase64] = match;
  const result = await postToClaudeProxy(
    { action: "evaluate", prompt, imageBase64, mediaType },
    25000
  );
  return result as EvaluateResult;
};
