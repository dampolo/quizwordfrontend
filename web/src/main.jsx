import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ApiProvider } from "@quizword/shared/api/provider";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/auth/AuthProvider";
import "./styles/basic.scss"
import "./i18n/i18n";

ReactDOM.createRoot(document.getElementById("root")).render(
  <ApiProvider api={import.meta.env.VITE_API_URL}>
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
  </ApiProvider>
);