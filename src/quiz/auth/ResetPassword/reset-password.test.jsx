import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useAuth } from "../../../context/useAuth";
import ResetPassword from "./reset-password";

// Replace authentication so this test never calls the backend.
vi.mock("../../../context/useAuth", () => ({ useAuth: vi.fn() }));

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

it("renders empty hidden passwords and a disabled submit button", () => {
  // Arrange: authentication is idle when the form first opens.
  useAuth.mockReturnValue({
    resetPassword: vi.fn(),
    setConfirmationMessage: vi.fn(),
    loading: false,
  });

  // Act: render the form inside the router it needs.
  const { container } = render(
    <MemoryRouter>
      <ResetPassword />
    </MemoryRouter>
  );

  // Assert: both passwords start empty and hidden; submission is disabled.
  const password = container.querySelector('input[name="password1"]');
  const repeatedPassword = container.querySelector('input[name="password2"]');
  const submit = container.querySelector('button[type="submit"]');

  expect(password.value).toBe("");
  expect(repeatedPassword.value).toBe("");
  expect(password.type).toBe("password");
  expect(repeatedPassword.type).toBe("password");
  expect(submit.disabled).toBe(true);
});
