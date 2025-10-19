// backend/utils/verifyPassword.js
import crypto from "crypto";

// SQL: CONVERT(NVARCHAR(255), HASHBYTES('SHA2_512', i.PasswordHash), 2)
export const hashPassword = (plainPassword) => {
  const hash = crypto
    .createHash("sha512")
    .update(Buffer.from(plainPassword, "utf16le")) // ✅ SQL NVARCHAR -> UTF-16LE
    .digest("hex")
    .toUpperCase();

  return hash;
};

export const verifyPassword = async (plainPassword, hashedPasswordFromDb) => {
  const hashedInput = hashPassword(plainPassword);

  // console.log("🟦 Введений пароль:", plainPassword);
  // console.log("🟨 Хеш із введеного (Node):", hashedInput);
  // console.log("🟩 Хеш із бази:", hashedPasswordFromDb);

  return hashedInput === hashedPasswordFromDb;
};
