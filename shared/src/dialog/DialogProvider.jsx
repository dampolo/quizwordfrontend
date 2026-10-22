import { useState } from "react";
import DialogContext from "./DialogContext.jsx";

export function DialogProvider({ children, renderDialog }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState({});

  const openDialog = (options) => {
    setOptions(options);
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
  };

  const handleConfirm = () => {
    if (options.onConfirm) {
      options.onConfirm();
    }

    closeDialog();
  };

  return (
    <DialogContext.Provider value={{ openDialog, closeDialog, open, options, handleConfirm }}>
      {children}
      {renderDialog?.({ open, options, closeDialog, handleConfirm })}
    </DialogContext.Provider>
  );
}
