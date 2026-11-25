import { i as nid, t as clamp } from "./utils-pryIKIhC.mjs";
import { o as PRESETS, r as KIND_META, t as HOUSE_ID } from "./cast-CAA-oOdj.mjs";
import { n as PROVIDER_KINDS, t as MODES } from "./types-BEgKCHv-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/store.server-Y_pGEi-o.js
var _0002_arena_default = "create table if not exists providers (\n  id text primary key,\n  name text not null,\n  kind text not null,\n  base_url text not null default '',\n  model text not null default '',\n  temperature double precision not null default 0.8,\n  max_tokens integer not null default 500,\n  context_turns integer not null default 14,\n  extra text not null default '{}',\n  locked boolean not null default false,\n  created_at timestamptz not null default now(),\n  updated_at timestamptz not null default now()\n);\n\ncreate table if not exists characters (\n  id text primary key,\n  name text not null,\n  role text not null default '',\n  personality text not null default '',\n  perspective text not null default '',\n  style text not null default '',\n  background text not null default '',\n  emotion text not null default '',\n  domains text not null default '',\n  motivation text not null default '',\n  objective text not null default '',\n  constraints text not null default '',\n  voice_provider text not null default 'none',\n  voice_id text not null default '',\n  favorite boolean not null default false,\n  is_template boolean not null default false,\n  portrait_url text,\n  created_at timestamptz not null default now(),\n  updated_at timestamptz not null default now()\n);\n\ncreate table if not exists memories (\n  id text primary key,\n  character_id text not null references characters (id) on delete cascade,\n  kind text not null default 'long',\n  content text not null,\n  session_id text,\n  created_at timestamptz not null default now()\n);\n\ncreate index if not exists memories_character_idx on memories (character_id);\n\ncreate table if not exists sessions (\n  id text primary key,\n  title text not null,\n  topic text not null,\n  mode text not null,\n  status text not null default 'draft',\n  agent_a text not null,\n  agent_b text not null,\n  max_exchanges integer not null default 8,\n  token_budget integer not null default 12000,\n  tokens_used integer not null default 0,\n  speed_ms integer not null default 1200,\n  allow_conclusion boolean not null default true,\n  is_public boolean not null default true,\n  summary text,\n  agreements text,\n  disagreements text,\n  conclusion text,\n  design text,\n  exchange_count integer not null default 0,\n  started_at timestamptz,\n  ended_at timestamptz,\n  created_at timestamptz not null default now(),\n  updated_at timestamptz not null default now()\n);\n\ncreate index if not exists sessions_status_idx on sessions (status);\n\ncreate table if not exists messages (\n  id text primary key,\n  session_id text not null references sessions (id) on delete cascade,\n  speaker text not null,\n  content text not null,\n  tokens integer not null default 0,\n  created_at timestamptz not null default now()\n);\n\ncreate index if not exists messages_session_idx on messages (session_id, created_at);\n\ncreate table if not exists app_meta (\n  key text primary key,\n  value text not null\n);\n";
var _0003_board_default = "alter table sessions add column if not exists max_minutes integer not null default 0;\nalter table sessions add column if not exists elapsed_ms integer not null default 0;\nalter table sessions add column if not exists resumed_at timestamptz;\n\nupdate sessions\nset resumed_at = coalesce(resumed_at, started_at)\nwhere status in ('live', 'thinking') and resumed_at is null;\n\nupdate sessions\nset elapsed_ms = greatest(\n  0,\n  floor(extract(epoch from (coalesce(ended_at, updated_at) - started_at)) * 1000)\n)::int\nwhere elapsed_ms = 0\n  and started_at is not null\n  and status in ('completed', 'failed', 'paused');\n\ncreate table if not exists setups (\n  id text primary key,\n  name text not null,\n  topic text not null,\n  mode text not null,\n  character_a text not null,\n  character_b text not null,\n  provider_a text not null,\n  provider_b text not null,\n  extra_a text not null default '',\n  extra_b text not null default '',\n  max_exchanges integer not null default 8,\n  token_budget integer not null default 12000,\n  speed_ms integer not null default 900,\n  max_minutes integer not null default 0,\n  allow_conclusion boolean not null default true,\n  is_public boolean not null default true,\n  created_at timestamptz not null default now()\n);\n";
/**
* Migration bookkeeping shared by the two appliers — `scripts/migrate.mjs`
* (deploy, `readdir`) and `src/lib/db.ts` (PGLite preview, `import.meta.glob`).
*
* Applied files are keyed by BASENAME, so the same file applies once no matter
* which directory it is globbed from. That is what makes the auth schema safe to
* copy from `migrations/auth/` into `migrations/` when an app turns sign-in on:
* a database that already has `0001_auth.sql` will not re-run it.
*
* Neither applier descends into subdirectories, so `migrations/auth/*.sql` is
* out of scope for both until it is copied up.
*/
/**
* The `_migrations` key for a migration path (or bare filename).
* @param {string} path
* @returns {string}
*/
function migrationName(path) {
	return path.split("/").pop() ?? path;
}
/**
* @param {string} path
* @returns {boolean}
*/
function isMigrationFile(path) {
	return path.endsWith(".sql");
}
/**
* Migrations in `paths` that are not yet in `applied`, in apply order.
* Non-`.sql` entries (a `readdir` also yields `migrations/auth/`) are dropped.
* @param {Iterable<string>} paths
* @param {Iterable<string>} applied
* @returns {Array<{ name: string, path: string }>}
*/
function pendingMigrations(paths, applied) {
	const done = new Set(applied);
	return [...paths].filter(isMigrationFile).map((path) => ({
		name: migrationName(path),
		path
	})).sort((a, b) => a.name.localeCompare(b.name)).filter(({ name }) => !done.has(name));
}
var rawDatabaseUrl = typeof process !== "undefined" ? process.env.DATABASE_URL : void 0;
var databaseUrl = rawDatabaseUrl && rawDatabaseUrl.trim() ? rawDatabaseUrl : void 0;
/**
* Active backend: real **Neon** when `DATABASE_URL` is set (deployed / configured
* sandbox), otherwise a local embedded **PGLite** (Postgres compiled to WASM) so
* the app has a working database even with nothing configured — the live preview
* included. Swap in Neon later by just setting `DATABASE_URL`; no code changes.
*/
var dbSource = databaseUrl ? "neon" : "pglite";
/**
* Init state lives on globalThis as promises: dev HMR creates new instances of
* this module, and two instances racing module-level state would open a second
* pool or run two concurrent PGLite migration passes (whose duplicate
* `_migrations` insert rejects — and would get memoized, poisoning every later
* `getSql()`). A failed init clears its slot so the next call retries.
*/
var globalRef = globalThis;
/**
* Result-type parity: Postgres sends every value as text plus a type OID — the
* JS value is the DRIVER's parsing choice, and pg and PGLite disagree (pg:
* int8 -> string, date -> local-midnight Date; PGLite: int8 -> BigInt, which
* JSON.stringify rejects, date -> UTC Date). Normalize both so preview and
* production return identical, JSON-safe shapes:
*   int8/bigint (incl. count(*)) -> number (past 2^53 loses precision — cast
*                                   `::text` if you ever need huge integers)
*   date                         -> 'YYYY-MM-DD' string
*   interval                     -> Postgres interval text
* numeric already comes back as a string on both (arbitrary precision).
*/
var OID_INT8 = 20;
var OID_DATE = 1082;
var OID_INTERVAL = 1186;
var identity = (v) => v;
/** Wrap a query runner in the tagged-template + `.query()` `Sql` surface. */
function toSql(run) {
	const sql = (async (strings, ...values) => {
		let text = strings[0];
		for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
		return run(text, values);
	});
	sql.query = (text, params = []) => run(text, params);
	return sql;
}
function createNeonSql() {
	globalRef.__pgSqlPromise__ ??= (async () => {
		const { Pool, types } = await import("../_libs/pg.mjs").then((n) => n.t);
		types.setTypeParser(OID_INT8, Number);
		types.setTypeParser(OID_DATE, identity);
		types.setTypeParser(OID_INTERVAL, identity);
		const pool = new Pool({ connectionString: databaseUrl });
		return toSql(async (text, params) => {
			return (await pool.query(text, params)).rows;
		});
	})().catch((err) => {
		globalRef.__pgSqlPromise__ = void 0;
		throw err;
	});
	return globalRef.__pgSqlPromise__;
}
async function createPgliteSql() {
	globalRef.__pgliteInstance__ ??= (async () => {
		const { PGlite } = await import("../_libs/electric-sql__pglite.mjs").then((n) => n.t);
		const pg = new PGlite({ parsers: {
			[OID_INT8]: Number,
			[OID_DATE]: identity,
			[OID_INTERVAL]: identity
		} });
		await pg.waitReady;
		await pg.exec("create table if not exists _migrations (name text primary key, applied_at timestamptz not null default now())");
		return pg;
	})().catch((err) => {
		globalRef.__pgliteInstance__ = void 0;
		throw err;
	});
	const pg = await globalRef.__pgliteInstance__;
	const migrate = async () => {
		const migrations = /* #__PURE__ */ Object.assign({
			"/migrations/0002_arena.sql": _0002_arena_default,
			"/migrations/0003_board.sql": _0003_board_default
		});
		const done = (await pg.query("select name from _migrations")).rows.map((r) => r.name);
		for (const { name, path } of pendingMigrations(Object.keys(migrations), done)) await pg.transaction(async (tx) => {
			await tx.exec(migrations[path]);
			await tx.query("insert into _migrations (name) values ($1)", [name]);
		});
	};
	const pass = (globalRef.__pgliteMigrateChain__ ?? Promise.resolve()).catch(() => void 0).then(migrate);
	globalRef.__pgliteMigrateChain__ = pass;
	await pass;
	return toSql(async (text, params) => {
		return (await pg.query(text, params)).rows;
	});
}
var sqlPromise = null;
async function createSql() {
	if (typeof window !== "undefined") throw new Error("@/lib/db is server-only — call getSql() from a createServerFn handler or a server route loader, never from client code.");
	return dbSource === "neon" ? createNeonSql() : createPgliteSql();
}
/**
* Get the shared, **server-only** SQL client. Neon when `DATABASE_URL` is set,
* otherwise the local PGLite fallback. Memoized — safe to call per request.
*
* Schema comes from `migrations/*.sql`, auto-applied before the first query on
* both backends — define tables there, never inline in server functions.
*/
function getSql() {
	sqlPromise ??= createSql().catch((err) => {
		sqlPromise = null;
		throw err;
	});
	return sqlPromise;
}
/**
* Finish DB bootstrap before the server handles traffic.
*
* - **PGLite** (preview / no `DATABASE_URL`): open the in-memory DB and apply
*   `migrations/*.sql`. Idempotent — concurrent callers share one promise.
* - **Neon**: no-op (pool is created lazily on first query).
*
* Vite `configureServer` awaits this at dev startup; production imports of this
* module kick it off immediately (see bottom of file).
*/
function ensureDbReady() {
	if (dbSource !== "pglite") return Promise.resolve();
	return getSql().then(() => void 0);
}
var globalBoot = globalThis;
if (typeof window === "undefined" && dbSource === "pglite") globalBoot.__pgBootstrapPromise__ ??= ensureDbReady().catch((err) => {
	globalBoot.__pgBootstrapPromise__ = void 0;
	console.error("[db] PGLite bootstrap failed:", err);
	throw err;
});
function iso(value) {
	if (value == null) return null;
	if (value instanceof Date) return value.toISOString();
	const d = new Date(String(value));
	if (Number.isNaN(d.getTime())) return String(value);
	return d.toISOString();
}
function str(value, fallback = "") {
	return value == null ? fallback : String(value);
}
function num(value, fallback = 0) {
	const n = Number(value);
	return Number.isFinite(n) ? n : fallback;
}
function bool(value) {
	return value === true || value === "t" || value === "true" || value === 1;
}
function asKind(value) {
	return PROVIDER_KINDS.includes(value) ? value : "custom";
}
function asMode(value) {
	return MODES.includes(value) ? value : "debate";
}
function asVoice(value) {
	if (value === "house" || value === "elevenlabs" || value === "openai") return value;
	return "none";
}
function asStatus(value) {
	if (value === "draft" || value === "live" || value === "thinking" || value === "paused" || value === "completed" || value === "failed") return value;
	return "paused";
}
function parseJson(value, fallback) {
	if (typeof value !== "string" || !value.trim()) return fallback;
	try {
		return JSON.parse(value);
	} catch {
		return fallback;
	}
}
function mapProvider(row) {
	return {
		id: str(row.id),
		name: str(row.name),
		kind: asKind(str(row.kind)),
		baseUrl: str(row.base_url),
		model: str(row.model),
		temperature: num(row.temperature, .8),
		maxTokens: num(row.max_tokens, 500),
		contextTurns: num(row.context_turns, 14),
		extra: str(row.extra, "{}"),
		locked: bool(row.locked),
		createdAt: iso(row.created_at) ?? (/* @__PURE__ */ new Date()).toISOString()
	};
}
function mapCharacter(row) {
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
		createdAt: iso(row.created_at) ?? (/* @__PURE__ */ new Date()).toISOString()
	};
}
function mapSession(row) {
	return {
		id: str(row.id),
		title: str(row.title),
		topic: str(row.topic),
		mode: asMode(str(row.mode)),
		status: asStatus(str(row.status)),
		agentA: parseJson(row.agent_a, emptyAgent()),
		agentB: parseJson(row.agent_b, emptyAgent()),
		maxExchanges: num(row.max_exchanges, 8),
		tokenBudget: num(row.token_budget, 12e3),
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
		design: parseJson(row.design, null),
		exchangeCount: num(row.exchange_count, 0),
		startedAt: iso(row.started_at),
		endedAt: iso(row.ended_at),
		createdAt: iso(row.created_at) ?? (/* @__PURE__ */ new Date()).toISOString(),
		updatedAt: iso(row.updated_at) ?? (/* @__PURE__ */ new Date()).toISOString()
	};
}
function mapMessage(row) {
	const speaker = str(row.speaker);
	return {
		id: str(row.id),
		sessionId: str(row.session_id),
		speaker: speaker === "a" || speaker === "b" || speaker === "director" || speaker === "system" ? speaker : "system",
		content: str(row.content),
		tokens: num(row.tokens, 0),
		createdAt: iso(row.created_at) ?? (/* @__PURE__ */ new Date()).toISOString()
	};
}
function mapMemory(row) {
	const kind = str(row.kind);
	return {
		id: str(row.id),
		characterId: str(row.character_id),
		kind: kind === "short" || kind === "session" ? kind : "long",
		content: str(row.content),
		sessionId: row.session_id ? str(row.session_id) : null,
		createdAt: iso(row.created_at) ?? (/* @__PURE__ */ new Date()).toISOString()
	};
}
function emptyAgent() {
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
			temperature: .8,
			maxTokens: 500,
			contextTurns: 14,
			extra: "{}"
		}
	};
}
async function ensureSeed() {
	const sql = await getSql();
	const meta = await sql`select value from app_meta where key = 'seeded'`;
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
	for (const preset of PRESETS) await insertCharacter({
		...preset,
		favorite: Boolean(preset.favorite),
		template: true
	});
	await sql`insert into app_meta (key, value) values ('seeded', '1') on conflict (key) do nothing`;
}
async function listProviders() {
	await ensureSeed();
	return (await (await getSql())`select * from providers order by locked desc, created_at asc`).map(mapProvider);
}
async function saveProvider(input) {
	await ensureSeed();
	const sql = await getSql();
	const existing = await sql`select * from providers where id = ${input.id}`;
	if (existing[0] && bool(existing[0].locked)) await sql`
      update providers set
        temperature = ${clamp(input.temperature, 0, 2)},
        max_tokens = ${clamp(Math.round(input.maxTokens), 32, 800)},
        context_turns = ${clamp(Math.round(input.contextTurns), 4, 40)},
        model = ${input.model.trim() || KIND_META.house.model},
        extra = ${input.extra?.trim() || "{}"},
        updated_at = now()
      where id = ${input.id}
    `;
	else if (existing[0]) await sql`
      update providers set
        name = ${input.name.trim() || "Untitled model"},
        kind = ${input.kind},
        base_url = ${input.baseUrl.trim()},
        model = ${input.model.trim()},
        temperature = ${clamp(input.temperature, 0, 2)},
        max_tokens = ${clamp(Math.round(input.maxTokens), 32, 4e3)},
        context_turns = ${clamp(Math.round(input.contextTurns), 4, 40)},
        extra = ${input.extra?.trim() || "{}"},
        updated_at = now()
      where id = ${input.id}
    `;
	else {
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
        ${clamp(Math.round(input.maxTokens), 32, 4e3)},
        ${clamp(Math.round(input.contextTurns), 4, 40)},
        ${input.extra?.trim() || "{}"},
        false
      )
    `;
	}
	return mapProvider((await sql`select * from providers where id = ${input.id}`)[0]);
}
async function deleteProvider(id) {
	const sql = await getSql();
	const rows = await sql`select locked from providers where id = ${id}`;
	if (rows[0] && bool(rows[0].locked)) throw new Error("The house model stays on the floor.");
	await sql`delete from providers where id = ${id}`;
}
async function insertCharacter(input) {
	await (await getSql())`
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
async function listCharacters() {
	await ensureSeed();
	return (await (await getSql())`select * from characters order by favorite desc, created_at asc`).map(mapCharacter);
}
async function saveCharacter(input) {
	await ensureSeed();
	const sql = await getSql();
	if (!(await sql`select id, portrait_url, is_template from characters where id = ${input.id}`)[0]) await insertCharacter(input);
	else await sql`
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
	return mapCharacter((await sql`select * from characters where id = ${input.id}`)[0]);
}
async function deleteCharacter(id) {
	await (await getSql())`delete from characters where id = ${id}`;
}
async function setPortrait(id, url) {
	const sql = await getSql();
	await sql`update characters set portrait_url = ${url}, updated_at = now() where id = ${id}`;
	const rows = await sql`select * from characters where id = ${id}`;
	if (!rows[0]) throw new Error("Character not found.");
	return mapCharacter(rows[0]);
}
async function getCharacter(id) {
	const rows = await (await getSql())`select * from characters where id = ${id}`;
	return rows[0] ? mapCharacter(rows[0]) : null;
}
async function listMemories(characterId) {
	return (await (await getSql())`
    select * from memories where character_id = ${characterId} order by created_at desc limit 80
  `).map(mapMemory);
}
async function memoriesFor(characterId) {
	return (await (await getSql())`
    select * from memories where character_id = ${characterId}
    order by created_at desc limit 8
  `).map(mapMemory).reverse();
}
async function addMemory(input) {
	const sql = await getSql();
	const id = nid();
	const content = input.content.trim().slice(0, 2e3);
	if (!content) throw new Error("Memory cannot be empty.");
	await sql`
    insert into memories (id, character_id, kind, content, session_id)
    values (${id}, ${input.characterId}, ${input.kind}, ${content}, ${input.sessionId ?? null})
  `;
	return mapMemory((await sql`select * from memories where id = ${id}`)[0]);
}
async function deleteMemory(id) {
	await (await getSql())`delete from memories where id = ${id}`;
}
async function clearMemories(characterId) {
	await (await getSql())`delete from memories where character_id = ${characterId}`;
}
async function createSession(input) {
	await ensureSeed();
	const sql = await getSql();
	const id = nid();
	const topic = input.topic.trim().slice(0, 2e3);
	if (!topic) throw new Error("A topic is required.");
	if (!input.agentA?.name || !input.agentB?.name) throw new Error("Both agents need a character.");
	const design = input.design;
	await sql`
    insert into sessions (
      id, title, topic, mode, status, agent_a, agent_b, max_exchanges, token_budget,
      speed_ms, max_minutes, elapsed_ms, resumed_at, allow_conclusion, is_public, design, started_at
    ) values (
      ${id},
      ${(input.title || design?.title || topic).slice(0, 180)},
      ${topic},
      ${input.mode},
      'live',
      ${JSON.stringify(input.agentA)},
      ${JSON.stringify(input.agentB)},
      ${clamp(Math.round(input.maxExchanges), 2, 24)},
      ${clamp(Math.round(input.tokenBudget), 500, 2e5)},
      ${clamp(Math.round(input.speedMs), 0, 15e3)},
      ${clamp(Math.round(input.maxMinutes || 0), 0, 180)},
      0,
      now(),
      ${input.allowConclusion},
      ${input.isPublic},
      ${design ? JSON.stringify(design) : null},
      now()
    )
  `;
	if (design?.coldOpen?.trim()) await sql`
      insert into messages (id, session_id, speaker, content)
      values (${nid()}, ${id}, 'director', ${design.coldOpen.trim().slice(0, 2e3)})
    `;
	return await getSession(id);
}
async function listSessions() {
	await ensureSeed();
	return (await (await getSql())`select * from sessions order by created_at desc limit 60`).map(mapSession);
}
function accrued(session) {
	const extra = session.resumedAt ? Math.max(0, Date.now() - new Date(session.resumedAt).getTime()) : 0;
	return Math.round(session.elapsedMs + extra);
}
function clockMs(session) {
	return accrued(session);
}
async function getSession(id) {
	const sql = await getSql();
	const rows = await sql`select * from sessions where id = ${id}`;
	if (!rows[0]) return null;
	let session = mapSession(rows[0]);
	if (session.status === "thinking") {
		if (Date.now() - new Date(session.updatedAt).getTime() > 15e4) {
			const elapsed = accrued(session);
			await sql`
        update sessions set
          status = 'paused',
          elapsed_ms = ${elapsed},
          resumed_at = null,
          updated_at = now()
        where id = ${id} and status = 'thinking'
      `;
			session = {
				...session,
				status: "paused",
				elapsedMs: elapsed,
				resumedAt: null
			};
		}
	}
	return session;
}
async function getMessages(sessionId) {
	return (await (await getSql())`
    select * from messages where session_id = ${sessionId} order by created_at asc
  `).map(mapMessage);
}
async function setStatus(id, status) {
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
	} else if (status === "live") await sql`
      update sessions set
        status = 'live',
        started_at = coalesce(started_at, now()),
        resumed_at = coalesce(resumed_at, now()),
        ended_at = null,
        updated_at = now()
      where id = ${id} and status in ('paused', 'draft', 'live', 'failed')
    `;
	else await sql`update sessions set status = ${status}, updated_at = now() where id = ${id}`;
	const session = await getSession(id);
	if (!session) throw new Error("Session not found.");
	return session;
}
async function deleteSession(id) {
	await (await getSql())`delete from sessions where id = ${id}`;
}
async function addMessage(sessionId, speaker, content, tokens = 0) {
	const sql = await getSql();
	const id = nid();
	await sql`
    insert into messages (id, session_id, speaker, content, tokens)
    values (${id}, ${sessionId}, ${speaker}, ${content.slice(0, 12e3)}, ${tokens})
  `;
	return mapMessage((await sql`select * from messages where id = ${id}`)[0]);
}
async function claimTurn(sessionId) {
	const rows = await (await getSql())`
    update sessions set status = 'thinking', updated_at = now()
    where id = ${sessionId} and status = 'live'
    returning *
  `;
	return rows[0] ? mapSession(rows[0]) : null;
}
async function releaseTurn(sessionId, status) {
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
async function commitTurn(input) {
	const sql = await getSql();
	const message = await addMessage(input.sessionId, input.speaker, input.content, input.tokens);
	const current = await getSession(input.sessionId);
	if (!current) throw new Error("Session disappeared.");
	const concluded = current.allowConclusion && /(^|\n)\s*CONCLUSION:/i.test(input.content);
	const nextCount = current.exchangeCount + 1;
	const nextTokens = current.tokensUsed + input.tokens;
	const hitCap = nextCount >= current.maxExchanges || nextTokens >= current.tokenBudget;
	const stop = concluded || hitCap;
	let reason = null;
	if (concluded) reason = "conclusion";
	else if (nextCount >= current.maxExchanges) reason = "exchanges";
	else if (nextTokens >= current.tokenBudget) reason = "budget";
	let session = mapSession((await sql`
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
  `)[0]);
	if (session.status !== "live" && session.resumedAt) {
		const elapsed = clockMs(session);
		await sql`
      update sessions set elapsed_ms = ${elapsed}, resumed_at = null, updated_at = now()
      where id = ${input.sessionId}
    `;
		session = {
			...session,
			elapsedMs: elapsed,
			resumedAt: null
		};
	}
	const actuallyStop = session.status !== "live";
	return {
		message,
		session,
		stop: actuallyStop,
		reason: actuallyStop ? reason ?? session.status : null
	};
}
async function saveAnalysis(id, analysis) {
	await (await getSql())`
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
async function applyVisuals(id, visuals) {
	const sql = await getSql();
	const session = await getSession(id);
	if (!session) throw new Error("Session not found.");
	const agentA = {
		...session.agentA,
		portraitUrl: visuals.portraitA || session.agentA.portraitUrl
	};
	const agentB = {
		...session.agentB,
		portraitUrl: visuals.portraitB || session.agentB.portraitUrl
	};
	const design = session.design ? {
		...session.design,
		backdropUrl: visuals.backdropUrl || session.design.backdropUrl
	} : session.design;
	await sql`
    update sessions set
      agent_a = ${JSON.stringify(agentA)},
      agent_b = ${JSON.stringify(agentB)},
      design = ${design ? JSON.stringify(design) : null},
      updated_at = now()
    where id = ${id}
  `;
	const next = await getSession(id);
	if (!next) throw new Error("Session not found.");
	return next;
}
async function dashboard() {
	await ensureSeed();
	const counts = await (await getSql())`
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
			tokens: num(row.tokens)
		},
		sessions: sessions.slice(0, 8),
		cast: cast.slice(0, 4)
	};
}
async function restoreTemplates() {
	for (const preset of PRESETS) if (!(await (await getSql())`select id from characters where id = ${preset.id}`).length) await insertCharacter({
		...preset,
		template: true,
		favorite: Boolean(preset.favorite)
	});
	return listCharacters();
}
async function listBoard() {
	await ensureSeed();
	const rows = await (await getSql())`
    select * from sessions where is_public = true order by created_at desc limit 80
  `;
	const rank = (status) => status === "live" || status === "thinking" ? 0 : status === "paused" ? 1 : 2;
	return rows.map(mapSession).sort((a, b) => rank(a.status) - rank(b.status) || b.createdAt.localeCompare(a.createdAt));
}
async function rematchSession(id) {
	const session = await getSession(id);
	if (!session) throw new Error("That session is not on the floor.");
	return createSession({
		topic: session.topic,
		mode: session.mode,
		title: session.design?.title || session.title,
		agentA: session.agentA,
		agentB: session.agentB,
		maxExchanges: session.maxExchanges,
		tokenBudget: session.tokenBudget,
		speedMs: session.speedMs,
		maxMinutes: session.maxMinutes,
		allowConclusion: session.allowConclusion,
		isPublic: session.isPublic,
		design: session.design
	});
}
async function closeForClock(sessionId) {
	const message = await addMessage(sessionId, "system", "The clock ran out. The floor is closed.", 0);
	await releaseTurn(sessionId, "completed");
	return {
		session: await getSession(sessionId),
		message
	};
}
function mapSetup(row) {
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
		tokenBudget: num(row.token_budget, 12e3),
		speedMs: num(row.speed_ms, 900),
		maxMinutes: num(row.max_minutes, 0),
		allowConclusion: bool(row.allow_conclusion),
		isPublic: bool(row.is_public),
		createdAt: iso(row.created_at) ?? (/* @__PURE__ */ new Date()).toISOString()
	};
}
async function listSetups() {
	return (await (await getSql())`select * from setups order by created_at desc limit 40`).map(mapSetup);
}
async function saveSetup(input) {
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
      ${input.topic.trim().slice(0, 2e3)},
      ${input.mode},
      ${input.characterA},
      ${input.characterB},
      ${input.providerA},
      ${input.providerB},
      ${input.extraA.slice(0, 2e3)},
      ${input.extraB.slice(0, 2e3)},
      ${clamp(Math.round(input.maxExchanges), 2, 24)},
      ${clamp(Math.round(input.tokenBudget), 500, 2e5)},
      ${clamp(Math.round(input.speedMs), 0, 15e3)},
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
	return mapSetup((await sql`select * from setups where id = ${id}`)[0]);
}
async function deleteSetup(id) {
	await (await getSql())`delete from setups where id = ${id}`;
}
//#endregion
export { addMemory, addMessage, applyVisuals, claimTurn, clearMemories, clockMs, closeForClock, commitTurn, createSession, dashboard, deleteCharacter, deleteMemory, deleteProvider, deleteSession, deleteSetup, getCharacter, getMessages, getSession, listBoard, listCharacters, listMemories, listProviders, listSessions, listSetups, memoriesFor, releaseTurn, rematchSession, restoreTemplates, saveAnalysis, saveCharacter, saveProvider, saveSetup, setPortrait, setStatus };
