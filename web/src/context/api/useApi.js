import useSharedApi from "@quizword/shared/api/useApi";

export default function useApi() {
  return useSharedApi() ?? import.meta.env.VITE_API_URL;
}
