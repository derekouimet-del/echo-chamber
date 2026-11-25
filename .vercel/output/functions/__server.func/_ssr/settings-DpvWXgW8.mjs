import { w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as Route$4 } from "./router-B60dYSLG.mjs";
import { n as useVault, t as useHydrated } from "./vault-68PPfR4E.mjs";
import { i as Pill, n as Field, r as Panel, s as TextInput } from "./ui-C1kFAxUP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-DpvWXgW8.js
var import_jsx_runtime = require_jsx_runtime();
function SettingsPage() {
	const house = Route$4.useLoaderData();
	const hydrated = useHydrated();
	const vault = useVault();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs tracking-widest text-lime",
				children: "PREFERENCES"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl font-extrabold",
				children: "Settings"
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "space-y-3 p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl font-bold",
						children: "House director"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
						tone: house.available ? "lime" : "ember",
						children: house.available ? "Available" : "Offline"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "The director writes characters, paints portraits, stages a showdown, analyzes a transcript, and can also sit on either side of the floor as House Grok. Outside models never see this key. Your own keys stay in this browser."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "space-y-4 p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl font-bold",
						children: "Voice"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "If a character has no voice, the floor stays text. House voices speak through the director. ElevenLabs and OpenAI speech use the keys below, which are not saved on the server."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex min-h-11 items-center gap-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: hydrated ? vault.voiceOn : false,
							onChange: (e) => vault.setVoiceOn(e.target.checked)
						}), "Speak each new turn automatically"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "ElevenLabs key",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
							type: "password",
							autoComplete: "off",
							value: hydrated ? vault.elevenKey : "",
							onChange: (e) => vault.setElevenKey(e.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "OpenAI speech key",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
							type: "password",
							autoComplete: "off",
							value: hydrated ? vault.openaiTtsKey : "",
							onChange: (e) => vault.setOpenaiTtsKey(e.target.value)
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Default exchanges",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
							type: "number",
							min: 2,
							max: 24,
							value: hydrated ? vault.defaultExchanges : 8,
							onChange: (e) => vault.setDefaults({ defaultExchanges: Number(e.target.value) })
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Default token budget",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
							type: "number",
							min: 500,
							step: 500,
							value: hydrated ? vault.defaultBudget : 12e3,
							onChange: (e) => vault.setDefaults({ defaultBudget: Number(e.target.value) })
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Default pause (ms)",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
							type: "number",
							min: 0,
							step: 100,
							value: hydrated ? vault.defaultSpeed : 900,
							onChange: (e) => vault.setDefaults({ defaultSpeed: Number(e.target.value) })
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Default clock (minutes)",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
							type: "number",
							min: 0,
							max: 180,
							value: hydrated ? vault.defaultMinutes : 20,
							onChange: (e) => vault.setDefaults({ defaultMinutes: Number(e.target.value) })
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "space-y-2 p-5 text-sm text-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl font-bold text-fg",
						children: "How a floor runs"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Turns alternate. Each call is one model, with its own endpoint, temperature, and instructions." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Replies stream onto the floor as they are generated. Pause, end, or inject a director's note at any time." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "A local model has to be reachable at a public URL. The arena cannot see a server that only exists on your desk." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "A clock, if you set one, counts only while the floor is live. Pause freezes it. Zero minutes means no clock." })
				]
			})
		]
	});
}
//#endregion
export { SettingsPage as component };
