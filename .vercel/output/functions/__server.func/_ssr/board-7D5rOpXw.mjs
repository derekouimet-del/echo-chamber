import { o as __toESM } from "../_runtime.mjs";
import { r as formatWhen } from "./utils-pryIKIhC.mjs";
import { i as MODE_META } from "./cast-CAA-oOdj.mjs";
import { Z as require_react, w as require_jsx_runtime, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { E as getBoardFn, u as Route$10 } from "./router-B60dYSLG.mjs";
import { i as Pill, r as Panel } from "./ui-C1kFAxUP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/board-7D5rOpXw.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Board() {
	const initial = Route$10.useLoaderData();
	const [sessions, setSessions] = (0, import_react.useState)(initial);
	(0, import_react.useEffect)(() => {
		const timer = window.setInterval(() => {
			getBoardFn().then(setSessions).catch(() => {});
		}, 8e3);
		return () => window.clearInterval(timer);
	}, []);
	const live = sessions.filter((session) => session.status === "live" || session.status === "thinking");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs tracking-widest text-lime",
					children: "PUBLIC BOARD"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-4xl font-extrabold",
					children: "Watch the floor"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-xl text-sm text-muted",
					children: "Sessions marked for the board. Live floors are at the top. Private sessions stay in the library."
				})
			] }),
			sessions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "px-5 py-10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-2xl",
						children: "The board is dark."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "Open a floor and leave “Keep on the public board” on."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/setup",
						className: "mt-4 inline-flex min-h-11 items-center text-sm text-lime",
						children: "Stage one"
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "grid gap-4 md:grid-cols-2",
				children: sessions.map((session) => {
					const hot = session.status === "live" || session.status === "thinking";
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/arena/$sessionId",
						params: { sessionId: session.id },
						search: {
							autostart: false,
							play: session.status === "completed"
						},
						className: "flex h-full flex-col overflow-hidden rounded-xl border border-line bg-panel hover:border-fg/30",
						children: [session.design?.backdropUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: session.design.backdropUrl,
							alt: "",
							className: "h-28 w-full object-cover"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid h-28 grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Face, {
								agent: session.agentA,
								tone: "tide"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Face, {
								agent: session.agentB,
								tone: "ember"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-1 flex-col gap-2 p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
											tone: hot ? "lime" : "muted",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "inline-flex items-center gap-2",
												children: [hot ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "live-dot size-1.5 rounded-full bg-lime-ink" }) : null, hot ? "live" : session.status]
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, { children: MODE_META[session.mode].label }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-muted",
											children: formatWhen(session.createdAt)
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-display text-xl font-bold",
									children: session.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "line-clamp-2 text-sm text-muted",
									children: session.topic
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-auto text-sm",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-tide",
											children: session.agentA.name
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-muted",
											children: [" · ", session.agentA.provider.model]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted",
											children: " vs "
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
								session.conclusion ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted",
									children: session.conclusion
								}) : null
							]
						})]
					}) }, session.id);
				})
			}),
			live.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [live.length, " floors are live. Open one to watch it stream."]
			}) : null
		]
	});
}
function Face({ agent, tone }) {
	if (agent.portraitUrl) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: agent.portraitUrl,
		alt: "",
		className: "h-full w-full object-cover"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: `flex h-full items-center justify-center bg-panel-2 font-display text-4xl font-extrabold ${tone === "tide" ? "text-tide" : "text-ember"}`,
		children: agent.name.slice(0, 1)
	});
}
//#endregion
export { Board as component };
