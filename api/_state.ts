const STATE_KEY = "rate-sheet";

export type AppState = Record<string, any>;

export const DEFAULT_COMPETITORS = {
  A: {
    label: "Grupo A - Vilas Lion & Panhard (Booking.com 2026)",
    note: "* Villa Mandi inclui servicos completos justificando preco superior.",
    rows: [
      { name: "Vila Alala Jeri", v: [2288, 1741, 1857, 2263, 3598, 3830, 3646, 3819, 3646, 3646] },
      { name: "Villa Odara", v: [2595, 2595, 2595, 2595, 6095, 6795, 6095, 3995, 3995, 5500] },
      { name: "Casa Jerian", v: [null, null, 6900, 6900, 7500, 8100, 6900, 6900, 6900, 6900] },
      { name: "Villa Florens", v: [null, null, 7500, 7500, null, 4986, 4986, 4986, 4986, 4986] },
      { name: "*Villa Mandi", v: [10400, 11600, 10530, 10530, 13500, 13500, 15720, 15720, 15720, 15720] },
    ],
  },
  B: {
    label: "Grupo B - Vilas Niros & Ventana (Booking.com 2026)",
    note: "Precos por noite (vila completa).",
    rows: [
      { name: "Villa Alegria - La Villa Grp", v: [5223, 5223, 5223, 5223, 8705, 8705, 6499, 5223, 5223, 5223] },
      { name: "Villa Messina Jeri", v: [2200, 1500, 1500, 1915, 3073, 3500, 2700, 2700, 2700, 2700] },
      { name: "Villa Luz do Mar", v: [2123, 2256, 2256, 2628, null, null, 3353, null, null, null] },
      { name: "Vila Jehol", v: [null, null, null, 2000, 4000, null, null, 4400, 4400, 5000] },
    ],
  },
  C: {
    label: "Grupo C - Suites (Booking.com 2026)",
    note: "Superior = nivel Master. Inferior = nivel Deluxe.",
    rows: [
      { name: "Villa Mango Jeri (Master)", v: [null, 669, 713, 713, 968, 1320, null, null, null, null] },
      { name: "Villa Nautica (Master)", v: [648, 683, 648, 702, 918, 1026, 810, 810, 810, 810] },
      { name: "Cafe Jeri Hotel (Master)", v: [659, 726, 674, 726, 726, 1112, 978, 978, 978, 978] },
      { name: "Villa Tapi (Master)", v: [753, 753, 762, 782, 869, 1265, 975, 975, 975, 975] },
      { name: "Vila Kalango (Deluxe)", v: [1258, 1258, 1258, 1258, 2484, null, 2484, 2484, 2484, 2484] },
      { name: "Villa Florens (Deluxe)", v: [900, 900, 900, 1296, 1022, null, 900, 900, 900, 900] },
      { name: "*Villa Mandi (Deluxe)", v: [2600, 2900, 2633, 2633, 3375, null, 3930, 3930, 3930, 3930] },
    ],
  },
  D: {
    label: "Grupo D - Apartamentos (Booking.com 2026)",
    note: "Produto raro - raridade justifica precificacao confiante.",
    rows: [
      { name: "CasaLo Hotel", v: [483, 483, 483, 483, 544, 877, null, null, 727, 727] },
      { name: "Blue Residence", v: [590, 590, 590, 590, 1089, 1089, null, null, null, null] },
    ],
  },
};

export const COMPETITOR_MONTHS = ["Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function normalizeUrl(value: string) {
  return value.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
}

function getSupabaseConfig() {
  const url = normalizeUrl(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
  if (!url || !key) throw new Error("SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY precisam estar configurados na Vercel.");
  return { url, key };
}

function headers(key: string) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}

export function requireAgentAuth(req: any, res: any) {
  const expected = process.env.AGENT_API_KEY || "";
  if (!expected) {
    res.status(500).json({ error: "AGENT_API_KEY nao configurada na Vercel." });
    return false;
  }

  if (req.headers.authorization !== `Bearer ${expected}`) {
    res.status(401).json({ error: "Nao autorizado." });
    return false;
  }

  return true;
}

export async function loadState(): Promise<AppState> {
  const { url, key } = getSupabaseConfig();
  const params = new URLSearchParams({ key: `eq.${STATE_KEY}`, select: "payload", limit: "1" });
  const response = await fetch(`${url}/rest/v1/app_state?${params}`, { headers: headers(key) });

  if (!response.ok) throw new Error(`Erro ${response.status} ao carregar estado.`);

  const rows = await response.json() as Array<{ payload?: AppState }>;
  return rows[0]?.payload || {};
}

export async function saveState(payload: AppState) {
  const { url, key } = getSupabaseConfig();
  const response = await fetch(`${url}/rest/v1/app_state`, {
    method: "POST",
    headers: {
      ...headers(key),
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify({
      key: STATE_KEY,
      payload,
      updated_at: new Date().toISOString(),
    }),
  });

  if (!response.ok) throw new Error(`Erro ${response.status} ao salvar estado.`);
  return payload;
}

export function sendError(res: any, error: unknown) {
  const message = error instanceof Error ? error.message : "Erro inesperado.";
  res.status(500).json({ error: message });
}