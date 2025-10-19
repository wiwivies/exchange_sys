import React from "react";

const ClientInfoModal = ({ client, onClose }) => {
  return (
    <div
      className="modal show fade d-block"
      tabIndex="-1"
      onClick={onClose}
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
    >
      <div
        className="modal-dialog modal-lg modal-dialog-centered"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header bg-info text-white">
            <h5 className="modal-title">Інформація про клієнта</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <p>
              <b>ПІБ:</b> {client.LastName} {client.FirstName}
            </p>
            <p>
              <b>Паспорт:</b> {client.PassportNumber}
            </p>
            <p>
              <b>Телефон:</b> {client.Phone}
            </p>
            <p>
              <b>Email:</b> {client.Email}
            </p>
            <p>
              <b>Кількість операцій:</b> {client.OperationsCount}
            </p>

            <hr />
            <h6>Останні операції:</h6>
            {client.operations?.length > 0 ? (
              <ul>
                {client.operations.map((op, i) => (
                  <li key={i}>
                    {new Date(op.OperationDate).toLocaleDateString("uk-UA")} —{" "}
                    {op.AmountFrom} {op.FromCurrency} → {op.AmountTo}{" "}
                    {op.ToCurrency} ({op.TotalUAH}₴)
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted">Операцій ще не було.</p>
            )}
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Закрити
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientInfoModal;
