"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  ActiveTimer,
  beaconEvent,
  fetchHeartbeatSeconds,
  sendEvent,
  DEFAULT_HEARTBEAT_SECONDS,
} from "@/lib/tracking";

/**
 * Reports page views and active reading time to the API.
 *
 * Mounted once, in the root layout. It sends nothing that identifies anybody: the visitor id lives in
 * an HttpOnly cookie this code cannot read, and the user id is resolved by the API from the session.
 *
 * Three things make the numbers hold up:
 *
 * - A client-side route change is a page view. Next does not reload the document when you navigate,
 *   so nothing else would notice.
 * - Active time only accrues while the tab is visible, via the Page Visibility API. A page left open
 *   in a background tab reports the seconds it was really read, not the hour it sat there.
 * - Heartbeats carry the time as they go. The final page_leave is sent with `sendBeacon` and is still
 *   best-effort - if it is lost, at most one heartbeat interval of reading is unaccounted for.
 */
interface Props {
  /** The locale the page was rendered in, from the route segment. */
  language?: string;
}

export function AnalyticsProvider({ language }: Props) {
  const pathname = usePathname();

  // Refs, not state: changing any of these must never re-render the tree below.
  const timerRef = useRef<ActiveTimer | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pathRef = useRef(pathname);
  const heartbeatSecondsRef = useRef(DEFAULT_HEARTBEAT_SECONDS);
  const languageRef = useRef(language);

  // Kept in a ref so a language switch does not tear down and restart the heartbeat: the tab is
  // still visible and the reader is still on the same page.
  languageRef.current = language;

  // The interval is configured server-side, so it can change without redeploying the website.
  useEffect(() => {
    const controller = new AbortController();

    fetchHeartbeatSeconds(controller.signal).then((seconds) => {
      heartbeatSecondsRef.current = seconds;
    });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    // Track the path this effect was set up for, so the flush on the way out reports the page that
    // was actually being read rather than the one just navigated to.
    pathRef.current = pathname;

    const isVisible = () => document.visibilityState === "visible";

    const timer = new ActiveTimer(isVisible());
    timerRef.current = timer;

    /** Sends whatever active time has accrued. Zero-second beats are skipped - they say nothing. */
    const flush = (eventType: "heartbeat" | "page_leave", useBeacon: boolean) => {
      const activeSeconds = timer.takeSeconds();

      if (activeSeconds <= 0) {
        return;
      }

      const payload = {
        eventType,
        path: pathRef.current,
        activeSeconds,
        language: languageRef.current,
      } as const;

      if (useBeacon) {
        beaconEvent(payload);
      } else {
        sendEvent(payload);
      }
    };

    sendEvent({
      eventType: "page_view",
      path: pathname,
      referrer: document.referrer || undefined,
      language: languageRef.current,
    });

    intervalRef.current = setInterval(() => {
      // Belt and braces: the timer is already paused while hidden, so this would send nothing anyway.
      if (isVisible()) {
        flush("heartbeat", false);
      }
    }, heartbeatSecondsRef.current * 1000);

    const onVisibilityChange = () => {
      if (isVisible()) {
        timer.start();
        return;
      }

      // Hiding a tab is the most common way a page is left for good - on mobile it is usually the
      // only signal there is - so the pending time goes out now, by beacon, while it still can.
      timer.pause();
      flush("page_leave", true);
    };

    // pagehide, not unload: unload is unreliable and blocks the back/forward cache.
    const onPageHide = () => {
      timer.pause();
      flush("page_leave", true);
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", onPageHide);

    return () => {
      // Runs on navigation as well as unmount. Flush the page being left before the next one starts,
      // and clear the interval so two pages never beat at once.
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", onPageHide);

      timer.pause();
      flush("page_leave", false);
      timerRef.current = null;
    };
  }, [pathname]);

  return null;
}
