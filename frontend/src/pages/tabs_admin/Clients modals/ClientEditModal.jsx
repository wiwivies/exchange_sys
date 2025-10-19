import React, { useState } from "react";

const ClientEditModal = ({ client, onClose, onSave }) => {
  const [formData, setFormData] = useState({ ...client });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div
      className="modal show fade d-block"
      tabIndex="-1"
      onClick={onClose}
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header bg-warning">
            <h5 className="modal-title">Редагування клієнта</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="form-group mb-2">
              <label>Ім’я</label>
              <input
                name="FirstName"
                value={formData.FirstName}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="form-group mb-2">
              <label>Прізвище</label>
              <input
                name="LastName"
                value={formData.LastName}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="form-group mb-2">
              <label>Паспорт</label>
              <input
                name="PassportNumber"
                value={formData.PassportNumber}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="form-group mb-2">
              <label>Телефон</label>
              <input
                name="Phone"
                value={formData.Phone}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="form-group mb-2">
              <label>Email</label>
              <input
                name="Email"
                value={formData.Email}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Скасувати
            </button>
            <button className="btn btn-success" onClick={handleSave}>
              Зберегти
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientEditModal;
