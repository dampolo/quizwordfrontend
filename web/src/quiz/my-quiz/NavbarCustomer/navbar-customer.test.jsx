import { afterEach, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import useVocabulary from "../../../context/vocabulary/useVocabulary";
import i18n from "../../../i18n/i18n";
import NavbarCustomer from "./navbar-customer";

vi.mock("../../../context/vocabulary/useVocabulary", () => ({ default: vi.fn() }));

afterEach(async () => {
  cleanup();
  await i18n.changeLanguage("en");
});

function setup(entry, languages = [{ id: 2 }, { id: 3 }]) {
  useVocabulary.mockReturnValue({ userLanguages: languages });
  const { container } = render(
    <MemoryRouter initialEntries={[entry]}>
      <NavbarCustomer />
    </MemoryRouter>,
  );
  return {
    links: ["all-categories", "all-words", "all-quizzes"].map((page) =>
      container.querySelector(`a[href^="/my-quiz/${page}"]`),
    ),
  };
}

it("keeps language 3 while navigating between categories, words, and quizzes", () => {
  const { links } = setup("/my-quiz/all-words?language=3&page=2");
  for (const link of [links[0], links[2], links[1], links[0]]) {
    fireEvent.click(link);
    for (const destination of links) {
      expect(destination.getAttribute("href")).toMatch(/\?language=3$/);
    }
  }
});

it("defaults to the first language when no language is selected", () => {
  const { links } = setup("/my-quiz/profile");
  links.forEach((link) => expect(link.getAttribute("href")).toMatch(/\?language=2$/));
});

it("omits the language query when no languages are available", () => {
  const { links } = setup("/my-quiz/profile", []);
  links.forEach((link) => expect(link.getAttribute("href")).not.toContain("?"));
});

it("updates the navigation labels without changing the selected quiz language", async () => {
  setup("/my-quiz/all-words?language=3");
  expect(screen.getAllByRole("link").map((link) => link.textContent)).toEqual([
    "Categories", "All Words", "New", "Quizzes", "Translator",
  ]);

  await act(async () => {
    await i18n.changeLanguage("de");
  });

  expect(screen.getAllByRole("link").map((link) => link.textContent)).toEqual([
    "Kategorien", "Wörter", "Neu", "Quizze", "Übersetzer",
  ]);
  expect(screen.getByRole("link", { name: "Wörter" }).getAttribute("href"))
    .toBe("/my-quiz/all-words?language=3");
});
