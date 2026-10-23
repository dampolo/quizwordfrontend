import { useCallback, useEffect, useMemo, useState } from "react";
import { createApiFetch } from "../api/createApiFetch.js";

import AuthContext from "./AuthContext.js";

export function AuthProvider({ children, api, session, onProfileError = console.error }) {
  const request = session?.fetch ?? fetch;
  const apiFetch = useMemo(() => createApiFetch(api, request), [api, request]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(api));
  const [profile, setProfile] = useState(false);

  const getProfile = useCallback(async () => {
    try {
      const response = await apiFetch(`${api}profile-customer/`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load words.");
      }

      const data = await response.json();
      setProfile(data);
    } catch (error) {
      onProfileError(error);
    }
  }, [api, apiFetch, onProfileError]);

  const checkAuth = useCallback(async () => {
    setLoading(true);

    try {
      let response = await request(`${api}me/`, {
        credentials: "include",
      });

      if (response.status === 401) {
        const refreshResponse = await request(`${api}token/refresh/`, {
          method: "POST",
          credentials: "include",
        });

        if (!refreshResponse.ok) {
          setUser(null);
          return false;
        }

        response = await request(`${api}me/`, {
          credentials: "include",
        });

      }

      if (!response.ok) {
        throw new Error("Not authenticated");
      }

      const user = await response.json();
      setUser(user);

      // Avatar must be loaded after log in that why getProfile() 
      await getProfile()
      
      return true;
    } catch {
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  }, [api, request, getProfile]);

  async function login(email, password) {
    setLoading(true);
    try {
      const response = await request(`${api}token/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        const error = new Error("Account creation failed");
        error.response = data;
        throw error;
      }
      return checkAuth();
    } finally {
      setLoading(false);
    }
  }

  async function createAccount(formData) {
    setLoading(true);

    try {
      const response = await request(`${api}create-account/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        const error = new Error("Account creation failed");
        error.response = data;
        throw error;
      }

      return checkAuth();
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile(payload) {
    const isFormData = payload instanceof FormData;

    const response = await apiFetch(`${api}profile-customer/`, {
      method: "PATCH",
      credentials: "include",
      headers: isFormData ? undefined : { "Content-Type": "application/json" },
      body: isFormData ? payload : JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error("Profile update failed");
      error.response = { data };
      throw error;
    }

    setProfile(data);
    return data;
  }

  async function logout() {
    await request(`${api}logout/`, {
      method: "POST",
      credentials: "include",
    });

    setUser(null);
    setProfile(false);
  }

  async function verifyEmail(uidb64, token) {
    setLoading(true);
    try {
      const response = await request(`${api}verify-email/${uidb64}/${token}`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = new Error("Email verification failed.");
        error.status = response.status;
        throw error;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function forgotPassword(payload) {
    setLoading(true);
    try {
      const response = await request(`${api}forgot-password/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const error = new Error("Changed password failed");
        error.response = { data };
        throw error;
      }
      return data;
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(password, uid, token) {
    setLoading(true);
    const response = await request(`${api}reset-password/`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password, uid, token }),
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error("Changed password failed");
      error.response = { data };
      throw error;
    }

    setLoading(false);
    return data;
  }

  async function postChangePassword(payload) {
    try {
      const response = await request(`${api}change-password/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const error = new Error("Changed password failed");
        error.response = data;
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Email change failed:", error);
      throw error;
    }
  }

  async function postChangeEmail(formData) {
    setLoading(true);

    try {
      const response = await request(`${api}change-email/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        const error = new Error("Email change failed");
        error.response = data;
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Email change failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function patchChangeUsername(formData) {
    try {
      const response = await request(`${api}change-username/`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        const error = new Error("Username change failed");
        error.response = data;
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Username change failed:", error);
      throw error;
    }
  }

  async function deleteAccount(password) {
    const response = await request(`${api}delete-account/`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(password),
    });

    const data = await response.json();

    if (!response.ok) {
      throw data;
    }
    return data;
  }

  async function postSupport(payload) {
    const response = await request(`${api}support/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      const error = new Error("Nachricht konnte nicht gesendet werden.");
      error.response = { data };
      throw error;
    }
    return data;
  }


  async function postResendVerification(payload) {
    setLoading(true);
    try {
      const response = await request(`${api}resend-verification/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const error = new Error("Der Bestätigungslink konnte nicht gesendet werden. Bitte versuche es erneut.");
        error.response = data;
        error.status = response.status;
        throw error;
      }

      return data;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (api) void checkAuth();
  }, [api, checkAuth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        profile,
        postResendVerification,
        postSupport,
        deleteAccount,
        patchChangeUsername,
        postChangeEmail,
        postChangePassword,
        resetPassword,
        forgotPassword,
        verifyEmail,
        login,
        logout,
        getProfile,
        checkAuth,
        updateProfile,
        createAccount,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
