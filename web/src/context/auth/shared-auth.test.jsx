import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { AuthProvider } from "@quizword/shared/auth/provider";
import { useAuth } from "@quizword/shared/auth/useAuth";
import { createApiFetch } from "@quizword/shared/api";

afterEach(cleanup);
const response = (status, data = {}) => ({ status, ok: status >= 200 && status < 300, json: async () => data });
function setup(request, api = "https://example.test/api/") {
  const session = { fetch: request };
  const wrapper = ({ children }) => <AuthProvider api={api} session={session}>{children}</AuthProvider>;
  return renderHook(() => useAuth(), { wrapper });
}

it("refreshes an expired session and loads the profile once", async () => {
  const request = vi.fn()
    .mockResolvedValueOnce(response(401))
    .mockResolvedValueOnce(response(200))
    .mockResolvedValueOnce(response(200, { id: 1 }))
    .mockResolvedValueOnce(response(200, { username: "player" }));
  const { result } = setup(request);
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.user).toEqual({ id: 1 });
  expect(result.current.profile).toEqual({ username: "player" });
  expect(request.mock.calls.map(([url]) => url)).toEqual([
    "https://example.test/api/me/", "https://example.test/api/token/refresh/",
    "https://example.test/api/me/", "https://example.test/api/profile-customer/",
  ]);
  expect(request.mock.calls.every(([, options]) => options.credentials === "include")).toBe(true);
});

it("logs in through the injected session and clears user and profile on logout", async () => {
  const request = vi.fn()
    .mockResolvedValueOnce(response(401))
    .mockResolvedValueOnce(response(401))
    .mockResolvedValueOnce(response(200))
    .mockResolvedValueOnce(response(200, { id: 2 }))
    .mockResolvedValueOnce(response(200, { username: "player" }))
    .mockResolvedValueOnce(response(200));
  const { result } = setup(request);
  await waitFor(() => expect(result.current.loading).toBe(false));
  await act(async () => { expect(await result.current.login("player@example.test", "password")).toBe(true); });
  expect(result.current.isAuthenticated).toBe(true);
  expect(JSON.parse(request.mock.calls[2][1].body)).toEqual({ email: "player@example.test", password: "password" });
  await act(async () => { await result.current.logout(); });
  expect(result.current.user).toBeNull();
  expect(result.current.profile).toBe(false);
});

it("does not make requests when mobile has no backend configured", () => {
  const request = vi.fn();
  const { result } = setup(request, "");
  expect(result.current.loading).toBe(false);
  expect(result.current.isAuthenticated).toBe(false);
  expect(request).not.toHaveBeenCalled();
});

it("does not retry a protected request when session refresh fails", async () => {
  const denied = response(401);
  const request = vi.fn().mockResolvedValueOnce(denied).mockResolvedValueOnce(response(401));
  expect(await createApiFetch("https://example.test/api/", request)("https://example.test/api/profile-customer/")).toBe(denied);
  expect(request).toHaveBeenCalledTimes(2);
});
