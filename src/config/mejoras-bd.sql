-- =========================================================================
-- 🗄️ ACTUALIZACIÓN DE BASE DE DATOS (NUEVAS FUNCIONALIDADES PREMIUM)
-- =========================================================================
-- CÓMO EJECUTAR ESTO EN RAILWAY:
-- 1. Entra a tu proyecto en Railway.
-- 2. Click en el servicio "Postgres".
-- 3. Ve a la pestaña "Data" (o "Query").
-- 4. Pega este archivo completo y ejecútalo una sola vez.
-- =========================================================================

-- Tabla para almacenar imágenes extras de los productos (Galería Múltiple)
CREATE TABLE IF NOT EXISTS producto_imagenes (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER REFERENCES productos(id) ON DELETE CASCADE,
    url_imagen TEXT NOT NULL,
    orden INTEGER DEFAULT 0
);

-- Tabla para el sistema de Reseñas / Calificaciones
CREATE TABLE IF NOT EXISTS resenas (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER REFERENCES productos(id) ON DELETE CASCADE,
    nombre_cliente VARCHAR(100) NOT NULL,
    calificacion INTEGER CHECK (calificacion >= 1 AND calificacion <= 5),
    comentario TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
