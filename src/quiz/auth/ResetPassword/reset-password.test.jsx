import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { toast } from "react-toastify";
import { useAuth } from "../../../context/useAuth";
import ResetPassword from "./reset-password";

// Replace authentication so this test never calls the backend.
vi.mock("../../../context/useAuth", () => ({ useAuth: vi.fn() }));
vi.mock("react-toastify", () => ({ toast: { error: vi.fn() } }));

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

function renderResetPassword() {
  const user = userEvent.setup();
  const resetPassword = vi.fn();
  const setConfirmationMessage = vi.fn();
  const navigate = vi.fn();
  useNavigate.mockReturnValue(navigate);
  useAuth.mockReturnValue({
    resetPassword,
    setConfirmationMessage,
    loading: false,
  });

  const { container } = render(
    <MemoryRouter initialEntries={["/reset-password/test-uid/test-token"]}>
      <Routes>
        <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
      </Routes>
    </MemoryRouter>
  );
  const password = container.querySelector('input[name="password1"]');
  const repeatedPassword = container.querySelector('input[name="password2"]');
  const passwordError = password.closest(".input-container").querySelector(".warn-txt");
  const mismatchError = container.querySelector("form > .warn-txt");
  const submit = container.querySelector('button[type="submit"]');

  return { user, resetPassword, setConfirmationMessage, navigate, password, repeatedPassword, passwordError, mismatchError, submit };
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

it("blocks matching passwords without an uppercase letter", async () => {
  const { user, resetPassword, password, repeatedPassword, passwordError, mismatchError, submit } = renderResetPassword();

  // Act: use matching passwords that meet every rule except uppercase letters.
  await user.type(password, "strongpass123!");
  await user.type(repeatedPassword, "strongpass123!");
  await user.tab();

  // Assert: password validation fails without a mismatch error or reset request.
  expect(passwordError.textContent.trim()).not.toBe("");
  expect(mismatchError.textContent).toBe("");
  expect(submit.disabled).toBe(true);
  await user.click(submit);
  expect(resetPassword).not.toHaveBeenCalled();
});

it("blocks matching passwords without a digit", async () => {
  const { user, resetPassword, password, repeatedPassword, passwordError, mismatchError, submit } = renderResetPassword();

  // Act: use matching passwords that meet every rule except a digit.
  await user.type(password, "StrongPassword!");
  await user.type(repeatedPassword, "StrongPassword!");
  await user.tab();

  // Assert: password validation fails without a mismatch error or reset request.
  expect(passwordError.textContent.trim()).not.toBe("");
  expect(mismatchError.textContent).toBe("");
  expect(submit.disabled).toBe(true);
  await user.click(submit);
  expect(resetPassword).not.toHaveBeenCalled();
});

it("blocks matching passwords without a special character", async () => {
  const { user, resetPassword, password, repeatedPassword, passwordError, mismatchError, submit } = renderResetPassword();

  // Act: use matching passwords that meet every rule except a special character.
  await user.type(password, "StrongPass123");
  await user.type(repeatedPassword, "StrongPass123");
  await user.tab();

  // Assert: password validation fails without a mismatch error or reset request.
  expect(passwordError.textContent.trim()).not.toBe("");
  expect(mismatchError.textContent).toBe("");
  expect(submit.disabled).toBe(true);
  await user.click(submit);
  expect(resetPassword).not.toHaveBeenCalled();
});

it("blocks submission when the repeated password is weak", async () => {
  const { user, resetPassword, password, repeatedPassword, passwordError, mismatchError, submit } = renderResetPassword();

  // Act: enter a valid first password and a weak repeated password.
  await user.type(password, "StrongPass123!");
  await user.type(repeatedPassword, "short");
  await user.tab();

  // Assert: the first password is valid, but the incomplete confirmation blocks reset.
  expect(passwordError.textContent).toBe("");
  expect(mismatchError.textContent.trim()).not.toBe("");
  expect(submit.disabled).toBe(true);
  await user.click(submit);
  expect(resetPassword).not.toHaveBeenCalled();
});

it("blocks mismatched strong passwords and enables submission after correction", async () => {
  const { user, resetPassword, password, repeatedPassword, passwordError, mismatchError, submit } = renderResetPassword();

  // Act: enter two different passwords that both meet the strength rules.
  await user.type(password, "StrongPass123!");
  await user.type(repeatedPassword, "DifferentPass123!");
  await user.tab();

  // Assert: a mismatch must block submission even though both passwords are strong.
  expect(passwordError.textContent).toBe("");
  expect(mismatchError.textContent.trim()).not.toBe("");
  expect(submit.disabled).toBe(true);
  await user.click(submit);
  expect(resetPassword).not.toHaveBeenCalled();

  // Act: correct the repeated password and leave the field again.
  await user.clear(repeatedPassword);
  await user.type(repeatedPassword, "StrongPass123!");
  await user.tab();

  // Assert: matching valid passwords clear the error and allow submission.
  expect(mismatchError.textContent).toBe("");
  expect(submit.disabled).toBe(false);
});

it("resets the password with route credentials and confirms success", async () => {
  const { user, resetPassword, setConfirmationMessage, navigate, password, repeatedPassword, submit } = renderResetPassword();
  resetPassword.mockResolvedValue(true);

  // Act: submit matching valid passwords.
  await user.type(password, "StrongPass123!");
  await user.type(repeatedPassword, "StrongPass123!");
  expect(submit.disabled).toBe(false);
  await user.click(submit);

  // Assert: use the password and URL credentials, then confirm and clear the form.
  expect(resetPassword).toHaveBeenCalledTimes(1);
  expect(resetPassword).toHaveBeenCalledWith("StrongPass123!", "test-uid", "test-token");
  await waitFor(() => {
    expect(setConfirmationMessage).toHaveBeenCalledWith("Dein Password wurde erfolgreich geändert.");
    expect(navigate).toHaveBeenCalledWith("/confirmation");
    expect(password.value).toBe("");
    expect(repeatedPassword.value).toBe("");
  });
});

it("reports a failed reset without confirming, navigating, or clearing the passwords", async () => {
  const { user, resetPassword, setConfirmationMessage, navigate, password, repeatedPassword, submit } = renderResetPassword();
  const error = new Error("Reset unavailable");
  resetPassword.mockRejectedValue(error);
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

  try {
    // Act: submit valid passwords, but let the reset request fail.
    await user.type(password, "StrongPass123!");
    await user.type(repeatedPassword, "StrongPass123!");
    await user.click(submit);
    await waitFor(() => expect(consoleError).toHaveBeenCalledWith(error));

    // Assert: failure preserves the form and does not enter the success flow.
    expect(resetPassword).toHaveBeenCalledTimes(1);
    expect(setConfirmationMessage).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
    expect(password.value).toBe("StrongPass123!");
    expect(repeatedPassword.value).toBe("StrongPass123!");
    expect(toast.error).toHaveBeenCalledTimes(1);
  } finally {
    consoleError.mockRestore();
  }
});
