import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/useAuth";
import ForgotPassword from "./forgot-password";

// Replace authentication so the test never calls the real backend.
vi.mock("../../../context/useAuth", () => ({ useAuth: vi.fn() }));

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

function renderForgotPassword() {
  const user = userEvent.setup();
  const forgotPassword = vi.fn();
  const setConfirmationMessage = vi.fn();
  const navigate = vi.fn();
  useNavigate.mockReturnValue(navigate);
  useAuth.mockReturnValue({
    forgotPassword,
    setConfirmationMessage,
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

  return { user, forgotPassword, setConfirmationMessage, navigate, email, emailError, submit };
}

it("renders an empty email field without an error and a disabled submit button", () => {
  const { email, emailError, submit } = renderForgotPassword();

  expect(email.value).toBe("");
  expect(emailError.textContent).toBe("");
  expect(submit.disabled).toBe(true);
});

it.each(["invalid", "user@example", "user@example.c", "user name@example.com"])(
  "shows an error and blocks submission for invalid email %s",
  async (emailValue) => {
    const { user, forgotPassword, email, emailError, submit } = renderForgotPassword();

    await user.type(email, emailValue);

    expect(emailError.textContent).toBe("E-Mail ist unvollständig/inkorrekt.");
    expect(submit.disabled).toBe(true);
    await user.click(submit);
    expect(forgotPassword).not.toHaveBeenCalled();
  }
);

it("clears the error after correcting the email and disables submission when cleared", async () => {
  const { user, forgotPassword, email, emailError, submit } = renderForgotPassword();

  await user.type(email, "invalid");
  expect(emailError.textContent).toBe("E-Mail ist unvollständig/inkorrekt.");
  expect(submit.disabled).toBe(true);

  await user.clear(email);
  await user.type(email, "user@example.com");
  expect(email.value).toBe("user@example.com");
  expect(emailError.textContent).toBe("");
  expect(submit.disabled).toBe(false);

  await user.clear(email);
  expect(email.value).toBe("");
  expect(emailError.textContent).toBe("E-Mail ist unvollständig/inkorrekt.");
  expect(submit.disabled).toBe(true);
  expect(forgotPassword).not.toHaveBeenCalled();
});

it("submits a valid email once with the correct payload", async () => {
  const { user, forgotPassword, email, submit } = renderForgotPassword();
  forgotPassword.mockResolvedValue(true);

  await user.type(email, "user@example.com");
  await user.click(submit);

  expect(forgotPassword).toHaveBeenCalledTimes(1);
  expect(forgotPassword).toHaveBeenCalledWith({ email: "user@example.com" });
});

it("preserves the email without confirming or navigating when the request fails", async () => {
  const { user, forgotPassword, setConfirmationMessage, navigate, email, submit } = renderForgotPassword();
  const error = new Error("Recovery unavailable");
  forgotPassword.mockRejectedValue(error);
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

  try {
    await user.type(email, "user@example.com");
    await user.click(submit);
    await waitFor(() => expect(consoleError).toHaveBeenCalledWith(error));

    expect(forgotPassword).toHaveBeenCalledTimes(1);
    expect(email.value).toBe("user@example.com");
    expect(setConfirmationMessage).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  } finally {
    consoleError.mockRestore();
  }
});
