import { createApiFetch } from "@quizword/shared/api";

export const apiFetch = createApiFetch(import.meta.env.VITE_API_URL);
