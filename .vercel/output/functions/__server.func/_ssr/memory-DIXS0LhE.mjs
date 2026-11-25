import { o as __toESM } from "../_runtime.mjs";
import { r as formatWhen } from "./utils-pryIKIhC.mjs";
import { Z as require_react, w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { D as getMemories, _ as clearMemoriesFn, b as deleteMemoryFn, o as Route$6, p as addMemoryFn } from "./router-B60dYSLG.mjs";
import { a as SelectInput, i as Pill, n as Field, o as TextArea, r as Panel, t as Button } from "./ui-C1kFAxUP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/memory-DIXS0LhE.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function MemoryDesk() {
	const characters = Route$6.useLoaderData();
	const [characterId, setCharacterId] = (0, import_react.useState)(characters[0]?.id ?? "");
	const [rows, setRows] = (0, import_react.useState)([]);
	const [kind, setKind] = (0, import_react.useState)("long");
	const [content, setContent] = (0, import_react.useState)("");
	const [confirm, setConfirm] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!characterId) return;
		let cancel = false;
		getMemories({ data: { characterId } }).then((next) => {
			if (!cancel) setRows(next);
		});
		return () => {
			cancel = true;
		};
	}, [characterId]);
	const character = characters.find((c) => c.id === characterId);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs tracking-widest text-lime",
					children: "PERSISTENT MEMORY"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-4xl font-extrabold",
					children: "Memory"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-xl text-sm text-muted",
					children: "Each character keeps their own notes. The other side cannot read them unless you write the same fact twice. Short-term context is the live transcript. This desk is what survives the session."
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Character",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectInput, {
					value: characterId,
					onChange: (e) => {
						setConfirm(false);
						setCharacterId(e.target.value);
					},
					children: characters.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: c.id,
						children: c.name
					}, c.id))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "space-y-3 p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "New memory",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextArea, {
						value: content,
						onChange: (e) => setContent(e.target.value),
						placeholder: `Something ${character?.name ?? "they"} should still know next time.`
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectInput, {
						value: kind,
						onChange: (e) => setKind(e.target.value),
						className: "max-w-40",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "long",
								children: "Long-term"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "short",
								children: "Short-term"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "session",
								children: "From a session"
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						tone: "lime",
						onClick: () => {
							addMemoryFn({ data: {
								characterId,
								kind,
								content
							} }).then((row) => {
								setRows((prev) => [row, ...prev]);
								setContent("");
							}).catch((err) => toast.error(err instanceof Error ? err.message : "Could not save"));
						},
						children: "Keep it"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-2",
				children: rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "text-sm text-muted",
					children: "Nothing retained yet."
				}) : rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-xl border border-line bg-panel px-4 py-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
								tone: row.kind === "long" ? "lime" : "muted",
								children: row.kind
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted",
								children: formatWhen(row.createdAt)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm",
							children: row.content
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "mt-2 text-xs text-ember",
							onClick: () => {
								deleteMemoryFn({ data: { id: row.id } }).then(() => setRows((prev) => prev.filter((m) => m.id !== row.id)));
							},
							children: "Forget"
						})
					]
				}, row.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: confirm ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				tone: "danger",
				onClick: () => {
					clearMemoriesFn({ data: { characterId } }).then(() => {
						setRows([]);
						setConfirm(false);
						toast.success("Memory cleared for this character");
					});
				},
				children: ["Confirm clear for ", character?.name]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				tone: "danger",
				onClick: () => setConfirm(true),
				children: "Clear this character"
			}) })
		]
	});
}
//#endregion
export { MemoryDesk as component };
