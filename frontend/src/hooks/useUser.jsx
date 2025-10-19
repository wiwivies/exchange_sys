// src/hooks/useUser.js
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function useUser() {
  const [user, setUser] = useState({ name: "", role: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const name = localStorage.getItem("userName");
    const role = localStorage.getItem("userRole");

    if (!name || !role) {
      navigate("/"); // якщо користувач не залогінений
      return;
    }

    setUser({ name, role });
  }, [navigate]);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return { user, logout };
}
