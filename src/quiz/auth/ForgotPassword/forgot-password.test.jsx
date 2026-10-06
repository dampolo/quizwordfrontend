import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useAuth } from "../../../context/useAuth";
import ForgotPassword from "./forgot-password";

// Replace authentication so the test never calls the real backend.
vi.mock("../../../context/useAuth", () => ({ useAuth: vi.fn() }));

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

it("renders an empty email field without an error and a disabled submit button", () => {
  useAuth.mockReturnValue({
    forgotPassword: vi.fn(),
    setConfirmationMessage: vi.fn(),
    loading: false,
  });

  const { container } = render(
    <MemoryRouter>
      <ForgotPassword />
    </MemoryRouter>
  );
  const email = container.querySelector('input[name="email"]');
  const emailError = email.closest(".input-container").querySelector(".warn-txt");
  const submit = container.querySelector('button[type="submit"]');

  expect(email.value).toBe("");
  expect(emailError.textContent).toBe("");
  expect(submit.disabled).toBe(true);
});
