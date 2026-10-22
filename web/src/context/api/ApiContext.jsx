import { createContext } from "react";

const ApiContext = createContext(import.meta.env.VITE_API_URL);

export default ApiContext;
