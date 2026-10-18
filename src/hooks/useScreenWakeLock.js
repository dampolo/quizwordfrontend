import { useEffect } from "react";
import { toast } from "react-toastify";

export default function useScreenWakeLock(enabled) {
  useEffect(() => {
    if (!enabled) return;

    if (!navigator.wakeLock?.request) {
      toast.error("Dein Browser kann den Bildschirm nicht automatisch wach halten.");
      return;
    }

    let disposed = false;
    let wakeLock = null;
    let requesting = false;
    let notified = false;

    async function acquire() {
      if (disposed || requesting || wakeLock || document.visibilityState !== "visible") return;
      requesting = true;
      try {
        const lock = await navigator.wakeLock.request("screen");
        // A pending request can finish after playback stops or the page hides.
        if (disposed || document.visibilityState !== "visible") {
          await lock.release();
          return;
        }
        wakeLock = lock;
        lock.addEventListener("release", () => {
          if (wakeLock === lock) wakeLock = null;
        }, { once: true });
      } catch {
        if (!disposed && !notified) {
          notified = true;
          toast.error("Der Bildschirm konnte nicht wach gehalten werden.");
        }
      } finally {
        requesting = false;
      }
    }

    function onVisibilityChange() {
      if (document.visibilityState === "visible") void acquire();
    }

    void acquire();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      disposed = true;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (wakeLock) void wakeLock.release().catch(() => {});
    };
  }, [enabled]);
}
