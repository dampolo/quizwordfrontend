import { createContext, useEffect, useState } from "react";
import useApi from "./ApiContext";

const AuthContext = createContext();

export default AuthContext;

export function AuthProvider({ children }) {
  const api = useApi();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profile, setProfile] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");

  async function checkAuth() {
    setLoading(true);

    try {
      const response = await fetch(`${api}me/`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Not authenticated");
      }

      const user = await response.json();

      setUser(user);
      return true;
    } catch {
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function getProfile() {
    setLoading(true);

    try {
      const response = await fetch(`${api}profile-customer/`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load words.");
      }

      const data = await response.json();
      setProfile(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  }

  async function login(email, password) {
    setLoading(true);
    try {
      const response = await fetch(`${api}token/`, {
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
      const response = await fetch(`${api}create-account/`, {
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
    const response = await fetch(`${api}profile-customer/`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error("Profile update failed");
      error.response = { data };
      console.log(data);
      throw error;
    }

    setProfile(data);
    return data;
  }

  async function logout() {
    await fetch(`${api}logout/`, {
      method: "POST",
      credentials: "include",
    });

    setUser(null);
  }

  async function verifyEmail(uidb64, token) {
    setLoading(true);
    try {
      const response = await fetch(`${api}verify-email/${uidb64}/${token}`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Email verification failed.");
      }

      const data = await response.json();
      console.log("verifyEmail: ", verifyEmail);

      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async function forgotPassword(payload) {
    setLoading(true);
    const response = await fetch(`${api}forgot-password/`, {
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
      console.log(data);
      throw error;
    }

    setLoading(false);
    console.log("forgotPassword: ", data);

    return data;
  }

  async function resetPassword(password, uid, token) {
    setLoading(true);
    const response = await fetch(`${api}reset-password/`, {
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
      console.log(data);
      throw error;
    }

    setLoading(false);
    console.log("resetPassword: ", data);

    return data;
  }

  async function postChangePassword(payload) {
    setLoading(true);

    try {
      const response = await fetch(`${api}change-password/`, {
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
    } finally {
      setLoading(false);
    }
  }

  async function postChangeEmail(formData) {
    setLoading(true);

    try {
      const response = await fetch(`${api}change-email/`, {
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
      const response = await fetch(`${api}change-username/`, {
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

  useEffect(() => {
    const init = async () => {
      const authenticated = await checkAuth();

      if (authenticated) {
        await getProfile();
      }
    };

    init();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        profile,
        isMenuOpen,
        confirmationMessage,
        patchChangeUsername,
        postChangeEmail,
        postChangePassword,
        resetPassword,
        forgotPassword,
        setConfirmationMessage,
        setIsMenuOpen,
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
