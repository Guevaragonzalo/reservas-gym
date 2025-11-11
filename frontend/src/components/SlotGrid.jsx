// src/components/SlotGrid.jsx
import React from "react";

export default function SlotGrid({
  slots = [],
  selectedTime = "",
  onSelect = () => {},
  showAll = false,
  dia = ""   // ✅ añadimos dia
}) {



  // ✅ Ordenamos como antes
  const sorted = slots.slice().sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="d-flex flex-wrap gap-2">
      {sorted.map(s => {
        const remaining = (s.remaining ?? ((s.capacity ?? 0) - (s.bookedCount ?? 0)));
        const isAvailable = remaining > 0;
        const isSelected = selectedTime === s.time;

        // ✅ Colores exactamente como los tenías
        let variant = "outline-secondary";
        if (!isAvailable) variant = "secondary";
        else if (remaining <= 2) variant = "warning";
        else variant = "success";

        const disabled = !isAvailable && showAll === true;

        return (
          <button
            key={s._id ?? s.time}
            type="button"
            className={`btn btn-${variant} d-flex align-items-center gap-2`}
            style={{
              minWidth: 120,
              justifyContent: "space-between",
              borderWidth: isSelected ? 2 : 1,
              boxShadow: isSelected ? "0 0 0 0.2rem rgba(13,110,253,0.15)" : undefined
            }}
            onClick={() => { if (isAvailable) onSelect(s.time); }}
            disabled={disabled}
            title={!isAvailable ? "Completo" : `${remaining} lugares disponibles`}
          >
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: 600 }}>{s.time}</div>
              <div style={{ fontSize: 12 }}>{s.capacity ?? "–"} cap.</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span
                className={`badge ${isAvailable ? "bg-light text-dark" : "bg-dark text-white"}`}
                style={{ fontSize: 12 }}
              >
                {isAvailable ? `${remaining}` : "0"}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
