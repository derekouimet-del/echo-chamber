import { getSql } from "@/lib/db";
import { clamp, nid } from "@/lib/utils";
import { HOUSE_ID, KIND_META, PRESETS } from "./cast";
import type {
  AgentSnapshot,
  Character,
  CharacterDraft,
  CreateSessionInput,
  Memory,
  MemoryKind,
  Mode,
  Provider,
  ProviderDraft,
  ProviderKind,
  Session,
  SessionStatus,
  Setup,
  SetupDraft,
  Speaker,
  StageDesign,
  TurnMessage,
  VoiceProvider,
} from "./types";
import { MODES, PROVIDER_KINDS } from "./types";

type Row = Record<string, unknown>;

function iso(value: unknown): string | null {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString();
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toISOString();
}

function str(value: unknown, fallback = ""): string {
  return value == null ? fallback : String(value);
}

function num(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function bool(value: unknown): boolean {
  return value === true || value === "t" || value === "true" || value === 1;
}

function asKind(value: string): ProviderKind {
  return (PROVIDER_KINDS as readonly string[]).includes(value) ? (value as ProviderKind) : "custom";
}

function asMode(value: string): Mode {
  return (MODES as readonly string[]).includes(value) ? (value as Mode) : "debate";
}

function asVoice(value: string): VoiceProvider {
  if (value === "house" || value === "elevenlabs" || value === "openai") return value;
  return "none";
}

function asStatus(value: string): SessionStatus {
  if (
    value === "draft" ||
    value === "live" ||
    value === "thinking" ||
    value === "paused" ||
    value === "completed" ||
    value === "failed"
  ) {
    return value;
  }
  return "paused";
}

function parseJson<T>(value: unknown, fallback: T): T {
  if (typeof value !== "string" || !value.trim()) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function mapProvider(row: Row): Provider {
  return {
    id: str(row.id),
    name: str(row.name),
    kind: asKind(str(row.kind)),
    baseUrl: str(row.base_url),
    model: str(row.model),
    temperature: num(row.temperature, 0.8),
    maxTokens: num(row.max_tokens, 500),
    contextTurns: num(row.context_turns, 14),
    extra: str(row.extra, "{}"),
    locked: bool(row.locked),
    createdAt: iso(row.created_at) ?? new Date().toISOString(),
  };
}

function mapCharacter(row: Row): Character {
  return {
    id: str(row.id),
    name: str(row.name),
    role: str(row.role),
    personality: str(row.personality),
    perspective: str(row.perspective),
    style: str(row.style),
    background: str(row.background),
    emotion: str(row.emotion),
    domains: str(row.domains),
    motivation: str(row.motivation),
    objective: str(row.objective),
    constraints: str(row.constraints),
    voiceProvider: asVoice(str(row.voice_provider)),
    voiceId: str(row.voice_id),
    favorite: bool(row.favorite),
    template: bool(row.is_template),
    portraitUrl: row.portrait_url ? str(row.portrait_url) : null,
    createdAt: iso(row.created_at) ?? new Date().toISOString(),
  };
}

function mapSession(row: Row): Session {
  const agentA = parseJson<AgentSnapshot>(row.agent_a, emptyAgent());
  const agentB = parseJson<AgentSnapshot>(row.agent_b, emptyAgent());
  const savedAgents = parseJson<AgentSnapshot[]>(row.participants, []);
  const agents = savedAgents.length >= 2 ? savedAgents.slice(0, 4) : [agentA, agentB];
  return {
    id: str(row.id),
    title: str(row.title),
    topic: str(row.topic),
    mode: asMode(str(row.mode)),
    status: asStatus(str(row.status)),
    agentA: agents[0] ?? agentA,
    agentB: agents[1] ?? agentB,
    agents,
    maxExchanges: num(row.max_exchanges, 8),
    tokenBudget: num(row.token_budget, 12000),
    tokensUsed: num(row.tokens_used, 0),
    speedMs: num(row.speed_ms, 1200),
    maxMinutes: num(row.max_minutes, 0),
    elapsedMs: num(row.elapsed_ms, 0),
    resumedAt: iso(row.resumed_at),
    allowConclusion: bool(row.allow_conclusion),
    isPublic: bool(row.is_public),
    summary: row.summary ? str(row.summary) : null,
    agreements: row.agreements ? str(row.agreements) : null,
    disagreements: row.disagreements ? str(row.disagreements) : null,
    conclusion: row.conclusion ? str(row.conclusion) : null,
    design: parseJson<StageDesign | null>(row.design, null),
    exchangeCount: num(row.exchange_count, 0),
    startedAt: iso(row.started_at),
    endedAt: iso(row.ended_at),
    createdAt: iso(row.created_at) ?? new Date().toISOString(),
    updatedAt: iso(row.updated_at) ?? new Date().toISOString(),
  };
}

function mapMessage(row: Row): TurnMessage {
  const speaker = str(row.speaker);
  return {
    id: str(row.id),
    sessionId: str(row.session_id),
    speaker:
      speaker === "a" || speaker === "b" || speaker === "c" || speaker === "d" || speaker === "user" || speaker === "director" || speaker === "system"
        ? speaker
        : "system",
    content: str(row.content),
    tokens: num(row.tokens, 0),
    createdAt: iso(row.created_at) ?? new Date().toISOString(),
  };
}

function mapMemory(row: Row): Memory {
  const kind = str(row.kind);
  return {
    id: str(row.id),
    characterId: str(row.character_id),
    kind: kind === "short" || kind === "session" ? kind : "long",
    content: str(row.content),
    sessionId: row.session_id ? str(row.session_id) : null,
    createdAt: iso(row.created_at) ?? new Date().toISOString(),
  };
}

function emptyAgent(): AgentSnapshot {
  return {
    characterId: "",
    name: "Unassigned",
    role: "",
    personality: "",
    perspective: "",
    style: "",
    background: "",
    emotion: "",
    domains: "",
    motivation: "",
    objective: "",
    constraints: "",
    extra: "",
    voiceProvider: "none",
    portraitUrl: null,
    voiceId: "",
    provider: {
      id: HOUSE_ID,
      name: "House Grok",
      kind: "house",
      baseUrl: KIND_META.house.baseUrl,
      model: KIND_META.house.model,
      temperature: 0.8,
      maxTokens: 500,
      contextTurns: 14,
      extra: "{}",
    },
  };
}

async function ensureSeed(): Promise<void> {
  const sql = await getSql();
  const meta = await sql<{ value: string }>`select value from app_meta where key = 'seeded'`;
  const house = KIND_META.house;
  await sql`
    insert into providers (
      id, name, kind, base_url, model, temperature, max_tokens, context_turns, extra, locked
    ) values (
      ${HOUSE_ID}, 'House Grok', 'house', ${house.baseUrl}, ${house.model}, 0.85, 520, 14, '{}', true
    )
    on conflict (id) do nothing
  `;
  if (meta.length) return;
  for (const preset of PRESETS) {
    await insertCharacter({ ...preset, favorite: Boolean(preset.favorite), template: true });
  }
  await sql`insert into app_meta (key, value) values ('seeded', '1') on conflict (key) do nothing`;
}

export async function listProviders(): Promise<Provider[]> {
  await ensureSeed();
  const sql = await getSql();
  const rows = await sql<Row>`select * from providers order by locked desc, created_at asc`;
  return rows.map(mapProvider);
}

export async function saveProvider(input: ProviderDraft): Promise<Provider> {
  await ensureSeed();
  const sql = await getSql();
  const existing = await sql<Row>`select * from providers where id = ${input.id}`;
  if (existing[0] && bool(existing[0].locked)) {
    await sql`
      update providers set
        temperature = ${clamp(input.temperature, 0, 2)},
        max_tokens = ${clamp(Math.round(input.maxTokens), 32, 800)},
        context_turns = ${clamp(Math.round(input.contextTurns), 4, 40)},
        model = ${input.model.trim() || KIND_META.house.model},
        extra = ${input.extra?.trim() || "{}"},
        updated_at = now()
      where id = ${input.id}
    `;
  } else if (existing[0]) {
    await sql`
      update providers set
        name = ${input.name.trim() || "Untitled model"},
        kind = ${input.kind},
        base_url = ${input.baseUrl.trim()},
        model = ${input.model.trim()},
        temperature = ${clamp(input.temperature, 0, 2)},
        max_tokens = ${clamp(Math.round(input.maxTokens), 32, 4000)},
        context_turns = ${clamp(Math.round(input.contextTurns), 4, 40)},
        extra = ${input.extra?.trim() || "{}"},
        updated_at = now()
      where id = ${input.id}
    `;
  } else {
    if (input.kind === "house") throw new Error("The house model already exists.");
    await sql`
      insert into providers (
        id, name, kind, base_url, model, temperature, max_tokens, context_turns, extra, locked
      ) values (
        ${input.id},
        ${input.name.trim() || "Untitled model"},
        ${input.kind},
        ${input.baseUrl.trim()},
        ${input.model.trim()},
        ${clamp(input.temperature, 0, 2)},
        ${clamp(Math.round(input.maxTokens), 32, 4000)},
        ${clamp(Math.round(input.contextTurns), 4, 40)},
        ${input.extra?.trim() || "{}"},
        false
      )
    `;
  }
  const rows = await sql<Row>`select * from providers where id = ${input.id}`;
  return mapProvider(rows[0]!);
}

export async function deleteProvider(id: string): Promise<void> {
  const sql = await getSql();
  const rows = await sql<Row>`select locked from providers where id = ${id}`;
  if (rows[0] && bool(rows[0].locked)) throw new Error("The house model stays on the floor.");
  await sql`delete from providers where id = ${id}`;
}

async function insertCharacter(input: CharacterDraft & { template?: boolean; favorite?: boolean; portraitUrl?: string | null }) {
  const sql = await getSql();
  await sql`
    insert into characters (
      id, name, role, personality, perspective, style, background, emotion, domains,
      motivation, objective, constraints, voice_provider, voice_id, favorite, is_template, portrait_url
    ) values (
      ${input.id},
      ${input.name.trim() || "Unnamed"},
      ${input.role},
      ${input.personality},
      ${input.perspective},
      ${input.style},
      ${input.background},
      ${input.emotion},
      ${input.domains},
      ${input.motivation},
      ${input.objective},
      ${input.constraints},
      ${input.voiceProvider},
      ${input.voiceId},
      ${Boolean(input.favorite)},
      ${Boolean(input.template)},
      ${input.portraitUrl ?? null}
    )
    on conflict (id) do nothing
  `;
}

export async function listCharacters(): Promise<Character[]> {
  await ensureSeed();
  const sql = await getSql();
  const rows = await sql<Row>`select * from characters order by favorite desc, created_at asc`;
  return rows.map(mapCharacter);
}

export async function saveCharacter(input: CharacterDraft & { favorite?: boolean }): Promise<Character> {
  await ensureSeed();
  const sql = await getSql();
  const existing = await sql<Row>`select id, portrait_url, is_template from characters where id = ${input.id}`;
  if (!existing[0]) {
    await insertCharacter(input);
  } else {
    await sql`
      update characters set
        name = ${input.name.trim() || "Unnamed"},
        role = ${input.role},
        personality = ${input.personality},
        perspective = ${input.perspective},
        style = ${input.style},
        background = ${input.background},
        emotion = ${input.emotion},
        domains = ${input.domains},
        motivation = ${input.motivation},
        objective = ${input.objective},
        constraints = ${input.constraints},
        voice_provider = ${input.voiceProvider},
        voice_id = ${input.voiceId},
        favorite = ${Boolean(input.favorite)},
        updated_at = now()
      where id = ${input.id}
    `;
  }
  const rows = await sql<Row>`select * from characters where id = ${input.id}`;
  return mapCharacter(rows[0]!);
}

export async function deleteCharacter(id: string): Promise<void> {
  const sql = await getSql();
  await sql`delete from characters where id = ${id}`;
}

export async function setPortrait(id: string, url: string): Promise<Character> {
  const sql = await getSql();
  await sql`update characters set portrait_url = ${url}, updated_at = now() where id = ${id}`;
  const rows = await sql<Row>`select * from characters where id = ${id}`;
  if (!rows[0]) throw new Error("Character not found.");
  return mapCharacter(rows[0]);
}

export async function getCharacter(id: string): Promise<Character | null> {
  const sql = await getSql();
  const rows = await sql<Row>`select * from characters where id = ${id}`;
  return rows[0] ? mapCharacter(rows[0]) : null;
}

export async function listMemories(characterId: string): Promise<Memory[]> {
  const sql = await getSql();
  const rows = await sql<Row>`
    select * from memories where character_id = ${characterId} order by created_at desc limit 80
  `;
  return rows.map(mapMemory);
}

export async function memoriesFor(characterId: string): Promise<Memory[]> {
  const sql = await getSql();
  const rows = await sql<Row>`
    select * from memories where character_id = ${characterId}
    order by created_at desc limit 8
  `;
  return rows.map(mapMemory).reverse();
}

export async function addMemory(input: {
  characterId: string;
  kind: MemoryKind;
  content: string;
  sessionId?: string | null;
}): Promise<Memory> {
  const sql = await getSql();
  const id = nid();
  const content = input.content.trim().slice(0, 2000);
  if (!content) throw new Error("Memory cannot be empty.");
  await sql`
    insert into memories (id, character_id, kind, content, session_id)
    values (${id}, ${input.characterId}, ${input.kind}, ${content}, ${input.sessionId ?? null})
  `;
  const rows = await sql<Row>`select * from memories where id = ${id}`;
  return mapMemory(rows[0]!);
}

export async function deleteMemory(id: string): Promise<void> {
  const sql = await getSql();
  await sql`delete from memories where id = ${id}`;
}

export async function clearMemories(characterId: string): Promise<void> {
  const sql = await getSql();
  await sql`delete from memories where character_id = ${characterId}`;
}

export async function createSession(input: CreateSessionInput): Promise<Session> {
  await ensureSeed();
  const sql = await getSql();
  const id = nid();
  const topic = input.topic.trim().slice(0, 2000);
  if (!topic) throw new Error("A topic is required.");
  const agents = (input.agents?.length ? input.agents : [input.agentA, input.agentB]).slice(0, 4);
  if (agents.length < 2 || agents.some((agent) => !agent?.name)) {
    throw new Error("Choose at least two characters for the floor.");
  }
  const [agentA, agentB] = agents;
  const design = input.design;
  const title = (input.title || design?.title || topic).slice(0, 180);
  await sql`
    insert into sessions (
      id, title, topic, mode, status, agent_a, agent_b, participants, max_exchanges, token_budget,
      speed_ms, max_minutes, elapsed_ms, resumed_at, allow_conclusion, is_public, design, started_at
    ) values (
      ${id},
      ${title},
      ${topic},
      ${input.mode},
      'live',
      ${JSON.stringify(agentA)},
      ${JSON.stringify(agentB)},
      ${JSON.stringify(agents)},
      ${clamp(Math.round(input.maxExchanges), 2, 24)},
      ${clamp(Math.round(input.tokenBudget), 500, 200000)},
      ${clamp(Math.round(input.speedMs), 0, 15000)},
      ${clamp(Math.round(input.maxMinutes || 0), 0, 180)},
      0,
      now(),
      ${input.allowConclusion},
      ${input.isPublic},
      ${design ? JSON.stringify(design) : null},
      now()
    )
  `;
  if (design?.coldOpen?.trim()) {
    await sql`
      insert into messages (id, session_id, speaker, content)
      values (${nid()}, ${id}, 'director', ${design.coldOpen.trim().slice(0, 2000)})
    `;
  }
  return (await getSession(id))!;
}

export async function listSessions(): Promise<Session[]> {
  await ensureSeed();
  const sql = await getSql();
  const rows = await sql<Row>`select * from sessions order by created_at desc limit 60`;
  return rows.map(mapSession);
}

function accrued(session: { elapsedMs: number; resumedAt: string | null }): number {
  const extra = session.resumedAt ? Math.max(0, Date.now() - new Date(session.resumedAt).getTime()) : 0;
  return Math.round(session.elapsedMs + extra);
}

export function clockMs(session: { elapsedMs: number; resumedAt: string | null }): number {
  return accrued(session);
}

export async function getSession(id: string): Promise<Session | null> {
  const sql = await getSql();
  const rows = await sql<Row>`select * from sessions where id = ${id}`;
  if (!rows[0]) return null;
  let session = mapSession(rows[0]);
  if (session.status === "thinking") {
    const age = Date.now() - new Date(session.updatedAt).getTime();
    if (age > 150_000) {
      const elapsed = accrued(session);
      await sql`
        update sessions set
          status = 'paused',
          elapsed_ms = ${elapsed},
          resumed_at = null,
          updated_at = now()
        where id = ${id} and status = 'thinking'
      `;
      session = { ...session, status: "paused", elapsedMs: elapsed, resumedAt: null };
    }
  }
  return session;
}

export async function getMessages(sessionId: string): Promise<TurnMessage[]> {
  const sql = await getSql();
  const rows = await sql<Row>`
    select * from messages where session_id = ${sessionId} order by created_at asc
  `;
  return rows.map(mapMessage);
}

export async function setStatus(id: string, status: SessionStatus): Promise<Session> {
  const sql = await getSql();
  if (status === "completed" || status === "failed" || status === "paused") {
    const current = await getSession(id);
    if (!current) throw new Error("Session not found.");
    const ended = status !== "paused";
    await sql`
      update sessions set
        elapsed_ms = ${accrued(current)},
        resumed_at = null,
        status = ${status},
        ended_at = case when ${ended} then coalesce(ended_at, now()) else ended_at end,
        updated_at = now()
      where id = ${id}
    `;
  } else if (status === "live") {
    await sql`
      update sessions set
        status = 'live',
        started_at = coalesce(started_at, now()),
        resumed_at = coalesce(resumed_at, now()),
        ended_at = null,
        updated_at = now()
      where id = ${id} and status in ('paused', 'draft', 'live', 'failed')
    `;
  } else {
    await sql`update sessions set status = ${status}, updated_at = now() where id = ${id}`;
  }
  const session = await getSession(id);
  if (!session) throw new Error("Session not found.");
  return session;
}

export async function deleteSession(id: string): Promise<void> {
  const sql = await getSql();
  await sql`delete from sessions where id = ${id}`;
}

export async function addMessage(
  sessionId: string,
  speaker: Speaker,
  content: string,
  tokens = 0,
): Promise<TurnMessage> {
  const sql = await getSql();
  const id = nid();
  await sql`
    insert into messages (id, session_id, speaker, content, tokens)
    values (${id}, ${sessionId}, ${speaker}, ${content.slice(0, 12000)}, ${tokens})
  `;
  const rows = await sql<Row>`select * from messages where id = ${id}`;
  return mapMessage(rows[0]!);
}

export async function claimTurn(sessionId: string): Promise<Session | null> {
  const sql = await getSql();
  const rows = await sql<Row>`
    update sessions set status = 'thinking', updated_at = now()
    where id = ${sessionId} and status = 'live'
    returning *
  `;
  return rows[0] ? mapSession(rows[0]) : null;
}

export async function releaseTurn(sessionId: string, status: SessionStatus): Promise<void> {
  const current = await getSession(sessionId);
  if (!current || current.status !== "thinking") return;
  const sql = await getSql();
  const ended = status === "completed" || status === "failed";
  await sql`
    update sessions set
      elapsed_ms = ${accrued(current)},
      resumed_at = null,
      status = ${status},
      ended_at = case when ${ended} then coalesce(ended_at, now()) else ended_at end,
      updated_at = now()
    where id = ${sessionId} and status = 'thinking'
  `;
}

export async function commitTurn(input: {
  sessionId: string;
  speaker: "a" | "b" | "c" | "d";
  content: string;
  tokens: number;
}): Promise<{ message: TurnMessage; session: Session; stop: boolean; reason: string | null }> {
  const sql = await getSql();
  const message = await addMessage(input.sessionId, input.speaker, input.content, input.tokens);
  const current = await getSession(input.sessionId);
  if (!current) throw new Error("Session disappeared.");
  const concluded = current.allowConclusion && /(^|\n)\s*CONCLUSION:/i.test(input.content);
  const nextCount = current.exchangeCount + 1;
  const nextTokens = current.tokensUsed + input.tokens;
  const hitCap = nextCount >= current.maxExchanges || nextTokens >= current.tokenBudget;
  const stop = concluded || hitCap;
  let reason: string | null = null;
  if (concluded) reason = "conclusion";
  else if (nextCount >= current.maxExchanges) reason = "exchanges";
  else if (nextTokens >= current.tokenBudget) reason = "budget";

  const rows = await sql<Row>`
    update sessions set
      exchange_count = ${nextCount},
      tokens_used = ${nextTokens},
      status = case
        when status = 'paused' then 'paused'
        when status = 'completed' then 'completed'
        when ${stop} then 'completed'
        else 'live'
      end,
      ended_at = case
        when status in ('paused') then ended_at
        when ${stop} or status = 'completed' then coalesce(ended_at, now())
        else ended_at
      end,
      updated_at = now()
    where id = ${input.sessionId}
    returning *
  `;
  let session = mapSession(rows[0]!);
  if (session.status !== "live" && session.resumedAt) {
    const elapsed = clockMs(session);
    await sql`
      update sessions set elapsed_ms = ${elapsed}, resumed_at = null, updated_at = now()
      where id = ${input.sessionId}
    `;
    session = { ...session, elapsedMs: elapsed, resumedAt: null };
  }
  const actuallyStop = session.status !== "live";
  return { message, session, stop: actuallyStop, reason: actuallyStop ? reason ?? session.status : null };
}

export async function saveAnalysis(
  id: string,
  analysis: { summary: string; agreements: string; disagreements: string; conclusion: string },
): Promise<Session> {
  const sql = await getSql();
  await sql`
    update sessions set
      summary = ${analysis.summary},
      agreements = ${analysis.agreements},
      disagreements = ${analysis.disagreements},
      conclusion = ${analysis.conclusion},
      updated_at = now()
    where id = ${id}
  `;
  const session = await getSession(id);
  if (!session) throw new Error("Session not found.");
  return session;
}

export async function saveDesign(id: string, design: StageDesign): Promise<Session> {
  const sql = await getSql();
  await sql`
    update sessions set design = ${JSON.stringify(design)}, title = ${design.title.slice(0, 180)}, updated_at = now()
    where id = ${id}
  `;
  const session = await getSession(id);
  if (!session) throw new Error("Session not found.");
  return session;
}

export async function applyVisuals(
  id: string,
  visuals: { portraits?: (string | null)[]; portraitA?: string | null; portraitB?: string | null; backdropUrl?: string | null },
): Promise<Session> {
  const sql = await getSql();
  const session = await getSession(id);
  if (!session) throw new Error("Session not found.");
  const agents = session.agents.map((agent, index) => ({
    ...agent,
    portraitUrl: visuals.portraits?.[index] || (index === 0 ? visuals.portraitA : index === 1 ? visuals.portraitB : null) || agent.portraitUrl,
  }));
  const agentA = agents[0]!;
  const agentB = agents[1]!;
  const design = session.design
    ? { ...session.design, backdropUrl: visuals.backdropUrl || session.design.backdropUrl }
    : session.design;
  await sql`
    update sessions set
      agent_a = ${JSON.stringify(agentA)},
      agent_b = ${JSON.stringify(agentB)},
      participants = ${JSON.stringify(agents)},
      design = ${design ? JSON.stringify(design) : null},
      updated_at = now()
    where id = ${id}
  `;
  const next = await getSession(id);
  if (!next) throw new Error("Session not found.");
  return next;
}

export async function dashboard() {
  await ensureSeed();
  const sql = await getSql();
  const counts = await sql<Row>`
    select
      (select count(*) from sessions) as sessions,
      (select count(*) from sessions where status in ('live', 'thinking', 'paused')) as open,
      (select count(*) from characters) as characters,
      (select coalesce(sum(tokens_used), 0) from sessions) as tokens
  `;
  const sessions = await listSessions();
  const cast = await listCharacters();
  const row = counts[0] ?? {};
  return {
    counts: {
      sessions: num(row.sessions),
      open: num(row.open),
      characters: num(row.characters),
      tokens: num(row.tokens),
    },
    sessions: sessions.slice(0, 8),
    cast: cast.slice(0, 4),
  };
}

export async function restoreTemplates(): Promise<Character[]> {
  for (const preset of PRESETS) {
    const sql = await getSql();
    const existing = await sql`select id from characters where id = ${preset.id}`;
    if (!existing.length) await insertCharacter({ ...preset, template: true, favorite: Boolean(preset.favorite) });
  }
  return listCharacters();
}

export async function listBoard(): Promise<Session[]> {
  await ensureSeed();
  const sql = await getSql();
  const rows = await sql<Row>`
    select * from sessions where is_public = true order by created_at desc limit 80
  `;
  const rank = (status: SessionStatus) =>
    status === "live" || status === "thinking" ? 0 : status === "paused" ? 1 : 2;
  return rows
    .map(mapSession)
    .sort((a, b) => rank(a.status) - rank(b.status) || b.createdAt.localeCompare(a.createdAt));
}

export async function rematchSession(id: string): Promise<Session> {
  const session = await getSession(id);
  if (!session) throw new Error("That session is not on the floor.");
  return createSession({
    topic: session.topic,
    mode: session.mode,
    title: session.design?.title || session.title,
    agentA: session.agentA,
    agentB: session.agentB,
    agents: session.agents,
    maxExchanges: session.maxExchanges,
    tokenBudget: session.tokenBudget,
    speedMs: session.speedMs,
    maxMinutes: session.maxMinutes,
    allowConclusion: session.allowConclusion,
    isPublic: session.isPublic,
    design: session.design,
  });
}

export async function closeForClock(sessionId: string): Promise<{ session: Session | null; message: TurnMessage }> {
  const message = await addMessage(sessionId, "system", "The clock ran out. The floor is closed.", 0);
  await releaseTurn(sessionId, "completed");
  return { session: await getSession(sessionId), message };
}

function mapSetup(row: Row): Setup {
  return {
    id: str(row.id),
    name: str(row.name),
    topic: str(row.topic),
    mode: asMode(str(row.mode)),
    characterA: str(row.character_a),
    characterB: str(row.character_b),
    providerA: str(row.provider_a),
    providerB: str(row.provider_b),
    extraA: str(row.extra_a),
    extraB: str(row.extra_b),
    maxExchanges: num(row.max_exchanges, 8),
    tokenBudget: num(row.token_budget, 12000),
    speedMs: num(row.speed_ms, 900),
    maxMinutes: num(row.max_minutes, 0),
    allowConclusion: bool(row.allow_conclusion),
    isPublic: bool(row.is_public),
    createdAt: iso(row.created_at) ?? new Date().toISOString(),
  };
}

export async function listSetups(): Promise<Setup[]> {
  const sql = await getSql();
  const rows = await sql<Row>`select * from setups order by created_at desc limit 40`;
  return rows.map(mapSetup);
}

export async function saveSetup(input: SetupDraft): Promise<Setup> {
  const sql = await getSql();
  const name = input.name.trim().slice(0, 80);
  if (!name) throw new Error("Name the card before saving it.");
  if (!input.topic.trim()) throw new Error("A card needs a topic.");
  const id = input.id || nid();
  await sql`
    insert into setups (
      id, name, topic, mode, character_a, character_b, provider_a, provider_b,
      extra_a, extra_b, max_exchanges, token_budget, speed_ms, max_minutes,
      allow_conclusion, is_public
    ) values (
      ${id},
      ${name},
      ${input.topic.trim().slice(0, 2000)},
      ${input.mode},
      ${input.characterA},
      ${input.characterB},
      ${input.providerA},
      ${input.providerB},
      ${input.extraA.slice(0, 2000)},
      ${input.extraB.slice(0, 2000)},
      ${clamp(Math.round(input.maxExchanges), 2, 24)},
      ${clamp(Math.round(input.tokenBudget), 500, 200000)},
      ${clamp(Math.round(input.speedMs), 0, 15000)},
      ${clamp(Math.round(input.maxMinutes || 0), 0, 180)},
      ${input.allowConclusion},
      ${input.isPublic}
    )
    on conflict (id) do update set
      name = excluded.name,
      topic = excluded.topic,
      mode = excluded.mode,
      character_a = excluded.character_a,
      character_b = excluded.character_b,
      provider_a = excluded.provider_a,
      provider_b = excluded.provider_b,
      extra_a = excluded.extra_a,
      extra_b = excluded.extra_b,
      max_exchanges = excluded.max_exchanges,
      token_budget = excluded.token_budget,
      speed_ms = excluded.speed_ms,
      max_minutes = excluded.max_minutes,
      allow_conclusion = excluded.allow_conclusion,
      is_public = excluded.is_public
  `;
  const rows = await sql<Row>`select * from setups where id = ${id}`;
  return mapSetup(rows[0]!);
}

export async function deleteSetup(id: string): Promise<void> {
  const sql = await getSql();
  await sql`delete from setups where id = ${id}`;
}
