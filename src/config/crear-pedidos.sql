-- =========================================================================
-- 🗄️ TABLA DE PEDIDOS
-- =========================================================================
-- CÓMO EJECUTAR ESTO EN RAILWAY:
-- 1. Entra a tu proyecto en Railway.
-- 2. Click en el servicio "Postgres".
-- 3. Ve a la pestaña "Data" (o "Query").
-- 4. Pega este archivo completo y ejecútalo una sola vez.
-- =========================================================================

-- Crear tabla de pedidos si no existe
CREATE TABLE IF NOT EXISTS pedidos (
    id SERIAL PRIMARY KEY,
    cliente_nombre VARCHAR(100) NOT NULL,
    cliente_direccion TEXT,
    ubicacion VARCHAR(50),
    metodo_pago VARCHAR(50),
    items JSONB,
    total DECIMAL(10, 2),
    estado VARCHAR(20) DEFAULT 'pendiente',
    metodo_entrega VARCHAR(50) DEFAULT 'envio',
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_confirmacion TIMESTAMP,
    fecha_cancelacion TIMESTAMP
);

-- Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON pedidos(estado);
CREATE INDEX IF NOT EXISTS idx_pedidos_fecha ON pedidos(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_pedidos_cliente ON pedidos(cliente_nombre);

-- Si la tabla ya existe y falta la columna metodo_entrega, la añade
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS metodo_entrega VARCHAR(50) DEFAULT 'envio';
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS fecha_confirmacion TIMESTAMP;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS fecha_cancelacion TIMESTAMP;
