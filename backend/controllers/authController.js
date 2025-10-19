import { poolPromise } from "../db/connection.js";
import {verifyPassword } from "../utils/verifyPassword.js";
import sql from "mssql";

export const loginUser = async (req, res) => {
  try {
    const { login, password, role } = req.body;

    if (!login || !password || !role) {
      return res.status(400).json({ message: "Усі поля обов’язкові" });
    }

    const pool = await poolPromise;

    // 🎯 Залежно від ролі — шукаємо користувача
    const query = `
      SELECT TOP 1 UserID, FirstName, LastName, Login_name, PasswordHash, Rolle
      FROM Users
      WHERE Login_name = @login AND Rolle = @role
    `;

    const result = await pool
      .request()
      .input("login", sql.NVarChar(100), login)
      .input("role", sql.NVarChar(50), role)
      .query(query);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Користувача не знайдено" });
    }

    const user = result.recordset[0];

    const isValid = await verifyPassword(password, user.PasswordHash);

    if (!isValid) {
      return res.status(401).json({ message: "Невірний пароль" });
    }

    // ✅ Якщо все добре — успішний логін
    res.status(200).json({
      message: "Вхід успішний",
      user: {
        id: user.UserID,
        name: `${user.FirstName} ${user.LastName}`,
        role: user.Rolle,
        PointID: user.PointID,
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Помилка сервера" });
  }
};
