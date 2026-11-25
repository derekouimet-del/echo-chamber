import { previewPathPrefix } from "@/lib/preview-path-prefix";
import type { AgentSpeaker, TurnMessage, TurnResult } from "./types";
import { advanceTurnFn } from "./functions";

export function apiUrl(path: string): string {
  if (typeof window === "undefined") return path;
  const prefix = previewPathPrefix(window.location.hostname, window.location.pathname);
  return prefix ? `${prefix}${path}` : path;
}

export type StreamHandlers = {
  onMeta?: (speaker: AgentSpeaker) => void;
  onDelta?: (chunk: string) => void;
};

export async function streamTurn(
  sessionId: string,
  keys: Record<string, string>,
  handlers: StreamHandlers,
  signal?: AbortSignal,
): Promise<TurnResult> {
  try {
    const res = await fetch(apiUrl("/api/arena/stream"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sessionId, keys }),
      signal,
    });
    if (!res.ok || !res.body) {
      return advanceTurnFn({ data: { sessionId, keys } });
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    let result: TurnResult | null = null;
    let error: string | null = null;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const chunks = buf.split("\n\n");
      buf = chunks.pop() ?? "";
      for (const block of chunks) {
        let event = "message";
        let data = "";
        for (const line of block.split("\n")) {
          if (line.startsWith("event:")) event = line.slice(6).trim();
          else if (line.startsWith("data:")) data += line.slice(5).trim();
        }
        if (!data) continue;
        const json = JSON.parse(data) as {
          speaker?: AgentSpeaker;
          text?: string;
          error?: string;
          stop?: boolean;
          reason?: string | null;
          message?: TurnMessage | null;
          session?: TurnResult["session"];
        };
        if (event === "meta" && json.speaker) handlers.onMeta?.(json.speaker);
        if (event === "delta" && json.text) handlers.onDelta?.(json.text);
        if (event === "done") {
          result = {
            stop: Boolean(json.stop),
            reason: json.reason ?? null,
            message: json.message ?? null,
            session: json.session ?? null,
          };
        }
        if (event === "error") error = json.error ?? "The turn failed.";
      }
    }
    if (error && !result?.message) {
      return { stop: true, reason: "error", message: null, session: null, error };
    }
    return (
      result ?? { stop: true, reason: "empty", message: null, session: null, error: "The stream ended early." }
    );
  } catch {
    if (signal?.aborted) {
      return { stop: true, reason: "aborted", message: null, session: null };
    }
    return advanceTurnFn({ data: { sessionId, keys } });
  }
}

let speaker: HTMLAudioElement | null = null;
let releaseCurrent: (() => void) | null = null;

export function primeAudio() {
  if (typeof window === "undefined") return;
  speaker ??= new Audio();
  speaker.src = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";
  const started = speaker.play();
  if (started) void started.then(() => speaker?.pause()).catch(() => {});
}

export async function playSpeech(input: {
  text: string;
  voiceProvider: "house" | "elevenlabs" | "openai";
  voiceId: string;
  elevenKey?: string;
  openaiKey?: string;
}): Promise<void> {
  const res = await fetch(apiUrl("/api/arena/speak"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await res.text());
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  releaseCurrent?.();
  speaker ??= new Audio();
  speaker.src = url;
  await new Promise<void>((resolve, reject) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      if (releaseCurrent === finish) releaseCurrent = null;
      URL.revokeObjectURL(url);
      resolve();
    };
    const fail = (err: unknown) => {
      if (settled) return;
      settled = true;
      if (releaseCurrent === finish) releaseCurrent = null;
      URL.revokeObjectURL(url);
      reject(err instanceof Error ? err : new Error("Playback failed"));
    };
    releaseCurrent = finish;
    speaker!.onended = finish;
    speaker!.onerror = () => fail(new Error("Playback failed"));
    void speaker!.play().catch(fail);
  });
}
