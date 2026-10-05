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

function renderResetPassword() {
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
  const passwordError = password.closest(".input-container").querySelector(".warn-txt");
  const mismatchError = container.querySelector("form > .warn-txt");
  const submit = container.querySelector('button[type="submit"]');

  return { user, resetPassword, password, repeatedPassword, passwordError, mismatchError, submit };
}

it("renders empty hidden passwords and a disabled submit button", () => {
  const { password, repeatedPassword, submit } = renderResetPassword();

  expect(password.value).toBe("");
  expect(repeatedPassword.value).toBe("");
  expect(password.type).toBe("password");
  expect(repeatedPassword.type).toBe("password");
  expect(submit.disabled).toBe(true);
});

it("validates a password on blur and clears the error after correction", async () => {
  const { user, password, passwordError, mismatchError } = renderResetPassword();

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
  const { user, resetPassword, password, repeatedPassword, submit } = renderResetPassword();

  // Act: enter a valid password but leave its confirmation empty.
  await user.type(password, "StrongPass123!");

  // Assert: the incomplete form cannot send a reset request.
  expect(repeatedPassword.value).toBe("");
  expect(submit.disabled).toBe(true);
  await user.click(submit);
  expect(resetPassword).not.toHaveBeenCalled();
});

it("blocks matching passwords shorter than 10 characters", async () => {
  const { user, resetPassword, password, repeatedPassword, passwordError, mismatchError, submit } = renderResetPassword();

  // Act: use 9 characters with every required character type in both fields.
  await user.type(password, "Abcdef12!");
  await user.type(repeatedPassword, "Abcdef12!");
  await user.tab();

  // Assert: length validation fails despite matching passwords.
  expect(passwordError.textContent.trim()).not.toBe("");
  expect(mismatchError.textContent).toBe("");
  expect(submit.disabled).toBe(true);
  await user.click(submit);
  expect(resetPassword).not.toHaveBeenCalled();
});

it("blocks matching passwords without a lowercase letter", async () => {
  const { user, resetPassword, password, repeatedPassword, passwordError, mismatchError, submit } = renderResetPassword();

  // Act: use matching passwords that meet every rule except lowercase letters.
  await user.type(password, "STRONGPASS123!");
  await user.type(repeatedPassword, "STRONGPASS123!");
  await user.tab();

  // Assert: password validation fails without a mismatch error or reset request.
  expect(passwordError.textContent.trim()).not.toBe("");
  expect(mismatchError.textContent).toBe("");
  expect(submit.disabled).toBe(true);
  await user.click(submit);
  expect(resetPassword).not.toHaveBeenCalled();
});
