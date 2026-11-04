import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { useAuth } from "../context/auth/useAuth";
import ProtectedRoute from "./ProtectedRoute";

vi.mock("../context/auth/useAuth", () => ({ useAuth: vi.fn() }));

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});


function renderProtectedRoute({ path = "/my-quiz/all-words", verified = false, authenticated = true, loading = false } = {}) {
  const protectedMount = vi.fn();
  useAuth.mockReturnValue({
    loading,
    isAuthenticated: authenticated,
    user: authenticated ? { is_email_verified: verified } : null,
  });

  function ProtectedContent() {
    protectedMount();
    return <div data-testid="protected-content" />;
  }

  const result = render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/my-quiz/*" element={<ProtectedContent />} />
        </Route>
        <Route path="/resend-new-link" element={<div data-testid="resend-page" />} />
        <Route path="/login" element={<div data-testid="login-page" />} />
      </Routes>
    </MemoryRouter>,
  );
  return { ...result, protectedMount };
}

it.each(["/my-quiz/all-words", "/my-quiz/choose-languages"])(
  "blocks unverified users at %s before protected content mounts",
  (path) => {
    const { container, protectedMount } = renderProtectedRoute({ path });
    expect(container.querySelector(".main-content-customer.confirm-email")).not.toBeNull();
    expect(protectedMount).not.toHaveBeenCalled();
  },
);

it("allows unverified users to open the public resend page", () => {
  const { container, getByTestId } = renderProtectedRoute();
  fireEvent.click(container.querySelector('a[href="/resend-new-link"]'));
  expect(getByTestId("resend-page")).toBeTruthy();
});

it.each(["/my-quiz/all-words", "/my-quiz/choose-languages"])(
  "allows verified users through to %s",
  (path) => {
    const { getByTestId } = renderProtectedRoute({ path, verified: true });
    expect(getByTestId("protected-content")).toBeTruthy();
  },
);

it("redirects unauthenticated users to login", () => {
  const { getByTestId } = renderProtectedRoute({ authenticated: false });
  expect(getByTestId("login-page")).toBeTruthy();
});

it("waits for authentication before mounting protected content", () => {
  const { container, protectedMount } = renderProtectedRoute({ loading: true });
  expect(container.querySelector(".confirm-email")).toBeNull();
  expect(protectedMount).not.toHaveBeenCalled();
});
