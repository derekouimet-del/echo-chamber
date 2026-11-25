import type { Character, CharacterDraft, StageDesign } from "./types";
import { houseImage, houseJson } from "./llm.server";
import { labelSpeaker } from "./prompts";
import { applyVisuals, getCharacter, getMessages, getSession, memoriesFor, saveAnalysis, saveCharacter, setPortrait } from "./store.server";

const PERSONA_KEYS = [
  "name",
  "role",
  "personality",
  "perspective",
  "style",
  "background",
  "emotion",
  "domains",
  "motivation",
  "objective",
  "constraints",
] as const;

function asPersona(value: unknown, fallbackName: string): Partial<CharacterDraft> {
  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const out: Partial<CharacterDraft> = {};
  for (const key of PERSONA_KEYS) {
    const raw = record[key];
    if (typeof raw === "string" && raw.trim()) out[key] = raw.trim().slice(0, 800);
  }
  if (!out.name) out.name = fallbackName;
  return out;
}

export async function authorPersona(input: {
  mode: "fresh" | "oppose" | "complement";
  brief?: string;
  seed?: Partial<CharacterDraft>;
}): Promise<Partial<CharacterDraft>> {
  const seed = input.seed;
  const system =
    "You invent fictional personalities for a conversational arena. Return only a JSON object with keys name, role, personality, perspective, style, background, emotion, domains, motivation, objective, constraints. Specific, adult, non-generic. No markdown.";
  const user = [
    `Mode: ${input.mode}.`,
    input.brief?.trim() ? `Brief: ${input.brief.trim().slice(0, 600)}` : "",
    seed
      ? `Existing character to react to: ${JSON.stringify({
          name: seed.name,
          role: seed.role,
          personality: seed.personality,
          perspective: seed.perspective,
          objective: seed.objective,
        })}`
      : "",
    input.mode === "oppose"
      ? "Create a worthy opponent with a genuinely different perspective and objective."
      : input.mode === "complement"
        ? "Create a partner who shares the aim but supplies a missing skill and tone."
        : "Create a complete original character.",
  ]
    .filter(Boolean)
    .join("\n");
  const json = await houseJson(system, user, 600);
  return asPersona(json, "New contestant");
}

export async function createQuickCharacter(prompt: string): Promise<Character> {
  const persona = await authorPersona({ mode: "fresh", brief: prompt.slice(0, 120) });
  const name = persona.name?.trim() || prompt.trim().slice(0, 40) || "New voice";
  return saveCharacter({
    id: crypto.randomUUID(),
    name,
    role: persona.role ?? "Independent thinker",
    personality: persona.personality ?? "Curious and direct",
    perspective: persona.perspective ?? "Pragmatic",
    style: persona.style ?? "Clear and concise",
    background: persona.background ?? "A fictional voice shaped by the audience prompt.",
    emotion: persona.emotion ?? "Even-tempered",
    domains: persona.domains ?? "The discussion at hand",
    motivation: persona.motivation ?? "Make one useful point at a time",
    objective: persona.objective ?? "Explore the topic with the other voices",
    constraints: persona.constraints ?? "Stay respectful, specific, and brief.",
    voiceProvider: "house",
    voiceId: "eve",
    favorite: false,
    template: false,
  });
}

export async function stageShowdown(input: {
  topic: string;
  mode: string;
  a: { name: string; role: string; perspective: string; objective: string };
  b: { name: string; role: string; perspective: string; objective: string };
}): Promise<StageDesign> {
  const system =
    "You are the director of a live AI arena. Return only JSON with keys title, stakes, coldOpen, visualMotif, aEntrance, bEntrance. title under 8 words. coldOpen is 2 sentences spoken by the director to open the floor, no spoilers. No markdown.";
  const user = `Mode: ${input.mode}\nTopic: ${input.topic}\nSide A: ${input.a.name}, ${input.a.role}, ${input.a.perspective}. Objective: ${input.a.objective}\nSide B: ${input.b.name}, ${input.b.role}, ${input.b.perspective}. Objective: ${input.b.objective}`;
  const json = (await houseJson(system, user, 450)) as Record<string, unknown>;
  const text = (key: string, max: number) =>
    typeof json[key] === "string" ? String(json[key]).trim().slice(0, max) : "";
  return {
    title: text("title", 120) || input.topic.slice(0, 80),
    stakes: text("stakes", 400),
    coldOpen: text("coldOpen", 600),
    visualMotif: text("visualMotif", 400),
    aEntrance: text("aEntrance", 240),
    bEntrance: text("bEntrance", 240),
    backdropUrl: null,
  };
}

