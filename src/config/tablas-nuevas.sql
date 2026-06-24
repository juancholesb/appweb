-- =========================================================================
-- 🗄️ TABLAS NECESARIAS PARA CATEGORÍAS Y PROMOCIONES
-- =========================================================================
-- Tu base de datos de Railway ya tiene la tabla "productos".
-- Estas dos tablas son nuevas: las necesita el panel de admin para que
-- las categorías y el carrusel de promociones funcionen de verdad
-- (antes el HTML las llamaba pero no existían en la base de datos).
--
-- CÓMO EJECUTAR ESTO EN RAILWAY:
-- 1. Entra a tu proyecto en Railway.
-- 2. Click en el servicio "Postgres".
-- 3. Ve a la pestaña "Data" (o "Query").
-- 4. Pega este archivo completo y ejecútalo una sola vez.
-- =========================================================================

CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS promociones (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    subtitulo VARCHAR(200),
    descripcion TEXT,
    texto_boton VARCHAR(50) DEFAULT 'Comprar Ahora',
    imagen TEXT,
    color_fondo VARCHAR(100) DEFAULT 'from-zinc-900 via-zinc-900 to-cyan-950/40',
    enlace VARCHAR(100) DEFAULT '#productos'
);

-- Categorías iniciales sugeridas (puedes borrarlas o editarlas desde el admin)
INSERT INTO categorias (nombre)
VALUES ('Desechables'), ('Pods'), ('Líquidos')
ON CONFLICT (nombre) DO NOTHING;