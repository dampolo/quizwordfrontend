import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../../context/useAuth";
import CreateAccount from "./create-account";

// Replace authentication so the tests never call the real backend.
vi.mock("../../../context/useAuth", () => ({ useAuth: vi.fn() }));
vi.mock("react-toastify", () => ({ toast: { error: vi.fn() } }));

// Keep real router components, but record navigation requests.
vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

function renderCreateAccount({ loading = false } = {}) {
  const user = userEvent.setup();
  const createAccount = vi.fn().mockResolvedValue(true);
  const setConfirmationMessage = vi.fn();
  const navigate = vi.fn();
  useAuth.mockReturnValue({ createAccount, loading, setConfirmationMessage });
  useNavigate.mockReturnValue(navigate);

  const { container } = render(
    <MemoryRouter>
      <CreateAccount />
    </MemoryRouter>
  );
  const email = container.querySelector('input[name="email"]');
  const password = container.querySelector('input[name="password"]');
  const repeatedPassword = container.querySelector('input[name="repeated_password"]');
  const checkbox = container.querySelector('input[name="checked"]');
  const submit = container.querySelector('button[type="submit"]');
  const emailError = email.closest(".input-container").querySelector(".warn-txt");
  const passwordError = password.closest(".input-container").querySelector(".warn-txt");
  const repeatedPasswordError = repeatedPassword.closest(".input-container").querySelector(".warn-txt");
  const checkboxError = container.querySelector(".checkbox-container .warn-txt");

  async function fillForm({
    emailValue = "test@example.com",
    passwordValue = "StrongPass123!",
    repeatedPasswordValue = passwordValue,
    acceptPrivacy = true,
  } = {}) {
    await user.type(email, emailValue);
    await user.type(password, passwordValue);
    await user.type(repeatedPassword, repeatedPasswordValue);
    if (acceptPrivacy) await user.click(checkbox);
  }

  return {
    container, user, createAccount, setConfirmationMessage, navigate,
    email, password, repeatedPassword, checkbox, submit,
    emailError, passwordError, repeatedPasswordError, checkboxError, fillForm,
  };
}

it("renders empty fields, hidden passwords, and a disabled submit button", () => {
  const { email, password, repeatedPassword, checkbox, submit, container } = renderCreateAccount();

  expect(email.type).toBe("email");
  for (const field of [email, password, repeatedPassword]) expect(field.value).toBe("");
  expect(password.type).toBe("password");
  expect(repeatedPassword.type).toBe("password");
  expect(checkbox.checked).toBe(false);
  expect(submit.disabled).toBe(true);
  for (const error of container.querySelectorAll(".warn-txt")) expect(error.textContent).toBe("");
});

it("validates only touched fields on blur and clears a corrected email error", async () => {
  const { user, email, emailError, passwordError, repeatedPasswordError, checkboxError } = renderCreateAccount();

  await user.type(email, "test@example.c");
  expect(emailError.textContent).toBe("");
  await user.tab();
  expect(emailError.textContent.trim()).not.toBe("");
  expect(passwordError.textContent).toBe("");
  expect(repeatedPasswordError.textContent).toBe("");
  expect(checkboxError.textContent).toBe("");

  await user.clear(email);
  await user.type(email, "test@example.com");
  await user.tab();
  expect(emailError.textContent).toBe("");
});

it("blocks registration with an invalid email", async () => {
  const { user, fillForm, submit, emailError, createAccount, navigate } = renderCreateAccount();
  await fillForm({ emailValue: "test@example.c" });
  await user.click(submit);

  expect(emailError.textContent.trim()).not.toBe("");
  expect(submit.disabled).toBe(true);
  expect(createAccount).not.toHaveBeenCalled();
  expect(navigate).not.toHaveBeenCalled();
});

it.each([
  ["too short", "Abc123!"],
  ["missing lowercase", "STRONGPASS123!"],
  ["missing uppercase", "strongpass123!"],
  ["missing a digit", "StrongPassword!"],
  ["missing a special character", "StrongPass123"],
])("blocks a password that is %s", async (_description, passwordValue) => {
  const { fillForm, submit, passwordError, createAccount } = renderCreateAccount();
  await fillForm({ passwordValue });

  expect(passwordError.textContent.trim()).not.toBe("");
  expect(submit.disabled).toBe(true);
  expect(createAccount).not.toHaveBeenCalled();
});

