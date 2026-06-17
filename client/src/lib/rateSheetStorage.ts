const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || "")
  .replace(/\/rest\/v1\/?$/, "")
  .replace(/\/+$/, "");
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const STATE_KEY = "rate-sheet";

const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

type StoredRateSheet = {
  data: unknown | null;
  updatedAt: string | null;
};

function supabaseHeaders() {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
  };
}

async function loadFromSupabase(): Promise<StoredRateSheet> {
  const params = new URLSearchParams({
    key: `eq.${STATE_KEY}`,
    select: "payload,updated_at",
    limit: "1",
  });

  const res = await fetch(`${SUPABASE_URL}/rest/v1/app_state?${params}`, {
    headers: supabaseHeaders(),
  });

  if (!res.ok) throw new Error(`Erro ${res.status} ao carregar Supabase`);

  const rows = await res.json() as Array<{ payload: unknown; updated_at: string }>;
  const row = rows[0];

  return {
    data: row?.payload ?? null,
    updatedAt: row?.updated_at ?? null,
  };
}

async function saveToSupabase(data: unknown): Promise<StoredRateSheet> {
  const updatedAt = new Date().toISOString();

  const res = await fetch(`${SUPABASE_URL}/rest/v1/app_state`, {
    method: "POST",
    headers: {
      ...supabaseHeaders(),
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify({
      key: STATE_KEY,
      payload: data,
      updated_at: updatedAt,
    }),
  });

  if (!res.ok) throw new Error(`Erro ${res.status} ao salvar Supabase`);

  return {
    data,
    updatedAt,
  };
}

async function loadFromLocalApi(): Promise<StoredRateSheet> {
  const res = await fetch("/api/rate-sheet");
  if (!res.ok) throw new Error(`Erro ${res.status} ao carregar banco local`);

  const body = await res.json() as { data?: unknown | null; updatedAt?: string | null };

  return {
    data: body.data ?? null,
    updatedAt: body.updatedAt ?? null,
  };
}

async function saveToLocalApi(data: unknown): Promise<StoredRateSheet> {
  const res = await fetch("/api/rate-sheet", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error(`Erro ${res.status} ao salvar banco local`);

  const body = await res.json() as { data?: unknown | null; updatedAt?: string | null };

  return {
    data: body.data ?? data,
    updatedAt: body.updatedAt ?? null,
  };
}

export function getStorageMode() {
  return hasSupabase ? "supabase" : "local-api";
}

export function loadRateSheetData() {
  return hasSupabase ? loadFromSupabase() : loadFromLocalApi();
}

export function saveRateSheetData(data: unknown) {
  return hasSupabase ? saveToSupabase(data) : saveToLocalApi(data);
}
