import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { primeAudio } from "@/lib/arena/client-stream";
import { HOUSE_ID, MODE_META, TOPIC_PRESETS } from "@/lib/arena/cast";
import { dealRandomFloor } from "@/lib/arena/deal";
import { createSessionFn, deleteSetupFn, getSetupData, paintBackdropFn, quickCharacterFn, quickStartFn, saveSetupFn, stageShowdownFn } from "@/lib/arena/functions";
import { toSnapshot } from "@/lib/arena/snapshot";
import type { Mode, StageDesign } from "@/lib/arena/types";
import { MODES } from "@/lib/arena/types";
import { useHydrated, useVault } from "@/lib/arena/vault";
import { Button, Field, Panel, Pill, SelectInput, TextArea, TextInput } from "@/components/ui";

export const Route = createFileRoute("/setup")({
  loader: () => getSetupData(),
  component: Stage,
});

function Stage() {
  const { characters, providers, setups: saved } = Route.useLoaderData();
  const navigate = useNavigate();
  const hydrated = useHydrated();
  const defaultExchanges = useVault((s) => s.defaultExchanges);
  const defaultBudget = useVault((s) => s.defaultBudget);
  const defaultSpeed = useVault((s) => s.defaultSpeed);
  const defaultMinutes = useVault((s) => s.defaultMinutes);
  const keys = useVault((s) => s.keys);
  const house = providers.find((p) => p.id === HOUSE_ID) ?? providers[0];
  const a0 = characters.find((c) => c.id === "char_vesper") ?? characters[0];
  const b0 = characters.find((c) => c.id === "char_imani") ?? characters[1] ?? characters[0];

  const [mode, setMode] = useState<Mode>("debate");
  const [topic, setTopic] = useState(TOPIC_PRESETS[0] ?? "");
  const [charA, setCharA] = useState(a0?.id ?? "");
  const [charB, setCharB] = useState(b0?.id ?? "");
  const [provA, setProvA] = useState(house?.id ?? "");
  const [provB, setProvB] = useState(house?.id ?? "");
  const [extraA, setExtraA] = useState("");
  const [extraB, setExtraB] = useState("");
  const [maxExchanges, setMaxExchanges] = useState(defaultExchanges);
  const [tokenBudget, setTokenBudget] = useState(defaultBudget);
  const [speedMs, setSpeedMs] = useState(defaultSpeed);
  const [maxMinutes, setMaxMinutes] = useState(defaultMinutes);
  const [allowConclusion, setAllowConclusion] = useState(true);
  const [isPublic, setIsPublic] = useState(true);
  const [design, setDesign] = useState<StageDesign | null>(null);
  const [setups, setSetups] = useState(saved);
  const [cardId, setCardId] = useState("");
  const [cardName, setCardName] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [quickPrompt, setQuickPrompt] = useState("");
  const [quickTopic, setQuickTopic] = useState("Open discussion");
  const [quickCast, setQuickCast] = useState(characters);
  const [quickSelected, setQuickSelected] = useState<string[]>(characters.slice(0, 2).map((character) => character.id));

  const characterA = characters.find((c) => c.id === charA);
  const characterB = characters.find((c) => c.id === charB);
  const providerA = providers.find((p) => p.id === provA);
  const providerB = providers.find((p) => p.id === provB);
  const quickCharacters = quickCast.filter((character) => quickSelected.includes(character.id)).slice(0, 4);

  async function createQuickPersona() {
    if (!quickPrompt.trim()) return;
    setBusy("persona");
    try {
      const character = await quickCharacterFn({ data: { prompt: quickPrompt } });
      setQuickCast((current) => [character, ...current.filter((item) => item.id !== character.id)]);
      setQuickSelected((current) => [character.id, ...current.filter((id) => id !== character.id)].slice(0, 4));
      setQuickPrompt("");
      toast.success(`${character.name} joined the cast`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create that voice");
    } finally {
      setBusy(null);
    }
  }

  async function quickLaunch() {
    const cast = [...quickCharacters];
    if (cast.length < 2 || !house) {
      toast.error("Choose at least two saved voices, or create one to join the cast.");
      return;
    }
    primeAudio();
    setBusy("quick-launch");
    try {
      const agents = cast.slice(0, 4).map((character) => toSnapshot(character, house));
      const session = await quickStartFn({
        data: {
          topic: quickTopic.trim() || "Open discussion",
          mode: "freeform",
          title: quickTopic.trim() || "Open discussion",
          agentA: agents[0]!,
          agentB: agents[1]!,
          agents,
          maxExchanges,
          tokenBudget,
          speedMs,
          maxMinutes,
          allowConclusion,
          isPublic: true,
          design: null,
        },
      });
      await navigate({ to: "/arena/$sessionId", params: { sessionId: session.id }, search: { autostart: true, play: false } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not open the Echo Chamber");
      setBusy(null);
    }
  }

  const keyNote = useMemo(() => {
    if (!hydrated) return null;
    const missing = [providerA, providerB].filter((p) => p && p.kind !== "house" && !keys[p.id]);
    if (!missing.length) return null;
    return `Missing a browser key for ${missing.map((p) => p!.name).join(" and ")}.`;
  }, [hydrated, keys, providerA, providerB]);

  async function stageIt() {
    if (!characterA || !characterB) return;
    setBusy("stage");
    try {
      const next = await stageShowdownFn({
        data: {
          topic,
          mode,
          a: { name: characterA.name, role: characterA.role, perspective: characterA.perspective, objective: characterA.objective },
          b: { name: characterB.name, role: characterB.role, perspective: characterB.perspective, objective: characterB.objective },
        },
      });
      setDesign(next);
      toast.success("The director staged the floor");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Staging failed");
    } finally {
      setBusy(null);
    }
  }

  async function backdrop() {
    if (!design) {
      toast.error("Stage the floor before rendering it.");
      return;
    }
    setBusy("backdrop");
    try {
      const { url } = await paintBackdropFn({ data: { design, topic } });
      setDesign({ ...design, backdropUrl: url });
      toast.success("Floor rendered");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Render failed");
    } finally {
      setBusy(null);
    }
  }

  async function launch() {
    if (!characterA || !characterB || !providerA || !providerB) {
      toast.error("Pick both characters and both models.");
      return;
    }
    if (characterA.id === characterB.id) {
      toast.error("Give each side a different character, or duplicate one in the studio first.");
      return;
    }
    primeAudio();
    setBusy("launch");
    try {
      const session = await createSessionFn({
        data: {
          topic,
          mode,
          title: design?.title,
          agentA: toSnapshot(characterA, providerA, extraA),
          agentB: toSnapshot(characterB, providerB, extraB),
          maxExchanges,
          tokenBudget,
          speedMs,
          maxMinutes,
          allowConclusion,
          isPublic,
          design,
        },
      });
      await navigate({
        to: "/arena/$sessionId",
        params: { sessionId: session.id },
        search: { autostart: true, play: false },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not open the floor");
      setBusy(null);
    }
  }

  function applyCard(id: string) {
    const card = setups.find((item) => item.id === id);
    if (!card) return;
    setCardId(card.id);
    setCardName(card.name);
    setMode(card.mode);
    setTopic(card.topic);
    setCharA(card.characterA);
    setCharB(card.characterB);
    setProvA(card.providerA);
    setProvB(card.providerB);
    setExtraA(card.extraA);
    setExtraB(card.extraB);
    setMaxExchanges(card.maxExchanges);
    setTokenBudget(card.tokenBudget);
    setSpeedMs(card.speedMs);
    setMaxMinutes(card.maxMinutes);
    setAllowConclusion(card.allowConclusion);
    setIsPublic(card.isPublic);
    setDesign(null);
  }

  async function keepCard() {
    const name = cardName.trim() || design?.title || topic.slice(0, 48);
    if (!name.trim()) {
      toast.error("Name the card, or write a topic first.");
      return;
    }
    setBusy("card");
    try {
      const savedCard = await saveSetupFn({
        data: {
          id: cardId || crypto.randomUUID(),
          name,
          topic,
          mode,
          characterA: charA,
          characterB: charB,
          providerA: provA,
          providerB: provB,
          extraA,
          extraB,
          maxExchanges,
          tokenBudget,
          speedMs,
          maxMinutes,
          allowConclusion,
          isPublic,
        },
      });
      setCardId(savedCard.id);
      setCardName(savedCard.name);
      setSetups((prev) => [savedCard, ...prev.filter((item) => item.id !== savedCard.id)]);
      toast.success("Stage card saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save the card");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs tracking-widest text-lime">ARENA SETUP</p>
        <h1 className="font-display text-4xl font-extrabold">Stage</h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Choose the mode, the question, and who walks out. House Grok can play either side with no key.
        </p>
      </div>

      <Panel className="space-y-5 border-lime/40 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium tracking-widest text-lime">ECHO CHAMBER</p>
            <h2 className="mt-1 font-display text-2xl font-bold">Drop in. Listen in.</h2>
            <p className="mt-1 max-w-xl text-sm text-muted">Spin up a voice from one line, add two to four saved characters, and let the conversation find its shape.</p>
          </div>
          <Pill tone="lime">House voice on by default</Pill>
        </div>
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <Field label="Create a character from one line" hint="Try “Stoner Johnny” or “Liberal Jake”. The house director saves the persona to your cast.">
            <TextInput value={quickPrompt} onChange={(event) => setQuickPrompt(event.target.value)} placeholder="A one-line persona…" maxLength={120} />
          </Field>
          <div className="flex items-end">
            <Button disabled={busy !== null || !quickPrompt.trim()} onClick={() => void createQuickPersona()}>
              {busy === "persona" ? "Creating voice…" : "Create voice"}
            </Button>
          </div>
        </div>
        <Field label="Topic" hint="Leave it as Open discussion to let the characters choose their direction.">
          <TextInput value={quickTopic} onChange={(event) => setQuickTopic(event.target.value)} placeholder="Open discussion" maxLength={200} />
        </Field>
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Saved cast <span className="text-muted">· choose 2–4 voices</span></legend>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {quickCast.map((character) => {
              const checked = quickSelected.includes(character.id);
              return (
                <label key={character.id} className="flex min-h-12 items-center gap-3 rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={!checked && quickSelected.length >= 4}
                    onChange={(event) => setQuickSelected((current) => event.target.checked
                      ? [...current, character.id].slice(0, 4)
                      : current.filter((id) => id !== character.id))}
                  />
                  <span className="min-w-0"><span className="block truncate font-medium">{character.name}</span><span className="block truncate text-xs text-muted">{character.role}</span></span>
                </label>
              );
            })}
          </div>
        </fieldset>
        <div className="flex flex-wrap items-center gap-3">
          <Button tone="lime" disabled={busy !== null || quickCharacters.length < 2} onClick={() => void quickLaunch()} className="px-6">
            {busy === "quick-launch" ? "Opening…" : "Start listening"}
          </Button>
          <span className="text-xs text-muted">Short turns · house voice playback · audience questions and mic input on the floor</span>
        </div>
      </Panel>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {MODES.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setMode(item)}
            className={`rounded-xl border p-4 text-left ${mode === item ? "border-lime bg-panel" : "border-line bg-panel"}`}
          >
            <span className="font-display text-lg font-bold">{MODE_META[item].label}</span>
            <span className="mt-1 block text-sm text-muted">{MODE_META[item].blurb}</span>
          </button>
        ))}
      </div>

      <Panel className="space-y-4 p-5">
        <Field label="Topic">
          <TextArea value={topic} onChange={(e) => setTopic(e.target.value)} />
        </Field>
        <div className="flex flex-wrap gap-2">
          {TOPIC_PRESETS.map((preset) => (
            <button key={preset} type="button" onClick={() => setTopic(preset)} className="rounded-full border border-line px-3 py-1.5 text-left text-xs text-muted hover:text-fg">
              {preset}
            </button>
          ))}
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <AgentCard
          title="Side A"
          tone="tide"
          characters={characters}
          providers={providers}
          characterId={charA}
          providerId={provA}
          extra={extraA}
          onCharacter={setCharA}
          onProvider={setProvA}
          onExtra={setExtraA}
        />
        <AgentCard
          title="Side B"
          tone="ember"
          characters={characters}
          providers={providers}
          characterId={charB}
          providerId={provB}
          extra={extraB}
          onCharacter={setCharB}
          onProvider={setProvB}
          onExtra={setExtraB}
        />
      </div>

      <Panel className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Exchanges">
          <TextInput type="number" min={2} max={24} value={maxExchanges} onChange={(e) => setMaxExchanges(Number(e.target.value))} />
        </Field>
        <Field label="Token budget">
          <TextInput type="number" min={500} step={500} value={tokenBudget} onChange={(e) => setTokenBudget(Number(e.target.value))} />
        </Field>
        <Field label="Pause between turns (ms)">
          <TextInput type="number" min={0} step={100} value={speedMs} onChange={(e) => setSpeedMs(Number(e.target.value))} />
        </Field>
        <Field label="Clock (minutes)" hint="0 runs until the exchange or token cap. Pause freezes the clock.">
          <TextInput type="number" min={0} max={180} value={maxMinutes} onChange={(e) => setMaxMinutes(Number(e.target.value))} />
        </Field>
        <div className="flex flex-col justify-end gap-3 text-sm">
          <label className="flex min-h-11 items-center gap-2">
            <input type="checkbox" checked={allowConclusion} onChange={(e) => setAllowConclusion(e.target.checked)} />
            They may conclude
          </label>
          <label className="flex min-h-11 items-center gap-2">
            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
            Keep on the public board
          </label>
        </div>
      </Panel>

      <Panel className="space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold">Director</h2>
            <p className="text-sm text-muted">Optional. The house model writes the title, stakes, and opening. Rendering the room is a separate image.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button disabled={busy !== null} onClick={() => void stageIt()}>
              {busy === "stage" ? "Staging…" : "Stage this"}
            </Button>
            <Button disabled={busy !== null || !design} onClick={() => void backdrop()}>
              {busy === "backdrop" ? "Rendering…" : "Render the room"}
            </Button>
          </div>
        </div>
        {design ? (
          <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
            <div className="space-y-2 text-sm">
              <p className="font-display text-2xl font-bold">{design.title}</p>
              <p className="text-lime">{design.stakes}</p>
              <p className="text-muted">{design.coldOpen}</p>
              <p>
                <span className="text-tide">{characterA?.name}: </span>
                {design.aEntrance}
              </p>
              <p>
                <span className="text-ember">{characterB?.name}: </span>
                {design.bEntrance}
              </p>
              <p className="text-xs text-muted">{design.visualMotif}</p>
            </div>
            {design.backdropUrl ? (
              <img src={design.backdropUrl} alt="" className="h-40 w-full rounded-lg object-cover outline outline-1 -outline-offset-1 outline-fg/10 lg:h-full" />
            ) : null}
          </div>
        ) : null}
      </Panel>

      {keyNote ? <p className="text-sm text-ember">{keyNote}</p> : null}

      <Panel className="space-y-4 p-5">
        <div>
          <h2 className="font-display text-2xl font-bold">Stage cards</h2>
          <p className="text-sm text-muted">Save this pairing and open it again without rebuilding the floor.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <Field label="Card name">
            <TextInput value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="Mars, nationalist vs academic" />
          </Field>
          <Field label="Saved cards">
            <SelectInput value={cardId} onChange={(e) => applyCard(e.target.value)}>
              <option value="">Load a card</option>
              {setups.map((card) => (
                <option key={card.id} value={card.id}>
                  {card.name}
                </option>
              ))}
            </SelectInput>
          </Field>
          <div className="flex items-end gap-2">
            <Button disabled={busy !== null} onClick={() => void keepCard()}>
              {busy === "card" ? "Saving…" : cardId ? "Update card" : "Save card"}
            </Button>
            {cardId ? (
              <Button
                tone="danger"
                disabled={busy !== null}
                onClick={() => {
                  void deleteSetupFn({ data: { id: cardId } })
                    .then(() => {
                      setSetups((prev) => prev.filter((item) => item.id !== cardId));
                      setCardId("");
                      toast.success("Card removed");
                    })
                    .catch((err) => toast.error(err instanceof Error ? err.message : "Could not remove the card"));
                }}
              >
                Remove
              </Button>
            ) : null}
          </div>
        </div>
      </Panel>

      <div className="flex flex-wrap gap-3">
        <Button tone="lime" disabled={busy !== null} onClick={() => void launch()} className="px-6">
          {busy === "launch" ? "Opening…" : "Open the floor"}
        </Button>
        <Button
          disabled={busy !== null}
          onClick={() => {
            primeAudio();
            setBusy("deal");
            void dealRandomFloor(
              { exchanges: maxExchanges, budget: tokenBudget, speed: speedMs, minutes: maxMinutes },
              providers,
            )
              .then((sessionId) =>
                navigate({
                  to: "/arena/$sessionId",
                  params: { sessionId },
                  search: { autostart: true, play: false },
                }),
              )
              .catch((err) => {
                toast.error(err instanceof Error ? err.message : "Could not deal a floor");
                setBusy(null);
              });
          }}
        >
          {busy === "deal" ? "Casting…" : "Random floor"}
        </Button>
      </div>
    </div>
  );
}

function AgentCard({
  title,
  tone,
  characters,
  providers,
  characterId,
  providerId,
  extra,
  onCharacter,
  onProvider,
  onExtra,
}: {
  title: string;
  tone: "tide" | "ember";
  characters: { id: string; name: string; role: string }[];
  providers: { id: string; name: string; model: string }[];
  characterId: string;
  providerId: string;
  extra: string;
  onCharacter: (id: string) => void;
  onProvider: (id: string) => void;
  onExtra: (value: string) => void;
}) {
  const character = characters.find((c) => c.id === characterId);
  return (
    <Panel className="space-y-3 p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">{title}</h2>
        <Pill tone={tone}>{character?.role || "Uncast"}</Pill>
      </div>
      <Field label="Character">
        <SelectInput value={characterId} onChange={(e) => onCharacter(e.target.value)}>
          {characters.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </SelectInput>
      </Field>
      <Field label="Model">
        <SelectInput value={providerId} onChange={(e) => onProvider(e.target.value)}>
          {providers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} · {p.model}
            </option>
          ))}
        </SelectInput>
      </Field>
      <Field label="Private note" hint="Added only to this side's instructions.">
        <TextArea value={extra} onChange={(e) => onExtra(e.target.value)} className="min-h-20" />
      </Field>
    </Panel>
  );
}
