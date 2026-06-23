const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const productosRoutes = require('./routes/productos.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Servir automáticamente todos los archivos multimedia y vistas del cliente
app.use(express.static(path.join(__dirname, '../public')));

// Enrutar las peticiones de la API
app.use('/api/productos', productosRoutes);

// Manejo seguro por si un cliente entra a un enlace roto
app.use((req, res) => {
    res.status(404).send("La página que buscas no existe en CBFlow Store.");
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor Express encendido en el puerto ${PORT}`);
});