export async function paintPortrait(characterId: string): Promise<Character> {
  const character = await getCharacter(characterId);
  if (!character) throw new Error("Save the character before painting a portrait.");
  const prompt = [
    "Editorial photographic portrait of one fictional adult, shoulders up, clothed, no text, no watermark, no logo.",
    `Name mood only, do not render letters: ${character.name}.`,
    `They read as: ${character.role}. Personality: ${character.personality}.`,
    `Perspective energy: ${character.perspective}. Style: ${character.style}.`,
    `Face and wardrobe should suggest: ${character.background}.`,
    "Cinematic lighting, dark obsidian background, a rim of chartreuse and either teal or coral. Sharp, realistic, not a cartoon.",
  ].join(" ");
  const url = await houseImage(prompt);
  return setPortrait(characterId, url);
}

export async function paintBackdrop(design: StageDesign, topic: string): Promise<string> {
  const prompt = [
    "Wide cinematic photograph of an empty debate arena control room, no people, no readable text, no logos.",
    "Obsidian architecture, a chartreuse floodlight, one side washed in teal and the other in coral.",
    design.visualMotif ? `Motif: ${design.visualMotif}.` : "",
    `The room is about to host a confrontation on: ${topic.slice(0, 180)}.`,
  ]
    .filter(Boolean)
    .join(" ");
  return houseImage(prompt);
}

export async function dressSession(sessionId: string) {
  const session = await getSession(sessionId);
  if (!session) throw new Error("Session not found.");
  const portraits = await Promise.all(session.agents.map((agent) =>
    agent.characterId ? paintPortrait(agent.characterId).then((character) => character.portraitUrl).catch(() => null) : Promise.resolve(null),
  ));
  let backdrop: string | null = null;
  if (session.design) {
    backdrop = await paintBackdrop(session.design, session.topic).catch(() => null);
  }
  return applyVisuals(sessionId, { portraits, backdropUrl: backdrop });
}

export async function analyzeSession(sessionId: string) {
  const session = await getSession(sessionId);
  if (!session) throw new Error("Session not found.");
  const messages = await getMessages(sessionId);
  const transcript = messages
    .map((m) => {
      return `${labelSpeaker(m.speaker, session)}: ${m.content}`;
    })
    .join("\n\n")
    .slice(0, 14000);
  const system =
    "You analyze a multi-voice session. Return only JSON with keys summary, agreements, disagreements, conclusion. Each value is 1-3 sentences of plain prose. No markdown.";
  const json = (await houseJson(
    system,
    `Mode: ${session.mode}\nTopic: ${session.topic}\n\n${transcript || "(empty)"}`,
    500,
  )) as Record<string, unknown>;
  const take = (key: string) => (typeof json[key] === "string" ? String(json[key]).trim().slice(0, 800) : "");
  return saveAnalysis(sessionId, {
    summary: take("summary"),
    agreements: take("agreements"),
    disagreements: take("disagreements"),
    conclusion: take("conclusion"),
  });
}

export async function distillSession(sessionId: string) {
  const session = await getSession(sessionId);
  if (!session) throw new Error("Session not found.");
  const messages = await getMessages(sessionId);
  const speakers = ["a", "b", "c", "d"].slice(0, session.agents.length);
  const transcript = messages
    .filter((message) => speakers.includes(message.speaker))
    .map((message) => `${labelSpeaker(message.speaker, session)}: ${message.content}`)
    .join("\n\n")
    .slice(0, 12000);
  const schema = speakers.map((speaker) => `"${speaker}": [string, string]`).join(", ");
  const system = `Extract durable memories for each character. Return only JSON: {${schema}}. Each string is one sentence that character would remember later. No markdown.`;
  const json = (await houseJson(system, transcript || "No transcript.", 450)) as Record<string, unknown>;
  const list = (value: unknown) =>
    Array.isArray(value) ? value.filter((item) => typeof item === "string").map((item) => item.trim()).filter(Boolean).slice(0, 3) : [];
  const { addMemory } = await import("./store.server");
  const saved = [];
  for (const [index, agent] of session.agents.entries()) {
    if (!agent.characterId) continue;
    for (const content of list(json[speakers[index]!])) {
      saved.push(await addMemory({ characterId: agent.characterId, kind: "session", content, sessionId }));
    }
  }
  const memories = await Promise.all(session.agents.map((agent) =>
    agent.characterId ? memoriesFor(agent.characterId) : Promise.resolve([]),
  ));
  return { saved: saved.length, agents: memories, a: memories[0] ?? [], b: memories[1] ?? [] };
}
