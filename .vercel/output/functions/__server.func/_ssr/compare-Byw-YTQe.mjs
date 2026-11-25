import { i as MODE_META } from "./cast-CAA-oOdj.mjs";
import { S as useNavigate, w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as Route$8 } from "./router-B60dYSLG.mjs";
import { a as SelectInput, i as Pill, n as Field, r as Panel } from "./ui-C1kFAxUP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/compare-Byw-YTQe.js
var import_jsx_runtime = require_jsx_runtime();
function Compare() {
	const data = Route$8.useLoaderData();
	const search = Route$8.useSearch();
	const navigate = useNavigate();
	function pick(side, id) {
		navigate({
			to: "/compare",
			search: {
				...search,
				[side]: id
			}
		});
	}
	const sameTopic = data.left && data.right && data.left.session.topic.trim().toLowerCase() === data.right.session.topic.trim().toLowerCase();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs tracking-widest text-lime",
					children: "MODEL COMPARISON"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-4xl font-extrabold",
					children: "Same question, two floors"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-xl text-sm text-muted",
					children: "Put two sessions next to each other. Useful when the topic matches and the models, or the personalities, do not."
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Left floor",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectInput, {
						value: search.a,
						onChange: (e) => pick("a", e.target.value),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Choose a session"
						}), data.sessions.map((session) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
							value: session.id,
							children: [
								session.agentA.provider.model,
								" vs ",
								session.agentB.provider.model,
								" — ",
								session.title
							]
						}, session.id))]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Right floor",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectInput, {
						value: search.b,
						onChange: (e) => pick("b", e.target.value),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Choose a session"
						}), data.sessions.map((session) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
							value: session.id,
							children: [
								session.agentA.provider.model,
								" vs ",
								session.agentB.provider.model,
								" — ",
								session.title
							]
						}, session.id))]
					})
				})]
			}),
			data.left && data.right && !sameTopic ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-ember",
				children: "These floors were not asked the same question. The contrast is still there, just less direct."
			}) : null,
			!data.sessions.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				className: "px-5 py-8 text-sm text-muted",
				children: "Run at least one session before comparing."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Column, { bundle: data.left }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Column, { bundle: data.right })]
			})
		]
	});
}
function Column({ bundle }) {
	if (!bundle) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
		className: "flex min-h-64 items-center justify-center p-6 text-sm text-muted",
		children: "Pick a session."
	});
	const { session, messages } = bundle;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		className: "flex min-h-64 flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2 border-b border-line p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, { children: MODE_META[session.mode].label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
							tone: "muted",
							children: session.status
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-xl font-bold",
						children: session.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: session.topic
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-tide",
							children: session.agentA.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-muted",
							children: [" · ", session.agentA.provider.model]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-ember",
							children: session.agentB.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-muted",
							children: [" · ", session.agentB.provider.model]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "max-h-[28rem] flex-1 space-y-4 overflow-y-auto p-4",
				children: messages.map((message) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm leading-relaxed",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: speakerClass(message.speaker),
						children: [who(message, session), ". "]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "whitespace-pre-wrap",
						children: message.content
					})]
				}, message.id))
			}),
			session.summary || session.conclusion ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2 border-t border-line p-4 text-sm",
				children: [
					session.summary ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: session.summary }) : null,
					session.agreements ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-lime",
						children: "Agreed. "
					}), session.agreements] }) : null,
					session.disagreements ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-ember",
						children: "Split. "
					}), session.disagreements] }) : null,
					session.conclusion ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-muted",
						children: session.conclusion
					}) : null
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "border-t border-line p-4 text-xs text-muted",
				children: "No analysis yet. Open the floor and run Analyze."
			})
		]
	});
}
function who(message, session) {
	if (message.speaker === "a") return session.agentA.name;
	if (message.speaker === "b") return session.agentB.name;
	if (message.speaker === "director") return "Director";
	return "Floor";
}
function speakerClass(speaker) {
	if (speaker === "a") return "font-medium text-tide";
	if (speaker === "b") return "font-medium text-ember";
	return "font-medium text-lime";
}
//#endregion
export { Compare as component };
