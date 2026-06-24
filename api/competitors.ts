import { COMPETITOR_MONTHS, DEFAULT_COMPETITORS, loadState, requireAgentAuth, saveState, sendError } from "./_state";

function getMonthIndex(month: unknown) {
  if (typeof month === "number") {
    if (month < 0 || month >= COMPETITOR_MONTHS.length) throw new Error("Mes invalido.");
    return month;
  }

  if (typeof month === "string") {
    const numeric = Number(month);
    if (Number.isInteger(numeric) && numeric >= 0 && numeric < COMPETITOR_MONTHS.length) return numeric;

    const normalized = month.trim().toLowerCase();
    const idx = COMPETITOR_MONTHS.findIndex((item) => item.toLowerCase() === normalized);
    if (idx >= 0) return idx;
  }

  throw new Error("Informe month como indice 0-9 ou nome: Mar, Abr, Mai, Jun, Jul, Ago, Set, Out, Nov, Dez.");
}

function getCompetitors(state: any) {
  if (!state.competitors) state.competitors = DEFAULT_COMPETITORS;
  return state.competitors;
}

export default async function handler(req: any, res: any) {
  if (!requireAgentAuth(req, res)) return;

  try {
    const state = await loadState();
    const competitors = getCompetitors(state);

    if (req.method === "GET") {
      const group = typeof req.query.group === "string" ? req.query.group : undefined;
      res.status(200).json({
        months: COMPETITOR_MONTHS,
        data: group ? competitors[group] : competitors,
      });
      return;
    }

    if (req.method === "PATCH") {
      const { group, competitor, competitorIndex, month, value } = req.body || {};
      if (!group || !competitors[group]) throw new Error("Grupo invalido. Use A, B, C ou D.");

      const rows = competitors[group].rows || [];
      let rowIndex = typeof competitorIndex === "number" ? competitorIndex : -1;
      if (rowIndex < 0 && typeof competitor === "string") {
        rowIndex = rows.findIndex((row: any) => row.name === competitor);
      }
      if (rowIndex < 0 || !rows[rowIndex]) throw new Error("Concorrente nao encontrado.");

      const monthIndex = getMonthIndex(month);
      const nextValue = value === null || value === "" ? null : Number(value);
      if (nextValue !== null && !Number.isFinite(nextValue)) throw new Error("Valor invalido.");

      rows[rowIndex].v[monthIndex] = nextValue;
      await saveState(state);

      res.status(200).json({
        months: COMPETITOR_MONTHS,
        data: competitors[group].rows[rowIndex],
      });
      return;
    }

    res.setHeader("Allow", "GET, PATCH");
    res.status(405).json({ error: "Metodo nao permitido." });
  } catch (error) {
    sendError(res, error);
  }
}