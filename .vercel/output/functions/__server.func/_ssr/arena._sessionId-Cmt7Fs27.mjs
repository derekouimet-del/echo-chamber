import { o as __toESM } from "../_runtime.mjs";
import { r as formatWhen } from "./utils-pryIKIhC.mjs";
import { i as MODE_META } from "./cast-CAA-oOdj.mjs";
import { S as useNavigate, Z as require_react, w as require_jsx_runtime, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as Play, f as Pause, g as Download, o as Square, t as Volume2, u as RotateCcw } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { A as interveneFn, N as rematchFn, R as setStatusFn, h as analyzeFn, k as getSessionBundle, n as Route$2, w as distillFn } from "./router-B60dYSLG.mjs";
import { r as streamTurn, t as playSpeech } from "./client-stream-t0kJOY9g.mjs";
import { n as useVault } from "./vault-68PPfR4E.mjs";
import { i as Pill, o as TextArea, r as Panel, t as Button } from "./ui-C1kFAxUP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/arena._sessionId-Cmt7Fs27.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Arena() {
	const data = Route$2.useLoaderData();
	const search = Route$2.useSearch();
	const navigate = useNavigate();
	const [session, setSession] = (0, import_react.useState)(data.session);
	const [messages, setMessages] = (0, import_react.useState)(data.messages);
	const [draft, setDraft] = (0, import_react.useState)(null);
	const [running, setRunning] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [note, setNote] = (0, import_react.useState)("");
	const [shown, setShown] = (0, import_react.useState)(search.play ? 0 : data.messages.length);
	const [now, setNow] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(null);
	const scroller = (0, import_react.useRef)(null);
	const runRef = (0, import_react.useRef)(null);
	const sessionRef = (0, import_react.useRef)(session);
	const booted = (0, import_react.useRef)(false);
	sessionRef.current = session;
	const replaying = search.play && session.status === "completed";
	const visible = replaying ? messages.slice(0, shown) : messages;
	(0, import_react.useEffect)(() => {
		setNow(Date.now());
		const timer = window.setInterval(() => setNow(Date.now()), 1e3);
		return () => window.clearInterval(timer);
	}, []);
	(0, import_react.useEffect)(() => {
		scroller.current?.scrollTo({
			top: scroller.current.scrollHeight,
			behavior: "smooth"
		});
	}, [visible.length, draft?.text]);
	(0, import_react.useEffect)(() => {
		if (!replaying) return;
		if (shown >= messages.length) return;
		const timer = window.setTimeout(() => setShown((n) => n + 1), Math.max(500, session.speedMs));
		return () => window.clearTimeout(timer);
	}, [
		replaying,
		shown,
		messages.length,
		session.speedMs
	]);
	(0, import_react.useEffect)(() => {
		if (!search.autostart || booted.current) return;
		if (data.session.status !== "live") return;
		booted.current = true;
		runLoop();
	}, [search.autostart]);
	(0, import_react.useEffect)(() => {
		if (!(session.status === "live" || session.status === "thinking") || running) return;
		let cancel = false;
		const pull = async () => {
			try {
				const fresh = await getSessionBundle({ data: { id: session.id } });
				if (cancel || runRef.current) return;
				setSession((prev) => prev.updatedAt === fresh.session.updatedAt && prev.status === fresh.session.status ? prev : fresh.session);
				setMessages((prev) => {
					if (prev.length === fresh.messages.length && prev.every((message, index) => message.id === fresh.messages[index]?.id)) return prev;
					return fresh.messages;
				});
			} catch {}
		};
		const timer = window.setInterval(() => void pull(), 2500);
		return () => {
			cancel = true;
			window.clearInterval(timer);
		};
	}, [
		running,
		session.id,
		session.status
	]);
	(0, import_react.useEffect)(() => {
		const id = session.id;
		let ticks = 0;
		const timer = window.setInterval(() => {
			ticks += 1;
			if (ticks > 12) {
				window.clearInterval(timer);
				return;
			}
			getSessionBundle({ data: { id } }).then((fresh) => {
				setSession((prev) => {
					if (prev.id !== id) return prev;
					const portraitA = fresh.session.agentA.portraitUrl;
					const portraitB = fresh.session.agentB.portraitUrl;
					const backdrop = fresh.session.design?.backdropUrl ?? null;
					if (portraitA === prev.agentA.portraitUrl && portraitB === prev.agentB.portraitUrl && (prev.design?.backdropUrl ?? null) === backdrop) return prev;
					return {
						...prev,
						design: prev.design ? {
							...prev.design,
							backdropUrl: backdrop
						} : fresh.session.design,
						agentA: {
							...prev.agentA,
							portraitUrl: portraitA
						},
						agentB: {
							...prev.agentB,
							portraitUrl: portraitB
						}
					};
				});
			}).catch(() => {});
		}, 5e3);
		return () => window.clearInterval(timer);
	}, [session.id]);
	async function runLoop() {
		runRef.current?.abort();
		const controller = new AbortController();
		runRef.current = controller;
		setRunning(true);
		setError(null);
		const speakerRef = { current: "a" };
		try {
			await speakColdOpen(sessionRef.current);
			while (!controller.signal.aborted) {
				let text = "";
				const current = sessionRef.current;
				const keys = keysFor(current);
				const outcome = await streamTurn(current.id, keys, {
					onMeta: (speaker) => {
						speakerRef.current = speaker;
						text = "";
						setDraft({
							speaker,
							text: ""
						});
					},
					onDelta: (chunk) => {
						text += chunk;
						setDraft({
							speaker: speakerRef.current,
							text
						});
					}
				}, controller.signal);
				if (controller.signal.aborted) {
					const fresh = await getSessionBundle({ data: { id: current.id } });
					setSession(fresh.session);
					setMessages(fresh.messages);
					setDraft(null);
					break;
				}
				if (outcome.message) {
					setMessages((prev) => prev.some((m) => m.id === outcome.message.id) ? prev : [...prev, outcome.message]);
					await maybeSpeak(outcome.message, outcome.session ?? current);
				}
				if (outcome.session) {
					setSession(outcome.session);
					sessionRef.current = outcome.session;
				}
				setDraft(null);
				if (outcome.error) setError(outcome.error);
				if (outcome.stop || outcome.error || !outcome.message) break;
				await wait(outcome.session?.speedMs ?? current.speedMs, controller.signal);
			}
		} finally {
			if (runRef.current === controller) {
				runRef.current = null;
				setRunning(false);
			}
		}
	}
	async function pause() {
		const next = await setStatusFn({ data: {
			id: session.id,
			status: "paused"
		} });
		setSession(next);
		runRef.current?.abort();
	}
	async function stop() {
		const next = await setStatusFn({ data: {
			id: session.id,
			status: "completed"
		} });
		setSession(next);
		runRef.current?.abort();
	}
	async function resume() {
		const next = await setStatusFn({ data: {
			id: session.id,
			status: "live"
		} });
		setSession(next);
		sessionRef.current = next;
		runLoop();
	}
	async function intervene() {
		if (!note.trim()) return;
		setBusy("note");
		try {
			const message = await interveneFn({ data: {
				sessionId: session.id,
				note
			} });
			setMessages((prev) => [...prev, message]);
			setNote("");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not intervene");
		} finally {
			setBusy(null);
		}
	}
	async function again() {
		setBusy("again");
		try {
			const next = await rematchFn({ data: { id: session.id } });
			await navigate({
				to: "/arena/$sessionId",
				params: { sessionId: next.id },
				search: {
					autostart: true,
					play: false
				}
			});
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not run it again");
			setBusy(null);
		}
	}
	const spent = activeMs(session, now, running);
	const clockLabel = session.maxMinutes > 0 ? `${formatClock(spent)} / ${formatClock(session.maxMinutes * 6e4)}` : formatClock(spent);
	const live = session.status === "live" || session.status === "thinking" || running;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
									tone: live ? "lime" : "muted",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "inline-flex items-center gap-2",
										children: [live ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "live-dot size-1.5 rounded-full bg-lime-ink" }) : null, running ? "live" : session.status]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, { children: MODE_META[session.mode].label }),
								session.isPublic ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, { children: "On the board" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, { children: "Private board" })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-2 font-display text-3xl font-extrabold lg:text-4xl",
							children: session.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 max-w-2xl text-sm text-muted",
							children: session.topic
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "px-2 font-display text-lg tabular-nums text-lime",
							children: clockLabel
						}),
						session.status === "paused" || session.status === "failed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							tone: "lime",
							onClick: () => void resume(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), " Resume"]
						}) : null,
						live ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: () => void pause(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" }), " Pause"]
						}) : null,
						session.status !== "completed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							tone: "danger",
							onClick: () => void stop(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, { className: "size-4" }), " End"]
						}) : null,
						session.status === "completed" || session.status === "paused" || session.status === "failed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							disabled: busy !== null || running,
							onClick: () => void again(),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-4" }),
								" ",
								busy === "again" ? "Opening…" : "Run again"
							]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: () => download(session, messages),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), " Export"]
						})
					]
				})]
			}),
			session.design?.backdropUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: session.design.backdropUrl,
				alt: "",
				className: "h-36 w-full rounded-xl object-cover outline outline-1 -outline-offset-1 outline-fg/10"
			}) : null,
			session.design?.stakes ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-lime",
				children: session.design.stakes
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid items-start gap-4 lg:grid-cols-[240px_1fr_240px]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dossier, {
						agent: session.agentA,
						tone: "tide",
						entrance: session.design?.aEntrance,
						speaking: draft?.speaker === "a"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
						className: "flex min-h-[60vh] flex-col",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between border-b border-line px-4 py-3 text-xs text-muted",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "tabular-nums",
									children: [
										session.exchangeCount,
										"/",
										session.maxExchanges,
										" exchanges"
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "tabular-nums",
									children: [
										session.tokensUsed.toLocaleString(),
										" / ",
										session.tokenBudget.toLocaleString(),
										" tokens"
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								ref: scroller,
								className: "flex-1 space-y-5 overflow-y-auto px-4 py-5 lg:max-h-[70vh]",
								children: [
									visible.map((message) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Turn, {
										message,
										session
									}, message.id)),
									draft ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
										className: draft.speaker === "a" ? "border-l-2 border-tide pl-4" : "border-l-2 border-ember pl-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: `text-xs font-medium tracking-widest ${draft.speaker === "a" ? "text-tide" : "text-ember"}`,
											children: (draft.speaker === "a" ? session.agentA.name : session.agentB.name).toUpperCase()
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-2 whitespace-pre-wrap text-sm leading-relaxed",
											children: [draft.text, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "caret" })]
										})]
									}) : null,
									replaying && shown < messages.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted",
										children: "Replaying…"
									}) : null,
									!visible.length && !draft ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm text-muted",
										children: "Waiting for the first voice."
									}) : null
								]
							}),
							error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "border-t border-line px-4 py-3 text-sm text-ember",
								children: error
							}) : null,
							session.status === "thinking" && !running ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "border-t border-line px-4 py-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									onClick: () => {
										setStatusFn({ data: {
											id: session.id,
											status: "paused"
										} }).then((next) => setSession(next));
									},
									children: "Release a stuck floor"
								})
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "border-t border-line p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextArea, {
									value: note,
									onChange: (e) => setNote(e.target.value),
									placeholder: "Director's intervention. Both sides will see it on their next turn.",
									className: "min-h-16"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2 flex flex-wrap gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										disabled: busy !== null || !note.trim(),
										onClick: () => void intervene(),
										children: "Send onto the floor"
									}), replaying ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										onClick: () => setShown(messages.length),
										children: "Skip replay"
									}) : null]
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dossier, {
						agent: session.agentB,
						tone: "ember",
						entrance: session.design?.bEntrance,
						speaking: draft?.speaker === "b"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						disabled: busy !== null,
						onClick: () => {
							setBusy("analyze");
							analyzeFn({ data: { sessionId: session.id } }).then((next) => {
								setSession(next);
								toast.success("Analysis filed");
							}).catch((err) => toast.error(err instanceof Error ? err.message : "Analysis failed")).finally(() => setBusy(null));
						},
						children: busy === "analyze" ? "Reading…" : "Analyze"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						disabled: busy !== null,
						onClick: () => {
							setBusy("memory");
							distillFn({ data: { sessionId: session.id } }).then((result) => toast.success(`${result.saved} memories kept`)).catch((err) => toast.error(err instanceof Error ? err.message : "Could not distill")).finally(() => setBusy(null));
						},
						children: "Distill memory"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/library",
						className: "inline-flex min-h-11 items-center text-sm text-lime",
						children: "Back to the library"
					})
				]
			}),
			session.summary ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "space-y-3 p-5 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-xl font-bold",
						children: "After the floor"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: session.summary }),
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
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted",
				children: ["Opened ", formatWhen(session.createdAt)]
			})
		]
	});
}
function Dossier({ agent, tone, entrance, speaking }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		className: `p-4 lg:sticky lg:top-6 ${speaking ? "outline outline-2 outline-lime" : ""}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `mb-3 h-1 rounded-full ${tone === "tide" ? "bg-tide" : "bg-ember"}` }),
			agent.portraitUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: agent.portraitUrl,
				alt: "",
				className: "mb-3 aspect-[4/5] w-full rounded-lg object-cover outline outline-1 -outline-offset-1 outline-fg/10"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: `mb-3 flex aspect-[4/5] items-center justify-center rounded-lg bg-panel-2 font-display text-4xl font-extrabold ${tone === "tide" ? "text-tide" : "text-ember"}`,
				children: agent.name.slice(0, 1)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-xl font-bold",
				children: agent.name
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: `text-sm ${tone === "tide" ? "text-tide" : "text-ember"}`,
				children: agent.role
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted",
				children: agent.objective
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-xs text-muted",
				children: [
					agent.provider.name,
					" · ",
					agent.provider.model
				]
			}),
			entrance ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs text-fg/80",
				children: entrance
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-xs text-muted",
				children: ["Voice ", agent.voiceProvider === "none" ? "off" : `${agent.voiceProvider} · ${agent.voiceId || "default"}`]
			})
		]
	});
}
function Turn({ message, session }) {
	const name = message.speaker === "a" ? session.agentA.name : message.speaker === "b" ? session.agentB.name : message.speaker === "director" ? "Director" : "Floor";
	const agent = message.speaker === "a" ? session.agentA : message.speaker === "b" ? session.agentB : null;
	const tone = message.speaker === "a" ? "border-tide" : message.speaker === "b" ? "border-ember" : "border-lime";
	const color = message.speaker === "a" ? "text-tide" : message.speaker === "b" ? "text-ember" : "text-lime";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: `border-l-2 pl-4 ${tone}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: `text-xs font-medium tracking-widest ${color}`,
				children: name.toUpperCase()
			}), agent && agent.voiceProvider !== "none" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "inline-flex size-11 items-center justify-center text-muted hover:text-fg",
				"aria-label": `Play ${name}`,
				onClick: () => {
					const vault = useVault.getState();
					playSpeech({
						text: message.content,
						voiceProvider: agent.voiceProvider,
						voiceId: agent.voiceId,
						elevenKey: vault.elevenKey,
						openaiKey: vault.openaiTtsKey
					}).catch((err) => toast.error(err instanceof Error ? err.message : "Voice failed"));
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4" })
			}) : null]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "whitespace-pre-wrap text-sm leading-relaxed",
			children: message.content
		})]
	});
}
function keysFor(session) {
	const vault = useVault.getState().keys;
	const out = {};
	for (const id of [session.agentA.provider.id, session.agentB.provider.id]) if (vault[id]) out[id] = vault[id];
	return out;
}
async function speakColdOpen(session) {
	if (!useVault.getState().voiceOn) return;
	const line = session.design?.coldOpen?.trim();
	if (!line) return;
	const voiceId = (/* @__PURE__ */ new Set([session.agentA.voiceId, session.agentB.voiceId])).has("eve") ? "sal" : "eve";
	try {
		await playSpeech({
			text: line,
			voiceProvider: "house",
			voiceId
		});
	} catch {}
}
async function maybeSpeak(message, session) {
	if (!useVault.getState().voiceOn) return;
	const agent = message.speaker === "a" ? session.agentA : message.speaker === "b" ? session.agentB : null;
	if (!agent || agent.voiceProvider === "none") return;
	const vault = useVault.getState();
	try {
		await playSpeech({
			text: message.content,
			voiceProvider: agent.voiceProvider,
			voiceId: agent.voiceId,
			elevenKey: vault.elevenKey,
			openaiKey: vault.openaiTtsKey
		});
	} catch (err) {
		toast.error(err instanceof Error ? err.message : "Voice failed");
	}
}
function wait(ms, signal) {
	return new Promise((resolve) => {
		const timer = window.setTimeout(() => resolve(), ms);
		signal.addEventListener("abort", () => {
			window.clearTimeout(timer);
			resolve();
		});
	});
}
function activeMs(session, now, running) {
	const extra = (running || session.status === "live" || session.status === "thinking") && session.resumedAt && now != null ? Math.max(0, now - new Date(session.resumedAt).getTime()) : 0;
	return session.elapsedMs + extra;
}
function formatClock(ms) {
	const seconds = Math.max(0, Math.floor(ms / 1e3));
	return `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
}
function download(session, messages) {
	const body = [
		session.title,
		session.topic,
		`${MODE_META[session.mode].label}`,
		`${session.agentA.name} (${session.agentA.provider.name} / ${session.agentA.provider.model})`,
		`${session.agentB.name} (${session.agentB.provider.name} / ${session.agentB.provider.model})`,
		"",
		...messages.map((m) => {
			return `${m.speaker === "a" ? session.agentA.name : m.speaker === "b" ? session.agentB.name : m.speaker}\n${m.content}\n`;
		}),
		session.summary ? `Summary\n${session.summary}\n` : "",
		session.agreements ? `Agreements\n${session.agreements}\n` : "",
		session.disagreements ? `Disagreements\n${session.disagreements}\n` : ""
	].join("\n");
	const blob = new Blob([body], { type: "text/plain" });
	const anchor = document.createElement("a");
	anchor.href = URL.createObjectURL(blob);
	anchor.download = `${session.title.replace(/[^\w]+/g, "-").slice(0, 48) || "dyad"}.txt`;
	anchor.click();
	URL.revokeObjectURL(anchor.href);
}
//#endregion
export { Arena as component };
