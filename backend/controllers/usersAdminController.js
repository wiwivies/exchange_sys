import { poolPromise } from "../db/connection.js";

// ✅ Отримати всіх користувачів
export const getAllUsers = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        u.UserID,
        u.FirstName,
        u.LastName,
        u.Login_name,
        u.Email,
        u.Phone,
        u.Rolle,
        u.JoinDate,
        u.PointID,
        p.PointName
      FROM Users u
      LEFT JOIN ExchangePoints p ON u.PointID = p.PointID
      ORDER BY u.UserID DESC
    `);

    res.json(result.recordset);
  } catch (err) {
    console.error("❌ Помилка отримання користувачів:", err);
    res.status(500).json({ message: "Помилка сервера при отриманні користувачів" });
  }
};

// ✅ Отримати одного користувача за ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("UserID", id)
      .query(`
        SELECT 
          u.UserID,
          u.FirstName,
          u.LastName,
          u.Login_name,
          u.Email,
          u.Phone,
          u.Rolle,
          u.JoinDate,
          u.PointID,
          p.PointName
        FROM Users u
        LEFT JOIN ExchangePoints p ON u.PointID = p.PointID
        WHERE u.UserID = @UserID
      `);

    if (result.recordset.length === 0)
      return res.status(404).json({ message: "Користувача не знайдено" });

    res.json(result.recordset[0]);
  } catch (err) {
    console.error("❌ Помилка отримання користувача:", err);
    res.status(500).json({ message: "Помилка сервера при отриманні користувача" });
  }
};

// ✅ Додати нового користувача
export const addUser = async (req, res) => {
  try {
    const { FirstName, LastName, Login_name, PasswordHash, Email, Phone, Rolle, PointID, JoinDate } = req.body;
    const pool = await poolPromise;

    await pool.request()
      .input("FirstName", FirstName)
      .input("LastName", LastName)
      .input("Login_name", Login_name)
      .input("PasswordHash", PasswordHash)
      .input("Email", Email)
      .input("Phone", Phone)
      .input("Rolle", Rolle)
      .input("PointID", PointID)
      .input("JoinDate", JoinDate || new Date())
      .query(`
        INSERT INTO Users (FirstName, LastName, Login_name, PasswordHash, Email, Phone, Rolle, PointID, JoinDate)
        VALUES (@FirstName, @LastName, @Login_name, @PasswordHash, @Email, @Phone, @Rolle, @PointID, @JoinDate)
      `);

    res.json({ message: "✅ Користувача успішно додано" });
  } catch (err) {
    console.error("❌ Помилка додавання користувача:", err);
    res.status(500).json({ message: "Помилка сервера при додаванні користувача" });
  }
};

// ✅ Оновити користувача
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { FirstName, LastName, Login_name, Email, Phone, Rolle, PointID } = req.body;
    const pool = await poolPromise;

    await pool.request()
      .input("UserID", id)
      .input("FirstName", FirstName)
      .input("LastName", LastName)
      .input("Login_name", Login_name)
      .input("Email", Email)
      .input("Phone", Phone)
      .input("Rolle", Rolle)
      .input("PointID", PointID)
      .query(`
        UPDATE Users
        SET 
          FirstName = @FirstName,
          LastName = @LastName,
          Login_name = @Login_name,
          Email = @Email,
          Phone = @Phone,
          Rolle = @Rolle,
          PointID = @PointID
        WHERE UserID = @UserID
      `);

    res.json({ message: "✅ Дані користувача оновлено" });
  } catch (err) {
    console.error("❌ Помилка оновлення користувача:", err);
    res.status(500).json({ message: "Помилка сервера при оновленні користувача" });
  }
};

// ✅ Видалити користувача
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;

    const result = await pool.request()
      .input("UserID", id)
      .query(`DELETE FROM Users WHERE UserID = @UserID`);

    if (result.rowsAffected[0] === 0)
      return res.status(404).json({ message: "Користувача не знайдено" });

    res.json({ message: "🗑️ Користувача видалено" });
  } catch (err) {
    console.error("❌ Помилка видалення користувача:", err);
    res.status(500).json({ message: "Помилка сервера при видаленні користувача" });
  }
};
