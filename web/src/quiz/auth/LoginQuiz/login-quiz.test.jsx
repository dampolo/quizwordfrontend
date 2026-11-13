import { afterEach, expect, it, vi } from "vitest";
import { act, cleanup, render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../../context/auth/useAuth";
import i18n from "../../../i18n/i18n";
import LoginQuiz from "./login-quiz";

// Replace authentication so the test never calls the real backend.
vi.mock("../../../context/auth/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("react-toastify", () => ({
  toast: { error: vi.fn() },
}));

// Keep the real router components, but record navigation requests.
vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: vi.fn(),
}));

afterEach(async () => {
  cleanup();
  vi.resetAllMocks();
  await i18n.changeLanguage("en");
});

// Shared setup for the remaining scenarios; selectors do not depend on labels.
function renderLogin({ loading = false } = {}) {
  const user = userEvent.setup();
  const login = vi.fn().mockResolvedValue(true);
  const navigate = vi.fn();
  useAuth.mockReturnValue({ login, loading });
  useNavigate.mockReturnValue(navigate);

  const { container } = render(
    <MemoryRouter>
      <LoginQuiz />
    </MemoryRouter>
  );
  const email = container.querySelector('input[name="email"]');
  const password = container.querySelector('input[name="password"]');
  const submit = container.querySelector('button[type="submit"]');
  const emailError = email.closest(".input-container").querySelector(".warn-txt");
  const passwordError = password.closest(".input-container").querySelector(".warn-txt");

  async function submitCredentials(emailValue = "test@example.com") {
    await user.type(email, emailValue);
    await user.type(password, "StrongPass123!");
    await user.click(submit);
  }

  return { container, user, login, navigate, email, password, submit,
    emailError, passwordError, submitCredentials };
}

it("renders empty email and password fields and an enabled submit button", () => {
  const { email, password, submit } = renderLogin();

  expect(email.type).toBe("email");
  expect(email.value).toBe("");
  expect(password.type).toBe("password");
  expect(password.value).toBe("");
  expect(submit.disabled).toBe(false);
});

it("shows both validation errors when the form is empty", async () => {
  const { user, submit, emailError, passwordError, login, navigate } = renderLogin();

  await user.click(submit);

  expect(emailError.textContent.trim()).not.toBe("");
  expect(passwordError.textContent.trim()).not.toBe("");
  expect(login).not.toHaveBeenCalled();
  expect(navigate).not.toHaveBeenCalled();
});

it("updates the login labels and existing validation errors when the language changes", async () => {
  const { user, email, submit, emailError, passwordError } = renderLogin();

  await user.click(submit);
  expect(email.labels[0].textContent).toBe("Email address");
  expect(emailError.textContent).toBe("Enter a valid email address.");

  await act(async () => {
    await i18n.changeLanguage("de");
  });

  expect(document.title).toBe("Anmeldung | Quiz Word");
  expect(email.labels[0].textContent).toBe("E-Mail-Adresse");
  expect(submit.textContent).toBe("Anmelden");
  expect(emailError.textContent).toBe("Gib eine gültige E-Mail-Adresse ein.");
  expect(passwordError.textContent).toBe("Dein Passwort ist nicht korrekt.");
});

it("shows an email error for an address rejected by component validation", async () => {
  const { submitCredentials, emailError, passwordError, login, navigate } = renderLogin();

  // A one-character suffix passes native email validation but fails our regex.
  await submitCredentials("test@example.c");

  expect(emailError.textContent.trim()).not.toBe("");
  expect(passwordError.textContent).toBe("");
  expect(login).not.toHaveBeenCalled();
  expect(navigate).not.toHaveBeenCalled();
});

it("blocks a malformed email through native browser validation", async () => {
  const { submitCredentials, email, login, navigate } = renderLogin();

  await submitCredentials("invalid-email");

  expect(email.validity.typeMismatch).toBe(true);
  expect(login).not.toHaveBeenCalled();
  expect(navigate).not.toHaveBeenCalled();
});

