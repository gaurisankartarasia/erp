import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from '@/contexts/AuthContext';
import { ConfirmProvider } from "./contexts/ConfirmModalProvider";
import { MessageProvider } from "./contexts/MessageModalProvider";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
   
      <ConfirmProvider>
        
        <MessageProvider>
           <AuthProvider>
          <App />
               </AuthProvider>
        </MessageProvider>
   
      </ConfirmProvider>
      
    </BrowserRouter>
  </StrictMode>
);
