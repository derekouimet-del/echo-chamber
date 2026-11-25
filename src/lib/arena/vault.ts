import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type Vault = {
  keys: Record<string, string>;
  elevenKey: string;
  openaiTtsKey: string;
  voiceOn: boolean;
  defaultExchanges: number;
  defaultBudget: number;
  defaultSpeed: number;
  defaultMinutes: number;
  setKey: (id: string, key: string) => void;
  removeKey: (id: string) => void;
  setElevenKey: (key: string) => void;
  setOpenaiTtsKey: (key: string) => void;
  setVoiceOn: (on: boolean) => void;
  setDefaults: (
    patch: Partial<Pick<Vault, "defaultExchanges" | "defaultBudget" | "defaultSpeed" | "defaultMinutes">>,
  ) => void;
};

export const useVault = create<Vault>()(
  persist(
    (set) => ({
      keys: {},
      elevenKey: "",
      openaiTtsKey: "",
      voiceOn: true,
      defaultExchanges: 8,
      defaultBudget: 12000,
      defaultSpeed: 900,
      defaultMinutes: 20,
      setKey: (id, key) =>
        set((s) => ({ keys: { ...s.keys, [id]: key } })),
      removeKey: (id) =>
        set((s) => {
          const keys = { ...s.keys };
          delete keys[id];
          return { keys };
        }),
      setElevenKey: (elevenKey) => set({ elevenKey }),
      setOpenaiTtsKey: (openaiTtsKey) => set({ openaiTtsKey }),
      setVoiceOn: (voiceOn) => set({ voiceOn }),
      setDefaults: (patch) => set(patch),
    }),
    {
      name: "dyad-vault",
      merge: (persisted, current) => {
        const saved = persisted as Partial<Vault>;
        return { ...current, ...saved, voiceOn: saved.voiceOn ?? true };
      },
    },
  ),
);

export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    if (useVault.persist.hasHydrated()) setHydrated(true);
    return useVault.persist.onFinishHydration(() => setHydrated(true));
  }, []);
  return hydrated;
}
