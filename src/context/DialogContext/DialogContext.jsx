import { createContext, useState, forwardRef } from "react";
import Slide from "@mui/material/Slide";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

const DialogContext = createContext();

export default DialogContext;

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export function DialogProvider({ children }) {
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
    <DialogContext.Provider value={{ openDialog, closeDialog }}>
      {children}

      <Dialog
        open={open}
        onClose={closeDialog}
        keepMounted
        slotProps={{
          paper: {
            sx: {
              borderRadius: "24px",
              p: 2,
            },
          },
        }}
        slots={{
          transition: Transition,
        }}
      >
        <DialogTitle>{options.title}</DialogTitle>

        <DialogContent>
          <DialogContentText>{options.description}</DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button
            disableRipple
            onClick={closeDialog}
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minWidth: "fit-content",
              width: "auto",
              fontSize: "1rem",
              fontWeight: 600,
              padding: "0.2rem 0.3rem",
              background: "transparent",
              color: "#5B5CE2",
              borderRadius: "0.625rem",
              border: "1px solid #dfe3ef",
              transition: "all 0.2s ease-in-out",

              "&:hover, &:focus-visible": {
                background: "rgba(91, 92, 226, 0.06)",
                border: "1px solid #5B5CE2",
                color: "#3f2bdc",
              },
            }}
          >
            {options.cancelText || "Cancel"}
          </Button>

          <Button
            onClick={handleConfirm}
            variant="contained"
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              textDecoration: "none",
              maxWidth: "8rem",
              width: "auto",
              padding: "0.2rem 0.3rem",
              fontWeight: 600,
              fontSize: "1rem",
              gap: "0.625rem",
              borderRadius: "0.625rem",
              color: "#f4f4f4",
              backgroundColor: "#3f2bdc",
              border: "1px solid #3f2bdc",
              transition: "all 0.2s ease-in-out",
              outline: "none",

              "&:hover, &:focus-visible": {
                border: "1px solid #3f2bdc",
                backgroundColor: "#fff",
                color: "#3f2bdc",
              },
            }}
          >
            {options.confirmText || "OK"}
          </Button>
        </DialogActions>
      </Dialog>
    </DialogContext.Provider>
  );
}
