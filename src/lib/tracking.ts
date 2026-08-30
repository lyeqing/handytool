/**
 * Browser-side tracking transport.
 *
 * Every call here is a relative URL. In production the reverse proxy sends /api/* to the ASP.NET Core
 * API; in development the Next rewrite does the same. Either way the request is same-origin, so the
 * browser attaches the HttpOnly `visitor_id` and `session_token` cookies on its own.
 *
 * Nothing in this file knows who the visitor is, and that is deliberate: the visitor id is HttpOnly
 * and unreadable from JavaScript, and the user id is resolved server-side from the session. The
 * browser only ever reports what happened, never who it happened to.
 */

export const TRACK_ENDPOINT = "/api/track";

export const DEFAULT_HEARTBEAT_SECONDS = 30;

/** The event names the website sends. The API accepts more; these are the ones the tracker writes. */
export type TrackedEventType = "page_view" | "heartbeat" | "page_leave";

export interface TrackEventPayload {
  eventType: TrackedEventType;
  path: string;
  /** Seconds this tab was actually visible since the last event. Omitted on page_view. */
  activeSeconds?: number;
  referrer?: string;
  /**
   * The locale this page was rendered in. The API also derives it from the URL prefix, so this is
   * belt and braces - but it is the only signal if the locale ever stops being in the path.
   */
  language?: string;
}

/**
 * Normal send, for events that happen while the page is alive and can wait for a response.
 *
 * `keepalive` lets the request outlive a navigation that starts immediately afterwards, and the
 * promise is swallowed on purpose: analytics must never surface an error to someone using the site.
 */
export function sendEvent(payload: TrackEventPayload): void {
  try {
    void fetch(TRACK_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "same-origin",
      keepalive: true,
    }).catch(() => {
      // A dropped analytics event is not worth telling anybody about.
    });
  } catch {
    // Ditto for a synchronous throw - some privacy extensions block the call outright.
  }
}

/**
 * Last-gasp send, for a tab being hidden or closed.
 *
 * `fetch` is cancelled when a document is torn down; `sendBeacon` is queued by the browser and
 * survives it. It cannot set a Content-Type header, so the body goes as a Blob with the type on it.
 *
 * This is still best-effort. Nothing in the system depends on the final event arriving - the
 * heartbeats have already accounted for all but the last few seconds.
 */
export function beaconEvent(payload: TrackEventPayload): void {
  const body = JSON.stringify(payload);

  try {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([body], { type: "application/json" });

      if (navigator.sendBeacon(TRACK_ENDPOINT, blob)) {
        return;
      }
    }
  } catch {
    // Fall through to fetch below.
  }

  sendEvent(payload);
}

/** Reads the heartbeat interval from the API so it is configured server-side, in one place. */
export async function fetchHeartbeatSeconds(signal?: AbortSignal): Promise<number> {
  try {
    const response = await fetch(`${TRACK_ENDPOINT}/config`, {
      credentials: "same-origin",
      signal,
    });

    if (!response.ok) {
      return DEFAULT_HEARTBEAT_SECONDS;
    }

    const config: { heartbeatSeconds?: number } = await response.json();

    return typeof config.heartbeatSeconds === "number" && config.heartbeatSeconds > 0
      ? config.heartbeatSeconds
      : DEFAULT_HEARTBEAT_SECONDS;
  } catch {
    return DEFAULT_HEARTBEAT_SECONDS;
  }
}

/**
 * Accumulates the time a page was actually looked at.
 *
 * Only the browser can see whether its tab is visible, which is why active time is measured here
 * rather than inferred from the gaps between server timestamps. The clock runs while the tab is
 * visible and stops the moment it is not, so a page left open in a background tab for an hour
 * reports the few seconds it was really read.
 */
export class ActiveTimer {
  private startedAt: number | null = null;
  private accumulatedMs = 0;

  constructor(startRunning: boolean) {
    if (startRunning) {
      this.start();
    }
  }

  start(): void {
    if (this.startedAt === null) {
      this.startedAt = Date.now();
    }
  }

  pause(): void {
    if (this.startedAt !== null) {
      this.accumulatedMs += Date.now() - this.startedAt;
      this.startedAt = null;
    }
  }

  /** Whole seconds accumulated so far, keeping the remainder for the next read. */
  takeSeconds(): number {
    if (this.startedAt !== null) {
      const now = Date.now();
      this.accumulatedMs += now - this.startedAt;
      this.startedAt = now;
    }

    const seconds = Math.floor(this.accumulatedMs / 1000);
    this.accumulatedMs -= seconds * 1000;

    return seconds;
  }
}
