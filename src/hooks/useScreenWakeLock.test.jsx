import { afterEach, expect, it, vi } from "vitest";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { toast } from "react-toastify";
import useScreenWakeLock from "./useScreenWakeLock";

vi.mock("react-toastify", () => ({ toast: { error: vi.fn() } }));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function setup(requestOverride) {
  const lock = new EventTarget();
  lock.release = vi.fn().mockResolvedValue();
  const request = requestOverride ?? vi.fn().mockResolvedValue(lock);
  vi.spyOn(navigator, "wakeLock", "get").mockReturnValue({ request });
  const visibility = vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible");
  const result = renderHook(({ enabled }) => useScreenWakeLock(enabled), {
    initialProps: { enabled: false },
  });
  return { ...result, lock, request, visibility };
}

// jsdom does not provide the Wake Lock API.
Object.defineProperty(navigator, "wakeLock", { configurable: true, get: () => undefined });

it("requests only during playback and releases on stop and unmount", async () => {
  const { request, lock, rerender, unmount } = setup();
  expect(request).not.toHaveBeenCalled();
  rerender({ enabled: true });
  await waitFor(() => expect(request).toHaveBeenCalledWith("screen"));
  rerender({ enabled: false });
  expect(lock.release).toHaveBeenCalledTimes(1);
  rerender({ enabled: true });
  await act(async () => {});
  unmount();
  expect(lock.release).toHaveBeenCalledTimes(2);
});

it("reacquires a released lock when the page becomes visible", async () => {
  const { request, lock, visibility, rerender } = setup();
  rerender({ enabled: true });
  await act(async () => {});
  visibility.mockReturnValue("hidden");
  act(() => {
    lock.dispatchEvent(new Event("release"));
    document.dispatchEvent(new Event("visibilitychange"));
  });
  expect(request).toHaveBeenCalledTimes(1);
  visibility.mockReturnValue("visible");
  await act(async () => document.dispatchEvent(new Event("visibilitychange")));
  expect(request).toHaveBeenCalledTimes(2);
});

it("releases requests that finish after playback stops", async () => {
  let resolve;
  const request = vi.fn(() => new Promise((done) => { resolve = done; }));
  const { lock, rerender } = setup(request);
  rerender({ enabled: true });
  rerender({ enabled: false });
  await act(async () => resolve(lock));
  expect(lock.release).toHaveBeenCalledTimes(1);
});

it("reports a rejected request", async () => {
  const { rerender } = setup(vi.fn().mockRejectedValue(new Error("Denied")));
  rerender({ enabled: true });
  await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Der Bildschirm konnte nicht wach gehalten werden."));
});

it("reports unavailable browser support", () => {
  vi.spyOn(navigator, "wakeLock", "get").mockReturnValue(undefined);
  renderHook(() => useScreenWakeLock(true));
  expect(toast.error).toHaveBeenCalledWith("Dein Browser kann den Bildschirm nicht automatisch wach halten.");
});
