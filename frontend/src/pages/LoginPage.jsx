
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock } from "react-icons/fa";
import { IoEye, IoEyeOff } from "react-icons/io5";
import "./LoginPage.css";
import logo from "../assets/logo.png";

export default function LoginPage() {
  const [role, setRole] = useState("cashier");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ login: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          login: formData.login,
          password: formData.password,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Невірний логін або пароль");
        return;
      }

      // ✅ Зберігаємо дані користувача в localStorage
      localStorage.setItem("userRole", data.user.role);
      localStorage.setItem("userName", data.user.name);
localStorage.setItem("userId", data.user.id);
localStorage.setItem("userPointID", data.user.PointID);


      // 🔹 Перехід за роллю
      if (data.user.role === "admin") navigate("/admin");
      else if (data.user.role === "cashier") navigate("/cashier");
    } catch (error) {
      console.error("❌ Login error:", error);
      setError("Помилка сервера при вході");
    }
  };

  return (
    <div className="login-page">
      <div className="overlay">
        <div className="login-container">
          <div className="logo">
            <img src={logo} className="logo-img" alt="Finestra" />
            <p className="logo-text">
              Твоя фінансова стабільність — <br /> наша турбота
            </p>
          </div>

          <div className="role-buttons">
            <button
              className={role === "cashier" ? "active" : ""}
              onClick={() => setRole("cashier")}
              type="button"
            >
              Вхід як Касир
            </button>
            <button
              className={role === "admin" ? "active" : ""}
              onClick={() => setRole("admin")}
              type="button"
            >
              Вхід як Адміністратор
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <FaUser className="icon" />
              <input
                type="text"
                placeholder="Введіть логін"
                value={formData.login}
                onChange={(e) =>
                  setFormData({ ...formData, login: e.target.value })
                }
                required
              />
            </div>

            <div className="input-group">
              <FaLock className="icon" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Введіть пароль"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
              <span
                className="toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <IoEyeOff /> : <IoEye />}
              </span>
            </div>

            {error && <div className="alert alert-danger mt-2">{error}</div>}

            <button type="submit" className="login-btn">
              Увійти
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
