import React from "react";
import { Route, Routes } from "react-router-dom";
import PrivateRoutes from "./PrivateRoutes";

import LoginForm from "@/pages/auth/LoginPage";

const AppRoutes = () => {
  return (
    // <AuthProvider>
      <Routes>
        {/* --- PUBLIC ROUTES --- */}
  <Route path="/login" element={<LoginForm />} />
    

        {/* --- PRIVATE ROUTES --- */}
        <Route path="/*" element={<PrivateRoutes />} />
      </Routes>
    // </AuthProvider>
  );
};

export default AppRoutes;
