import { useCallback, useMemo, useRef, useState } from "react";
import { Portal, Snackbar } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SnackbarContext } from "./SnackbarContext";


export function SnackbarProvider({ children }) {
  const [notification, setNotification] = useState(null);
  const nextId = useRef(0);
  const insets = useSafeAreaInsets();
  const showSnackbar = useCallback((message) => {
    if (typeof message !== "string" || !message.trim()) {
      return;
    }
    nextId.current += 1;
    setNotification({ id: nextId.current, message });
  }, []);
  const hideSnackbar = useCallback(() => {
    setNotification(null);
  }, []);
  const value = useMemo(() => ({ showSnackbar, hideSnackbar }), [showSnackbar, hideSnackbar]);

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      <Portal>
        {notification && (
          <Snackbar
            key={notification.id}
            visible
            duration={5000}
            wrapperStyle={{ bottom: insets.bottom }}
            onDismiss={hideSnackbar}
            action={{ label: "OK", onPress: hideSnackbar }}
          >
            {notification.message}
          </Snackbar>
        )}
      </Portal>
    </SnackbarContext.Provider>
  );
}
