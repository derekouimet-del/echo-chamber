import { createServerFn } from "@tanstack/react-start";
import type {
  CharacterDraft,
  CreateSessionInput,
  MemoryKind,
  ProviderDraft,
  ProviderKind,
  SessionStatus,
  SetupDraft,
  StageDesign,
} from "./types";

export const getDashboard = createServerFn({ method: "GET" }).handler(async () => {
  const { dashboard } = await import("./store.server");
  return dashboard();
});

export const getProviders = createServerFn({ method: "GET" }).handler(async () => {
  const { listProviders } = await import("./store.server");
  return listProviders();
});

export const saveProviderFn = createServerFn({ method: "POST" })
  .validator((input: ProviderDraft) => {
    if (!input?.id || !input.kind) throw new Error("Provider is incomplete.");
    return input;
  })
  .handler(async ({ data }) => {
    const { saveProvider } = await import("./store.server");
    return saveProvider(data);
  });

export const deleteProviderFn = createServerFn({ method: "POST" })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const { deleteProvider } = await import("./store.server");
    await deleteProvider(data.id);
    return { ok: true as const };
  });

export const testProviderFn = createServerFn({ method: "POST" })
  .validator(
    (input: {
      kind: ProviderKind;
      baseUrl: string;
      model: string;
      apiKey?: string;
      temperature?: number;
      maxTokens?: number;
    }) => input,
  )
  .handler(async ({ data }) => {
    const { completeChat } = await import("./llm.server");
    const result = await completeChat({
      kind: data.kind,
      baseUrl: data.baseUrl,
      model: data.model,
      apiKey: data.apiKey,
      temperature: data.temperature ?? 0,
      maxTokens: Math.min(data.maxTokens ?? 32, 32),
      messages: [
        { role: "system", content: "Reply with exactly the word PONG and nothing else." },
        { role: "user", content: "Ping." },
      ],
    });
    return { ok: true as const, text: result.text.slice(0, 80) };
  });

export const getCharacters = createServerFn({ method: "GET" }).handler(async () => {
  const { listCharacters } = await import("./store.server");
  return listCharacters();
});

export const saveCharacterFn = createServerFn({ method: "POST" })
  .validator((input: CharacterDraft & { favorite?: boolean }) => {
    if (!input?.id) throw new Error("Missing character id.");
    if (!input.name?.trim()) throw new Error("A character needs a name.");
    return input;
  })
  .handler(async ({ data }) => {
    const { saveCharacter } = await import("./store.server");
    return saveCharacter(data);
  });

export const deleteCharacterFn = createServerFn({ method: "POST" })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const { deleteCharacter } = await import("./store.server");
    await deleteCharacter(data.id);
    return { ok: true as const };
  });

export const restoreTemplatesFn = createServerFn({ method: "POST" }).handler(async () => {
  const { restoreTemplates } = await import("./store.server");
  return restoreTemplates();
});

export const authorCharacterFn = createServerFn({ method: "POST" })
  .validator(
    (input: { mode: "fresh" | "oppose" | "complement"; brief?: string; seed?: Partial<CharacterDraft> }) =>
      input,
  )
  .handler(async ({ data }) => {
    const { authorPersona } = await import("./director.server");
    return authorPersona(data);
  });

export const paintPortraitFn = createServerFn({ method: "POST" })
  .validator((input: { characterId: string }) => input)
  .handler(async ({ data }) => {
    const { paintPortrait } = await import("./director.server");
    return paintPortrait(data.characterId);
  });

export const stageShowdownFn = createServerFn({ method: "POST" })
  .validator(
    (input: {
      topic: string;
      mode: string;
      a: { name: string; role: string; perspective: string; objective: string };
      b: { name: string; role: string; perspective: string; objective: string };
    }) => {
      if (!input?.topic?.trim()) throw new Error("Add a topic before the director stages it.");
      return input;
    },
  )
  .handler(async ({ data }) => {
    const { stageShowdown } = await import("./director.server");
    return stageShowdown(data);
  });

export const paintBackdropFn = createServerFn({ method: "POST" })
  .validator((input: { design: StageDesign; topic: string }) => input)
  .handler(async ({ data }) => {
    const { paintBackdrop } = await import("./director.server");
    const url = await paintBackdrop(data.design, data.topic);
    return { url };
  });

export const dressSessionFn = createServerFn({ method: "POST" })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const { dressSession } = await import("./director.server");
    return dressSession(data.id);
  });

export const getMemories = createServerFn({ method: "POST" })
  .validator((input: { characterId: string }) => input)
  .handler(async ({ data }) => {
    const { listMemories } = await import("./store.server");
    return listMemories(data.characterId);
  });

