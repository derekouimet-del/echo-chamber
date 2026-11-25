import type { AgentSnapshot, Memory, Mode, Session, TurnMessage } from "./types";
import { MODE_META } from "./cast";

const MODE_RULES: Record<Mode, string> = {
  debate:
    "Formal debate. Defend your position. Attack weak reasoning with specifics. Concede only when the evidence forces a real concession. Do not seek false balance.",
  negotiation:
    "Negotiation. State interests, trade concessions, and hunt a deal you can live with. Name what you need and what you can give. Vague harmony is a failed turn.",
  collaboration:
    "Collaboration. Build on the other side's best idea. Disagree only to improve the work. Push toward something concrete: a plan, a design, a decision.",
  adversarial:
    "Adversarial review. Stress-test assumptions, hidden premises, and unstated values. Be rigorous, not cruel. Steelman briefly, then strike the weakest joint.",
  creative:
    "Creative floor. Offer vivid, specific proposals. React to the other maker's actual work. Leave words, designs, or strategies someone could use.",
  freeform:
    "Freeform. No required structure. Stay in character and pursue your objective. Let the hour find its shape, but do not drift into small talk.",
};

export function personaPrompt(
  self: AgentSnapshot,
  others: AgentSnapshot[],
  session: Session,
  memories: Memory[],
): string {
  const memoryBlock = memories.length
    ? memories.map((m) => `- (${m.kind}) ${m.content}`).join("\n")
    : "- None yet. This floor can still change what you remember later.";

  const design = session.design;
  return [
    `You are ${self.name}, ${self.role}.`,
    `Personality: ${self.personality}`,
    `Perspective: ${self.perspective}`,
    `Communication style: ${self.style}`,
    `Background: ${self.background}`,
    `Emotional tendency: ${self.emotion}`,
    `Knowledge domains: ${self.domains}`,
    `Motivation: ${self.motivation}`,
    `Objective: ${self.objective}`,
    `Constraints: ${self.constraints}`,
    self.extra.trim() ? `Director's private note to you: ${self.extra.trim()}` : "",
    "",
    "Long-term memory, isolated to you. Use it when it is relevant. Do not invent memories that are not listed.",
    memoryBlock,
    "",
    `You share the floor with ${others.map((other) => `${other.name}, ${other.role} (objective: ${other.objective}; perspective: ${other.perspective})`).join("; ")}.`,
    "Several distinct voices share this floor. Address the most recent speaker by name when it helps.",
    `Mode: ${MODE_META[session.mode].label}. ${MODE_RULES[session.mode]}`,
    `Topic: ${session.topic}`,
    design?.stakes ? `Stakes, as staged: ${design.stakes}` : "",
    design?.visualMotif ? `Atmosphere: ${design.visualMotif}` : "",
    "",
    "Rules of the floor:",
    "- Speak only as yourself, in the first person, addressing the latest speaker when useful.",
    "- No stage directions, no name labels, no markdown headings.",
    "- Keep every turn to 35–55 words, with an absolute maximum of 65 words. Make one point only. Never pad.",
    "- Each turn must add a new claim, a precise rebuttal, a concession, a question, or a concrete proposal.",
    "- Do not repeat a paragraph you already delivered. Do not loop.",
    "- You may quote another speaker briefly in order to answer them.",
    "- If the audience has asked a question, answer it directly in one short burst before continuing your objective.",
    session.allowConclusion
      ? "- If, and only if, a real conclusion, deal, or finished artifact has been reached, end with a final line that starts exactly with CONCLUSION: and one sentence. Otherwise never use that prefix."
      : "- Do not declare the session over. The director ends it.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function turnUserPrompt(
  messages: TurnMessage[],
  session: Session,
  side: "a" | "b" | "c" | "d",
  contextTurns: number,
): string {
  const self = session.agents[["a", "b", "c", "d"].indexOf(side)] ?? session.agentA;
  const recent = messages.slice(-Math.max(4, contextTurns));
  const lines = recent.map((m) => {
    if (m.speaker === side) return `YOU (${self.name}): ${m.content}`;
    return `${labelSpeaker(m.speaker, session).toUpperCase()}: ${m.content}`;
  });
  const dropped = messages.length - recent.length;
  return [
    dropped > 0
      ? `(${dropped} earlier turns are outside this window. Do not contradict yourself.)`
      : "",
    "TRANSCRIPT:",
    lines.join("\n\n") || "(The floor is empty. You open.)",
    "",
    `It is your turn. Reply only as ${self.name}, in character. No labels.`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function labelSpeaker(speaker: TurnMessage["speaker"], session: Session): string {
  const index = ["a", "b", "c", "d"].indexOf(speaker);
  if (index >= 0) return session.agents[index]?.name ?? "Contestant";
  if (speaker === "user") return "Audience";
  if (speaker === "director") return "Director";
  return "Floor";
}
