import type { IncomingMessage, ServerResponse } from "node:http";
import { getRateSheetState, saveRateSheetState } from "./rateSheetStore";

type NextFn = (err?: unknown) => void;

function sendJson(res: ServerResponse, statusCode: number, body: unknown) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

function readRequestBody(req: IncomingMessage) {
  return new Promise<string>((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

export async function handleRateSheetApi(
  req: IncomingMessage,
  res: ServerResponse,
  next?: NextFn,
) {
  const pathname = new URL(req.url || "/", "http://localhost").pathname;

  if (pathname !== "/api/rate-sheet") {
    next?.();
    return false;
  }

  try {
    if (req.method === "GET") {
      sendJson(res, 200, getRateSheetState());
      return true;
    }

    if (req.method === "PUT" || req.method === "POST") {
      const body = await readRequestBody(req);
      const payload = body ? JSON.parse(body) : null;

      sendJson(res, 200, saveRateSheetState(payload));
      return true;
    }

    res.writeHead(405, { Allow: "GET, PUT, POST" });
    res.end();
    return true;
  } catch (error) {
    sendJson(res, 400, {
      error: error instanceof Error ? error.message : "Invalid request.",
    });
    return true;
  }
}