export const addMemoryFn = createServerFn({ method: "POST" })
  .validator((input: { characterId: string; kind: MemoryKind; content: string }) => input)
  .handler(async ({ data }) => {
    const { addMemory } = await import("./store.server");
    return addMemory(data);
  });

export const deleteMemoryFn = createServerFn({ method: "POST" })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const { deleteMemory } = await import("./store.server");
    await deleteMemory(data.id);
    return { ok: true as const };
  });

export const clearMemoriesFn = createServerFn({ method: "POST" })
  .validator((input: { characterId: string }) => input)
  .handler(async ({ data }) => {
    const { clearMemories } = await import("./store.server");
    await clearMemories(data.characterId);
    return { ok: true as const };
  });

export const getSetupData = createServerFn({ method: "GET" }).handler(async () => {
  const { listCharacters, listProviders, listSetups } = await import("./store.server");
  const [characters, providers, setups] = await Promise.all([listCharacters(), listProviders(), listSetups()]);
  return { characters, providers, setups };
});

export const createSessionFn = createServerFn({ method: "POST" })
  .validator((input: CreateSessionInput) => {
    if (!input?.topic?.trim()) throw new Error("A topic is required.");
    return input;
  })
  .handler(async ({ data }) => {
    const { createSession } = await import("./store.server");
    return createSession(data);
  });

export const getSessionBundle = createServerFn({ method: "POST" })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const { getMessages, getSession } = await import("./store.server");
    const session = await getSession(data.id);
    if (!session) throw new Error("That session is not on the floor.");
    const messages = await getMessages(data.id);
    return { session, messages };
  });

export const listSessionsFn = createServerFn({ method: "GET" }).handler(async () => {
  const { listSessions } = await import("./store.server");
  return listSessions();
});

export const setStatusFn = createServerFn({ method: "POST" })
  .validator((input: { id: string; status: SessionStatus }) => input)
  .handler(async ({ data }) => {
    const { setStatus } = await import("./store.server");
    return setStatus(data.id, data.status);
  });

export const deleteSessionFn = createServerFn({ method: "POST" })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const { deleteSession } = await import("./store.server");
    await deleteSession(data.id);
    return { ok: true as const };
  });

export const interveneFn = createServerFn({ method: "POST" })
  .validator((input: { sessionId: string; note: string }) => {
    if (!input.note?.trim()) throw new Error("Write a note for the floor.");
    return input;
  })
  .handler(async ({ data }) => {
    const { addMessage } = await import("./store.server");
    return addMessage(data.sessionId, "director", data.note.trim().slice(0, 2000));
  });

export const advanceTurnFn = createServerFn({ method: "POST" })
  .validator((input: { sessionId: string; keys?: Record<string, string> }) => input)
  .handler(async ({ data }) => {
    const { executeTurn } = await import("./turn.server");
    return executeTurn(data, () => undefined);
  });

export const analyzeFn = createServerFn({ method: "POST" })
  .validator((input: { sessionId: string }) => input)
  .handler(async ({ data }) => {
    const { analyzeSession } = await import("./director.server");
    return analyzeSession(data.sessionId);
  });

export const distillFn = createServerFn({ method: "POST" })
  .validator((input: { sessionId: string }) => input)
  .handler(async ({ data }) => {
    const { distillSession } = await import("./director.server");
    return distillSession(data.sessionId);
  });

export const houseStatusFn = createServerFn({ method: "GET" }).handler(async () => {
  return { available: Boolean(process.env.XAI_API_KEY) };
});

export const getBoardFn = createServerFn({ method: "GET" }).handler(async () => {
  const { listBoard } = await import("./store.server");
  return listBoard();
});

export const rematchFn = createServerFn({ method: "POST" })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const { rematchSession } = await import("./store.server");
    return rematchSession(data.id);
  });

export const saveSetupFn = createServerFn({ method: "POST" })
  .validator((input: SetupDraft) => {
    if (!input?.name?.trim()) throw new Error("Name the card before saving it.");
    return input;
  })
  .handler(async ({ data }) => {
    const { saveSetup } = await import("./store.server");
    return saveSetup(data);
  });

export const deleteSetupFn = createServerFn({ method: "POST" })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const { deleteSetup } = await import("./store.server");
    await deleteSetup(data.id);
    return { ok: true as const };
  });

export const getCompareFn = createServerFn({ method: "POST" })
  .validator((input: { a?: string; b?: string }) => input ?? {})
  .handler(async ({ data }) => {
    const { getMessages, getSession, listSessions } = await import("./store.server");
    const sessions = await listSessions();
    async function pack(id?: string) {
      if (!id) return null;
      const session = await getSession(id);
      if (!session) return null;
      const messages = await getMessages(id);
      return { session, messages };
    }
    const [left, right] = await Promise.all([pack(data.a), pack(data.b)]);
    return { sessions, left, right };
  });
