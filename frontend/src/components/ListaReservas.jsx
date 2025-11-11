// src/components/ListaReservas.jsx
import React from "react";

function formatDate(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);
  // Opciones: día/mes/año 
  return d.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}




export default function ListaReservas({ reservas, onEdit, onDelete, loading }) {
  if (loading) {
    return <div className="alert alert-secondary">Cargando reservas...</div>;
  }

  if (!reservas || reservas.length === 0) {
    return <div className="alert alert-info">No hay reservas aún.</div>;
  }

  return (
    <div className="table-responsive">
      <table className="table table-striped align-middle">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Día</th>
            <th>Hora</th>
            <th style={{ width: 160 }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {reservas.map(r => (
            <tr key={r._id}>
              <td>{r.nombre}</td>
              <td>{formatDate(r.dia)}</td>
              <td>{r.hora}</td>
              <td>
                <button className="btn btn-sm btn-outline-primary me-2" onClick={() => onEdit(r)}>
                  Editar
                </button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(r._id)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
