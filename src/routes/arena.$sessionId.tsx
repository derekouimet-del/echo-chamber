import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Download, Pause, Play, RotateCcw, Square, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { playSpeech, streamTurn } from "@/lib/arena/client-stream";
import {
  analyzeFn,
  distillFn,
  getSessionBundle,
  interveneFn,
  rematchFn,
  setStatusFn,
} from "@/lib/arena/functions";
import { MODE_META } from "@/lib/arena/cast";
import type { Session, TurnMessage } from "@/lib/arena/types";
import { useVault } from "@/lib/arena/vault";
import { formatWhen } from "@/lib/utils";
import { Button, Panel, Pill, TextArea } from "@/components/ui";

export const Route = createFileRoute("/arena/$sessionId")({
  validateSearch: (search: Record<string, unknown>) => ({
    autostart: search.autostart === true || search.autostart === "1" || search.autostart === 1,
    play: search.play === true || search.play === "1" || search.play === 1,
  }),
  loader: ({ params }) => getSessionBundle({ data: { id: params.sessionId } }),
  component: Arena,
});

function Arena() {
  const data = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [session, setSession] = useState(data.session);
  const [messages, setMessages] = useState(data.messages);
  const [draft, setDraft] = useState<{ speaker: "a" | "b"; text: string } | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [shown, setShown] = useState(search.play ? 0 : data.messages.length);
  const [now, setNow] = useState<number | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const runRef = useRef<AbortController | null>(null);
  const sessionRef = useRef(session);
  const booted = useRef(false);
  sessionRef.current = session;
  const replaying = search.play && session.status === "completed";
  const visible = replaying ? messages.slice(0, shown) : messages;

  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [visible.length, draft?.text]);

  useEffect(() => {
    if (!replaying) return;
    if (shown >= messages.length) return;
    const timer = window.setTimeout(() => setShown((n) => n + 1), Math.max(500, session.speedMs));
    return () => window.clearTimeout(timer);
  }, [replaying, shown, messages.length, session.speedMs]);

  useEffect(() => {
    if (!search.autostart || booted.current) return;
    if (data.session.status !== "live") return;
    booted.current = true;
    void runLoop();
    // The loop closes over stable refs. Boot once per page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.autostart]);

  useEffect(() => {
    const watching = session.status === "live" || session.status === "thinking";
    if (!watching || running) return;
    let cancel = false;
    const pull = async () => {
      try {
        const fresh = await getSessionBundle({ data: { id: session.id } });
        if (cancel || runRef.current) return;
        setSession((prev) => (prev.updatedAt === fresh.session.updatedAt && prev.status === fresh.session.status ? prev : fresh.session));
        setMessages((prev) => {
          if (
            prev.length === fresh.messages.length &&
            prev.every((message, index) => message.id === fresh.messages[index]?.id)
          ) {
            return prev;
          }
          return fresh.messages;
        });
      } catch {
        // A spectator miss is not a floor failure. The next tick retries.
      }
    };
    const timer = window.setInterval(() => void pull(), 2500);
    return () => {
      cancel = true;
      window.clearInterval(timer);
    };
  }, [running, session.id, session.status]);

  useEffect(() => {
    const id = session.id;
    let ticks = 0;
    const timer = window.setInterval(() => {
      ticks += 1;
      if (ticks > 12) {
        window.clearInterval(timer);
        return;
      }
      void getSessionBundle({ data: { id } })
        .then((fresh) => {
          setSession((prev) => {
            if (prev.id !== id) return prev;
            const portraitA = fresh.session.agentA.portraitUrl;
            const portraitB = fresh.session.agentB.portraitUrl;
            const backdrop = fresh.session.design?.backdropUrl ?? null;
            if (
              portraitA === prev.agentA.portraitUrl &&
              portraitB === prev.agentB.portraitUrl &&
              (prev.design?.backdropUrl ?? null) === backdrop
            ) {
              return prev;
            }
            return {
              ...prev,
              design: prev.design ? { ...prev.design, backdropUrl: backdrop } : fresh.session.design,
              agentA: { ...prev.agentA, portraitUrl: portraitA },
              agentB: { ...prev.agentB, portraitUrl: portraitB },
            };
          });
        })
        .catch(() => {});
    }, 5000);
    return () => window.clearInterval(timer);
  }, [session.id]);

  async function runLoop() {
    runRef.current?.abort();
    const controller = new AbortController();
    runRef.current = controller;
    setRunning(true);
    setError(null);
    const speakerRef = { current: "a" as "a" | "b" };
    try {
      await speakColdOpen(sessionRef.current);
      while (!controller.signal.aborted) {
        let text = "";
        const current = sessionRef.current;
        const keys = keysFor(current);
        const outcome = await streamTurn(
          current.id,
          keys,
          {
            onMeta: (speaker) => {
              speakerRef.current = speaker;
              text = "";
              setDraft({ speaker, text: "" });
            },
            onDelta: (chunk) => {
              text += chunk;
              setDraft({ speaker: speakerRef.current, text });
            },
          },
          controller.signal,
        );
        if (controller.signal.aborted) {
          const fresh = await getSessionBundle({ data: { id: current.id } });
          setSession(fresh.session);
          setMessages(fresh.messages);
          setDraft(null);
          break;
        }
        if (outcome.message) {
          setMessages((prev) => (prev.some((m) => m.id === outcome.message!.id) ? prev : [...prev, outcome.message!]));
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
    const next = await setStatusFn({ data: { id: session.id, status: "paused" } });
    setSession(next);
    runRef.current?.abort();
  }

  async function stop() {
    const next = await setStatusFn({ data: { id: session.id, status: "completed" } });
    setSession(next);
    runRef.current?.abort();
  }

  async function resume() {
    const next = await setStatusFn({ data: { id: session.id, status: "live" } });
    setSession(next);
    sessionRef.current = next;
    void runLoop();
  }

  async function intervene() {
    if (!note.trim()) return;
    setBusy("note");
    try {
      const message = await interveneFn({ data: { sessionId: session.id, note } });
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
        search: { autostart: true, play: false },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not run it again");
      setBusy(null);
    }
  }

  const spent = activeMs(session, now, running);
  const clockLabel =
    session.maxMinutes > 0 ? `${formatClock(spent)} / ${formatClock(session.maxMinutes * 60_000)}` : formatClock(spent);
  const live = session.status === "live" || session.status === "thinking" || running;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone={live ? "lime" : "muted"}>
              <span className="inline-flex items-center gap-2">
                {live ? <span className="live-dot size-1.5 rounded-full bg-lime-ink" /> : null}
                {running ? "live" : session.status}
              </span>
            </Pill>
            <Pill>{MODE_META[session.mode].label}</Pill>
            {session.isPublic ? <Pill>On the board</Pill> : <Pill>Private board</Pill>}
          </div>
          <h1 className="mt-2 font-display text-3xl font-extrabold lg:text-4xl">{session.title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">{session.topic}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2 font-display text-lg tabular-nums text-lime">{clockLabel}</span>
          {session.status === "paused" || session.status === "failed" ? (
            <Button tone="lime" onClick={() => void resume()}>
              <Play className="size-4" /> Resume
            </Button>
          ) : null}
          {live ? (
            <Button onClick={() => void pause()}>
              <Pause className="size-4" /> Pause
            </Button>
          ) : null}
          {session.status !== "completed" ? (
            <Button tone="danger" onClick={() => void stop()}>
              <Square className="size-4" /> End
            </Button>
          ) : null}
          {session.status === "completed" || session.status === "paused" || session.status === "failed" ? (
            <Button disabled={busy !== null || running} onClick={() => void again()}>
              <RotateCcw className="size-4" /> {busy === "again" ? "Opening…" : "Run again"}
            </Button>
          ) : null}
          <Button onClick={() => download(session, messages)}>
            <Download className="size-4" /> Export
          </Button>
        </div>
      </div>

      {session.design?.backdropUrl ? (
        <img
          src={session.design.backdropUrl}
          alt=""
          className="h-36 w-full rounded-xl object-cover outline outline-1 -outline-offset-1 outline-fg/10"
        />
      ) : null}
      {session.design?.stakes ? <p className="text-sm text-lime">{session.design.stakes}</p> : null}

      <div className="grid items-start gap-4 lg:grid-cols-[240px_1fr_240px]">
        <Dossier agent={session.agentA} tone="tide" entrance={session.design?.aEntrance} speaking={draft?.speaker === "a"} />
        <Panel className="flex min-h-[60vh] flex-col">
          <div className="flex items-center justify-between border-b border-line px-4 py-3 text-xs text-muted">
            <span className="tabular-nums">
              {session.exchangeCount}/{session.maxExchanges} exchanges
            </span>
            <span className="tabular-nums">
              {session.tokensUsed.toLocaleString()} / {session.tokenBudget.toLocaleString()} tokens
            </span>
          </div>
          <div ref={scroller} className="flex-1 space-y-5 overflow-y-auto px-4 py-5 lg:max-h-[70vh]">
            {visible.map((message) => (
              <Turn key={message.id} message={message} session={session} />
            ))}
            {draft ? (
              <article className={draft.speaker === "a" ? "border-l-2 border-tide pl-4" : "border-l-2 border-ember pl-4"}>
                <p className={`text-xs font-medium tracking-widest ${draft.speaker === "a" ? "text-tide" : "text-ember"}`}>
                  {(draft.speaker === "a" ? session.agentA.name : session.agentB.name).toUpperCase()}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                  {draft.text}
                  <span className="caret" />
                </p>
              </article>
            ) : null}
            {replaying && shown < messages.length ? (
              <p className="text-xs text-muted">Replaying…</p>
            ) : null}
            {!visible.length && !draft ? (
              <p className="text-sm text-muted">Waiting for the first voice.</p>
            ) : null}
          </div>
          {error ? <p className="border-t border-line px-4 py-3 text-sm text-ember">{error}</p> : null}
          {session.status === "thinking" && !running ? (
            <div className="border-t border-line px-4 py-3">
              <Button
                onClick={() => {
                  void setStatusFn({ data: { id: session.id, status: "paused" } }).then((next) => setSession(next));
                }}
              >
                Release a stuck floor
              </Button>
            </div>
          ) : null}
          <div className="border-t border-line p-3">
            <TextArea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Director's intervention. Both sides will see it on their next turn."
              className="min-h-16"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              <Button disabled={busy !== null || !note.trim()} onClick={() => void intervene()}>
                Send onto the floor
              </Button>
              {replaying ? (
                <Button onClick={() => setShown(messages.length)}>Skip replay</Button>
              ) : null}
            </div>
          </div>
        </Panel>
        <Dossier agent={session.agentB} tone="ember" entrance={session.design?.bEntrance} speaking={draft?.speaker === "b"} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          disabled={busy !== null}
          onClick={() => {
            setBusy("analyze");
            void analyzeFn({ data: { sessionId: session.id } })
              .then((next) => {
                setSession(next);
                toast.success("Analysis filed");
              })
              .catch((err) => toast.error(err instanceof Error ? err.message : "Analysis failed"))
              .finally(() => setBusy(null));
          }}
        >
          {busy === "analyze" ? "Reading…" : "Analyze"}
        </Button>
        <Button
          disabled={busy !== null}
          onClick={() => {
            setBusy("memory");
            void distillFn({ data: { sessionId: session.id } })
              .then((result) => toast.success(`${result.saved} memories kept`))
              .catch((err) => toast.error(err instanceof Error ? err.message : "Could not distill"))
              .finally(() => setBusy(null));
          }}
        >
          Distill memory
        </Button>
        <Link to="/library" className="inline-flex min-h-11 items-center text-sm text-lime">
          Back to the library
        </Link>
      </div>

      {session.summary ? (
        <Panel className="space-y-3 p-5 text-sm">
          <h2 className="font-display text-xl font-bold">After the floor</h2>
          <p>{session.summary}</p>
          {session.agreements ? <p><span className="text-lime">Agreed. </span>{session.agreements}</p> : null}
          {session.disagreements ? <p><span className="text-ember">Split. </span>{session.disagreements}</p> : null}
          {session.conclusion ? <p className="text-muted">{session.conclusion}</p> : null}
        </Panel>
      ) : null}
      <p className="text-xs text-muted">Opened {formatWhen(session.createdAt)}</p>
    </div>
  );
}

function Dossier({
  agent,
  tone,
  entrance,
  speaking,
}: {
  agent: Session["agentA"];
  tone: "tide" | "ember";
  entrance?: string;
  speaking: boolean;
}) {
  return (
    <Panel className={`p-4 lg:sticky lg:top-6 ${speaking ? "outline outline-2 outline-lime" : ""}`}>
      <div className={`mb-3 h-1 rounded-full ${tone === "tide" ? "bg-tide" : "bg-ember"}`} />
      {agent.portraitUrl ? (
        <img src={agent.portraitUrl} alt="" className="mb-3 aspect-[4/5] w-full rounded-lg object-cover outline outline-1 -outline-offset-1 outline-fg/10" />
      ) : (
        <div className={`mb-3 flex aspect-[4/5] items-center justify-center rounded-lg bg-panel-2 font-display text-4xl font-extrabold ${tone === "tide" ? "text-tide" : "text-ember"}`}>
          {agent.name.slice(0, 1)}
        </div>
      )}
      <h2 className="font-display text-xl font-bold">{agent.name}</h2>
      <p className={`text-sm ${tone === "tide" ? "text-tide" : "text-ember"}`}>{agent.role}</p>
      <p className="mt-3 text-sm text-muted">{agent.objective}</p>
      <p className="mt-2 text-xs text-muted">
        {agent.provider.name} · {agent.provider.model}
      </p>
      {entrance ? <p className="mt-3 text-xs text-fg/80">{entrance}</p> : null}
      <p className="mt-3 text-xs text-muted">
        Voice {agent.voiceProvider === "none" ? "off" : `${agent.voiceProvider} · ${agent.voiceId || "default"}`}
      </p>
    </Panel>
  );
}

function Turn({ message, session }: { message: TurnMessage; session: Session }) {
  const name =
    message.speaker === "a" ? session.agentA.name : message.speaker === "b" ? session.agentB.name : message.speaker === "director" ? "Director" : "Floor";
  const agent = message.speaker === "a" ? session.agentA : message.speaker === "b" ? session.agentB : null;
  const tone =
    message.speaker === "a" ? "border-tide" : message.speaker === "b" ? "border-ember" : "border-lime";
  const color =
    message.speaker === "a" ? "text-tide" : message.speaker === "b" ? "text-ember" : "text-lime";
  return (
    <article className={`border-l-2 pl-4 ${tone}`}>
      <div className="flex items-center justify-between gap-3">
        <p className={`text-xs font-medium tracking-widest ${color}`}>{name.toUpperCase()}</p>
        {agent && agent.voiceProvider !== "none" ? (
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center text-muted hover:text-fg"
            aria-label={`Play ${name}`}
            onClick={() => {
              const vault = useVault.getState();
              void playSpeech({
                text: message.content,
                voiceProvider: agent.voiceProvider as "house" | "elevenlabs" | "openai",
                voiceId: agent.voiceId,
                elevenKey: vault.elevenKey,
                openaiKey: vault.openaiTtsKey,
              }).catch((err) => toast.error(err instanceof Error ? err.message : "Voice failed"));
            }}
          >
            <Volume2 className="size-4" />
          </button>
        ) : null}
      </div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
    </article>
  );
}

function keysFor(session: Session): Record<string, string> {
  const vault = useVault.getState().keys;
  const out: Record<string, string> = {};
  for (const id of [session.agentA.provider.id, session.agentB.provider.id]) {
    if (vault[id]) out[id] = vault[id];
  }
  return out;
}

async function speakColdOpen(session: Session) {
  if (!useVault.getState().voiceOn) return;
  const line = session.design?.coldOpen?.trim();
  if (!line) return;
  const taken = new Set([session.agentA.voiceId, session.agentB.voiceId]);
  const voiceId = taken.has("eve") ? "sal" : "eve";
  try {
    await playSpeech({ text: line, voiceProvider: "house", voiceId });
  } catch {
    // A blocked cold open should not stop the debate.
  }
}

async function maybeSpeak(message: TurnMessage, session: Session) {
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
      openaiKey: vault.openaiTtsKey,
    });
  } catch (err) {
    toast.error(err instanceof Error ? err.message : "Voice failed");
  }
}

function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    const timer = window.setTimeout(() => resolve(), ms);
    signal.addEventListener("abort", () => {
      window.clearTimeout(timer);
      resolve();
    });
  });
}

