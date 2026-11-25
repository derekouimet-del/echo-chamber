import { d as randomCharacter, n as HOUSE_VOICES, s as TOPIC_PRESETS, u as opposeCharacter } from "./cast-CAA-oOdj.mjs";
import { F as saveCharacterFn, O as getProviders, T as dressSessionFn, v as createSessionFn, z as stageShowdownFn } from "./router-B60dYSLG.mjs";
import { n as useVault } from "./vault-68PPfR4E.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/deal-Blj24pvg.js
function toSnapshot(character, provider, extra = "") {
	return {
		characterId: character.id,
		name: character.name,
		role: character.role,
		personality: character.personality,
		perspective: character.perspective,
		style: character.style,
		background: character.background,
		emotion: character.emotion,
		domains: character.domains,
		motivation: character.motivation,
		objective: character.objective,
		constraints: character.constraints,
		extra,
		voiceProvider: character.voiceProvider,
		voiceId: character.voiceId,
		portraitUrl: character.portraitUrl,
		provider: {
			id: provider.id,
			name: provider.name,
			kind: provider.kind,
			baseUrl: provider.baseUrl,
			model: provider.model,
			temperature: provider.temperature,
			maxTokens: provider.maxTokens,
			contextTurns: provider.contextTurns,
			extra: provider.extra
		}
	};
}
async function dealRandomFloor(limits, providers) {
	useVault.getState().setVoiceOn(true);
	const list = providers ?? await getProviders();
	const keys = useVault.getState().keys;
	const [providerA, providerB] = pickSides(list, keys);
	const topic = TOPIC_PRESETS[Math.floor(Math.random() * TOPIC_PRESETS.length)] ?? TOPIC_PRESETS[0];
	const draftA = randomCharacter();
	const draftB = opposeCharacter(draftA);
	draftA.voiceProvider = "house";
	draftB.voiceProvider = "house";
	if (draftB.voiceId === draftA.voiceId) draftB.voiceId = HOUSE_VOICES.find((voice) => voice.id !== draftA.voiceId)?.id ?? "ara";
	const [characterA, characterB] = await Promise.all([saveCharacterFn({ data: draftA }), saveCharacterFn({ data: draftB })]);
	let design = null;
	try {
		design = await stageShowdownFn({ data: {
			topic,
			mode: "debate",
			a: {
				name: characterA.name,
				role: characterA.role,
				perspective: characterA.perspective,
				objective: characterA.objective
			},
			b: {
				name: characterB.name,
				role: characterB.role,
				perspective: characterB.perspective,
				objective: characterB.objective
			}
		} });
	} catch {
		design = null;
	}
	const session = await createSessionFn({ data: {
		topic,
		mode: "debate",
		title: design?.title,
		agentA: toSnapshot(characterA, providerA),
		agentB: toSnapshot(characterB, providerB),
		maxExchanges: limits.exchanges,
		tokenBudget: limits.budget,
		speedMs: limits.speed,
		maxMinutes: limits.minutes,
		allowConclusion: true,
		isPublic: true,
		design
	} });
	dressSessionFn({ data: { id: session.id } }).catch(() => {});
	return session.id;
}
function pickSides(providers, keys) {
	const house = providers.find((provider) => provider.kind === "house" || provider.id === "prov_house");
	const keyed = providers.filter((provider) => provider.kind !== "house" && keys[provider.id]);
	const pool = keyed.length >= 2 ? keyed : house ? [house, ...keyed] : keyed;
	if (!pool.length || !pool[0]) throw new Error("No model is ready. The house director should always be available.");
	const first = pool[Math.floor(Math.random() * pool.length)] ?? pool[0];
	const others = pool.filter((provider) => provider.id !== first.id);
	const second = others.length ? others[Math.floor(Math.random() * others.length)] ?? first : first;
	return Math.random() < .5 ? [first, second] : [second, first];
}
//#endregion
export { toSnapshot as n, dealRandomFloor as t };
