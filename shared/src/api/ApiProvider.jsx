import ApiContext from "./ApiContext.jsx";

export function ApiProvider({ children, api }) {
  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
}
