import { afterEach, expect, it, vi } from "vitest";
import { act, cleanup, renderHook } from "@testing-library/react";
import { toast } from "react-toastify";
import { apiFetch } from "../../services/apiFetch";
import { TranslationProvider } from "./TranslationProvider";
import useTranslation from "./useTranslation";

vi.mock("../api/useApi", () => ({ default: () => "/api/" }));
vi.mock("../../services/apiFetch", () => ({ apiFetch: vi.fn() }));
vi.mock("react-toastify", () => ({ toast: { error: vi.fn() } }));
afterEach(() => { cleanup(); vi.resetAllMocks(); });

it.each([
  [false, { detail: "Service unavailable" }, "Service unavailable"],
  [true, {}, "Der Server hat keine gültige Übersetzung zurückgegeben."],
])("keeps a null result and shows one toast on failure (ok=%s)", async (ok, data, message) => {
  apiFetch.mockResolvedValue({ ok, json: async () => data });
  const { result } = renderHook(() => useTranslation(), { wrapper: TranslationProvider });
  await act(async () => { await result.current.translate({ text: "Hello", source: "en", target: "de" }); });
  expect(result.current.translatedText).toBeNull();
  expect(result.current.error).toBe(message);
  expect(result.current.loading).toBe(false);
  expect(toast.error).toHaveBeenCalledExactlyOnceWith(message);
});

it("shows a valid translation without an error toast", async () => {
  apiFetch.mockResolvedValue({ ok: true, json: async () => ({ translated_text: "Hallo" }) });
  const { result } = renderHook(() => useTranslation(), { wrapper: TranslationProvider });
  await act(async () => { await result.current.translate({ text: "Hello", source: "en", target: "de" }); });
  expect(result.current.translatedText).toEqual({ translated_text: "Hallo" });
  expect(result.current.error).toBe("");
  expect(toast.error).not.toHaveBeenCalled();
});

it("clears the previous response while loading and preserves conjugation fields", async () => {
  const data = {
    translated_text: "Hallo",
    source_conjugations: false,
    target_conjugations: true,
    source_results: null,
    target_results: { present: ["test"] },
  };
  apiFetch.mockResolvedValueOnce({ ok: true, json: async () => data });
  const { result } = renderHook(() => useTranslation(), { wrapper: TranslationProvider });
  expect(result.current.translatedText).toBeNull();
  await act(async () => {
    await result.current.translate({ text: "Hello", source: "en", target: "de" });
  });
  expect(result.current.translatedText).toEqual(data);
  let resolveRequest;
  apiFetch.mockReturnValueOnce(new Promise((resolve) => { resolveRequest = resolve; }));
  let pendingTranslation;
  act(() => {
    pendingTranslation = result.current.translate({ text: "Hi", source: "en", target: "de" });
  });
  expect(result.current.translatedText).toBeNull();
  expect(result.current.loading).toBe(true);
  await act(async () => {
    resolveRequest({ ok: true, json: async () => data });
    await pendingTranslation;
  });
  expect(result.current.loading).toBe(false);
});
