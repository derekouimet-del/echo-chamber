export const MODES = [
  "debate",
  "negotiation",
  "collaboration",
  "adversarial",
  "creative",
  "freeform",
] as const;

export type Mode = (typeof MODES)[number];

export const PROVIDER_KINDS = [
  "house",
  "openai",
  "anthropic",
  "openrouter",
  "huggingface",
  "custom",
] as const;

export type ProviderKind = (typeof PROVIDER_KINDS)[number];

export type VoiceProvider = "none" | "house" | "elevenlabs" | "openai";

export type SessionStatus =
  | "draft"
  | "live"
  | "thinking"
  | "paused"
  | "completed"
  | "failed";

export type AgentSpeaker = "a" | "b" | "c" | "d";
export type Speaker = AgentSpeaker | "director" | "system" | "user";

export type Provider = {
  id: string;
  name: string;
  kind: ProviderKind;
  baseUrl: string;
  model: string;
  temperature: number;
  maxTokens: number;
  contextTurns: number;
  extra: string;
  locked: boolean;
  createdAt: string;
};

export type Character = {
  id: string;
  name: string;
  role: string;
  personality: string;
  perspective: string;
  style: string;
  background: string;
  emotion: string;
  domains: string;
  motivation: string;
  objective: string;
  constraints: string;
  voiceProvider: VoiceProvider;
  voiceId: string;
  favorite: boolean;
  template: boolean;
  portraitUrl: string | null;
  createdAt: string;
};

export type CharacterDraft = Omit<Character, "createdAt" | "portraitUrl" | "template" | "favorite"> & {
  favorite?: boolean;
  template?: boolean;
  portraitUrl?: string | null;
};

export type ProviderDraft = Omit<Provider, "createdAt" | "locked"> & { locked?: boolean };

export type AgentProvider = {
  id: string;
  name: string;
  kind: ProviderKind;
  baseUrl: string;
  model: string;
  temperature: number;
  maxTokens: number;
  contextTurns: number;
  extra: string;
};

export type AgentSnapshot = {
  characterId: string;
  name: string;
  role: string;
  personality: string;
  perspective: string;
  style: string;
  background: string;
  emotion: string;
  domains: string;
  motivation: string;
  objective: string;
  constraints: string;
  extra: string;
  voiceProvider: VoiceProvider;
  voiceId: string;
  portraitUrl: string | null;
  provider: AgentProvider;
};

export type StageDesign = {
  title: string;
  stakes: string;
  coldOpen: string;
  visualMotif: string;
  aEntrance: string;
  bEntrance: string;
  backdropUrl?: string | null;
};

export type Session = {
  id: string;
  title: string;
  topic: string;
  mode: Mode;
  status: SessionStatus;
  agentA: AgentSnapshot;
  agentB: AgentSnapshot;
  agents: AgentSnapshot[];
  maxExchanges: number;
  tokenBudget: number;
  tokensUsed: number;
  speedMs: number;
  maxMinutes: number;
  elapsedMs: number;
  resumedAt: string | null;
  allowConclusion: boolean;
  isPublic: boolean;
  summary: string | null;
  agreements: string | null;
  disagreements: string | null;
  conclusion: string | null;
  design: StageDesign | null;
  exchangeCount: number;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TurnMessage = {
  id: string;
  sessionId: string;
  speaker: Speaker;
  content: string;
  tokens: number;
  createdAt: string;
};

export type MemoryKind = "long" | "short" | "session";

export type Memory = {
  id: string;
  characterId: string;
  kind: MemoryKind;
  content: string;
  sessionId: string | null;
  createdAt: string;
};

export type CreateSessionInput = {
  topic: string;
  mode: Mode;
  title?: string;
  agentA: AgentSnapshot;
  agentB: AgentSnapshot;
  agents?: AgentSnapshot[];
  maxExchanges: number;
  tokenBudget: number;
  speedMs: number;
  maxMinutes: number;
  allowConclusion: boolean;
  isPublic: boolean;
  design: StageDesign | null;
};

export type Setup = {
  id: string;
  name: string;
  topic: string;
  mode: Mode;
  characterA: string;
  characterB: string;
  providerA: string;
  providerB: string;
  extraA: string;
  extraB: string;
  maxExchanges: number;
  tokenBudget: number;
  speedMs: number;
  maxMinutes: number;
  allowConclusion: boolean;
  isPublic: boolean;
  createdAt: string;
};

export type SetupDraft = Omit<Setup, "createdAt">;

export type TurnResult = {
  stop: boolean;
  reason: string | null;
  message: TurnMessage | null;
  session: Session | null;
  error?: string;
};
