import { useContext } from "react";
import ApiContext from "./ApiContext.jsx";

export default function useApi() {
  return useContext(ApiContext);
}
