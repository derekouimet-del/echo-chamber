import { HOUSE_ID, HOUSE_VOICES, TOPIC_PRESETS, opposeCharacter, randomCharacter } from "./cast";
import {
  createSessionFn,
  dressSessionFn,
  getProviders,
  saveCharacterFn,
  stageShowdownFn,
} from "./functions";
import { toSnapshot } from "./snapshot";
import type { Provider } from "./types";
import { useVault } from "./vault";

export async function dealRandomFloor(
  limits: { exchanges: number; budget: number; speed: number; minutes: number },
  providers?: Provider[],
): Promise<string> {
  useVault.getState().setVoiceOn(true);
  const list = providers ?? (await getProviders());
  const keys = useVault.getState().keys;
  const [providerA, providerB] = pickSides(list, keys);
  const topic = TOPIC_PRESETS[Math.floor(Math.random() * TOPIC_PRESETS.length)] ?? TOPIC_PRESETS[0]!;
  const draftA = randomCharacter();
  const draftB = opposeCharacter(draftA);
  draftA.voiceProvider = "house";
  draftB.voiceProvider = "house";
  if (draftB.voiceId === draftA.voiceId) {
    draftB.voiceId = HOUSE_VOICES.find((voice) => voice.id !== draftA.voiceId)?.id ?? "ara";
  }
  const [characterA, characterB] = await Promise.all([
    saveCharacterFn({ data: draftA }),
    saveCharacterFn({ data: draftB }),
  ]);
  let design = null;
  try {
    design = await stageShowdownFn({
      data: {
        topic,
        mode: "debate",
        a: {
          name: characterA.name,
          role: characterA.role,
          perspective: characterA.perspective,
          objective: characterA.objective,
        },
        b: {
          name: characterB.name,
          role: characterB.role,
          perspective: characterB.perspective,
          objective: characterB.objective,
        },
      },
    });
  } catch {
    design = null;
  }
  const session = await createSessionFn({
    data: {
      topic,
      mode: "debate",
      title: design?.title,
      agentA: toSnapshot(characterA, providerA),
      agentB: toSnapshot(characterB, providerB),
      maxExchanges: limits.exchanges,
      tokenBudget: limits.budget,
      speedMs: limits.speed,
      maxMinutes: limits.minutes,
      allowConclusion: true,
      isPublic: true,
      design,
    },
  });
  void dressSessionFn({ data: { id: session.id } }).catch(() => {});
  return session.id;
}

function pickSides(providers: Provider[], keys: Record<string, string>): [Provider, Provider] {
  const house = providers.find((provider) => provider.kind === "house" || provider.id === HOUSE_ID);
  const keyed = providers.filter((provider) => provider.kind !== "house" && keys[provider.id]);
  const pool = keyed.length >= 2 ? keyed : house ? [house, ...keyed] : keyed;
  if (!pool.length || !pool[0]) throw new Error("No model is ready. The house director should always be available.");
  const first = pool[Math.floor(Math.random() * pool.length)] ?? pool[0];
  const others = pool.filter((provider) => provider.id !== first.id);
  const second = others.length ? (others[Math.floor(Math.random() * others.length)] ?? first) : first;
  return Math.random() < 0.5 ? [first, second] : [second, first];
}
