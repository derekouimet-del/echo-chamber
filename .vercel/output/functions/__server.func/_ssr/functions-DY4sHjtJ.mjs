import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/functions-DY4sHjtJ.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var getDashboard_createServerFn_handler = createServerRpc({
	id: "42e9d10041b85567d6fa093870b1bcf25b94e7bbdc471d16ab396167a4aff98d",
	name: "getDashboard",
	filename: "src/lib/arena/functions.ts"
}, (opts) => getDashboard.__executeServer(opts));
var getDashboard = createServerFn({ method: "GET" }).handler(getDashboard_createServerFn_handler, async () => {
	const { dashboard } = await import("./store.server-Y_pGEi-o.mjs");
	return dashboard();
});
var getProviders_createServerFn_handler = createServerRpc({
	id: "9872599b34e78b58d4b2578e013bc80616dc753991763bd8291005d7f714ef6f",
	name: "getProviders",
	filename: "src/lib/arena/functions.ts"
}, (opts) => getProviders.__executeServer(opts));
var getProviders = createServerFn({ method: "GET" }).handler(getProviders_createServerFn_handler, async () => {
	const { listProviders } = await import("./store.server-Y_pGEi-o.mjs");
	return listProviders();
});
var saveProviderFn_createServerFn_handler = createServerRpc({
	id: "d36a8091412c50ffd2898d310d79623bf3726d87a37600ce8e1b1ae7efe286e3",
	name: "saveProviderFn",
	filename: "src/lib/arena/functions.ts"
}, (opts) => saveProviderFn.__executeServer(opts));
var saveProviderFn = createServerFn({ method: "POST" }).validator((input) => {
	if (!input?.id || !input.kind) throw new Error("Provider is incomplete.");
	return input;
}).handler(saveProviderFn_createServerFn_handler, async ({ data }) => {
	const { saveProvider } = await import("./store.server-Y_pGEi-o.mjs");
	return saveProvider(data);
});
var deleteProviderFn_createServerFn_handler = createServerRpc({
	id: "064fc0733661a947c9bce9be72973be4987d44d15992f0506a9f9923ae5b2a81",
	name: "deleteProviderFn",
	filename: "src/lib/arena/functions.ts"
}, (opts) => deleteProviderFn.__executeServer(opts));
var deleteProviderFn = createServerFn({ method: "POST" }).validator((input) => input).handler(deleteProviderFn_createServerFn_handler, async ({ data }) => {
	const { deleteProvider } = await import("./store.server-Y_pGEi-o.mjs");
	await deleteProvider(data.id);
	return { ok: true };
});
var testProviderFn_createServerFn_handler = createServerRpc({
	id: "e27875807e647f615b926c83f31c4b094bf2cace027e9ec56b661418001f1385",
	name: "testProviderFn",
	filename: "src/lib/arena/functions.ts"
}, (opts) => testProviderFn.__executeServer(opts));
var testProviderFn = createServerFn({ method: "POST" }).validator((input) => input).handler(testProviderFn_createServerFn_handler, async ({ data }) => {
	const { completeChat } = await import("./llm.server-Bsi4ynMn.mjs");
	return {
		ok: true,
		text: (await completeChat({
			kind: data.kind,
			baseUrl: data.baseUrl,
			model: data.model,
			apiKey: data.apiKey,
			temperature: data.temperature ?? 0,
			maxTokens: Math.min(data.maxTokens ?? 32, 32),
			messages: [{
				role: "system",
				content: "Reply with exactly the word PONG and nothing else."
			}, {
				role: "user",
				content: "Ping."
			}]
		})).text.slice(0, 80)
	};
});
var getCharacters_createServerFn_handler = createServerRpc({
	id: "708a13fa3d9162b4a177e23e2a467998b109f9fb69a33d9f8399773e89520c73",
	name: "getCharacters",
	filename: "src/lib/arena/functions.ts"
}, (opts) => getCharacters.__executeServer(opts));
var getCharacters = createServerFn({ method: "GET" }).handler(getCharacters_createServerFn_handler, async () => {
	const { listCharacters } = await import("./store.server-Y_pGEi-o.mjs");
	return listCharacters();
});
var saveCharacterFn_createServerFn_handler = createServerRpc({
	id: "4d7c987fc3b743ed3c802d1236de0a12fadeb1b7d8a5afe187c6b342dff4203f",
	name: "saveCharacterFn",
	filename: "src/lib/arena/functions.ts"
}, (opts) => saveCharacterFn.__executeServer(opts));
var saveCharacterFn = createServerFn({ method: "POST" }).validator((input) => {
	if (!input?.id) throw new Error("Missing character id.");
	if (!input.name?.trim()) throw new Error("A character needs a name.");
	return input;
}).handler(saveCharacterFn_createServerFn_handler, async ({ data }) => {
	const { saveCharacter } = await import("./store.server-Y_pGEi-o.mjs");
	return saveCharacter(data);
});
var deleteCharacterFn_createServerFn_handler = createServerRpc({
	id: "1256c694ad124c99dd6ed06c390a6af6d29dcb236e6d7f9c1c5decd766aaee1d",
	name: "deleteCharacterFn",
	filename: "src/lib/arena/functions.ts"
}, (opts) => deleteCharacterFn.__executeServer(opts));
var deleteCharacterFn = createServerFn({ method: "POST" }).validator((input) => input).handler(deleteCharacterFn_createServerFn_handler, async ({ data }) => {
	const { deleteCharacter } = await import("./store.server-Y_pGEi-o.mjs");
	await deleteCharacter(data.id);
	return { ok: true };
});
var restoreTemplatesFn_createServerFn_handler = createServerRpc({
	id: "c46e8e5d37e02eb1bd667e8b19d5219e140a524f1cf808f725de3b917af699f1",
	name: "restoreTemplatesFn",
	filename: "src/lib/arena/functions.ts"
}, (opts) => restoreTemplatesFn.__executeServer(opts));
var restoreTemplatesFn = createServerFn({ method: "POST" }).handler(restoreTemplatesFn_createServerFn_handler, async () => {
	const { restoreTemplates } = await import("./store.server-Y_pGEi-o.mjs");
	return restoreTemplates();
});
var authorCharacterFn_createServerFn_handler = createServerRpc({
	id: "ef71dc21f873779c7b674c2fbf9686cdab2225ae3f72b1a817b6765338f80e32",
	name: "authorCharacterFn",
	filename: "src/lib/arena/functions.ts"
}, (opts) => authorCharacterFn.__executeServer(opts));
var authorCharacterFn = createServerFn({ method: "POST" }).validator((input) => input).handler(authorCharacterFn_createServerFn_handler, async ({ data }) => {
	const { authorPersona } = await import("./director.server-DrapUW7-.mjs");
	return authorPersona(data);
});
var paintPortraitFn_createServerFn_handler = createServerRpc({
	id: "6145b365271771ef71dbbaa471d6d15d5cd0cb283fbac9325051d016362b6514",
	name: "paintPortraitFn",
	filename: "src/lib/arena/functions.ts"
}, (opts) => paintPortraitFn.__executeServer(opts));
var paintPortraitFn = createServerFn({ method: "POST" }).validator((input) => input).handler(paintPortraitFn_createServerFn_handler, async ({ data }) => {
	const { paintPortrait } = await import("./director.server-DrapUW7-.mjs");
	return paintPortrait(data.characterId);
});
var stageShowdownFn_createServerFn_handler = createServerRpc({
	id: "ec4aafec0b65f5f5c7bafb276c4a82b08ab4d1a6aec6084b159282d749047762",
	name: "stageShowdownFn",
	filename: "src/lib/arena/functions.ts"
}, (opts) => stageShowdownFn.__executeServer(opts));
var stageShowdownFn = createServerFn({ method: "POST" }).validator((input) => {
	if (!input?.topic?.trim()) throw new Error("Add a topic before the director stages it.");
	return input;
}).handler(stageShowdownFn_createServerFn_handler, async ({ data }) => {
	const { stageShowdown } = await import("./director.server-DrapUW7-.mjs");
	return stageShowdown(data);
});
var paintBackdropFn_createServerFn_handler = createServerRpc({
	id: "06e32cc5931c334359983365d75ce69c915acf335af794b44cabfa467df79844",
	name: "paintBackdropFn",
	filename: "src/lib/arena/functions.ts"
}, (opts) => paintBackdropFn.__executeServer(opts));
var paintBackdropFn = createServerFn({ method: "POST" }).validator((input) => input).handler(paintBackdropFn_createServerFn_handler, async ({ data }) => {
	const { paintBackdrop } = await import("./director.server-DrapUW7-.mjs");
	return { url: await paintBackdrop(data.design, data.topic) };
});
var dressSessionFn_createServerFn_handler = createServerRpc({
	id: "fa970d32f55f1f978e29c94fb974a5d74806caa7572eb6a96b2f0727bd3445e5",
	name: "dressSessionFn",
	filename: "src/lib/arena/functions.ts"
}, (opts) => dressSessionFn.__executeServer(opts));
var dressSessionFn = createServerFn({ method: "POST" }).validator((input) => input).handler(dressSessionFn_createServerFn_handler, async ({ data }) => {
	const { dressSession } = await import("./director.server-DrapUW7-.mjs");
	return dressSession(data.id);
});
var getMemories_createServerFn_handler = createServerRpc({
	id: "be39af3c115161fc736bb555b0c2961010141b185e5cec99d862963f3e62ad89",
	name: "getMemories",
	filename: "src/lib/arena/functions.ts"
}, (opts) => getMemories.__executeServer(opts));
var getMemories = createServerFn({ method: "POST" }).validator((input) => input).handler(getMemories_createServerFn_handler, async ({ data }) => {
	const { listMemories } = await import("./store.server-Y_pGEi-o.mjs");
	return listMemories(data.characterId);
});
var addMemoryFn_createServerFn_handler = createServerRpc({
	id: "f2d14524db578c682933eed3c0f999bfd164bff9efe45916ec2edf203c33f185",
	name: "addMemoryFn",
	filename: "src/lib/arena/functions.ts"
}, (opts) => addMemoryFn.__executeServer(opts));
var addMemoryFn = createServerFn({ method: "POST" }).validator((input) => input).handler(addMemoryFn_createServerFn_handler, async ({ data }) => {
	const { addMemory } = await import("./store.server-Y_pGEi-o.mjs");
	return addMemory(data);
});
var deleteMemoryFn_createServerFn_handler = createServerRpc({
	id: "5a8c52669bc66c7d3eaf9b7aa13e8012e7f4c38dae6863e0c82bd22490de8aba",
	name: "deleteMemoryFn",
	filename: "src/lib/arena/functions.ts"
}, (opts) => deleteMemoryFn.__executeServer(opts));
var deleteMemoryFn = createServerFn({ method: "POST" }).validator((input) => input).handler(deleteMemoryFn_createServerFn_handler, async ({ data }) => {
	const { deleteMemory } = await import("./store.server-Y_pGEi-o.mjs");
	await deleteMemory(data.id);
	return { ok: true };
});
var clearMemoriesFn_createServerFn_handler = createServerRpc({
	id: "f677f84b7fd0abe18e63aa15e2471d8cdd325bd0ef34d5f5832ab44d4492dbf9",
	name: "clearMemoriesFn",
	filename: "src/lib/arena/functions.ts"
}, (opts) => clearMemoriesFn.__executeServer(opts));
var clearMemoriesFn = createServerFn({ method: "POST" }).validator((input) => input).handler(clearMemoriesFn_createServerFn_handler, async ({ data }) => {
	const { clearMemories } = await import("./store.server-Y_pGEi-o.mjs");
	await clearMemories(data.characterId);
	return { ok: true };
});
var getSetupData_createServerFn_handler = createServerRpc({
	id: "54f8587ff900f888f8cd00e39a32d978dc2232955a18bd5f2b600feda8d43f1f",
	name: "getSetupData",
	filename: "src/lib/arena/functions.ts"
}, (opts) => getSetupData.__executeServer(opts));
var getSetupData = createServerFn({ method: "GET" }).handler(getSetupData_createServerFn_handler, async () => {
	const { listCharacters, listProviders, listSetups } = await import("./store.server-Y_pGEi-o.mjs");
	const [characters, providers, setups] = await Promise.all([
		listCharacters(),
		listProviders(),
		listSetups()
	]);
	return {
		characters,
		providers,
		setups
	};
});
var createSessionFn_createServerFn_handler = createServerRpc({
	id: "51520fddf7feb6227d0132ced2f4301bd2a649e9f6e65af325aed340a3fbbfb2",
	name: "createSessionFn",
	filename: "src/lib/arena/functions.ts"
}, (opts) => createSessionFn.__executeServer(opts));
var createSessionFn = createServerFn({ method: "POST" }).validator((input) => {
	if (!input?.topic?.trim()) throw new Error("A topic is required.");
	return input;
}).handler(createSessionFn_createServerFn_handler, async ({ data }) => {
	const { createSession } = await import("./store.server-Y_pGEi-o.mjs");
	return createSession(data);
});
var getSessionBundle_createServerFn_handler = createServerRpc({
	id: "75f5ddedbd0280883587e4c38f1e3adcca445158b261625cee0d1e12612b76a3",
	name: "getSessionBundle",
	filename: "src/lib/arena/functions.ts"
}, (opts) => getSessionBundle.__executeServer(opts));
var getSessionBundle = createServerFn({ method: "POST" }).validator((input) => input).handler(getSessionBundle_createServerFn_handler, async ({ data }) => {
	const { getMessages, getSession } = await import("./store.server-Y_pGEi-o.mjs");
	const session = await getSession(data.id);
	if (!session) throw new Error("That session is not on the floor.");
	return {
		session,
		messages: await getMessages(data.id)
	};
});
var listSessionsFn_createServerFn_handler = createServerRpc({
	id: "def1f02d5384aefaede4bd9fb162286dc4b954747eb73776ef74b4b65415b5b5",
	name: "listSessionsFn",
	filename: "src/lib/arena/functions.ts"
}, (opts) => listSessionsFn.__executeServer(opts));
var listSessionsFn = createServerFn({ method: "GET" }).handler(listSessionsFn_createServerFn_handler, async () => {
	const { listSessions } = await import("./store.server-Y_pGEi-o.mjs");
	return listSessions();
});
var setStatusFn_createServerFn_handler = createServerRpc({
	id: "3f14944cd659bcbf9691a2c7fb8456f0ff9e4a04d0e8719ecd1b31c591373388",
	name: "setStatusFn",
	filename: "src/lib/arena/functions.ts"
}, (opts) => setStatusFn.__executeServer(opts));
var setStatusFn = createServerFn({ method: "POST" }).validator((input) => input).handler(setStatusFn_createServerFn_handler, async ({ data }) => {
	const { setStatus } = await import("./store.server-Y_pGEi-o.mjs");
	return setStatus(data.id, data.status);
});
var deleteSessionFn_createServerFn_handler = createServerRpc({
	id: "699bf6dfe997a7fc4f8e9e65136e3cc7943a31a753e2fb7c7ee3b11f7a080cd6",
	name: "deleteSessionFn",
	filename: "src/lib/arena/functions.ts"
}, (opts) => deleteSessionFn.__executeServer(opts));
var deleteSessionFn = createServerFn({ method: "POST" }).validator((input) => input).handler(deleteSessionFn_createServerFn_handler, async ({ data }) => {
	const { deleteSession } = await import("./store.server-Y_pGEi-o.mjs");
	await deleteSession(data.id);
	return { ok: true };
});
var interveneFn_createServerFn_handler = createServerRpc({
	id: "58bceacf6a1a866d08698e5026102b6bfd3d4519cb8feb2e316120e23099767f",
	name: "interveneFn",
	filename: "src/lib/arena/functions.ts"
}, (opts) => interveneFn.__executeServer(opts));
var interveneFn = createServerFn({ method: "POST" }).validator((input) => {
	if (!input.note?.trim()) throw new Error("Write a note for the floor.");
	return input;
}).handler(interveneFn_createServerFn_handler, async ({ data }) => {
	const { addMessage } = await import("./store.server-Y_pGEi-o.mjs");
	return addMessage(data.sessionId, "director", data.note.trim().slice(0, 2e3));
});
var advanceTurnFn_createServerFn_handler = createServerRpc({
	id: "444bdcef38ed8daba95f5ceabc4a5b5d80a47857a33e9edcf1fc45027fd61406",
	name: "advanceTurnFn",
	filename: "src/lib/arena/functions.ts"
}, (opts) => advanceTurnFn.__executeServer(opts));
var advanceTurnFn = createServerFn({ method: "POST" }).validator((input) => input).handler(advanceTurnFn_createServerFn_handler, async ({ data }) => {
	const { executeTurn } = await import("./turn.server-Dc4UUozS.mjs");
	return executeTurn(data, () => void 0);
});
var analyzeFn_createServerFn_handler = createServerRpc({
	id: "7f1a870f6792fd8370136ecb8ec45b70f80c175b8ef26728b6094d957e07ec1d",
	name: "analyzeFn",
	filename: "src/lib/arena/functions.ts"
}, (opts) => analyzeFn.__executeServer(opts));
var analyzeFn = createServerFn({ method: "POST" }).validator((input) => input).handler(analyzeFn_createServerFn_handler, async ({ data }) => {
	const { analyzeSession } = await import("./director.server-DrapUW7-.mjs");
	return analyzeSession(data.sessionId);
});
var distillFn_createServerFn_handler = createServerRpc({
	id: "c6f0460f5773d60808ae9e4854bdd5fadc5ca621ff8d46670bb6989dbd2b78ea",
	name: "distillFn",
	filename: "src/lib/arena/functions.ts"
}, (opts) => distillFn.__executeServer(opts));
var distillFn = createServerFn({ method: "POST" }).validator((input) => input).handler(distillFn_createServerFn_handler, async ({ data }) => {
	const { distillSession } = await import("./director.server-DrapUW7-.mjs");
	return distillSession(data.sessionId);
});
var houseStatusFn_createServerFn_handler = createServerRpc({
	id: "eb5a5db2bbe91744adc9753a339ef445a3ca15425d7d5e9c67be9a12874bec52",
	name: "houseStatusFn",
	filename: "src/lib/arena/functions.ts"
}, (opts) => houseStatusFn.__executeServer(opts));
var houseStatusFn = createServerFn({ method: "GET" }).handler(houseStatusFn_createServerFn_handler, async () => {
	return { available: Boolean(process.env.XAI_API_KEY) };
});
var getBoardFn_createServerFn_handler = createServerRpc({
	id: "932202348a226d11142006924dd20ce31af0122c75f5e1ab50dbb346ab3f5564",
	name: "getBoardFn",
	filename: "src/lib/arena/functions.ts"
}, (opts) => getBoardFn.__executeServer(opts));
var getBoardFn = createServerFn({ method: "GET" }).handler(getBoardFn_createServerFn_handler, async () => {
	const { listBoard } = await import("./store.server-Y_pGEi-o.mjs");
	return listBoard();
});
var rematchFn_createServerFn_handler = createServerRpc({
	id: "a025009ae96df27814d5aab480f008d54783fa95acccf135ac7381b802280446",
	name: "rematchFn",
	filename: "src/lib/arena/functions.ts"
}, (opts) => rematchFn.__executeServer(opts));
var rematchFn = createServerFn({ method: "POST" }).validator((input) => input).handler(rematchFn_createServerFn_handler, async ({ data }) => {
	const { rematchSession } = await import("./store.server-Y_pGEi-o.mjs");
	return rematchSession(data.id);
});
var saveSetupFn_createServerFn_handler = createServerRpc({
	id: "f84db70469466b81c2af2286a79bcc3991126478f74da562da3e50a6f41b566c",
	name: "saveSetupFn",
	filename: "src/lib/arena/functions.ts"
}, (opts) => saveSetupFn.__executeServer(opts));
var saveSetupFn = createServerFn({ method: "POST" }).validator((input) => {
	if (!input?.name?.trim()) throw new Error("Name the card before saving it.");
	return input;
}).handler(saveSetupFn_createServerFn_handler, async ({ data }) => {
	const { saveSetup } = await import("./store.server-Y_pGEi-o.mjs");
	return saveSetup(data);
});
var deleteSetupFn_createServerFn_handler = createServerRpc({
	id: "624a5c796cac59276058c208cee5fdccd40e1e1daef48cdf00ed74ace2c10c44",
	name: "deleteSetupFn",
	filename: "src/lib/arena/functions.ts"
}, (opts) => deleteSetupFn.__executeServer(opts));
var deleteSetupFn = createServerFn({ method: "POST" }).validator((input) => input).handler(deleteSetupFn_createServerFn_handler, async ({ data }) => {
	const { deleteSetup } = await import("./store.server-Y_pGEi-o.mjs");
	await deleteSetup(data.id);
	return { ok: true };
});
var getCompareFn_createServerFn_handler = createServerRpc({
	id: "bbca8622df69fd4ec027683bac76a659d505eef28cc06bed07101826a640249e",
	name: "getCompareFn",
	filename: "src/lib/arena/functions.ts"
}, (opts) => getCompareFn.__executeServer(opts));
var getCompareFn = createServerFn({ method: "POST" }).validator((input) => input ?? {}).handler(getCompareFn_createServerFn_handler, async ({ data }) => {
	const { getMessages, getSession, listSessions } = await import("./store.server-Y_pGEi-o.mjs");
	const sessions = await listSessions();
	async function pack(id) {
		if (!id) return null;
		const session = await getSession(id);
		if (!session) return null;
		return {
			session,
			messages: await getMessages(id)
		};
	}
	const [left, right] = await Promise.all([pack(data.a), pack(data.b)]);
	return {
		sessions,
		left,
		right
	};
});
//#endregion
export { addMemoryFn_createServerFn_handler, advanceTurnFn_createServerFn_handler, analyzeFn_createServerFn_handler, authorCharacterFn_createServerFn_handler, clearMemoriesFn_createServerFn_handler, createSessionFn_createServerFn_handler, deleteCharacterFn_createServerFn_handler, deleteMemoryFn_createServerFn_handler, deleteProviderFn_createServerFn_handler, deleteSessionFn_createServerFn_handler, deleteSetupFn_createServerFn_handler, distillFn_createServerFn_handler, dressSessionFn_createServerFn_handler, getBoardFn_createServerFn_handler, getCharacters_createServerFn_handler, getCompareFn_createServerFn_handler, getDashboard_createServerFn_handler, getMemories_createServerFn_handler, getProviders_createServerFn_handler, getSessionBundle_createServerFn_handler, getSetupData_createServerFn_handler, houseStatusFn_createServerFn_handler, interveneFn_createServerFn_handler, listSessionsFn_createServerFn_handler, paintBackdropFn_createServerFn_handler, paintPortraitFn_createServerFn_handler, rematchFn_createServerFn_handler, restoreTemplatesFn_createServerFn_handler, saveCharacterFn_createServerFn_handler, saveProviderFn_createServerFn_handler, saveSetupFn_createServerFn_handler, setStatusFn_createServerFn_handler, stageShowdownFn_createServerFn_handler, testProviderFn_createServerFn_handler };
