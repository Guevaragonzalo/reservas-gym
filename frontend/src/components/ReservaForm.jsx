// src/components/ReservaForm.jsx
import React, { useEffect, useState } from "react";
import SlotGrid from "./SlotGrid";
import { API } from "../api";

export default function ReservaForm({ onSave, editingReserva = null, onCancel = null, disabled = false, refreshSlotsSignal }) {
  const [nombre, setNombre] = useState(editingReserva ? editingReserva.nombre : "");
  const [dia, setDia] = useState(editingReserva ? editingReserva.dia : "");
  const [hora, setHora] = useState(editingReserva ? editingReserva.hora : "");
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [alert, setAlert] = useState({ type: "", message: "" });

  const todayStr = new Date().toISOString().slice(0, 10);

  // normalizador
  const normalizeSlots = (arr) =>
    arr.map((s) => ({
      ...s,
      remaining: typeof s.remaining === "number" ? s.remaining : ((s.capacity ?? 0) - (s.bookedCount ?? 0))
    }));

  const fetchSlots = async (date) => {
    if (!date) {
      setSlots([]);
      return;
    }
    setLoadingSlots(true);
    setError(null);
    try {
      const resp = await API.get("/slots", { params: { date } });
      let arr = Array.isArray(resp.data) ? resp.data : (resp.data.result ?? []);
      arr = normalizeSlots(arr);
      setSlots(arr);
    } catch (err) {
      console.error("fetchSlots error:", err);
      setSlots([]);
      setError("No se pudieron cargar los horarios. Intentá de nuevo.");
      setAlert({ type: "danger", message: "No se pudieron cargar los horarios." });
    } finally {
      setLoadingSlots(false);
    }
  };

  // cargar slots al cambiar fecha
  useEffect(() => {
    if (dia) fetchSlots(dia);
    else setSlots([]);
  }, [dia]);

  // ✅ refrescar slots desde fuera (cuando se borra una reserva)
  useEffect(() => {
    if (dia) fetchSlots(dia);
  }, [refreshSlotsSignal]);

  // sincronizar edición
  useEffect(() => {
    if (editingReserva) {
      setNombre(editingReserva.nombre || "");
      setDia(editingReserva.dia || "");
      setHora(editingReserva.hora || "");
    } else {
      setNombre("");
      setDia("");
      setHora("");
    }
  }, [editingReserva]);

  // limpiar alert
  useEffect(() => {
    if (alert.message) {
      const t = setTimeout(() => setAlert({ type: "", message: "" }), 3000);
      return () => clearTimeout(t);
    }
  }, [alert]);

  const availableSlots = slots.filter((s) => (s.remaining ?? 0) > 0);

  // submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setAlert({ type: "", message: "" });

    if (!nombre || !dia || !hora) {
      setError("Completa nombre, día y horario antes de enviar.");
      return;
    }

    if (dia < todayStr) {
      setError("No se pueden crear reservas en fechas pasadas.");
      return;
    }

    const payload = { nombre, dia, hora };

    try {
      setSaving(true);

      const result = await onSave(payload); // espera { success: true }

      // refrescar slots después de guardar
      await fetchSlots(dia);

      if (!editingReserva) setHora("");

      setAlert({ type: "success", message: "Reserva creada correctamente." });

    } catch (err) {
      console.error("Error al crear reserva:", err);
      const msg = err?.response?.data?.error ?? "Error al crear la reserva.";
      setError(msg);
      setAlert({ type: "danger", message: msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title">{editingReserva ? "Editar reserva" : "Crear reserva"}</h5>

        {alert.message && (
          <div className={`alert alert-${alert.type} alert-dismissible fade show`} role="alert">
            {alert.message}
            <button type="button" className="btn-close" onClick={() => setAlert({ type: "", message: "" })}></button>
          </div>
        )}

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Nombre</label>
            <input className="form-control" value={nombre} onChange={(e) => {setNombre(e.target.value);setError(null);}} />
          </div>

          <div className="mb-3">
            <label className="form-label">Día</label>
            <input type="date" className="form-control" value={dia} min={todayStr} onChange={(e) => setDia(e.target.value)} />
          </div>

          <div className="mb-3">
            <label className="form-label">Horario</label>

            {loadingSlots ? (
              <div>Cargando horarios...</div>
            ) : (
              <>
                <SlotGrid
                  slots={slots}
                  selectedTime={hora}
                  onSelect={(t) => setHora(t)}
                  showAll={true}
                  dia={dia}
                />

                <div className="form-text mt-2">
                  {!dia
                    ? "Selecciona una fecha para ver los horarios"
                    : availableSlots.length
                      ? `${availableSlots.length} horarios disponibles`
                      : "No hay horarios disponibles"}
                </div>
              </>
            )}
          </div>

          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Guardando..." : editingReserva ? "Guardar cambios" : "Crear reserva"}
            </button>

            {editingReserva && (
              <button type="button" className="btn btn-secondary" onClick={onCancel}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
