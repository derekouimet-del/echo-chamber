import { o as __toESM } from "../_runtime.mjs";
import { a as OPENAI_VOICES, c as blankCharacter, d as randomCharacter, f as shuffleField, l as complementCharacter, n as HOUSE_VOICES, u as opposeCharacter } from "./cast-CAA-oOdj.mjs";
import { C as useRouter, Z as require_react, w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Star, c as Shuffle, s as Sparkles } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { F as saveCharacterFn, M as paintPortraitFn, P as restoreTemplatesFn, g as authorCharacterFn, l as Route$9, y as deleteCharacterFn } from "./router-B60dYSLG.mjs";
import { a as SelectInput, i as Pill, n as Field, o as TextArea, r as Panel, s as TextInput, t as Button } from "./ui-C1kFAxUP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/characters-wfYtiUc0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FIELDS = [
	{
		key: "role",
		label: "Role"
	},
	{
		key: "personality",
		label: "Personality",
		long: true
	},
	{
		key: "perspective",
		label: "Perspective"
	},
	{
		key: "style",
		label: "Communication style"
	},
	{
		key: "background",
		label: "Background",
		long: true
	},
	{
		key: "emotion",
		label: "Emotional tendency"
	},
	{
		key: "domains",
		label: "Knowledge domains"
	},
	{
		key: "motivation",
		label: "Motivation",
		long: true
	},
	{
		key: "objective",
		label: "Objective",
		long: true
	},
	{
		key: "constraints",
		label: "Constraints",
		long: true
	}
];
function Studio() {
	const initial = Route$9.useLoaderData();
	const router = useRouter();
	const [cast, setCast] = (0, import_react.useState)(initial);
	const [draft, setDraft] = (0, import_react.useState)(initial[0] ?? blankCharacter());
	const [favorite, setFavorite] = (0, import_react.useState)(Boolean(initial[0]?.favorite));
	const [busy, setBusy] = (0, import_react.useState)(null);
	const portrait = (0, import_react.useMemo)(() => cast.find((c) => c.id === draft.id)?.portraitUrl ?? null, [cast, draft.id]);
	function load(character) {
		setDraft(character);
		setFavorite(character.favorite);
	}
	function patch(partial) {
		setDraft((d) => ({
			...d,
			...partial
		}));
	}
	async function save() {
		setBusy("save");
		try {
			const saved = await saveCharacterFn({ data: {
				...draft,
				favorite
			} });
			setCast((prev) => prev.some((c) => c.id === saved.id) ? prev.map((c) => c.id === saved.id ? saved : c) : [...prev, saved]);
			setDraft(saved);
			toast.success("Character saved");
			await router.invalidate();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not save");
		} finally {
			setBusy(null);
		}
	}
	async function author(mode) {
		setBusy(mode);
		try {
			const persona = await authorCharacterFn({ data: {
				mode,
				seed: mode === "fresh" ? void 0 : draft
			} });
			setDraft((d) => ({
				...d,
				id: mode === "fresh" ? crypto.randomUUID() : d.id,
				...persona,
				voiceProvider: d.voiceProvider === "none" ? "house" : d.voiceProvider,
				voiceId: d.voiceId || "ara"
			}));
			if (mode !== "fresh") {
				const next = {
					...blankCharacter(),
					...persona,
					voiceProvider: "house",
					voiceId: "leo"
				};
				setDraft(next);
			}
			toast.success("Director wrote a character. Save it to keep them.");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "The director is unavailable");
		} finally {
			setBusy(null);
		}
	}
	async function paint() {
		if (!cast.some((c) => c.id === draft.id)) {
			toast.error("Save the character before painting a portrait.");
			return;
		}
		setBusy("paint");
		try {
			const saved = await paintPortraitFn({ data: { characterId: draft.id } });
			setCast((prev) => prev.map((c) => c.id === saved.id ? saved : c));
			toast.success("Portrait ready");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Portrait failed");
		} finally {
			setBusy(null);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-end justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs tracking-widest text-lime",
					children: "CHARACTER STUDIO"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-4xl font-extrabold",
					children: "Cast"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-xl text-sm text-muted",
					children: "Personalities are not the model. The same endpoint can play both sides if the characters disagree."
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: () => {
							setDraft(randomCharacter());
							setFavorite(false);
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shuffle, { className: "size-4" }), " Random"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						disabled: busy !== null,
						onClick: () => void author("fresh"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4" }), " Director"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						tone: "lime",
						onClick: () => {
							const next = blankCharacter();
							setDraft(next);
							setFavorite(false);
						},
						children: "New"
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-6 lg:grid-cols-[280px_1fr]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [cast.map((character) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => load(character),
					className: `flex w-full items-center gap-3 rounded-xl border p-2 text-left ${character.id === draft.id ? "border-lime bg-panel" : "border-line bg-panel"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portrait, {
						name: character.name,
						url: character.portraitUrl
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block truncate font-medium",
							children: character.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block truncate text-xs text-muted",
							children: character.perspective
						})]
					})]
				}, character.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "w-full",
					onClick: () => {
						restoreTemplatesFn().then(async (rows) => {
							setCast(rows);
							await router.invalidate();
							toast.success("Templates restored");
						});
					},
					children: "Restore templates"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				className: "p-5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-5 lg:grid-cols-[180px_1fr]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-hidden rounded-lg border border-line",
						children: portrait ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: portrait,
							alt: "",
							className: "aspect-[4/5] w-full object-cover outline outline-1 -outline-offset-1 outline-fg/10"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex aspect-[4/5] items-center justify-center bg-panel-2 font-display text-4xl font-extrabold text-tide",
							children: monogram(draft.name)
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-3 w-full",
						disabled: busy !== null,
						onClick: () => void paint(),
						children: busy === "paint" ? "Painting…" : "Paint portrait"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Name",
								action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShuffleButton, { onClick: () => patch({ name: shuffleField("name", draft.name) }) }),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
									value: draft.name,
									onChange: (e) => patch({ name: e.target.value })
								})
							}),
							FIELDS.map((field) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: field.label,
								action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShuffleButton, { onClick: () => patch({ [field.key]: shuffleField(field.key, String(draft[field.key] ?? "")) }) }),
								children: field.long ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextArea, {
									value: String(draft[field.key] ?? ""),
									onChange: (e) => patch({ [field.key]: e.target.value })
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
									value: String(draft[field.key] ?? ""),
									onChange: (e) => patch({ [field.key]: e.target.value })
								})
							}, field.key)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-4 sm:grid-cols-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Voice",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectInput, {
										value: draft.voiceProvider,
										onChange: (e) => patch({ voiceProvider: e.target.value }),
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "none",
												children: "Text only"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "house",
												children: "House voice"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "elevenlabs",
												children: "ElevenLabs"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "openai",
												children: "OpenAI speech"
											})
										]
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Voice id",
									hint: voiceHint(draft.voiceProvider),
									children: draft.voiceProvider === "house" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectInput, {
										value: draft.voiceId,
										onChange: (e) => patch({ voiceId: e.target.value }),
										children: HOUSE_VOICES.map((voice) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: voice.id,
											children: voice.label
										}, voice.id))
									}) : draft.voiceProvider === "openai" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectInput, {
										value: draft.voiceId || "alloy",
										onChange: (e) => patch({ voiceId: e.target.value }),
										children: OPENAI_VOICES.map((voice) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: voice,
											children: voice
										}, voice))
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
										value: draft.voiceId,
										placeholder: "ElevenLabs voice id",
										onChange: (e) => patch({ voiceId: e.target.value })
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										tone: "lime",
										disabled: busy !== null,
										onClick: () => void save(),
										children: "Save character"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										disabled: busy !== null,
										onClick: () => {
											setDraft({
												...draft,
												id: crypto.randomUUID(),
												name: `${draft.name} copy`.slice(0, 80)
											});
											setFavorite(false);
											toast.success("Copy staged. Save it to put both on the floor.");
										},
										children: "Duplicate"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										disabled: busy !== null,
										onClick: () => {
											setFavorite((v) => !v);
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: `size-4 ${favorite ? "fill-lime text-lime" : ""}` }), favorite ? "Favorite" : "Mark favorite"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										disabled: busy !== null,
										onClick: () => setDraft(opposeCharacter(draft)),
										children: "Oppose"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										disabled: busy !== null,
										onClick: () => setDraft(complementCharacter(draft)),
										children: "Complement"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										disabled: busy !== null,
										onClick: () => void author("oppose"),
										children: "Director oppose"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										tone: "danger",
										disabled: busy !== null || !cast.some((c) => c.id === draft.id),
										onClick: () => {
											deleteCharacterFn({ data: { id: draft.id } }).then(async () => {
												const next = cast.filter((c) => c.id !== draft.id);
												setCast(next);
												setDraft(next[0] ?? blankCharacter());
												await router.invalidate();
												toast.success("Removed from the cast");
											});
										},
										children: "Delete"
									})
								]
							}),
							draft.template ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, { children: "Template" }) : null
						]
					})]
				})
			})]
		})]
	});
}
function ShuffleButton({ onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: "text-muted hover:text-lime",
		"aria-label": "Shuffle this field",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shuffle, { className: "size-3.5" })
	});
}
function Portrait({ name, url }) {
	if (url) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: url,
		alt: "",
		className: "size-12 rounded-lg object-cover outline outline-1 -outline-offset-1 outline-fg/10"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "flex size-12 items-center justify-center rounded-lg bg-panel-2 font-display text-sm font-bold text-tide",
		children: monogram(name)
	});
}
function monogram(name) {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (!parts.length) return "—";
	return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");
}
function voiceHint(provider) {
	if (provider === "none") return "This character stays on the page. Speech is skipped.";
	if (provider === "house") return "Spoken by the arena director when you press play.";
	if (provider === "elevenlabs") return "Uses the ElevenLabs key in Settings.";
	return "Uses the OpenAI speech key in Settings.";
}
//#endregion
export { Studio as component };
