// src/App.jsx
import React, { useEffect, useState } from "react";
import { API } from "./api";
import ReservaForm from "./components/ReservaForm";
import DeleteAlert from "./components/DeleteAlert";

export default function App() {
  const [reservas, setReservas] = useState([]);
  const [editingReserva, setEditingReserva] = useState(null);
  const [alert, setAlert] = useState(null);
  const [working, setWorking] = useState(false);

  const [showDelete, setShowDelete] = useState(false);
  const [reservaToDelete, setReservaToDelete] = useState(null);

  // ✅ Señal para refrescar horarios en el formulario
  const [refreshSlotsSignal, setRefreshSlotsSignal] = useState(0);

  // obtener reservas
  const fetchReservas = async () => {
    try {
      const res = await API.get("/reservas");
      setReservas(res.data);
    } catch (err) {
      console.error("Error fetching reservas:", err);
      setAlert({ type: "danger", message: "Error al cargar reservas." });
      setTimeout(() => setAlert(null), 3000);
    }
  };

  useEffect(() => {
    fetchReservas();
  }, []);

  // guardar (crear o editar)
  const handleSave = async (data) => {
    setWorking(true);
    try {
      if (editingReserva) {
        const res = await API.put(`/reservas/${editingReserva._id}`, data);
        const updated = (res.data && res.data.reserva) ? res.data.reserva : res.data;

        if (updated && updated._id) {
          setReservas((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
        } else {
          await fetchReservas();
        }

        setEditingReserva(null);
        setAlert({ type: "success", message: "Reserva actualizada correctamente" });
      } else {
        const res = await API.post("/reservas", data);
        const created = (res.data && res.data.reserva) ? res.data.reserva : res.data;

        if (created && created._id) {
          setReservas((prev) => [created, ...prev]);
        } else {
          await fetchReservas();
        }

        setAlert({ type: "success", message: "Reserva guardada correctamente" });
      }

      setTimeout(() => setAlert(null), 2000);
      return { success: true };

    } catch (err) {
      console.error("Error al guardar:", err);

      if (err?.response?.status === 409) {
        setAlert({ type: "danger", message: "No quedan cupos para ese horario" });
        await fetchReservas();
      } else {
        setAlert({ type: "danger", message: "Error al guardar la reserva" });
      }

      setTimeout(() => setAlert(null), 3000);
      throw err;

    } finally {
      setWorking(false);
    }
  };

  // eliminar
  const handleDeleteClick = (reserva) => {
    setReservaToDelete(reserva);
    setShowDelete(true);
  };

  const confirmDelete = async () => {
    try {
      await API.delete(`/reservas/${reservaToDelete._id}`);

      // quitar de la lista
      setReservas((prev) => prev.filter((r) => r._id !== reservaToDelete._id));

      // ✅ Forzar refresco de slots en el formulario
      setRefreshSlotsSignal((x) => x + 1);

      setAlert({ type: "success", message: "Reserva eliminada correctamente" });
      setTimeout(() => setAlert(null), 2000);

    } catch (err) {
      console.error("Error eliminando reserva:", err);
      setAlert({ type: "danger", message: "Error al eliminar la reserva" });
      setTimeout(() => setAlert(null), 3000);

    } finally {
      setShowDelete(false);
      setReservaToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDelete(false);
    setReservaToDelete(null);
  };

  const handleEditClick = (reserva) => {
    setEditingReserva(reserva);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="container py-4">
      <h1 className="mb-4 text-center">Sistema de Reservas</h1>

      {/* ALERTA GLOBAL */}
      {alert && (
        <div className={`alert alert-${alert.type} shadow-sm`} role="alert">
          {alert.message}
        </div>
      )}

      {/* GRID: Formulario (izq) | Lista (der) */}
      <div className="row g-4">

        {/* Formulario */}
        <div className="col-12 col-md-6">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Crear / Editar Reserva</h5>

              <ReservaForm
                onSave={handleSave}
                editingReserva={editingReserva}
                refreshSlotsSignal={refreshSlotsSignal}   // ✅ clave del refresco
              />
            </div>
          </div>
        </div>

        {/* Lista de reservas */}
        <div className="col-12 col-md-6">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Reservas actuales</h5>

              {reservas.length === 0 ? (
                <p className="text-muted">No hay reservas.</p>
              ) : (
                <ul className="list-group">
                  {reservas.map((r) => (
                    <li
                      key={r._id}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <strong>{r.nombre}</strong>
                        <div className="small text-muted">
                          {r.dia} • {r.hora}
                        </div>
                      </div>

                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleEditClick(r)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteClick(r)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete overlay */}
      <DeleteAlert
        show={showDelete}
        message={`¿Desea eliminar la reserva de ${reservaToDelete?.nombre ?? "este usuario"}?`}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}
