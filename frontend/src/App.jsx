
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import OperationsPage from "./pages/OperationsPage";
import AdminPage from "./pages/AdminPage";

function ProtectedRoute({ children, role }) {
  const userRole = localStorage.getItem("userRole");
  if (userRole !== role) {
    return <Navigate to="/" />;
  }
  return children;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/cashier"
          element={
            <ProtectedRoute role="cashier">
              <OperationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
