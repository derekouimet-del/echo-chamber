import { safeError } from "@/lib/utils";
import { streamChat, type LlmCall } from "./llm.server";
import { personaPrompt, turnUserPrompt } from "./prompts";
import { addMessage, claimTurn, clockMs, closeForClock, commitTurn, getMessages, memoriesFor, releaseTurn } from "./store.server";
import type { AgentSpeaker, TurnResult } from "./types";

const SPEAKERS: AgentSpeaker[] = ["a", "b", "c", "d"];

function capTurn(text: string, maxWords = 65): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text.trim();
  return `${words.slice(0, maxWords).join(" ").replace(/[.,;:!?]?$/, "")}.`;
}

export type TurnRequest = {
  sessionId: string;
  keys?: Record<string, string>;
};

export async function executeTurn(
  input: TurnRequest,
  onDelta: (chunk: string) => void,
  signal?: AbortSignal,
  onSpeaker?: (side: AgentSpeaker) => void,
): Promise<TurnResult> {
  if (!input.sessionId) {
    return { stop: true, reason: "bad-request", message: null, session: null, error: "Missing session." };
  }
  const session = await claimTurn(input.sessionId);
  if (!session) {
    return { stop: true, reason: "not-live", message: null, session: null };
  }
  const speaker = SPEAKERS[session.exchangeCount % session.agents.length] ?? "a";
  if (session.maxMinutes > 0 && clockMs(session) >= session.maxMinutes * 60_000) {
    const closed = await closeForClock(session.id);
    return { stop: true, reason: "clock", message: closed.message, session: closed.session };
  }
  onSpeaker?.(speaker);
  const agentIndex = SPEAKERS.indexOf(speaker);
  const agent = session.agents[agentIndex] ?? session.agentA;
  const others = session.agents.filter((_, index) => index !== agentIndex);
  const secret = agent.provider.kind === "house" ? undefined : input.keys?.[agent.provider.id];
  const timeout = AbortSignal.timeout(70_000);
  try {
    if (agent.provider.kind !== "house" && !secret?.trim()) {
      throw new Error(
        `Add an API key for ${agent.provider.name} under Models. Keys stay in this browser and are never written to the floor.`,
      );
    }
    const [messages, memories] = await Promise.all([
      getMessages(session.id),
      agent.characterId ? memoriesFor(agent.characterId) : Promise.resolve([]),
    ]);
    const llm: LlmCall = {
      kind: agent.provider.kind,
      baseUrl: agent.provider.baseUrl,
      model: agent.provider.model,
      apiKey: secret,
      temperature: agent.provider.temperature,
      maxTokens: Math.min(agent.provider.maxTokens, 180),
      extra: agent.provider.extra,
      messages: [
        { role: "system", content: personaPrompt(agent, others, session, memories) },
        { role: "user", content: turnUserPrompt(messages, session, speaker, agent.provider.contextTurns) },
      ],
    };
    const linked = signal ? AbortSignal.any([signal, timeout]) : timeout;
    const result = await streamChat(llm, onDelta, linked);
    const committed = await commitTurn({
      sessionId: session.id,
      speaker,
      content: capTurn(result.text),
      tokens: result.tokens,
    });
    return {
      stop: committed.stop,
      reason: committed.reason,
      message: committed.message,
      session: committed.session,
    };
  } catch (err) {
    if (signal?.aborted) {
      try {
        await releaseTurn(session.id, "paused");
      } catch {
        /* already moved */
      }
      return { stop: true, reason: "aborted", message: null, session: null };
    }
    const timedOut = timeout.aborted;
    const error = timedOut
      ? "The model took too long. The floor is paused."
      : safeError(err, secret);
    try {
      await addMessage(session.id, "system", error, 0);
      await releaseTurn(session.id, "paused");
    } catch {
      /* best-effort floor note */
    }
    return { stop: true, reason: "error", message: null, session: null, error };
  }
}