it("shows the API error in the form and in a toast when login rejects", async () => {
  const { login, navigate, submitCredentials, passwordError } = renderLogin();
  const message = "Account is not active";
  login.mockRejectedValue({ response: { detail: message } });

  await submitCredentials();

  await waitFor(() => {
    expect(toast.error).toHaveBeenCalledWith(message);
    expect(passwordError.textContent).toBe(message);
  });
  expect(login).toHaveBeenCalledWith("test@example.com", "StrongPass123!");
  expect(navigate).not.toHaveBeenCalled();
});

it("shows the fallback error when login rejects without API details", async () => {
  const { login, navigate, submitCredentials, passwordError } = renderLogin();
  login.mockRejectedValue(new Error("Network unavailable"));

  await submitCredentials();

  await waitFor(() => {
    expect(toast.error).toHaveBeenCalledWith("Login failed.");
    expect(passwordError.textContent).toBe("Login failed.");
  });
  expect(navigate).not.toHaveBeenCalled();
});

it("does not navigate when login returns false", async () => {
  const { login, navigate, submitCredentials } = renderLogin();
  login.mockResolvedValue(false);

  await submitCredentials();

  expect(login).toHaveBeenCalledTimes(1);
  expect(login).toHaveBeenCalledWith("test@example.com", "StrongPass123!");
  expect(navigate).not.toHaveBeenCalled();
});

it("disables submission while authentication is loading", async () => {
  const { submit, submitCredentials, login, navigate } = renderLogin({ loading: true });

  expect(submit.disabled).toBe(true);
  await submitCredentials();

  expect(login).not.toHaveBeenCalled();
  expect(navigate).not.toHaveBeenCalled();
});

it("toggles password visibility without changing its value or submitting", async () => {
  const { container, user, password, login, navigate } = renderLogin();
  const toggle = container.querySelector('button[type="button"].eye-button');
  await user.type(password, "StrongPass123!");

  expect(password.type).toBe("password");
  await user.click(toggle);
  expect(password.type).toBe("text");
  expect(password.value).toBe("StrongPass123!");

  await user.click(toggle);
  expect(password.type).toBe("password");
  expect(password.value).toBe("StrongPass123!");
  expect(login).not.toHaveBeenCalled();
  expect(navigate).not.toHaveBeenCalled();
});

it("logs in with the entered credentials and navigates after success", async () => {
  // Arrange: prepare a user and a successful authentication response.
  const user = userEvent.setup();
  const login = vi.fn().mockResolvedValue(true);
  const navigate = vi.fn();
  useAuth.mockReturnValue({ login, loading: false });
  useNavigate.mockReturnValue(navigate);

  const { container } = render(
    <MemoryRouter>
      <LoginQuiz />
    </MemoryRouter>
  );

  // Act: fill in the form and submit it as a user would.
  await user.type(
    container.querySelector('input[name="email"]'),
    "test@example.com"
  );
  await user.type(
    container.querySelector('input[name="password"]'),
    "StrongPass123!"
  );
  await user.click(container.querySelector('button[type="submit"]'));

  // Assert: check the credentials and the destination after login resolves.
  expect(login).toHaveBeenCalledTimes(1);
  expect(login).toHaveBeenCalledWith("test@example.com", "StrongPass123!");
  await waitFor(() => {
    expect(navigate).toHaveBeenCalledWith("/my-quiz/all-words");
  });
});

it("shows a password error without logging in when the password has no special character", async () => {
  // Arrange: login would succeed if called, but validation should prevent it.
  const user = userEvent.setup();
  const login = vi.fn().mockResolvedValue(true);
  const navigate = vi.fn();
  useAuth.mockReturnValue({ login, loading: false });
  useNavigate.mockReturnValue(navigate);

  const { container } = render(
    <MemoryRouter>
      <LoginQuiz />
    </MemoryRouter>
  );

  // Act: submit a valid email and a password missing a special character.
  await user.type(
    container.querySelector('input[name="email"]'),
    "test@example.com"
  );
  await user.type(
    container.querySelector('input[name="password"]'),
    "StrongPass123"
  );
  await user.click(container.querySelector('button[type="submit"]'));

  // Assert: validation displays an error and stops authentication.
  const passwordField = container.querySelector('input[name="password"]');
  const passwordError = passwordField
    .closest(".input-container")
    .querySelector(".warn-txt");
  expect(passwordError.textContent.trim()).not.toBe("");
  expect(login).not.toHaveBeenCalled();
  expect(navigate).not.toHaveBeenCalled();
});
