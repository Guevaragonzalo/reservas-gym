// backend/models/Reserva.js
const mongoose = require("mongoose");

const reservaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  dia: { type: String, required: true },
  hora: { type: String, required: true }
});

module.exports = mongoose.model("Reserva", reservaSchema);
