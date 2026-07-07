require('reflect-metadata');

const cors = require("cors");
const express = require('express');
const config = require('./config/config');
const db = require('./config/db');
const indexRoutes = require('./routes/index.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", indexRoutes);

app.get('/', (req, res) => {
  res.json({
    mensaje: 'Bienvenido al backend de servicio de aseos'
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    mensaje: 'Ruta no encontrada'
  });
});

db.initialize()
  .then(() => {
    console.log('✅ Base de datos conectada con TypeORM');
    app.listen(config.PORT, () => {
      console.log(`✅ Servidor ejecutándose en puerto ${config.PORT}`);
      console.log(`🔗 http://localhost:${config.PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ Error al conectar la base de datos:', error);
  });