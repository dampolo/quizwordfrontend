import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/auth/useAuth";
import { toast } from "react-toastify";
import ResendNewLink from "./resend-new-link";

vi.mock("react-toastify", () => ({ toast: { error: vi.fn() } }));

// Replace authentication so the test never calls the real backend.
vi.mock("../../../context/auth/useAuth", () => ({ useAuth: vi.fn() }));

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

function renderResendNewLink({ loading = false } = {}) {
  const user = userEvent.setup();
  const postResendVerification = vi.fn();
  const setConfirmationMessage = vi.fn();
  const navigate = vi.fn();
  useNavigate.mockReturnValue(navigate);
  useAuth.mockReturnValue({
    postResendVerification,
    setConfirmationMessage,
    loading,
  });

  const { container } = render(
    <MemoryRouter>
      <ResendNewLink />
    </MemoryRouter>
  );
  const email = container.querySelector('input[name="email"]');
  const emailError = email.closest(".input-container").querySelector(".warn-txt");
  const submit = container.querySelector('button[type="submit"]');
  const loader = container.querySelector(".rotate-center");
  const backLink = container.querySelector("a.arrow-back");
  const cancelLink = container.querySelector("a.back-button");

  return { user, postResendVerification, setConfirmationMessage, navigate, email, emailError, submit, loader, backLink, cancelLink };
}

it("renders an empty email field without an error and a disabled submit button", () => {
  const { email, emailError, submit } = renderResendNewLink();

  expect(email.value).toBe("");
  expect(emailError.textContent).toBe("");
  expect(submit.disabled).toBe(true);
});

it.each(["invalid", "user@example", "user@example.c", "user name@example.com"])(
  "shows an error and blocks submission for invalid email %s",
  async (emailValue) => {
    const { user, postResendVerification, email, emailError, submit } = renderResendNewLink();

    await user.type(email, emailValue);

    expect(emailError.textContent).toBe("E-Mail ist unvollständig/inkorrekt.");
    expect(submit.disabled).toBe(true);
    await user.click(submit);
    expect(postResendVerification).not.toHaveBeenCalled();
  }
);

it("clears the error after correcting the email and disables submission when cleared", async () => {
  const { user, postResendVerification, email, emailError, submit } = renderResendNewLink();

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
  expect(postResendVerification).not.toHaveBeenCalled();
});

it("submits a valid email once with the correct payload", async () => {
  const { user, postResendVerification, email, submit, setConfirmationMessage, navigate } = renderResendNewLink();
  postResendVerification.mockResolvedValue(true);

  await user.type(email, "user@example.com");
  await user.click(submit);

  expect(postResendVerification).toHaveBeenCalledTimes(1);
  expect(postResendVerification).toHaveBeenCalledWith({ email: "user@example.com" });
  expect(setConfirmationMessage).toHaveBeenCalledWith(
    "Falls für diese E-Mail-Adresse ein unbestätigtes Konto besteht, haben wir einen neuen Bestätigungslink gesendet.",
  );
  expect(navigate).toHaveBeenCalledWith("/confirmation?redirect=true");
});

it("preserves the email without confirming or navigating when the request fails", async () => {
  const { user, postResendVerification, setConfirmationMessage, navigate, email, submit } = renderResendNewLink();
  const error = new Error("Resend unavailable");
  postResendVerification.mockRejectedValue(error);

  await user.type(email, "user@example.com");
  await user.click(submit);
  await waitFor(() => expect(toast.error).toHaveBeenCalledWith(error.message));

  expect(postResendVerification).toHaveBeenCalledTimes(1);
  expect(email.value).toBe("user@example.com");
  expect(setConfirmationMessage).not.toHaveBeenCalled();
  expect(navigate).not.toHaveBeenCalled();
});

it("shows the loader and blocks submission while authentication is loading", async () => {
  const { user, postResendVerification, setConfirmationMessage, navigate, email, emailError, submit, loader } = renderResendNewLink({ loading: true });

  await user.type(email, "user@example.com");

  expect(loader).not.toBeNull();
  expect(emailError.textContent).toBe("");
  expect(submit.disabled).toBe(true);
  await user.click(submit);
  expect(postResendVerification).not.toHaveBeenCalled();
  expect(setConfirmationMessage).not.toHaveBeenCalled();
  expect(navigate).not.toHaveBeenCalled();
});

it("links back to login and cancels to login", () => {
  const { backLink, cancelLink } = renderResendNewLink();

  expect(backLink.getAttribute("href")).toBe("/login");
  expect(cancelLink.getAttribute("href")).toBe("/login");
});
