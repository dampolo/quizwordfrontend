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
});

function setup(fetchWord = vi.fn().mockResolvedValue({ translations: [{ word: "Haus" }, { word: "house" }] })) {
  vi.useFakeTimers();
  useVocabulary.mockReturnValue({ getRandomRepeatWords: fetchWord });
  vi.stubGlobal("speechSynthesis", { speak: vi.fn(), cancel: vi.fn() });
  vi.stubGlobal("SpeechSynthesisUtterance", class { constructor(text) { this.text = text; } });
  const result = render(<MemoryRouter initialEntries={["/?language=2"]}><RandomRepeadWords /></MemoryRouter>);
  return { ...result, fetchWord, button: result.container.querySelector('button[name="random-repeat"]') };
}

it("speaks both translations before fetching again and stops on pause and unmount", async () => {
  const { button, fetchWord, unmount, container } = setup();
  await act(async () => fireEvent.click(button));
  expect(container.querySelector("h1").textContent).toBe("Haus");
  expect(fetchWord.mock.calls[0][0]).toBe("2");
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
  expect(fetchWord).toHaveBeenCalledTimes(2);
  const signal = fetchWord.mock.calls[0][1].signal;
  await act(async () => fireEvent.click(button));
  expect(signal.aborted).toBe(true);
  await act(async () => window.speechSynthesis.speak.mock.calls[2][0].onend());
  await act(async () => vi.advanceTimersByTime(2000));
  expect(fetchWord).toHaveBeenCalledTimes(2);
  await act(async () => fireEvent.click(button));
  await act(async () => window.speechSynthesis.speak.mock.calls[3][0].onend());
  await act(async () => window.speechSynthesis.speak.mock.calls[4][0].onend());
  unmount();
  await act(async () => vi.advanceTimersByTime(2000));
  expect(fetchWord).toHaveBeenCalledTimes(3);
});

it("does not overlap slow requests and reports a failed request once", async () => {
  let reject;
  const fetchWord = vi.fn(() => new Promise((resolve, fail) => { reject = fail; }));
  const { button } = setup(fetchWord);
  await act(async () => fireEvent.click(button));
  await act(async () => vi.advanceTimersByTime(3000));
  expect(fetchWord).toHaveBeenCalledTimes(1);
  await act(async () => reject(new Error("Failed")));
  expect(toast.error).toHaveBeenCalledWith("Failed");
  await act(async () => vi.advanceTimersByTime(2000));
  expect(fetchWord).toHaveBeenCalledTimes(1);
});
