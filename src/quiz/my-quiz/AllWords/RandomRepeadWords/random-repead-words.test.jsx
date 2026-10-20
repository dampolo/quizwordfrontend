import { afterEach, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import useVocabulary from "../../../../context/useVocabulary";
import { toast } from "react-toastify";
import RandomRepeadWords from "./random-repead-words";

vi.mock("../../../../context/useVocabulary", () => ({ default: vi.fn() }));
vi.mock("../../../../hooks/useScreenWakeLock", () => ({ default: () => false }));
vi.mock("react-toastify", () => ({ toast: { error: vi.fn() } }));

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  localStorage.clear();
});

async function setup(fetchWord = vi.fn().mockResolvedValue([
  { translations: [{ word: "Haus" }, { word: "house" }] },
  { translations: [{ word: "Katze" }, { word: "cat" }] },
])) {
  vi.useFakeTimers();
  useVocabulary.mockReturnValue({ getRandomRepeatWords: fetchWord });
  vi.stubGlobal("speechSynthesis", { speak: vi.fn(), cancel: vi.fn() });
  vi.stubGlobal("SpeechSynthesisUtterance", class { constructor(text) { this.text = text; } });
  let result;
  await act(async () => {
    result = render(<MemoryRouter initialEntries={["/?language=2"]}><RandomRepeadWords /></MemoryRouter>);
  });
  return { ...result, fetchWord, button: result.container.querySelector('button[name="random-repeat"]') };
}

it("caches the full list, speaks both translations, pauses and advances without another request", async () => {
  const { button, fetchWord, unmount, container } = await setup();
  expect(fetchWord).toHaveBeenCalledTimes(1);
  expect(window.speechSynthesis.speak).not.toHaveBeenCalled();
  await act(async () => fireEvent.click(button));
  expect(container.querySelector("h1").textContent).toBe("Haus");
  expect(fetchWord.mock.calls[0][0]).toBe("2");
  expect(JSON.parse(localStorage.getItem("random-repeat-words:2"))).toHaveLength(2);
  expect(window.speechSynthesis.speak.mock.calls[0][0].text).toBe("Haus");
  await act(async () => vi.advanceTimersByTime(10000));
  expect(fetchWord).toHaveBeenCalledTimes(1);
  await act(async () => window.speechSynthesis.speak.mock.calls[0][0].onend());
  expect(window.speechSynthesis.speak.mock.calls[1][0].text).toBe("house");
  expect(fetchWord).toHaveBeenCalledTimes(1);
  await act(async () => window.speechSynthesis.speak.mock.calls[1][0].onend());
  await act(async () => vi.advanceTimersByTime(999));
  expect(fetchWord).toHaveBeenCalledTimes(1);
  await act(async () => vi.advanceTimersByTime(1));
  expect(fetchWord).toHaveBeenCalledTimes(1);
  expect(container.querySelector("h1").textContent).toBe("Katze");
  await act(async () => fireEvent.click(button));
  await act(async () => window.speechSynthesis.speak.mock.calls[2][0].onend());
  await act(async () => vi.advanceTimersByTime(2000));
  expect(fetchWord).toHaveBeenCalledTimes(1);
  await act(async () => fireEvent.click(button));
  await act(async () => window.speechSynthesis.speak.mock.calls[3][0].onend());
  await act(async () => window.speechSynthesis.speak.mock.calls[4][0].onend());
  unmount();
  await act(async () => vi.advanceTimersByTime(2000));
  expect(fetchWord).toHaveBeenCalledTimes(1);
});

it("refreshes on opening, reuses the list after stop/start, and refreshes on reopening", async () => {
  localStorage.setItem("random-repeat-words:2", JSON.stringify([
    { translations: [{ word: "Baum" }, { word: "tree" }] },
  ]));
  const fresh = [{ translations: [{ word: "Neu" }, { word: "new" }] }];
  const fetchWord = vi.fn().mockResolvedValue(fresh);
  const { button, container, unmount } = await setup(fetchWord);
  await act(async () => fireEvent.click(button));
  expect(fetchWord).toHaveBeenCalledTimes(1);
  expect(JSON.parse(localStorage.getItem("random-repeat-words:2"))).toEqual(fresh);
  expect(container.querySelector("h1").textContent).toBe("Neu");
  await act(async () => window.speechSynthesis.speak.mock.calls[0][0].onend());
  await act(async () => window.speechSynthesis.speak.mock.calls[1][0].onend());
  await act(async () => vi.advanceTimersByTime(1000));
  expect(window.speechSynthesis.speak.mock.calls[2][0].text).toBe("Neu");
  expect(fetchWord).toHaveBeenCalledTimes(1);
  await act(async () => fireEvent.click(button));
  const refreshed = [{ translations: [{ word: "Frisch" }, { word: "fresh" }] }];
  fetchWord.mockResolvedValue(refreshed);
  await act(async () => fireEvent.click(button));
  expect(fetchWord).toHaveBeenCalledTimes(1);
  expect(container.querySelector("h1").textContent).toBe("Neu");
  unmount();
  const reopened = await setup(fetchWord);
  expect(fetchWord).toHaveBeenCalledTimes(2);
  expect(JSON.parse(localStorage.getItem("random-repeat-words:2"))).toEqual(refreshed);
  expect(reopened.container.querySelector("h1").textContent).toBe("Frisch");
});

it("replaces malformed cached data with a fresh list", async () => {
  localStorage.setItem("random-repeat-words:2", "invalid JSON");
  const { button, fetchWord } = await setup();
  await act(async () => fireEvent.click(button));
  expect(fetchWord).toHaveBeenCalledTimes(1);
  expect(JSON.parse(localStorage.getItem("random-repeat-words:2"))).toHaveLength(2);
});

it("does not overlap slow requests and reports a failed request once", async () => {
  let reject;
  const fetchWord = vi.fn(() => new Promise((resolve, fail) => { reject = fail; }));
  const { button } = await setup(fetchWord);
  await act(async () => fireEvent.click(button));
  await act(async () => vi.advanceTimersByTime(3000));
  expect(fetchWord).toHaveBeenCalledTimes(1);
  await act(async () => reject(new Error("Failed")));
  expect(toast.error).toHaveBeenCalledWith("Failed");
  await act(async () => vi.advanceTimersByTime(2000));
  expect(fetchWord).toHaveBeenCalledTimes(1);
});
