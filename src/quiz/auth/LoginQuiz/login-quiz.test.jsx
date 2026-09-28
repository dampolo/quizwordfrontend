import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/useAuth";
import LoginQuiz from "./login-quiz";

// Replace authentication so the test never calls the real backend.
vi.mock("../../../context/useAuth", () => ({
  useAuth: vi.fn(),
}));

// Keep the real router components, but record navigation requests.
vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

it("logs in with the entered credentials and navigates after success", async () => {
  // Arrange: prepare a user and a successful authentication response.
  const user = userEvent.setup();
  const login = vi.fn().mockResolvedValue(true);
  const navigate = vi.fn();
  useAuth.mockReturnValue({ login, loading: false });
  useNavigate.mockReturnValue(navigate);

  render(
    <MemoryRouter>
      <LoginQuiz />
    </MemoryRouter>
  );

  // Act: fill in the form and submit it as a user would.
  await user.type(
    screen.getByLabelText("E-Mail-Adresse"),
    "test@example.com"
  );
  await user.type(
    screen.getByLabelText("Passwort", { exact: true }),
    "StrongPass123!"
  );
  await user.click(screen.getByRole("button", { name: "Anmelden" }));

  // Assert: check the credentials and the destination after login resolves.
  expect(login).toHaveBeenCalledTimes(1);
  expect(login).toHaveBeenCalledWith("test@example.com", "StrongPass123!");
  await waitFor(() => {
    expect(navigate).toHaveBeenCalledWith("/my-quiz/all-words");
  });
});
