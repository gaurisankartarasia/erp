import React, { createContext, useContext, useState, useCallback } from "react";
import ConfirmModal from "@/components/common/modals/ConfirmationModal";

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    description: "",
    resolve: null,
  });

  const confirm = useCallback(({ title, description }) => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        title,
        description,
        resolve,
      });
    });
  }, []);

  const handleClose = useCallback(() => {
    setModalState((prev) => {
      if (prev.resolve) prev.resolve(false); // user cancelled
      return { ...prev, isOpen: false, resolve: null };
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setModalState((prev) => {
      if (prev.resolve) prev.resolve(true); // user confirmed
      return { ...prev, isOpen: false, resolve: null };
    });
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmModal
        isOpen={modalState.isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title={modalState.title}
        description={modalState.description}
      />
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return ctx;
}
