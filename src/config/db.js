const { Pool } = require('pg');
require('dotenv').config();

// En Railway o entornos de producción siempre se requiere SSL seguro
const usarSSL = process.env.NODE_ENV === 'production' || !!process.env.DATABASE_URL;

const pool = new Pool({
    // Lee la URL de conexión directa que te genera Railway al crear el servicio Postgres
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:root@localhost:5432/cbflow_db',
    ssl: usarSSL ? { rejectUnauthorized: false } : false
});

// Verificación inicial de conexión
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Error crítico en la conexión de PostgreSQL:', err.stack);
        console.log('👉 Tip: Verifica que tu DATABASE_URL en el .env sea la correcta.');
        return;
    }
    console.log('✅ Base de datos PostgreSQL (Elefante) vinculada con éxito.');
    release();
});

module.exports = {
    query: (text, params) => pool.query(text, params)
};