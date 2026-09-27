import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => ((m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry)),
    );
  }
  return serverEntryPromise;
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}

// Dev-only startup guard: the preview dev server sometimes spawns before the
// platform injects backend env vars. A process can't receive env after start,
// so exit non-zero and let the supervisor respawn it with the vars present.
let envChecked = false;
async function ensureServerEnv(): Promise<Response | null> {
  if (envChecked || process.env.NODE_ENV === "production") return null;
  const missing = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"].filter((k) => !process.env[k]);
  if (missing.length === 0) {
    envChecked = true;
    return null;
  }
  const marker = "/tmp/.startup-guard";
  try {
    const fs = await import("node:fs");
    const last = fs.existsSync(marker) ? Number(fs.readFileSync(marker, "utf8")) : 0;
    if (Date.now() - last < 60_000) {
      console.error(`[startup-guard] faltan variables: ${missing.join(", ")} (reinicio ya intentado hace <60s, no se reintenta)`);
      envChecked = true;
      return null;
    }
    fs.writeFileSync(marker, String(Date.now()));
  } catch {
    return null;
  }
  console.error(`[startup-guard] faltan variables: ${missing.join(", ")} — reiniciando proceso`);
  setTimeout(() => process.exit(1), 200);
  return new Response("El servidor se está reiniciando. Reintentá en unos segundos.", {
    status: 503,
    headers: { "content-type": "text/plain; charset=utf-8", "retry-after": "5" },
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const guard = await ensureServerEnv();
      if (guard) return guard;
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return brandedErrorResponse();
    }
  },
};
