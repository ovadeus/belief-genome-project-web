import { useEffect, useRef } from "react";
import { useLocation } from "wouter";

function getSessionId(): string {
  const key = "bgp_sid";
  let sid = sessionStorage.getItem(key);
  if (!sid) {
    sid = crypto.randomUUID().replace(/-/g, "").slice(0, 32) +
          Math.random().toString(36).slice(2, 10);
    sessionStorage.setItem(key, sid);
  }
  return sid;
}

export function usePageTracker() {
  const [location] = useLocation();
  const lastPath = useRef<string>("");

  useEffect(() => {
    if (location === lastPath.current) return;
    lastPath.current = location;
    if (location.startsWith("/admin")) return;

    const body = {
      path: location,
      referrer: document.referrer || null,
      sessionId: getSessionId(),
      screenWidth: window.innerWidth,
    };

    const url = `${import.meta.env.BASE_URL}api/analytics/pageview`;

    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([JSON.stringify(body)], { type: "application/json" }));
    } else {
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        keepalive: true,
      }).catch(() => {});
    }
  }, [location]);
}
