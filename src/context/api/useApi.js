import { useContext } from "react";
import ApiContext from "./ApiContext";

export default function useApi() {
  return useContext(ApiContext);
}
