import { o as __toESM } from "../_runtime.mjs";
import { i as MODE_META, s as TOPIC_PRESETS } from "./cast-CAA-oOdj.mjs";
import { S as useNavigate, Z as require_react, w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { C as deleteSetupFn, L as saveSetupFn, j as paintBackdropFn, r as Route$3, v as createSessionFn, z as stageShowdownFn } from "./router-B60dYSLG.mjs";
import { n as primeAudio } from "./client-stream-t0kJOY9g.mjs";
import { n as useVault, t as useHydrated } from "./vault-68PPfR4E.mjs";
import { a as SelectInput, i as Pill, n as Field, o as TextArea, r as Panel, s as TextInput, t as Button } from "./ui-C1kFAxUP.mjs";
import { t as MODES } from "./types-BEgKCHv-.mjs";
import { n as toSnapshot, t as dealRandomFloor } from "./deal-Blj24pvg.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/setup-BEMhZSK9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Stage() {
	const { characters, providers, setups: saved } = Route$3.useLoaderData();
	const navigate = useNavigate();
	const hydrated = useHydrated();
	const defaultExchanges = useVault((s) => s.defaultExchanges);
	const defaultBudget = useVault((s) => s.defaultBudget);
	const defaultSpeed = useVault((s) => s.defaultSpeed);
	const defaultMinutes = useVault((s) => s.defaultMinutes);
	const keys = useVault((s) => s.keys);
	const house = providers.find((p) => p.id === "prov_house") ?? providers[0];
	const a0 = characters.find((c) => c.id === "char_vesper") ?? characters[0];
	const b0 = characters.find((c) => c.id === "char_imani") ?? characters[1] ?? characters[0];
	const [mode, setMode] = (0, import_react.useState)("debate");
	const [topic, setTopic] = (0, import_react.useState)(TOPIC_PRESETS[0] ?? "");
	const [charA, setCharA] = (0, import_react.useState)(a0?.id ?? "");
	const [charB, setCharB] = (0, import_react.useState)(b0?.id ?? "");
	const [provA, setProvA] = (0, import_react.useState)(house?.id ?? "");
	const [provB, setProvB] = (0, import_react.useState)(house?.id ?? "");
	const [extraA, setExtraA] = (0, import_react.useState)("");
	const [extraB, setExtraB] = (0, import_react.useState)("");
	const [maxExchanges, setMaxExchanges] = (0, import_react.useState)(defaultExchanges);
	const [tokenBudget, setTokenBudget] = (0, import_react.useState)(defaultBudget);
	const [speedMs, setSpeedMs] = (0, import_react.useState)(defaultSpeed);
	const [maxMinutes, setMaxMinutes] = (0, import_react.useState)(defaultMinutes);
	const [allowConclusion, setAllowConclusion] = (0, import_react.useState)(true);
	const [isPublic, setIsPublic] = (0, import_react.useState)(true);
	const [design, setDesign] = (0, import_react.useState)(null);
	const [setups, setSetups] = (0, import_react.useState)(saved);
	const [cardId, setCardId] = (0, import_react.useState)("");
	const [cardName, setCardName] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(null);
	const characterA = characters.find((c) => c.id === charA);
	const characterB = characters.find((c) => c.id === charB);
	const providerA = providers.find((p) => p.id === provA);
	const providerB = providers.find((p) => p.id === provB);
	const keyNote = (0, import_react.useMemo)(() => {
		if (!hydrated) return null;
		const missing = [providerA, providerB].filter((p) => p && p.kind !== "house" && !keys[p.id]);
		if (!missing.length) return null;
		return `Missing a browser key for ${missing.map((p) => p.name).join(" and ")}.`;
	}, [
		hydrated,
		keys,
		providerA,
		providerB
	]);
	async function stageIt() {
		if (!characterA || !characterB) return;
		setBusy("stage");
		try {
			const next = await stageShowdownFn({ data: {
				topic,
				mode,
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
			setDesign(next);
			toast.success("The director staged the floor");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Staging failed");
		} finally {
			setBusy(null);
		}
	}
	async function backdrop() {
		if (!design) {
			toast.error("Stage the floor before rendering it.");
			return;
		}
		setBusy("backdrop");
		try {
			const { url } = await paintBackdropFn({ data: {
				design,
				topic
			} });
			setDesign({
				...design,
				backdropUrl: url
			});
			toast.success("Floor rendered");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Render failed");
		} finally {
			setBusy(null);
		}
	}
	async function launch() {
		if (!characterA || !characterB || !providerA || !providerB) {
			toast.error("Pick both characters and both models.");
			return;
		}
		if (characterA.id === characterB.id) {
			toast.error("Give each side a different character, or duplicate one in the studio first.");
			return;
		}
		setBusy("launch");
		try {
			const session = await createSessionFn({ data: {
				topic,
				mode,
				title: design?.title,
				agentA: toSnapshot(characterA, providerA, extraA),
				agentB: toSnapshot(characterB, providerB, extraB),
				maxExchanges,
				tokenBudget,
				speedMs,
				maxMinutes,
				allowConclusion,
				isPublic,
				design
			} });
			await navigate({
				to: "/arena/$sessionId",
				params: { sessionId: session.id },
				search: {
					autostart: true,
					play: false
				}
			});
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not open the floor");
			setBusy(null);
		}
	}
	function applyCard(id) {
		const card = setups.find((item) => item.id === id);
		if (!card) return;
		setCardId(card.id);
		setCardName(card.name);
		setMode(card.mode);
		setTopic(card.topic);
		setCharA(card.characterA);
		setCharB(card.characterB);
		setProvA(card.providerA);
		setProvB(card.providerB);
		setExtraA(card.extraA);
		setExtraB(card.extraB);
		setMaxExchanges(card.maxExchanges);
		setTokenBudget(card.tokenBudget);
		setSpeedMs(card.speedMs);
		setMaxMinutes(card.maxMinutes);
		setAllowConclusion(card.allowConclusion);
		setIsPublic(card.isPublic);
		setDesign(null);
	}
	async function keepCard() {
		const name = cardName.trim() || design?.title || topic.slice(0, 48);
		if (!name.trim()) {
			toast.error("Name the card, or write a topic first.");
			return;
		}
		setBusy("card");
		try {
			const savedCard = await saveSetupFn({ data: {
				id: cardId || crypto.randomUUID(),
				name,
				topic,
				mode,
				characterA: charA,
				characterB: charB,
				providerA: provA,
				providerB: provB,
				extraA,
				extraB,
				maxExchanges,
				tokenBudget,
				speedMs,
				maxMinutes,
				allowConclusion,
				isPublic
			} });
			setCardId(savedCard.id);
			setCardName(savedCard.name);
			setSetups((prev) => [savedCard, ...prev.filter((item) => item.id !== savedCard.id)]);
			toast.success("Stage card saved");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not save the card");
		} finally {
			setBusy(null);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs tracking-widest text-lime",
					children: "ARENA SETUP"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-4xl font-extrabold",
					children: "Stage"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-xl text-sm text-muted",
					children: "Choose the mode, the question, and who walks out. House Grok can play either side with no key."
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
				children: MODES.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setMode(item),
					className: `rounded-xl border p-4 text-left ${mode === item ? "border-lime bg-panel" : "border-line bg-panel"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display text-lg font-bold",
						children: MODE_META[item].label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-1 block text-sm text-muted",
						children: MODE_META[item].blurb
					})]
				}, item))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "space-y-4 p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Topic",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextArea, {
						value: topic,
						onChange: (e) => setTopic(e.target.value)
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-2",
					children: TOPIC_PRESETS.map((preset) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setTopic(preset),
						className: "rounded-full border border-line px-3 py-1.5 text-left text-xs text-muted hover:text-fg",
						children: preset
					}, preset))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentCard, {
					title: "Side A",
					tone: "tide",
					characters,
					providers,
					characterId: charA,
					providerId: provA,
					extra: extraA,
					onCharacter: setCharA,
					onProvider: setProvA,
					onExtra: setExtraA
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentCard, {
					title: "Side B",
					tone: "ember",
					characters,
					providers,
					characterId: charB,
					providerId: provB,
					extra: extraB,
					onCharacter: setCharB,
					onProvider: setProvB,
					onExtra: setExtraB
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Exchanges",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
							type: "number",
							min: 2,
							max: 24,
							value: maxExchanges,
							onChange: (e) => setMaxExchanges(Number(e.target.value))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Token budget",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
							type: "number",
							min: 500,
							step: 500,
							value: tokenBudget,
							onChange: (e) => setTokenBudget(Number(e.target.value))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Pause between turns (ms)",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
							type: "number",
							min: 0,
							step: 100,
							value: speedMs,
							onChange: (e) => setSpeedMs(Number(e.target.value))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Clock (minutes)",
						hint: "0 runs until the exchange or token cap. Pause freezes the clock.",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
							type: "number",
							min: 0,
							max: 180,
							value: maxMinutes,
							onChange: (e) => setMaxMinutes(Number(e.target.value))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col justify-end gap-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex min-h-11 items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: allowConclusion,
								onChange: (e) => setAllowConclusion(e.target.checked)
							}), "They may conclude"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex min-h-11 items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: isPublic,
								onChange: (e) => setIsPublic(e.target.checked)
							}), "Keep on the public board"]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "space-y-4 p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl font-bold",
						children: "Director"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Optional. The house model writes the title, stakes, and opening. Rendering the room is a separate image."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							disabled: busy !== null,
							onClick: () => void stageIt(),
							children: busy === "stage" ? "Staging…" : "Stage this"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							disabled: busy !== null || !design,
							onClick: () => void backdrop(),
							children: busy === "backdrop" ? "Rendering…" : "Render the room"
						})]
					})]
				}), design ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 lg:grid-cols-[1fr_220px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-2xl font-bold",
								children: design.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-lime",
								children: design.stakes
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-muted",
								children: design.coldOpen
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-tide",
								children: [characterA?.name, ": "]
							}), design.aEntrance] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-ember",
								children: [characterB?.name, ": "]
							}), design.bEntrance] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted",
								children: design.visualMotif
							})
						]
					}), design.backdropUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: design.backdropUrl,
						alt: "",
						className: "h-40 w-full rounded-lg object-cover outline outline-1 -outline-offset-1 outline-fg/10 lg:h-full"
					}) : null]
				}) : null]
			}),
			keyNote ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-ember",
				children: keyNote
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "space-y-4 p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl font-bold",
					children: "Stage cards"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Save this pairing and open it again without rebuilding the floor."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 sm:grid-cols-[1fr_1fr_auto]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Card name",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
								value: cardName,
								onChange: (e) => setCardName(e.target.value),
								placeholder: "Mars, nationalist vs academic"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Saved cards",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectInput, {
								value: cardId,
								onChange: (e) => applyCard(e.target.value),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "Load a card"
								}), setups.map((card) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: card.id,
									children: card.name
								}, card.id))]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-end gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								disabled: busy !== null,
								onClick: () => void keepCard(),
								children: busy === "card" ? "Saving…" : cardId ? "Update card" : "Save card"
							}), cardId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								tone: "danger",
								disabled: busy !== null,
								onClick: () => {
									deleteSetupFn({ data: { id: cardId } }).then(() => {
										setSetups((prev) => prev.filter((item) => item.id !== cardId));
										setCardId("");
										toast.success("Card removed");
									}).catch((err) => toast.error(err instanceof Error ? err.message : "Could not remove the card"));
								},
								children: "Remove"
							}) : null]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					tone: "lime",
					disabled: busy !== null,
					onClick: () => void launch(),
					className: "px-6",
					children: busy === "launch" ? "Opening…" : "Open the floor"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					disabled: busy !== null,
					onClick: () => {
						primeAudio();
						setBusy("deal");
						dealRandomFloor({
							exchanges: maxExchanges,
							budget: tokenBudget,
							speed: speedMs,
							minutes: maxMinutes
						}, providers).then((sessionId) => navigate({
							to: "/arena/$sessionId",
							params: { sessionId },
							search: {
								autostart: true,
								play: false
							}
						})).catch((err) => {
							toast.error(err instanceof Error ? err.message : "Could not deal a floor");
							setBusy(null);
						});
					},
					children: busy === "deal" ? "Casting…" : "Random floor"
				})]
			})
		]
	});
}
function AgentCard({ title, tone, characters, providers, characterId, providerId, extra, onCharacter, onProvider, onExtra }) {
	const character = characters.find((c) => c.id === characterId);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		className: "space-y-3 p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl font-bold",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
					tone,
					children: character?.role || "Uncast"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Character",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectInput, {
					value: characterId,
					onChange: (e) => onCharacter(e.target.value),
					children: characters.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: c.id,
						children: c.name
					}, c.id))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Model",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectInput, {
					value: providerId,
					onChange: (e) => onProvider(e.target.value),
					children: providers.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
						value: p.id,
						children: [
							p.name,
							" · ",
							p.model
						]
					}, p.id))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Private note",
				hint: "Added only to this side's instructions.",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextArea, {
					value: extra,
					onChange: (e) => onExtra(e.target.value),
					className: "min-h-20"
				})
			})
		]
	});
}
//#endregion
export { Stage as component };
