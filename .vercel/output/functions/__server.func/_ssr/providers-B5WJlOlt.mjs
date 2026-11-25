import { o as __toESM } from "../_runtime.mjs";
import { i as nid } from "./utils-pryIKIhC.mjs";
import { r as KIND_META } from "./cast-CAA-oOdj.mjs";
import { C as useRouter, Z as require_react, w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { B as testProviderFn, I as saveProviderFn, a as Route$5, x as deleteProviderFn } from "./router-B60dYSLG.mjs";
import { n as useVault, t as useHydrated } from "./vault-68PPfR4E.mjs";
import { a as SelectInput, i as Pill, n as Field, o as TextArea, r as Panel, s as TextInput, t as Button } from "./ui-C1kFAxUP.mjs";
import { n as PROVIDER_KINDS } from "./types-BEgKCHv-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/providers-B5WJlOlt.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function fresh(kind = "openai") {
	const meta = KIND_META[kind];
	return {
		id: nid(),
		name: "",
		kind,
		baseUrl: meta.baseUrl,
		model: meta.model,
		temperature: .8,
		maxTokens: 600,
		contextTurns: 14,
		extra: "{}",
		locked: false,
		createdAt: ""
	};
}
function Models() {
	const initial = Route$5.useLoaderData();
	const router = useRouter();
	const hydrated = useHydrated();
	const setKey = useVault((s) => s.setKey);
	const stored = useVault((s) => s.keys);
	const [list, setList] = (0, import_react.useState)(initial);
	const [draft, setDraft] = (0, import_react.useState)(initial[0] ?? fresh("house"));
	const [keyDraft, setKeyDraft] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	function select(provider) {
		setDraft(provider);
		setKeyDraft("");
	}
	function patch(partial) {
		setDraft((d) => ({
			...d,
			...partial
		}));
	}
	async function save() {
		setBusy(true);
		try {
			const saved = await saveProviderFn({ data: draft });
			if (keyDraft.trim()) setKey(saved.id, keyDraft.trim());
			setKeyDraft("");
			toast.success("Model saved");
			await router.invalidate();
			setList((prev) => {
				return prev.some((p) => p.id === saved.id) ? prev.map((p) => p.id === saved.id ? saved : p) : [...prev, saved];
			});
			setDraft(saved);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not save");
		} finally {
			setBusy(false);
		}
	}
	async function test() {
		setBusy(true);
		try {
			const apiKey = keyDraft.trim() || stored[draft.id] || "";
			const result = await testProviderFn({ data: {
				kind: draft.kind,
				baseUrl: draft.baseUrl,
				model: draft.model,
				apiKey,
				temperature: 0,
				maxTokens: 32
			} });
			toast.success(`Connected · ${result.text}`);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Test failed");
		} finally {
			setBusy(false);
		}
	}
	async function remove() {
		if (draft.locked) return;
		setBusy(true);
		try {
			await deleteProviderFn({ data: { id: draft.id } });
			const next = list.filter((p) => p.id !== draft.id);
			setList(next);
			setDraft(next[0] ?? fresh());
			toast.success("Removed");
			await router.invalidate();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not remove");
		} finally {
			setBusy(false);
		}
	}
	const hasKey = hydrated && Boolean(stored[draft.id]);
	const meta = KIND_META[draft.kind];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-end justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs tracking-widest text-lime",
					children: "CONNECTIONS"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-4xl font-extrabold",
					children: "Models"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-xl text-sm text-muted",
					children: "Each side of the floor can use a different provider. API keys stay in this browser and are sent only for the live call. They are not stored with the session."
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				tone: "lime",
				onClick: () => {
					const next = fresh("openai");
					setList((prev) => [...prev, next]);
					select(next);
				},
				children: "Add connection"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-6 lg:grid-cols-[260px_1fr]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-2",
				children: list.map((provider) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => select(provider),
					className: `w-full rounded-xl border px-3 py-3 text-left ${provider.id === draft.id ? "border-lime bg-panel" : "border-line bg-panel hover:border-fg/30"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium",
							children: provider.name || "Untitled"
						}), provider.locked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
							tone: "lime",
							children: "House"
						}) : null]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-1 block text-xs text-muted",
						children: provider.model
					})]
				}) }, provider.id))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "space-y-4 p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Name",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
							value: draft.name,
							disabled: draft.locked,
							onChange: (e) => patch({ name: e.target.value }),
							placeholder: "DeepSeek via OpenRouter"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Integration",
						hint: meta.hint,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectInput, {
							value: draft.kind,
							disabled: draft.locked,
							onChange: (e) => {
								const kind = e.target.value;
								const next = KIND_META[kind];
								patch({
									kind,
									baseUrl: next.baseUrl,
									model: draft.model || next.model
								});
							},
							children: PROVIDER_KINDS.map((kind) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: kind,
								children: KIND_META[kind].label
							}, kind))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Endpoint",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
							value: draft.baseUrl,
							disabled: draft.locked,
							onChange: (e) => patch({ baseUrl: e.target.value })
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Model",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
							value: draft.model,
							onChange: (e) => patch({ model: e.target.value })
						})
					}),
					draft.kind !== "house" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "API key",
						hint: hasKey ? "A key is already stored in this browser. Leave blank to keep it." : "Stored only in this browser.",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
							type: "password",
							autoComplete: "off",
							value: keyDraft,
							placeholder: hasKey ? "••••••••" : "sk-…",
							onChange: (e) => setKeyDraft(e.target.value)
						})
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "House Grok uses the arena director. No key to paste."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 sm:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: `Temperature ${draft.temperature.toFixed(2)}`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "range",
									min: 0,
									max: 2,
									step: .05,
									value: draft.temperature,
									onChange: (e) => patch({ temperature: Number(e.target.value) }),
									className: "w-full"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Max tokens",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
									type: "number",
									min: 32,
									max: draft.locked ? 800 : 4e3,
									value: draft.maxTokens,
									onChange: (e) => patch({ maxTokens: Number(e.target.value) })
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Context turns",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
									type: "number",
									min: 4,
									max: 40,
									value: draft.contextTurns,
									onChange: (e) => patch({ contextTurns: Number(e.target.value) })
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Extra parameters",
						hint: "Optional JSON merged into the request. Model and messages stay protected.",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextArea, {
							value: draft.extra,
							onChange: (e) => patch({ extra: e.target.value }),
							className: "min-h-20 font-mono text-xs"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								tone: "lime",
								disabled: busy,
								onClick: () => void save(),
								children: "Save"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								disabled: busy,
								onClick: () => void test(),
								children: "Test connection"
							}),
							!draft.locked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								tone: "danger",
								disabled: busy,
								onClick: () => void remove(),
								children: "Remove"
							}) : null
						]
					})
				]
			})]
		})]
	});
}
//#endregion
export { Models as component };
