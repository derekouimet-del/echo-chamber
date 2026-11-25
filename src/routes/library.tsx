import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { MODE_META } from "@/lib/arena/cast";
import { deleteSessionFn, getSessionBundle, listSessionsFn } from "@/lib/arena/functions";
import type { Session, TurnMessage } from "@/lib/arena/types";
import { formatWhen } from "@/lib/utils";
import { Button, Panel, Pill } from "@/components/ui";

export const Route = createFileRoute("/library")({
  loader: () => listSessionsFn(),
  component: Library,
});

function Library() {
  const initial = Route.useLoaderData();
  const router = useRouter();
  const [sessions, setSessions] = useState(initial);
  const groups = groupByTopic(sessions.filter((s) => s.isPublic || true));

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs tracking-widest text-lime">SESSION LIBRARY</p>
        <h1 className="font-display text-4xl font-extrabold">Library</h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Replay a finished floor, export the transcript, or line up how different model pairs treated the same question.
        </p>
      </div>
      {sessions.length === 0 ? (
        <Panel className="px-5 py-10">
          <p className="font-display text-2xl">Nothing filed yet.</p>
          <Link to="/setup" className="mt-3 inline-flex text-sm text-lime">
            Stage the first session
          </Link>
        </Panel>
      ) : (
        <ul className="space-y-3">
          {sessions.map((session) => (
            <li key={session.id} className="rounded-xl border border-line bg-panel p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Pill tone={session.status === "completed" ? "muted" : "lime"}>{session.status}</Pill>
                <Pill>{MODE_META[session.mode].label}</Pill>
                <span className="text-xs text-muted">{formatWhen(session.createdAt)}</span>
                <span className="text-xs tabular-nums text-muted">{session.tokensUsed.toLocaleString()} tokens</span>
              </div>
              <h2 className="mt-2 font-display text-xl font-bold">{session.title}</h2>
              <p className="text-sm text-muted">{session.topic}</p>
              <p className="mt-1 text-sm text-muted">
                {session.agents.map((agent) => `${agent.name} · ${agent.provider.model}`).join("  /  ")}
              </p>
              {session.summary ? <p className="mt-2 text-sm">{session.summary}</p> : null}
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  to="/arena/$sessionId"
                  params={{ sessionId: session.id }}
                  search={{ autostart: false, play: session.status === "completed" }}
                  className="inline-flex min-h-11 items-center rounded-lg bg-lime px-4 text-sm font-medium text-lime-ink"
                >
                  {session.status === "completed" ? "Replay" : "Open"}
                </Link>
                <Button
                  onClick={() => {
                    void getSessionBundle({ data: { id: session.id } }).then((bundle) => exportText(bundle.session, bundle.messages));
                  }}
                >
                  Export
                </Button>
                <Button
                  tone="danger"
                  onClick={() => {
                    void deleteSessionFn({ data: { id: session.id } })
                      .then(async () => {
                        setSessions((prev) => prev.filter((s) => s.id !== session.id));
                        await router.invalidate();
                      })
                      .catch((err) => toast.error(err instanceof Error ? err.message : "Could not delete"));
                  }}
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {groups.length ? (
        <div>
          <h2 className="font-display text-2xl font-bold">Same question, different minds</h2>
          <div className="mt-3 space-y-3">
            {groups.map((group) => (
              <Panel key={group.topic} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <p className="text-sm text-muted">{group.topic}</p>
                  <Link
                    to="/compare"
                    search={{ a: group.sessions[0]!.id, b: group.sessions[1]!.id }}
                    className="inline-flex min-h-11 items-center text-sm text-lime"
                  >
                    Line them up
                  </Link>
                </div>
                <ul className="mt-2 space-y-1 text-sm">
                  {group.sessions.map((session) => (
                    <li key={session.id}>
                      {session.agentA.provider.model} vs {session.agentB.provider.model}
                      {session.conclusion ? ` — ${session.conclusion}` : session.summary ? ` — ${session.summary}` : ""}
                    </li>
                  ))}
                </ul>
              </Panel>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function groupByTopic(sessions: Session[]) {
  const map = new Map<string, Session[]>();
  for (const session of sessions) {
    const key = session.topic.trim().toLowerCase();
    map.set(key, [...(map.get(key) ?? []), session]);
  }
  return [...map.entries()]
    .filter(([, rows]) => rows.length > 1)
    .map(([_topic, rows]) => ({ topic: rows[0]!.topic, sessions: rows }));
}

function exportText(session: Session, messages: TurnMessage[]) {
  const body = [
    session.title,
    session.topic,
    "",
    ...messages.map((m) => {
      const index = ["a", "b", "c", "d"].indexOf(m.speaker);
      const name = index >= 0 ? session.agents[index]?.name ?? "Contestant" : m.speaker === "user" ? "Audience" : m.speaker;
      return `${name}\n${m.content}\n`;
    }),
  ].join("\n");
  const blob = new Blob([body], { type: "text/plain" });
  const anchor = document.createElement("a");
  anchor.href = URL.createObjectURL(blob);
  anchor.download = `${session.title.replace(/[^\w]+/g, "-").slice(0, 48) || "dyad"}.txt`;
  anchor.click();
  URL.revokeObjectURL(anchor.href);
}
