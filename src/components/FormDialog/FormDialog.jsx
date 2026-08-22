import { useState, forwardRef } from "react";
import Slide from "@mui/material/Slide";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function FormDialog({ open, onClose, onSubmit, selectedWordsCount, message }) {
  const [quizName, setQuizName] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    const trimmedQuizName = quizName.trim();

    if (!trimmedQuizName) {
      return;
    }

    onSubmit(trimmedQuizName);
    setQuizName("");
  }

  function handleClose() {
    setQuizName("");
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: "24px",
            p: 2,
          },
        },
      }}
      maxWidth="sm"
      slots={{
        transition: Transition,
      }}
    >
      <DialogTitle>Erstelle dein Quiz</DialogTitle>

      <DialogContent>
        <DialogContentText>
          Du hast {selectedWordsCount} Wörter gewählt. Gib einen Namen für dein Quiz ein.
        </DialogContentText>

        <form id="create-quiz-form" onSubmit={handleSubmit}>
          <TextField
            autoFocus
            required
            fullWidth
            margin="dense"
            name="quizName"
            label="Quizname"
            value={quizName}
            onChange={(event) => setQuizName(event.target.value)}
            variant="standard"
          />
        </form>
        <div className="warn-txt" >
        {message}
        </div>

      </DialogContent>

      <DialogActions 
      sx={{
        alignSelf: "self-end",
    }}
        >
        <Button
          onClick={handleClose}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minWidth: "140px",
            fontSize: "16px",
            fontWeight: 600,
            transition: "0.25s",
            height: "50px",
            background: "transparent",
            color: "#5B5CE2",
            borderRadius: "0.625rem",
            border: "1px solid #dfe3ef",

            "&:hover, &:focus-visible": {
              background: "rgba(91, 92, 226, 0.06)",
              border: "1px solid #5B5CE2",
              color: "#3f2bdc",
            },
          }}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={quizName.length < 3}
          form="create-quiz-form"
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            textDecoration: "none",
            maxWidth: "10.375rem",
            width: "100%",
            fontWeight: 700,
            fontSize: "1.125rem",
            gap: "0.625rem",
            padding: "0.75rem 1.5625rem",
            margin: "auto",
            borderRadius: "0.625rem",
            color: "#f4f4f4",
            backgroundColor: "#3f2bdc",
            border: "1px solid #3f2bdc",
            transition: "all 0.2s ease-in-out",
            outline: "none",
            cursor: "pointer",

            "&:hover, &:focus-visible": {
              border: "1px solid #3f2bdc",
              backgroundColor: "#fff",
              color: "#3f2bdc",
            },
          }}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default FormDialog;
