import type { RegistrationPayload } from "./registration-types";
import "server-only";
import { cache } from "react";
import type { HomeData } from "./home-types";
import { cookies } from "next/headers";
import type {
  ObjectDefinition,
  ObjectRecord,
  ValidationErrorResponse,
} from "./handytool-types";

/**
 * Server-side client for the handytool-api backend.
 *
 * Everything here runs on the Next.js server (Server Components and Server Actions). It uses an
 * absolute URL because server code has no origin to be relative to - the browser's same-origin
 * /api/* path only applies to calls the browser makes itself.
 *
 * Authentication rides on the request's own cookies. The session token is HttpOnly, so this is the
 * only place that can see it: page scripts cannot read it, and it never has to be handed to the
 * browser in a form JavaScript could steal.
 */

const API_URL = process.env.HANDYTOOL_API_URL ?? "http://localhost:5292";

export type ApiResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      status: number;
      message: string;
      /** Present when the API returned its structured validation envelope. */
      problem: ValidationErrorResponse | null;
    };

/**
 * Passes the caller's session and visitor cookies through to the API.
 *
 * Without this a server-rendered page would reach the API anonymous, and every request would come
 * back 401 even though the person is signed in.
 */
async function forwardedCookies(): Promise<Record<string, string>> {
  const store = await cookies();

  const forwarded = ["session_token", "visitor_id", "handytool_trial"]
    .map((name) => {
      const value = store.get(name)?.value;
      return value ? `${name}=${value}` : null;
    })
    .filter((pair): pair is string => pair !== null);

  return forwarded.length > 0 ? { Cookie: forwarded.join("; ") } : {};
}

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
        ...(await forwardedCookies()),
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

  if (init?.method && init.method !== "GET") await relayCookies(response);

  if (response.status === 401) {
    return {
      ok: false,
      status: 401,
      message: "Sign in to see this.",
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
  let problemTitle: string | null = null;
  try {
    const parsed = JSON.parse(body);
    if (typeof parsed?.title === "string") problemTitle = parsed.title;
    if (parsed && Array.isArray(parsed.errors)) {
      problem = parsed as ValidationErrorResponse;
    }
  } catch {
    // Not JSON - fall through to the raw message.
  }

  return {
    ok: false,
    status: response.status,
    message: problem?.title ?? problemTitle ?? summarise(body, response.status),
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

/**
 * The API resolves every label into one language before returning it, so the caller never deals with
 * translation maps. Passing the locale explicitly beats letting it fall back to Accept-Language:
 * these calls come from the Next server, whose header is not the reader's.
 */
export function listDefinitions(
  language?: string,
): Promise<ApiResult<ObjectDefinition[]>> {
  return request<ObjectDefinition[]>(withLanguage("/api/object-definitions", language));
}

export function getDefinition(
  id: number,
  language?: string,
): Promise<ApiResult<ObjectDefinition>> {
  return request<ObjectDefinition>(
    withLanguage(`/api/object-definitions/${id}`, language),
  );
}

function withLanguage(path: string, language?: string): string {
  if (!language) return path;

  return `${path}${path.includes("?") ? "&" : "?"}lang=${encodeURIComponent(language)}`;
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

/** Only mutations may set browser cookies. Server Component reads never mutate them. */
async function relayCookies(response: Response) {
  const store = await cookies();
  for (const header of response.headers.getSetCookie()) {
    const [pair, ...attributes] = header.split(";");
    const equals = pair.indexOf("=");
    const name = pair.slice(0, equals).trim();
    if (!["session_token", "visitor_id", "handytool_trial"].includes(name)) continue;
    const attr = new Map(attributes.map(part => {
      const [key, ...value] = part.trim().split("=");
      return [key.toLowerCase(), value.join("=")] as const;
    }));
    const sameSite = attr.get("samesite")?.toLowerCase();
    store.set(name, pair.slice(equals + 1), {
      httpOnly: true,
      secure: attr.has("secure") || process.env.NODE_ENV === "production",
      path: "/",
      sameSite: sameSite === "strict" || sameSite === "none" ? sameSite : "lax",
      ...(attr.has("expires") ? { expires: new Date(attr.get("expires")!) } : {}),
      ...(attr.has("max-age") ? { maxAge: Number(attr.get("max-age")) } : {}),
    });
  }
}
export function getHome(language: string, category?: number, subcategory?: number, skip = 0) {
  const query = new URLSearchParams({ lang: language, skip: String(skip) });
  if (category !== undefined) query.set("categoryId", String(category));
  if (subcategory !== undefined) query.set("subcategoryId", String(subcategory));
  return request<HomeData>(`/api/home?${query}`);
}
export const getCurrentUser = cache(() => request<{ id: number; displayName: string; email: string; isSuperAdmin: boolean; companyRole?: "Owner" | "Admin" | "Member" | null; companyName?: string | null }>("/api/auth/me"));
export function authenticate(email: string, password: string) {
  return request<unknown>("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password, clientType: "Web", deviceName: "Handytool web" }) });
}
export function logout() { return request<unknown>("/api/auth/logout", { method: "POST" }); }
export function getRecord(id: string) {
  return request<ObjectRecord>(`/api/records/${encodeURIComponent(id)}`);
}
export function registerAccount(payload: RegistrationPayload) {
  return request<unknown>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ ...payload, clientType: "Web", deviceName: "Handytool web" }),
  });
}
export function listAdmin(section: import("./admin-types").AdminSection, q: string, skip: number, sub: boolean, masterCategoryId?: number, filters: Record<string,string> = {}) {
 return request<import("./admin-types").AdminPage>(`/api/admin/${section}?${new URLSearchParams({...filters,q,skip:String(skip),sub:String(sub),...(masterCategoryId===undefined?{}:{masterCategoryId:String(masterCategoryId)})})}`);
}
export function adminPlans() { return request<import("./admin-types").AdminPlan[]>("/api/admin/plans"); }
export function saveAdmin(section: import("./admin-types").AdminSection, id: number | null, sub: boolean, payload: Record<string,unknown>) {
 return request<unknown>(`/api/admin/${section}${id===null?"":"/"+encodeURIComponent(id)}?sub=${sub}`,{method:id===null?"POST":"PUT",body:JSON.stringify(payload)});
}
export function deleteAdminCategory(id: number, sub: boolean, modifiedDate: string) {
 return request<unknown>(`/api/admin/categories/${encodeURIComponent(id)}?${new URLSearchParams({sub:String(sub),modifiedDate})}`, {method:"DELETE"});
}
export function adminCompanyOptions() { return request<{id:number;name:string}[]>("/api/admin/company-options"); }
