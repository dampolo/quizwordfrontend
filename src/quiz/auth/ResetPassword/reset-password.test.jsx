import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
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

it("validates a password on blur and clears the error after correction", async () => {
  // Arrange: render an idle form and locate fields without translated labels.
  const user = userEvent.setup();
  useAuth.mockReturnValue({
    resetPassword: vi.fn(),
    setConfirmationMessage: vi.fn(),
    loading: false,
  });

  const { container } = render(
    <MemoryRouter>
      <ResetPassword />
    </MemoryRouter>
  );
  const password = container.querySelector('input[name="password1"]');
  const passwordError = password.closest(".input-container").querySelector(".warn-txt");
  const mismatchError = container.querySelector("form > .warn-txt");

  // Act and assert: typing alone shows no error; leaving the field validates it.
  await user.type(password, "short");
  expect(passwordError.textContent).toBe("");
  await user.tab();
  expect(passwordError.textContent.trim()).not.toBe("");
  expect(mismatchError.textContent).toBe("");

  // Act and assert: correct the password and blur again to clear its error.
  await user.clear(password);
  await user.type(password, "StrongPass123!");
  await user.tab();
  expect(passwordError.textContent).toBe("");
});

it("blocks submission when the repeated password is empty", async () => {
  // Arrange: record reset requests without calling the backend.
  const user = userEvent.setup();
  const resetPassword = vi.fn();
  useAuth.mockReturnValue({
    resetPassword,
    setConfirmationMessage: vi.fn(),
    loading: false,
  });

  const { container } = render(
    <MemoryRouter>
      <ResetPassword />
    </MemoryRouter>
  );
  const password = container.querySelector('input[name="password1"]');
  const repeatedPassword = container.querySelector('input[name="password2"]');
  const submit = container.querySelector('button[type="submit"]');

  // Act: enter a valid password but leave its confirmation empty.
  await user.type(password, "StrongPass123!");

  // Assert: the incomplete form cannot send a reset request.
  expect(repeatedPassword.value).toBe("");
  expect(submit.disabled).toBe(true);
  await user.click(submit);
  expect(resetPassword).not.toHaveBeenCalled();
});
