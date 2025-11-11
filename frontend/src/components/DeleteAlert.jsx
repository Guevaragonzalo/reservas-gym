// src/components/DeleteAlert.jsx
import React from "react";

export default function DeleteAlert({ show, message, onConfirm, onCancel }) {
  if (!show) return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{
        backgroundColor: "rgba(0,0,0,0.4)",
        zIndex: 2000,
      }}
    >
      <div
        className="bg-white rounded-4 shadow p-4 text-center"
        style={{ maxWidth: "380px", width: "90%" }}
      >
        <h5 className="mb-3 text-dark fw-bold">{message}</h5>
        <div className="d-flex justify-content-center gap-3 mt-3">
          <button className="btn btn-secondary px-4" onClick={onCancel}>
            Cancelar
          </button>
          <button className="btn btn-danger px-4" onClick={onConfirm}>
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
