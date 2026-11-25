import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { getCompareFn } from "@/lib/arena/functions";
import { MODE_META } from "@/lib/arena/cast";
import type { Session, TurnMessage } from "@/lib/arena/types";
import { Field, Panel, Pill, SelectInput } from "@/components/ui";

export const Route = createFileRoute("/compare")({
  validateSearch: (search: Record<string, unknown>) => ({
    a: typeof search.a === "string" ? search.a : "",
    b: typeof search.b === "string" ? search.b : "",
  }),
  loaderDeps: ({ search }) => ({ a: search.a, b: search.b }),
  loader: ({ deps }) => getCompareFn({ data: deps }),
  component: Compare,
});

function Compare() {
  const data = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate();

  function pick(side: "a" | "b", id: string) {
    void navigate({ to: "/compare", search: { ...search, [side]: id } });
  }

  const sameTopic =
    data.left && data.right && data.left.session.topic.trim().toLowerCase() === data.right.session.topic.trim().toLowerCase();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs tracking-widest text-lime">MODEL COMPARISON</p>
        <h1 className="font-display text-4xl font-extrabold">Same question, two floors</h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Put two sessions next to each other. Useful when the topic matches and the models, or the personalities, do not.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Left floor">
          <SelectInput value={search.a} onChange={(e) => pick("a", e.target.value)}>
            <option value="">Choose a session</option>
            {data.sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.agentA.provider.model} vs {session.agentB.provider.model} — {session.title}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Right floor">
          <SelectInput value={search.b} onChange={(e) => pick("b", e.target.value)}>
            <option value="">Choose a session</option>
            {data.sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.agentA.provider.model} vs {session.agentB.provider.model} — {session.title}
              </option>
            ))}
          </SelectInput>
        </Field>
      </div>
      {data.left && data.right && !sameTopic ? (
        <p className="text-sm text-ember">These floors were not asked the same question. The contrast is still there, just less direct.</p>
      ) : null}
      {!data.sessions.length ? (
        <Panel className="px-5 py-8 text-sm text-muted">Run at least one session before comparing.</Panel>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Column bundle={data.left} />
          <Column bundle={data.right} />
        </div>
      )}
    </div>
  );
}

function Column({ bundle }: { bundle: { session: Session; messages: TurnMessage[] } | null }) {
  if (!bundle) {
    return (
      <Panel className="flex min-h-64 items-center justify-center p-6 text-sm text-muted">
        Pick a session.
      </Panel>
    );
  }
  const { session, messages } = bundle;
  return (
    <Panel className="flex min-h-64 flex-col">
      <div className="space-y-2 border-b border-line p-4">
        <div className="flex flex-wrap gap-2">
          <Pill>{MODE_META[session.mode].label}</Pill>
          <Pill tone="muted">{session.status}</Pill>
        </div>
        <h2 className="font-display text-xl font-bold">{session.title}</h2>
        <p className="text-sm text-muted">{session.topic}</p>
        <p className="text-sm">
          <span className="text-tide">{session.agentA.name}</span>
          <span className="text-muted"> · {session.agentA.provider.model}</span>
        </p>
        <p className="text-sm">
          <span className="text-ember">{session.agentB.name}</span>
          <span className="text-muted"> · {session.agentB.provider.model}</span>
        </p>
      </div>
      <div className="max-h-[28rem] flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((message) => (
          <p key={message.id} className="text-sm leading-relaxed">
            <span className={speakerClass(message.speaker)}>{who(message, session)}. </span>
            <span className="whitespace-pre-wrap">{message.content}</span>
          </p>
        ))}
      </div>
      {session.summary || session.conclusion ? (
        <div className="space-y-2 border-t border-line p-4 text-sm">
          {session.summary ? <p>{session.summary}</p> : null}
          {session.agreements ? <p><span className="text-lime">Agreed. </span>{session.agreements}</p> : null}
          {session.disagreements ? <p><span className="text-ember">Split. </span>{session.disagreements}</p> : null}
          {session.conclusion ? <p className="text-muted">{session.conclusion}</p> : null}
        </div>
      ) : (
        <p className="border-t border-line p-4 text-xs text-muted">No analysis yet. Open the floor and run Analyze.</p>
      )}
    </Panel>
  );
}

function who(message: TurnMessage, session: Session): string {
  const index = ["a", "b", "c", "d"].indexOf(message.speaker);
  if (index >= 0) return session.agents[index]?.name ?? "Contestant";
  if (message.speaker === "user") return "Audience";
  if (message.speaker === "director") return "Director";
  return "Floor";
}

function speakerClass(speaker: TurnMessage["speaker"]): string {
  if (speaker === "a" || speaker === "c") return "font-medium text-tide";
  if (speaker === "b" || speaker === "d") return "font-medium text-ember";
  return "font-medium text-lime";
}
