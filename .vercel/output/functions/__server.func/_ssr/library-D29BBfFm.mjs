import { o as __toESM } from "../_runtime.mjs";
import { r as formatWhen } from "./utils-pryIKIhC.mjs";
import { i as MODE_META } from "./cast-CAA-oOdj.mjs";
import { C as useRouter, Z as require_react, w as require_jsx_runtime, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { S as deleteSessionFn, k as getSessionBundle, s as Route$7 } from "./router-B60dYSLG.mjs";
import { i as Pill, r as Panel, t as Button } from "./ui-C1kFAxUP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/library-D29BBfFm.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Library() {
	const initial = Route$7.useLoaderData();
	const router = useRouter();
	const [sessions, setSessions] = (0, import_react.useState)(initial);
	const groups = groupByTopic(sessions.filter((s) => s.isPublic || true));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs tracking-widest text-lime",
					children: "SESSION LIBRARY"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-4xl font-extrabold",
					children: "Library"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-xl text-sm text-muted",
					children: "Replay a finished floor, export the transcript, or line up how different model pairs treated the same question."
				})
			] }),
			sessions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "px-5 py-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-2xl",
					children: "Nothing filed yet."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/setup",
					className: "mt-3 inline-flex text-sm text-lime",
					children: "Stage the first session"
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-3",
				children: sessions.map((session) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-xl border border-line bg-panel p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
									tone: session.status === "completed" ? "muted" : "lime",
									children: session.status
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, { children: MODE_META[session.mode].label }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted",
									children: formatWhen(session.createdAt)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs tabular-nums text-muted",
									children: [session.tokensUsed.toLocaleString(), " tokens"]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-2 font-display text-xl font-bold",
							children: session.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: session.topic
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-tide",
									children: session.agentA.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-muted",
									children: [
										" · ",
										session.agentA.provider.model,
										" "
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted",
									children: "vs "
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-ember",
									children: session.agentB.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-muted",
									children: [" · ", session.agentB.provider.model]
								})
							]
						}),
						session.summary ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm",
							children: session.summary
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex flex-wrap gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/arena/$sessionId",
									params: { sessionId: session.id },
									search: {
										autostart: false,
										play: session.status === "completed"
									},
									className: "inline-flex min-h-11 items-center rounded-lg bg-lime px-4 text-sm font-medium text-lime-ink",
									children: session.status === "completed" ? "Replay" : "Open"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									onClick: () => {
										getSessionBundle({ data: { id: session.id } }).then((bundle) => exportText(bundle.session, bundle.messages));
									},
									children: "Export"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									tone: "danger",
									onClick: () => {
										deleteSessionFn({ data: { id: session.id } }).then(async () => {
											setSessions((prev) => prev.filter((s) => s.id !== session.id));
											await router.invalidate();
										}).catch((err) => toast.error(err instanceof Error ? err.message : "Could not delete"));
									},
									children: "Delete"
								})
							]
						})
					]
				}, session.id))
			}),
			groups.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl font-bold",
				children: "Same question, different minds"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 space-y-3",
				children: groups.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
					className: "p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: group.topic
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/compare",
							search: {
								a: group.sessions[0].id,
								b: group.sessions[1].id
							},
							className: "inline-flex min-h-11 items-center text-sm text-lime",
							children: "Line them up"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 space-y-1 text-sm",
						children: group.sessions.map((session) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							session.agentA.provider.model,
							" vs ",
							session.agentB.provider.model,
							session.conclusion ? ` — ${session.conclusion}` : session.summary ? ` — ${session.summary}` : ""
						] }, session.id))
					})]
				}, group.topic))
			})] }) : null
		]
	});
}
function groupByTopic(sessions) {
	const map = /* @__PURE__ */ new Map();
	for (const session of sessions) {
		const key = session.topic.trim().toLowerCase();
		map.set(key, [...map.get(key) ?? [], session]);
	}
	return [...map.entries()].filter(([, rows]) => rows.length > 1).map(([topic, rows]) => ({
		topic: rows[0].topic,
		sessions: rows
	}));
}
function exportText(session, messages) {
	const body = [
		session.title,
		session.topic,
		"",
		...messages.map((m) => {
			return `${m.speaker === "a" ? session.agentA.name : m.speaker === "b" ? session.agentB.name : m.speaker}\n${m.content}\n`;
		})
	].join("\n");
	const blob = new Blob([body], { type: "text/plain" });
	const anchor = document.createElement("a");
	anchor.href = URL.createObjectURL(blob);
	anchor.download = `${session.title.replace(/[^\w]+/g, "-").slice(0, 48) || "dyad"}.txt`;
	anchor.click();
	URL.revokeObjectURL(anchor.href);
}
//#endregion
export { Library as component };
