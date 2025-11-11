const express = require("express");
const router = express.Router();
const Reserva = require("../models/Reserva.js");
const Slot = require("../models/Slot");
const mongoose = require("mongoose");

// Crear reserva
// backend/routes/reservasRoutes.js (fragmento dentro del POST)
router.post("/", async (req, res) => {
  try {
    const { nombre, dia, hora } = req.body ?? {};
    if (!nombre || !dia || !hora) {
      return res.status(400).json({ error: "Faltan campos: nombre, dia, hora" });
    }

    // 1) Intentamos asegurar que exista el slot: upsert con capacity por defecto
    const DEFAULT_CAPACITY = 8;
    await Slot.updateOne(
      { date: dia, time: hora },
      { $setOnInsert: { date: dia, time: hora, capacity: DEFAULT_CAPACITY, bookedCount: 0 } },
      { upsert: true }
    );

    // 2) Intentamos incrementar bookedCount de forma atómica solo si hay capacidad
    // Usamos $expr para comparar bookedCount < capacity (dinámico por documento)
    const updatedSlot = await Slot.findOneAndUpdate(
      { date: dia, time: hora, $expr: { $lt: ["$bookedCount", "$capacity"] } },
      { $inc: { bookedCount: 1 } },
      { new: true } // devuelve el documento actualizado
    );

    if (!updatedSlot) {
      // No se pudo incrementar: ya estaba lleno
      return res.status(409).json({ error: "No quedan cupos para ese horario" });
    }

    // 3) Crear la reserva (ya incrementamos el contador)
    const reserva = new Reserva({ nombre, dia, hora });
    const saved = await reserva.save();

    // 4) Devolver la reserva y el slot actualizado
    return res.json({ reserva: saved, slot: updatedSlot });
  } catch (err) {
    console.error("Error POST /reservas:", err);
    return res.status(500).json({ error: "Error al crear reserva", detail: err.message });
  }
});


// Obtener todas las reservas
router.get("/", async (req, res) => {
  try {
    const reservas = await Reserva.find();
    res.json(reservas);  
  } catch (error) {
    res.status(500).send("Error al obtener las reservas");
  }
});

// Obtener reserva por ID
router.get("/:id", async (req, res) => {
  try {
    const reserva = await Reserva.findById(req.params.id);
    if (!reserva) return res.status(404).send("Reserva no encontrada");
    res.json(reserva);
  } catch (error) {
    res.status(500).send("Error al buscar la reserva");
  }
});

// Actualizar reserva
router.put("/:id", async (req, res) => {
  try {
    const reservaActualizada = await Reserva.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!reservaActualizada) return res.status(404).send("Reserva no encontrada");
    res.json(reservaActualizada);
  } catch (error) {
    res.status(500).send("Error al actualizar la reserva");
  }
});

// Eliminar reserva
router.delete("/:id", async (req, res) => {
  try {
    // 1) Buscar la reserva a eliminar
    const reserva = await Reserva.findById(req.params.id);
    if (!reserva) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    const { dia, hora } = reserva;

    // 2) Eliminar la reserva
    await Reserva.deleteOne({ _id: req.params.id });

    // 3) Buscar el slot correspondiente
    const slot = await Slot.findOne({ date: dia, time: hora });

    if (slot) {
      // 4) Restar 1 cupo, pero nunca menos de 0
      const newBookedCount = Math.max(0, slot.bookedCount - 1);

      slot.bookedCount = newBookedCount;
      await slot.save();
    }

    // 5) Responder correctamente
    return res.json({
      message: "Reserva eliminada correctamente",
      slotActualizado: slot || null
    });

  } catch (error) {
    console.error("Error DELETE /reservas:", error);
    return res.status(500).json({ error: "Error al eliminar la reserva" });
  }
});

module.exports = router;
