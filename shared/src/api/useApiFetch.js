import { useMemo } from "react";
import useApi from "./useApi.js";
import { createApiFetch } from "./createApiFetch.js";

export default function useApiFetch(request, apiOverride) {
  const contextApi = useApi();
  const api = apiOverride ?? contextApi;
  return useMemo(() => createApiFetch(api, request), [api, request]);
}
