import { afterEach, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { toast } from "react-toastify";
import useQuiz from "../../../../context/useQuiz";
import WordAudioLoop from "./word-audio-loop";

vi.mock("../../../../context/useQuiz", () => ({ default: vi.fn() }));
vi.mock("react-toastify", () => ({ toast: { error: vi.fn() } }));

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

async function renderAudioLoop(concepts = [
  { translations: [{ word: "Haus", language_code: "de" }, { word: "house", language_code: "en" }] },
  { translations: [{ word: "Katze", language_code: "de" }, { word: "cat", language_code: "en" }] },
]) {
  useQuiz.mockReturnValue({ getQuizWords: vi.fn().mockResolvedValue({ quiz_name: "Words", concepts }) });
  const speak = vi.fn();
  const cancel = vi.fn();
  vi.stubGlobal("speechSynthesis", { speak, cancel });
  vi.stubGlobal("SpeechSynthesisUtterance", class {
    constructor(text) { this.text = text; }
  });
  const result = render(<MemoryRouter initialEntries={["/my-quiz/1/word-audio-loop"]}>
    <Routes><Route path="/my-quiz/:id/word-audio-loop" element={<WordAudioLoop />} /></Routes>
  </MemoryRouter>);
  const button = result.container.querySelector('button[name="audio-loop"]');
  await waitFor(() => expect(button.disabled).toBe(concepts.length === 0));
  return { ...result, button, speak, cancel };
}

it("speaks each translation sequentially and loops back to the first pair", async () => {
  const { button, speak, unmount, cancel } = await renderAudioLoop();
  vi.useFakeTimers();
  fireEvent.click(button);
  for (let index = 0; index < 4; index++) {
    act(() => {
      speak.mock.calls[index][0].onend();
      vi.advanceTimersByTime(700);
    });
  }
  expect(speak.mock.calls.map(([utterance]) => [utterance.text, utterance.lang])).toEqual([
    ["Haus", "de"], ["house", "en"], ["Katze", "de"], ["cat", "en"], ["Haus", "de"],
  ]);
  const last = speak.mock.calls[4][0];
  unmount();
  last.onend();
  vi.advanceTimersByTime(1000);
  expect(speak).toHaveBeenCalledTimes(5);
  expect(cancel).toHaveBeenCalled();
});

it("stops pending speech and ignores old callbacks after restarting", async () => {
  const { button, speak } = await renderAudioLoop();
  vi.useFakeTimers();
  fireEvent.click(button);
  const old = speak.mock.calls[0][0];
  act(() => old.onend());
  fireEvent.click(button);
  fireEvent.click(button);
  act(() => { old.onend(); vi.advanceTimersByTime(1000); });
  expect(speak).toHaveBeenCalledTimes(2);
});

it("disables playback for empty quizzes", async () => {
  const { button, speak } = await renderAudioLoop([]);
  expect(button.disabled).toBe(true);
  expect(speak).not.toHaveBeenCalled();
});

it("reports speech errors and resets playback", async () => {
  const { button, speak } = await renderAudioLoop();
  fireEvent.click(button);
  act(() => speak.mock.calls[0][0].onerror());
  expect(button.getAttribute("aria-pressed")).toBe("false");
  expect(toast.error).toHaveBeenCalled();
});
