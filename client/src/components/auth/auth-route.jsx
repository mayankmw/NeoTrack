import React from "react";
import { Navigate } from "react-router-dom";

const AuthRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    // If there's no token, redirect to login page
    return <Navigate to="/login" />;
  }

  return children;
};

export default AuthRoute;
