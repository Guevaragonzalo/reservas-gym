// backend/routes/slotsRoutes.js
const express = require("express");
const router = express.Router();
const Slot = require("../models/Slot");

const DEFAULT_TIMES = ["08:00","09:00","10:00","17:00","18:00","19:00"];
const DEFAULT_CAPACITY = 8;

// GET /slots?date=YYYY-MM-DD
router.get("/", async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: "Falta query param date" });

    // buscamos slots existentes
    let slots = await Slot.find({ date }).sort({ time: 1 }).lean();

    // Si no hay slots, creamos (seed) automáticamente usando DEFAULT_TIMES
    if (!slots || slots.length === 0) {
      const ops = DEFAULT_TIMES.map(t => ({
        updateOne: {
          filter: { date, time: t },
          update: { $setOnInsert: { date, time: t, capacity: DEFAULT_CAPACITY, bookedCount: 0 } },
          upsert: true
        }
      }));
      await Slot.bulkWrite(ops);
      // volvemos a leer después del upsert
      slots = await Slot.find({ date }).sort({ time: 1 }).lean();
    }

    // añadimos campo remaining para la UI
    const result = slots.map(s => ({
      ...s,
      remaining: (s.capacity ?? 0) - (s.bookedCount ?? 0)
    }));

    return res.json(result);
  } catch (err) {
    console.error("Error GET /slots:", err);
    return res.status(500).json({ error: "Error al obtener slots", detail: err.message });
  }
});


// POST /slots/seed
router.post("/seed", async (req, res) => {
  try {
    const { date, times, capacity = 8 } = req.body ?? {};
    if (!date || !Array.isArray(times) || times.length === 0) {
      return res.status(400).json({ error: "Body inválido. Enviar { date, times: [..], capacity }" });
    }

    const ops = times.map(t => ({
      updateOne: {
        filter: { date, time: t },
        update: { $setOnInsert: { date, time: t, capacity, bookedCount: 0 } },
        upsert: true
      }
    }));

    const result = await Slot.bulkWrite(ops);
    console.log("Slots seed result:", result);
    return res.json({ ok: true, result });
  } catch (err) {
    console.error("Error POST /slots/seed:", err);
    return res.status(500).json({ error: "Error al crear slots", detail: err.message });
  }
});

module.exports = router;