it("blocks mismatched passwords and enables submission after correcting them", async () => {
  const { user, fillForm, repeatedPassword, repeatedPasswordError, submit, createAccount } = renderCreateAccount();
  await fillForm({ repeatedPasswordValue: "DifferentPass123!" });

  expect(repeatedPasswordError.textContent).toBe("Passwörter stimmen nicht überein.");
  expect(submit.disabled).toBe(true);
  expect(createAccount).not.toHaveBeenCalled();

  await user.clear(repeatedPassword);
  await user.type(repeatedPassword, "StrongPass123!");
  await user.tab();
  expect(repeatedPasswordError.textContent).toBe("");
  expect(submit.disabled).toBe(false);
});

it("requires privacy acceptance and validates the checkbox on blur", async () => {
  const { user, fillForm, checkbox, checkboxError, submit, createAccount } = renderCreateAccount();
  await fillForm({ acceptPrivacy: false });
  expect(submit.disabled).toBe(true);

  await user.click(checkbox);
  expect(submit.disabled).toBe(false);
  await user.click(checkbox);
  await user.tab();
  expect(checkboxError.textContent).toBe("Bitte akzeptiere die Datenschutzerklärung.");
  expect(submit.disabled).toBe(true);
  expect(createAccount).not.toHaveBeenCalled();
});

it.each(["StrongPass123!", "StrongPass123#"])("creates an account with %s and navigates after success", async (passwordValue) => {
  const { user, fillForm, submit, createAccount, setConfirmationMessage, navigate } = renderCreateAccount();
  await fillForm({ passwordValue });
  await user.click(submit);

  expect(createAccount).toHaveBeenCalledTimes(1);
  expect(createAccount).toHaveBeenCalledWith({
    email: "test@example.com", password: passwordValue,
    repeated_password: passwordValue, checked: true,
  });
  await waitFor(() => {
    expect(setConfirmationMessage).toHaveBeenCalledWith(
      "Du bist erfolgreich registriert. Um dich anzumelden, musst du dein E-Mail bestätigen!"
    );
    expect(navigate).toHaveBeenCalledWith("/confirmation");
  });
  expect(toast.error).not.toHaveBeenCalled();
});

it.each([
  [{ response: { email: ["Email already registered"] } }, "Email already registered"],
  [{ response: { password: ["Password rejected"] } }, "Password rejected"],
  [{ response: { detail: "Registration unavailable" } }, "Registration unavailable"],
  [new Error("Network unavailable"), "Account creation failed"],
])("shows the API or fallback error without navigating (%s)", async (error, message) => {
  const { user, fillForm, submit, createAccount, setConfirmationMessage, navigate } = renderCreateAccount();
  createAccount.mockRejectedValue(error);
  await fillForm();
  await user.click(submit);

  await waitFor(() => expect(toast.error).toHaveBeenCalledWith(message));
  expect(createAccount).toHaveBeenCalledTimes(1);
  expect(setConfirmationMessage).not.toHaveBeenCalled();
  expect(navigate).not.toHaveBeenCalled();
});

it("disables submission while authentication is loading", async () => {
  const { user, fillForm, submit, createAccount, navigate } = renderCreateAccount({ loading: true });
  await fillForm();
  expect(submit.disabled).toBe(true);
  await user.click(submit);
  expect(createAccount).not.toHaveBeenCalled();
  expect(navigate).not.toHaveBeenCalled();
});

it("toggles each password independently without changing values or submitting", async () => {
  const { user, container, password, repeatedPassword, createAccount } = renderCreateAccount();
  await user.type(password, "StrongPass123!");
  await user.type(repeatedPassword, "StrongPass123!");
  const toggles = container.querySelectorAll(".eye-button");

  await user.click(toggles[0]);
  expect(password.type).toBe("text");
  expect(repeatedPassword.type).toBe("password");
  await user.click(toggles[1]);
  expect(repeatedPassword.type).toBe("text");
  await user.click(toggles[0]);
  expect(password.type).toBe("password");
  expect(repeatedPassword.type).toBe("text");
  await user.click(toggles[1]);
  expect(repeatedPassword.type).toBe("password");
  expect(password.value).toBe("StrongPass123!");
  expect(repeatedPassword.value).toBe("StrongPass123!");
  expect(createAccount).not.toHaveBeenCalled();
});
