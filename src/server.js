const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

const productosRoutes = require('./routes/productos.routes');
const categoriasRoutes = require('./routes/categorias.routes');
const promocionesRoutes = require('./routes/promociones.routes');
const authRoutes = require('./routes/auth.routes');
const pedidosRoutes = require('./routes/pedidos.routes');
const { protegerVistaAdmin } = require('./middlewares/auth.middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// En Railway estamos detrás de un proxy (necesario para que las cookies
// seguras funcionen correctamente con HTTPS).
app.set('trust proxy', 1);

// =========================================================================
// Middlewares base
// =========================================================================
app.use(cors());
app.use(express.json());

// =========================================================================
// Sesión del admin (cookie firmada, httpOnly: el navegador no puede
// leerla con JavaScript, lo que protege contra robo de sesión vía XSS).
// SESSION_SECRET debe configurarse en las variables de entorno de Railway.
// =========================================================================
if (!process.env.SESSION_SECRET) {
    console.warn('⚠️ SESSION_SECRET no está configurada. Usando un valor temporal NO seguro para desarrollo.');
}

app.use(session({
    secret: process.env.SESSION_SECRET || 'clave-temporal-solo-para-desarrollo-local',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 8 // 8 horas de sesión
    }
}));

// =========================================================================
// Ruta secreta del panel de administración
// Se define en la variable de entorno ADMIN_ROUTE (ej: "panel-x9k2").
// Si no la configuras, por defecto será /panel-control
// =========================================================================
const rutaSecretaAdmin = '/' + (process.env.ADMIN_ROUTE || 'panel-control').replace(/^\/+/, '');

app.get(rutaSecretaAdmin, protegerVistaAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, '../views/admin.html'));
});

// =========================================================================
// Archivos estáticos públicos (tienda, login, imágenes, css, js del cliente)
// admin.html YA NO está aquí: vive en /views y solo se sirve a través de
// la ruta secreta protegida de arriba.
// =========================================================================
app.use(express.static(path.join(__dirname, '../public')));

// =========================================================================
// API
// =========================================================================
app.use('/api/auth', authRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/promociones', promocionesRoutes);
app.use('/api/pedidos', pedidosRoutes);

// Manejo seguro por si un cliente entra a un enlace roto
app.use((req, res) => {
    res.status(404).send('La página que buscas no existe en CBFlow Store.');
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor Express encendido en el puerto ${PORT}`);
    console.log(`🔐 Panel de administración disponible en: ${rutaSecretaAdmin}`);
});