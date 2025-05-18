import React, { createContext, useContext, useState, useCallback } from "react";
import { Snackbar, Alert } from "@mui/material";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ open: false, msg: "", sev: "info" });

  const show = useCallback((msg, sev = "info") => {
    setToast({ open: true, msg, sev });
  }, []);

  const handleClose = () => setToast(toast => ({ ...toast, open: false }));

  return (
    <ToastContext.Provider value={show}>
      {children}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleClose}
          severity={toast.sev}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toast.msg}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be inside ToastProvider");
  return {
    info:  (msg) => ctx(msg, "info"),
    success: (msg) => ctx(msg, "success"),
    warning: (msg) => ctx(msg, "warning"),
    error:   (msg) => ctx(msg, "error"),
  };
}
