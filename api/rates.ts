import { loadState, requireAgentAuth, saveState, sendError } from "./_state";

function numberOrUndefined(value: unknown) {
  if (value === undefined) return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error("Valor numerico invalido.");
  return parsed;
}

function flattenRates(state: any, filters: { unit?: string; season?: string }) {
  const seasons = state.seasons || [];
  const seasonName = (id: string) => seasons.find((s: any) => s.id === id)?.name || id;

  return (state.units || [])
    .filter((unit: any) => !filters.unit || unit.id === filters.unit)
    .flatMap((unit: any) => (unit.rows || [])
      .filter((row: any) => !filters.season || row.s === filters.season)
      .map((row: any) => ({
        unitId: unit.id,
        unitName: unit.name,
        group: unit.g,
        floor: unit.floor,
        seasonId: row.s,
        seasonName: seasonName(row.s),
        minStay: row.ms,
        net: row.net,
        discountPercent: row.disc,
        authorization: row.auth,
      })));
}

export default async function handler(req: any, res: any) {
  if (!requireAgentAuth(req, res)) return;

  try {
    const state = await loadState();

    if (req.method === "GET") {
      res.status(200).json({
        data: flattenRates(state, {
          unit: typeof req.query.unit === "string" ? req.query.unit : undefined,
          season: typeof req.query.season === "string" ? req.query.season : undefined,
        }),
      });
      return;
    }

    if (req.method === "PATCH") {
      const { unitId, seasonId, floor, net, minStay, discountPercent, authorization } = req.body || {};
      if (!unitId) throw new Error("Informe unitId.");

      const unit = (state.units || []).find((item: any) => item.id === unitId);
      if (!unit) throw new Error(`Unidade nao encontrada: ${unitId}`);

      const nextFloor = numberOrUndefined(floor);
      if (nextFloor !== undefined) unit.floor = nextFloor;

      if (seasonId) {
        const row = (unit.rows || []).find((item: any) => item.s === seasonId);
        if (!row) throw new Error(`Temporada nao encontrada na unidade: ${seasonId}`);

        const nextNet = numberOrUndefined(net);
        const nextDiscount = numberOrUndefined(discountPercent);
        if (nextNet !== undefined) row.net = nextNet;
        if (nextDiscount !== undefined) row.disc = nextDiscount;
        if (minStay !== undefined) row.ms = String(minStay);
        if (authorization !== undefined) row.auth = String(authorization);
      }

      await saveState(state);
      res.status(200).json({ data: flattenRates(state, { unit: unitId, season: seasonId }) });
      return;
    }

    res.setHeader("Allow", "GET, PATCH");
    res.status(405).json({ error: "Metodo nao permitido." });
  } catch (error) {
    sendError(res, error);
  }
}