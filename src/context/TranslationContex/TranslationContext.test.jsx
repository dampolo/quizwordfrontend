import { afterEach, expect, it, vi } from "vitest";
import { act, cleanup, renderHook } from "@testing-library/react";
import { toast } from "react-toastify";
import { apiFetch } from "../../services/apiFetch";
import { TranslationProvider } from "./TranslationContext";
import useTranslation from "./UseTranslation";

vi.mock("../ApiContext", () => ({ default: () => "/api/" }));
vi.mock("../../services/apiFetch", () => ({ apiFetch: vi.fn() }));
vi.mock("react-toastify", () => ({ toast: { error: vi.fn() } }));
afterEach(() => { cleanup(); vi.resetAllMocks(); });

it.each([
  [false, { detail: "Service unavailable" }, "Service unavailable"],
  [true, {}, "Der Server hat keine gültige Übersetzung zurückgegeben."],
])("keeps a string result and shows one toast on failure (ok=%s)", async (ok, data, message) => {
  apiFetch.mockResolvedValue({ ok, json: async () => data });
  const { result } = renderHook(() => useTranslation(), { wrapper: TranslationProvider });
  await act(async () => { await result.current.translate({ text: "Hello", source: "en", target: "de" }); });
  expect(result.current.translatedText).toBe("");
  expect(result.current.error).toBe(message);
  expect(result.current.loading).toBe(false);
  expect(toast.error).toHaveBeenCalledExactlyOnceWith(message);
});

it("shows a valid translation without an error toast", async () => {
  apiFetch.mockResolvedValue({ ok: true, json: async () => ({ translated_text: "Hallo" }) });
  const { result } = renderHook(() => useTranslation(), { wrapper: TranslationProvider });
  await act(async () => { await result.current.translate({ text: "Hello", source: "en", target: "de" }); });
  expect(result.current.translatedText).toBe("Hallo");
  expect(result.current.error).toBe("");
  expect(toast.error).not.toHaveBeenCalled();
});
