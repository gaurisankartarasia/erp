// import React, { createContext, useContext, useState, useCallback } from "react";
// import MessageModal from "@/components/common/modals/MessageModal";

// const MessageContext = createContext(null);

// export function MessageProvider({ children }) {
//   const [modalState, setModalState] = useState({
//     isOpen: false,
//     message: "",
//     variant: "info",
//     resolve: null,
//   });

//   const showMessage = useCallback(({ message, variant = "info" }) => {
//     return new Promise((resolve) => {
//       setModalState({
//         isOpen: true,
//         message,
//         variant,
//         resolve,
//       });
//     });
//   }, []);

//   const handleClose = useCallback(() => {
//     setModalState((prev) => {
//       if (prev.resolve) prev.resolve(); // resolve promise when closed
//       return { ...prev, isOpen: false, resolve: null };
//     });
//   }, []);

//   return (
//     <MessageContext.Provider value={showMessage}>
//       {children}
//       <MessageModal
//         isOpen={modalState.isOpen}
//         onClose={handleClose}
//         message={modalState.message}
//         variant={modalState.variant}
//       />
//     </MessageContext.Provider>
//   );
// }

// export function useMessage() {
//   const ctx = useContext(MessageContext);
//   if (!ctx) {
//     throw new Error("useMessage must be used within a MessageProvider");
//   }
//   return ctx;
// }




import React, { createContext, useContext, useState, useCallback } from "react";
import MessageModal from "@/components/common/modals/MessageModal";

const MessageContext = createContext(null);

export function MessageProvider({ children }) {
  const [modalState, setModalState] = useState({
    isOpen: false,
    message: "",
    variant: "info",
    resolve: null,
  });

  const showMessage = useCallback(({ message, variant = "info" }) => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        message,
        variant,
        resolve,
      });
    });
  }, []);

  const handleClose = useCallback(() => {
    setModalState((prev) => {
      if (prev.resolve) prev.resolve(); 
      return { ...prev, isOpen: false, resolve: null };
    });
  }, []);

  const api = {
    info: (message) => showMessage({ message, variant: "info" }),
    success: (message) => showMessage({ message, variant: "success" }),
    warning: (message) => showMessage({ message, variant: "warning" }),
    error: (message) => showMessage({ message, variant: "danger" }),
  };

  return (
    <MessageContext.Provider value={api}>
      {children}
      <MessageModal
        isOpen={modalState.isOpen}
        onClose={handleClose}
        message={modalState.message}
        variant={modalState.variant}
      />
    </MessageContext.Provider>
  );
}

export function useMessage() {
  const ctx = useContext(MessageContext);
  if (!ctx) {
    throw new Error("useMessage must be used within a MessageProvider");
  }
  return ctx;
}
