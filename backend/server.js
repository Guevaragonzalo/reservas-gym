const express = require("express");
const mongoose = require("mongoose");
const reservasRoutes = require("./routes/reservasRoutes");
const cors = require("cors");
const slotsRoutes = require("./routes/slotsRoutes");

const app = express();

app.use(cors()); 
app.use(express.json());
app.use("/slots", slotsRoutes);


const PORT = 5000;


// Conexión a MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/gym-reservas")
  .then(() => console.log("Conectado a MongoDB"))
  .catch(err => console.error("Error al conectar a MongoDB:", err));

// Rutas principales
app.use("/reservas", reservasRoutes);

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("API de Reservas funcionando");
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
