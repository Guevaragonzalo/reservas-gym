const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
  date: { type: String, required: true },        // formato YYYY-MM-DD
  time: { type: String, required: true },        // ejemplo "18:00"
  capacity: { type: Number, required: true, default: 8 },
  bookedCount: { type: Number, required: true, default: 0 }
});

// índice compuesto para búsquedas rápidas y unicidad por slot
slotSchema.index({ date: 1, time: 1 }, { unique: true });

module.exports = mongoose.model("Slot", slotSchema);
