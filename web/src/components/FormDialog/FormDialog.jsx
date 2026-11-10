import { useState, forwardRef, useEffect } from "react";
import Slide from "@mui/material/Slide";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useTranslation } from "react-i18next";

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function FormDialog({
  open,
  onClose,
  onSubmit,
  selectedWordsCount,
  message,
  quizName: initialQuizName,
  dialogTitle,
  dialogDescription,
  inputName = "quizName",
  inputLabel = "Quizname",
  formId = "create-quiz-form",
  submitting = false,
  preserveInputOnSubmit = false,
}) {
  const { t } = useTranslation();
  const [quizName, setQuizName] = useState("");

  useEffect(() => {
    if (open) {
      setQuizName(initialQuizName ?? "");
    }
  }, [open, initialQuizName]);

  function handleSubmit(event) {
    event.preventDefault();

    const trimmedQuizName = quizName.trim();

    if (submitting || trimmedQuizName.length < 3) {
      return;
    }

    onSubmit(trimmedQuizName);
    if (!preserveInputOnSubmit) setQuizName("");
  }

  function handleClose() {
    if (submitting) return;
    setQuizName("");
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
	  keepMounted
      slotProps={{
        paper: {
          sx: {
            borderRadius: "var(--qw-border-radius)",
            p: 2,
          },
        },
      }}
      maxWidth="sm"
      slots={{
        transition: Transition,
      }}
    >
      <DialogTitle>
        {dialogTitle ? dialogTitle : "Erstelle dein Quiz"}
      </DialogTitle>

      <DialogContent>
        <DialogContentText>
          {dialogDescription
            ? dialogDescription
            : `Du hast ${selectedWordsCount} Wörter gewählt. Gib einen Namen für dein
            Quiz ein.`}
        </DialogContentText>

        <form id={formId} onSubmit={handleSubmit}>
          <TextField
            disabled={submitting}
            autoFocus
            required
            fullWidth
            margin="dense"
            name={inputName}
            label={inputLabel}
            value={quizName}
            onChange={(event) => setQuizName(event.target.value)}
            variant="standard"
          />
        </form>
        <div className="warn-txt">{message}</div>
      </DialogContent>

      <DialogActions
        disableSpacing
        sx={{
          alignSelf: "self-end",
          boxSizing: "border-box",
          width: "min(100%, 19rem)",
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
          disabled={submitting}
          onClick={handleClose}
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
          {t("BUTTONS.CANCEL")}
        </Button>

        <Button
          disableRipple
          type="submit"
          disabled={submitting || quizName.trim().length < 3}
          form={formId}
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
          {t("BUTTONS.SAVE")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default FormDialog;
