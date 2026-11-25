import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Dices } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { primeAudio } from "@/lib/arena/client-stream";
import { dealRandomFloor } from "@/lib/arena/deal";
import { getDashboard } from "@/lib/arena/functions";
import { MODE_META } from "@/lib/arena/cast";
import { useVault } from "@/lib/arena/vault";
import { formatWhen } from "@/lib/utils";
import { Button, Panel, Pill } from "@/components/ui";

export const Route = createFileRoute("/")({
  loader: () => getDashboard(),
  component: Floor,
});

function Floor() {
  const data = Route.useLoaderData();
  const navigate = useNavigate();
  const [dealing, setDealing] = useState(false);
  const stats = [
    { label: "Sessions", value: data.counts.sessions },
    { label: "Open floors", value: data.counts.open },
    { label: "Cast", value: data.counts.characters },
    { label: "Tokens", value: data.counts.tokens.toLocaleString() },
  ];
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-xl border border-line bg-panel px-6 py-8 lg:px-10 lg:py-12">
        <div className="floor-wash pointer-events-none absolute inset-0" />
        <div className="relative max-w-2xl">
          <p className="text-xs font-medium tracking-widest text-lime">AGENT ARENA</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold leading-none lg:text-6xl">
            Two minds. One floor.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
            Point each side at a different model, give them a spine, and let them debate, bargain, or build.
            You direct. They do not share a brain unless you tell them to.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              tone="lime"
              disabled={dealing}
              className="px-4"
              onClick={() => {
                primeAudio();
                setDealing(true);
                const limits = useVault.getState();
                void dealRandomFloor({
                  exchanges: limits.defaultExchanges,
                  budget: limits.defaultBudget,
                  speed: limits.defaultSpeed,
                  minutes: limits.defaultMinutes,
                })
                  .then((sessionId) =>
                    navigate({
                      to: "/arena/$sessionId",
                      params: { sessionId },
                      search: { autostart: true, play: false },
                    }),
                  )
                  .catch((err) => {
                    toast.error(err instanceof Error ? err.message : "Could not deal a floor");
                    setDealing(false);
                  });
              }}
            >
              <Dices className="size-4" />
              {dealing ? "Casting…" : "Random floor"}
            </Button>
            <Link
              to="/setup"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-line bg-panel-2 px-4 py-2 text-sm text-fg"
            >
              Set the floor
              <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/characters"
              className="inline-flex min-h-11 items-center rounded-lg border border-line bg-panel-2 px-4 py-2 text-sm text-fg"
            >
              Meet the cast
            </Link>
            <Link
              to="/board"
              className="inline-flex min-h-11 items-center rounded-lg border border-line bg-panel-2 px-4 py-2 text-sm text-fg"
            >
              Public board
            </Link>
          </div>
          <p className="mt-3 max-w-xl text-sm text-muted">
            Random floor casts two opponents, turns on house voices, and starts a public debate. Portraits land while they talk.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <Panel key={stat.label} className="px-4 py-4">
            <p className="text-xs tracking-widest text-muted uppercase">{stat.label}</p>
            <p className="mt-2 font-display text-3xl font-bold tabular-nums">{stat.value}</p>
          </Panel>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="mb-3 flex items-end justify-between">
            <h2 className="font-display text-2xl font-bold">Recent floors</h2>
            <Link to="/library" className="text-sm text-lime">
              Library
            </Link>
          </div>
          {data.sessions.length === 0 ? (
            <Panel className="px-5 py-8">
              <p className="font-display text-xl">The floor is quiet.</p>
              <p className="mt-2 text-sm text-muted">
                No sessions yet. Stage a topic and the first exchange will land here.
              </p>
            </Panel>
          ) : (
            <ul className="space-y-3">
              {data.sessions.map((session) => (
                <li key={session.id}>
                  <Link
                    to="/arena/$sessionId"
                    params={{ sessionId: session.id }}
                    search={{ autostart: false, play: session.status === "completed" }}
                    className="block rounded-xl border border-line bg-panel px-4 py-4 hover:border-fg/30"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Pill tone={session.status === "live" || session.status === "thinking" ? "lime" : "muted"}>
                        {session.status}
                      </Pill>
                      <Pill>{MODE_META[session.mode].label}</Pill>
                      <span className="text-xs text-muted">{formatWhen(session.createdAt)}</span>
                    </div>
                    <p className="mt-2 font-display text-lg font-semibold">{session.title}</p>
                    <p className="mt-1 text-sm text-muted">
                      {session.agentA.name} · {session.agentA.provider.model} vs {session.agentB.name} ·{" "}
                      {session.agentB.provider.model}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <div className="mb-3 flex items-end justify-between">
            <h2 className="font-display text-2xl font-bold">Ready cast</h2>
            <Link to="/characters" className="text-sm text-lime">
              Studio
            </Link>
          </div>
          <ul className="space-y-3">
            {data.cast.map((character) => (
              <li key={character.id} className="rounded-xl border border-line bg-panel px-4 py-4">
                <p className="font-display text-lg font-semibold">{character.name}</p>
                <p className="text-sm text-tide">{character.role}</p>
                <p className="mt-2 text-sm text-muted">{character.objective}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