function activeMs(session: Session, now: number | null, running: boolean): number {
  const ticking = running || session.status === "live" || session.status === "thinking";
  const extra =
    ticking && session.resumedAt && now != null ? Math.max(0, now - new Date(session.resumedAt).getTime()) : 0;
  return session.elapsedMs + extra;
}

function formatClock(ms: number): string {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function download(session: Session, messages: TurnMessage[]) {
  const body = [
    session.title,
    session.topic,
    `${MODE_META[session.mode].label}`,
    `${session.agentA.name} (${session.agentA.provider.name} / ${session.agentA.provider.model})`,
    `${session.agentB.name} (${session.agentB.provider.name} / ${session.agentB.provider.model})`,
    "",
    ...messages.map((m) => {
      const name = m.speaker === "a" ? session.agentA.name : m.speaker === "b" ? session.agentB.name : m.speaker;
      return `${name}\n${m.content}\n`;
    }),
    session.summary ? `Summary\n${session.summary}\n` : "",
    session.agreements ? `Agreements\n${session.agreements}\n` : "",
    session.disagreements ? `Disagreements\n${session.disagreements}\n` : "",
  ].join("\n");
  const blob = new Blob([body], { type: "text/plain" });
  const anchor = document.createElement("a");
  anchor.href = URL.createObjectURL(blob);
  anchor.download = `${session.title.replace(/[^\w]+/g, "-").slice(0, 48) || "dyad"}.txt`;
  anchor.click();
  URL.revokeObjectURL(anchor.href);
}
