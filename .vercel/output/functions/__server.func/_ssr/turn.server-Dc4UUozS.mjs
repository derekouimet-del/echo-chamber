import { a as safeError } from "./utils-pryIKIhC.mjs";
import { i as MODE_META } from "./cast-CAA-oOdj.mjs";
import { streamChat } from "./llm.server-Bsi4ynMn.mjs";
import { addMessage, claimTurn, clockMs, closeForClock, commitTurn, getMessages, memoriesFor, releaseTurn } from "./store.server-Y_pGEi-o.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/turn.server-Dc4UUozS.js
var MODE_RULES = {
	debate: "Formal debate. Defend your position. Attack weak reasoning with specifics. Concede only when the evidence forces a real concession. Do not seek false balance.",
	negotiation: "Negotiation. State interests, trade concessions, and hunt a deal you can live with. Name what you need and what you can give. Vague harmony is a failed turn.",
	collaboration: "Collaboration. Build on the other side's best idea. Disagree only to improve the work. Push toward something concrete: a plan, a design, a decision.",
	adversarial: "Adversarial review. Stress-test assumptions, hidden premises, and unstated values. Be rigorous, not cruel. Steelman briefly, then strike the weakest joint.",
	creative: "Creative floor. Offer vivid, specific proposals. React to the other maker's actual work. Leave words, designs, or strategies someone could use.",
	freeform: "Freeform. No required structure. Stay in character and pursue your objective. Let the hour find its shape, but do not drift into small talk."
};
function personaPrompt(self, other, session, memories) {
	const memoryBlock = memories.length ? memories.map((m) => `- (${m.kind}) ${m.content}`).join("\n") : "- None yet. This floor can still change what you remember later.";
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
		`You share the floor with ${other.name}, ${other.role}. Their objective: ${other.objective}. Their perspective: ${other.perspective}.`,
		`Mode: ${MODE_META[session.mode].label}. ${MODE_RULES[session.mode]}`,
		`Topic: ${session.topic}`,
		design?.stakes ? `Stakes, as staged: ${design.stakes}` : "",
		design?.visualMotif ? `Atmosphere: ${design.visualMotif}` : "",
		"",
		"Rules of the floor:",
		"- Speak only as yourself, in the first person, addressing the other person.",
		"- No stage directions, no name labels, no markdown headings.",
		"- 120 to 220 words unless a shorter strike is sharper. Never pad.",
		"- Each turn must add a new claim, a precise rebuttal, a concession, a question, or a concrete proposal.",
		"- Do not repeat a paragraph you already delivered. Do not loop.",
		"- You may quote the other person briefly in order to answer them.",
		session.allowConclusion ? "- If, and only if, a real conclusion, deal, or finished artifact has been reached, end with a final line that starts exactly with CONCLUSION: and one sentence. Otherwise never use that prefix." : "- Do not declare the session over. The director ends it."
	].filter(Boolean).join("\n");
}
function turnUserPrompt(messages, session, side, contextTurns) {
	const self = side === "a" ? session.agentA : session.agentB;
	const recent = messages.slice(-Math.max(4, contextTurns));
	const lines = recent.map((m) => {
		if (m.speaker === side) return `YOU (${self.name}): ${m.content}`;
		return `${labelSpeaker(m.speaker, session).toUpperCase()}: ${m.content}`;
	});
	const dropped = messages.length - recent.length;
	return [
		dropped > 0 ? `(${dropped} earlier turns are outside this window. Do not contradict yourself.)` : "",
		"TRANSCRIPT:",
		lines.join("\n\n") || "(The floor is empty. You open.)",
		"",
		`It is your turn. Reply only as ${self.name}, in character. No labels.`
	].filter(Boolean).join("\n");
}
function labelSpeaker(speaker, session) {
	if (speaker === "a") return session.agentA.name;
	if (speaker === "b") return session.agentB.name;
	if (speaker === "director") return "Director";
	return "Floor";
}
async function executeTurn(input, onDelta, signal, onSpeaker) {
	if (!input.sessionId) return {
		stop: true,
		reason: "bad-request",
		message: null,
		session: null,
		error: "Missing session."
	};
	const session = await claimTurn(input.sessionId);
	if (!session) return {
		stop: true,
		reason: "not-live",
		message: null,
		session: null
	};
	const side = session.exchangeCount % 2 === 0 ? "a" : "b";
	if (session.maxMinutes > 0 && clockMs(session) >= session.maxMinutes * 6e4) {
		const closed = await closeForClock(session.id);
		return {
			stop: true,
			reason: "clock",
			message: closed.message,
			session: closed.session
		};
	}
	onSpeaker?.(side);
	const agent = side === "a" ? session.agentA : session.agentB;
	const other = side === "a" ? session.agentB : session.agentA;
	const secret = agent.provider.kind === "house" ? void 0 : input.keys?.[agent.provider.id];
	const timeout = AbortSignal.timeout(7e4);
	try {
		if (agent.provider.kind !== "house" && !secret?.trim()) throw new Error(`Add an API key for ${agent.provider.name} under Models. Keys stay in this browser and are never written to the floor.`);
		const [messages, memories] = await Promise.all([getMessages(session.id), agent.characterId ? memoriesFor(agent.characterId) : Promise.resolve([])]);
		const llm = {
			kind: agent.provider.kind,
			baseUrl: agent.provider.baseUrl,
			model: agent.provider.model,
			apiKey: secret,
			temperature: agent.provider.temperature,
			maxTokens: agent.provider.maxTokens,
			extra: agent.provider.extra,
			messages: [{
				role: "system",
				content: personaPrompt(agent, other, session, memories)
			}, {
				role: "user",
				content: turnUserPrompt(messages, session, side, agent.provider.contextTurns)
			}]
		};
		const linked = signal ? AbortSignal.any([signal, timeout]) : timeout;
		const result = await streamChat(llm, onDelta, linked);
		const committed = await commitTurn({
			sessionId: session.id,
			speaker: side,
			content: result.text,
			tokens: result.tokens
		});
		return {
			stop: committed.stop,
			reason: committed.reason,
			message: committed.message,
			session: committed.session
		};
	} catch (err) {
		if (signal?.aborted) {
			try {
				await releaseTurn(session.id, "paused");
			} catch {}
			return {
				stop: true,
				reason: "aborted",
				message: null,
				session: null
			};
		}
		const error = timeout.aborted ? "The model took too long. The floor is paused." : safeError(err, secret);
		try {
			await addMessage(session.id, "system", error, 0);
			await releaseTurn(session.id, "paused");
		} catch {}
		return {
			stop: true,
			reason: "error",
			message: null,
			session: null,
			error
		};
	}
}
//#endregion
export { executeTurn };
