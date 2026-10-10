import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Translation from "./Translation";
import useVocabulary from "../../../context/useVocabulary";
import UseTranslation from "../../../context/TranslationContex/UseTranslation";

vi.mock("../../../context/useVocabulary", () => ({ default: vi.fn() }));
vi.mock("../../../context/TranslationContex/UseTranslation", () => ({ default: vi.fn() }));
afterEach(() => { cleanup(); vi.resetAllMocks(); });

function renderTranslation({ withCodes = true, loading = false, sourceCode = "de", targetCode = "en" } = {}) {
  const nativeLanguage = { id: 1, language_name: "Deutsch", ...(withCodes && { language_code: sourceCode }) };
  const english = { id: 2, language_name: "Englisch", ...(withCodes && { language_code: targetCode }) };
  useVocabulary.mockReturnValue({ nativeLanguage, userLanguages: [english] });
  const translate = vi.fn();
  UseTranslation.mockReturnValue({ translate, translatedText: "", loading, error: "" });
  const { container } = render(<Translation />);
  return {
    user: userEvent.setup(), translate,
    source: container.querySelector('select[name="source"]'),
    target: container.querySelector('select[name="target"]'),
    text: container.querySelector('textarea[name="text"]'),
    submit: container.querySelector('button[type="submit"]'),
  };
}

it("keeps languages selectable even without codes and while loading", async () => {
  const { user, source, target } = renderTranslation({ withCodes: false, loading: true });
  expect(source.options.length).toBe(3);
  expect(source.disabled).toBe(false);
  await user.selectOptions(source, "2");
  await user.selectOptions(target, "1");
  expect(source.value).toBe("2");
  expect(target.value).toBe("1");
});

it("sends language codes rather than dropdown IDs", async () => {
  const { user, source, target, text, submit, translate } = renderTranslation();
  await user.selectOptions(source, "2");
  await user.selectOptions(target, "1");
  await user.type(text, "Hello");
  await user.click(submit);
  expect(translate).toHaveBeenCalledWith({ text: "Hello", source: "en", target: "de" });
});

it.each([
  ["de-DE", "en-US", "de", "en"],
  ["de_DE", "es-ES", "de", "es"],
])("normalizes %s and %s for the translation endpoint", async (sourceCode, targetCode, source, target) => {
  const { user, text, submit, translate } = renderTranslation({ sourceCode, targetCode });
  await user.type(text, "Hallo");
  await user.click(submit);
  expect(translate).toHaveBeenCalledWith({ text: "Hallo", source, target });
});
