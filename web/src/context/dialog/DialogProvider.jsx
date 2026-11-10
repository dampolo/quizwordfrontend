import Slide from "@mui/material/Slide";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

import { forwardRef } from "react";
import { DialogProvider as SharedDialogProvider } from "@quizword/shared/dialog/provider";

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function renderDialog({ open, options, closeDialog, handleConfirm }) {
  return (
      <Dialog
        open={open}
        onClose={closeDialog}
        keepMounted
        slotProps={{
          paper: {
            sx: {
              borderRadius: "var(--qw-border-radius)",
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

        {options.nativeWord && options.targetWord && (
          <DialogContent
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: "0.3rem",
              padding: "0 1rem 1.2rem 1rem",
              textAlign: "center",
              overflowWrap: "anywhere",
            }}
          >
            <DialogContentText component="strong" sx={{ color: "#4738d6", fontSize: "1rem", fontWeight: 700 }}>
              {options.nativeWord}
            </DialogContentText>
            <span style={{ color: "#bbb", fontSize: "1.2rem" }}>»</span>
            <DialogContentText sx={{ color: "#444", fontSize: "1rem" }}>
              {options.targetWord}
            </DialogContentText>
          </DialogContent>
        )}

        <DialogActions
          disableSpacing
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 8.5rem), 1fr))",
            gridAutoRows: "1fr",
            gap: "0.5rem",
            "& > .MuiButton-root": {
              minWidth: 0,
              width: "100%",
              overflowWrap: "anywhere",
            },
          }}
        >
          <Button
            disableRipple
            onClick={closeDialog}
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "1rem",
              fontWeight: 600,
              padding: "0.2rem 0.75rem",
              background: "transparent",
              color: "#5B5CE2",
              borderRadius: "var(--qw-border-radius)",
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
              padding: "0.2rem 0.75rem",
              fontWeight: 600,
              fontSize: "1rem",
              gap: "0.625rem",
              borderRadius: "var(--qw-border-radius)",
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
  );
}

export function DialogProvider({ children }) {
  return <SharedDialogProvider renderDialog={renderDialog}>{children}</SharedDialogProvider>;
}
