import { FaUserCircle } from "react-icons/fa";

export default function Header_admin({ user, logout, activeTab }) {
  // 🔹 Визначаємо текст для заголовка
  const getTabTitle = () => {
    switch (activeTab) {
      case "statistics":
        return "Коротка статистика";
      case "ratesInfo":
        return "Курс валют";
      case "reportInfo":
        return "Звітність";
      case "clientsInfo":
        return "База клієнтів";
      case "usersInfo":
        return "Користувачі системи";
      default:
        return "Панель адміністратора";
    }
  };

  return (
    <header
      className="d-flex justify-content-between align-items-center px-4 py-2 shadow-sm bg-light border-bottom"
      style={{ height: "64px" }}
    >
      {/* 🔹 Заголовок сторінки */}
      <h5 className="m-0 fw-bold text-primary">{getTabTitle()}</h5>

      {/* 🔹 Інформація про користувача */}
      <div className="d-flex align-items-center gap-3">
        <FaUserCircle size={34} color="#0d6efd" />
        <span className="fw-semibold">
          {user.firstName} {user.lastName}
        </span>
        <button
          className="btn btn-outline-primary btn-sm px-3"
          onClick={logout}
          style={{ fontWeight: 500 }}
        >
          Вийти
        </button>
      </div>
    </header>
  );
}
