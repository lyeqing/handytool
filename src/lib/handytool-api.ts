import type {
  ObjectDefinition,
  ObjectRecord,
  ValidationErrorResponse,
} from "./handytool-types";

/**
 * Server-side client for the handytool-api backend.
 *
 * Everything here runs on the Next.js server (Server Components and Server Actions), so the browser
 * never talks to the .NET API directly. That keeps the ownership header off the client and means the
 * API needs no CORS configuration.
 */

const API_URL = process.env.HANDYTOOL_API_URL ?? "http://localhost:5292";

/** Placeholder ownership until the API has real authentication - see Security/CurrentOwner.cs. */
const OWNER_ID = process.env.HANDYTOOL_OWNER_ID ?? "25";

export type ApiResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      status: number;
      message: string;
      /** Present when the API returned its structured validation envelope. */
      problem: ValidationErrorResponse | null;
    };

async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<ApiResult<T>> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        "X-Owner-Id": OWNER_ID,
        ...init?.headers,
      },
      cache: "no-store",
    });
  } catch (error) {
    return {
      ok: false,
      status: 0,
      message: `Could not reach the API at ${API_URL}. Start it with "dotnet run" in the handytool-api project. (${
        error instanceof Error ? error.message : String(error)
      })`,
      problem: null,
    };
  }

  if (response.status === 204) {
    return { ok: true, data: undefined as T };
  }

  const body = await response.text();

  if (response.ok) {
    return { ok: true, data: (body ? JSON.parse(body) : undefined) as T };
  }

  let problem: ValidationErrorResponse | null = null;
  try {
    const parsed = JSON.parse(body);
    if (parsed && Array.isArray(parsed.errors)) {
      problem = parsed as ValidationErrorResponse;
    }
  } catch {
    // Not JSON - fall through to the raw message.
  }

  return {
    ok: false,
    status: response.status,
    message: problem?.title ?? summarise(body, response.status),
    problem,
  };
}

/**
 * A 500 in Development returns the whole developer exception page. Its first line names the real
 * cause (a bad connection string, usually), which is worth showing - the stack trace that follows
 * is not, and belongs in the API's own console.
 */
function summarise(body: string, status: number): string {
  const firstLine = body.split("\n")[0].trim();

  if (!firstLine || firstLine.startsWith("<")) {
    return `The API returned ${status}.`;
  }

  const trimmed =
    firstLine.length > 200 ? `${firstLine.slice(0, 200)}…` : firstLine;

  return status >= 500
    ? `${trimmed} (full detail in the handytool-api console)`
    : trimmed;
}

export function listDefinitions(): Promise<ApiResult<ObjectDefinition[]>> {
  return request<ObjectDefinition[]>("/api/object-definitions");
}

export function getDefinition(
  id: number,
): Promise<ApiResult<ObjectDefinition>> {
  return request<ObjectDefinition>(`/api/object-definitions/${id}`);
}

export function createDefinition(
  payload: unknown,
): Promise<ApiResult<ObjectDefinition>> {
  return request<ObjectDefinition>("/api/object-definitions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function createRecord(
  definitionId: number,
  payload: unknown,
): Promise<ApiResult<ObjectRecord>> {
  return request<ObjectRecord>(
    `/api/object-definitions/${definitionId}/records`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}
