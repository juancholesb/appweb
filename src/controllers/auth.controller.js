// =========================================================================
// 🔑 CONTROLADOR DE LOGIN DEL ADMIN
// =========================================================================
const bcrypt = require('bcryptjs');

// Genera, una sola vez al iniciar el servidor, un hash de la contraseña
// que viene de las variables de entorno. Así nunca se compara la clave
// en texto plano y queda protegida incluso en memoria.
let hashPasswordAdmin = null;

function obtenerHashPassword() {
    if (!hashPasswordAdmin) {
        const claveOriginal = process.env.ADMIN_PASSWORD || '';
        hashPasswordAdmin = bcrypt.hashSync(claveOriginal, 10);
    }
    return hashPasswordAdmin;
}

exports.mostrarEstadoSesion = (req, res) => {
    res.json({ autenticado: !!(req.session && req.session.esAdmin) });
};

exports.iniciarSesion = async (req, res) => {
    const { usuario, contrasena } = req.body;

    const usuarioEsperado = process.env.ADMIN_USER;
    if (!usuarioEsperado || !process.env.ADMIN_PASSWORD) {
        console.error('⚠️ ADMIN_USER o ADMIN_PASSWORD no están configuradas en las variables de entorno.');
        return res.status(500).json({ error: 'El panel de administración no está configurado correctamente en el servidor.' });
    }

    if (!usuario || !contrasena) {
        return res.status(400).json({ error: 'Debes ingresar usuario y contraseña.' });
    }

    // Comparamos el usuario de forma exacta
    const usuarioValido = usuario === usuarioEsperado;

    // Comparamos la contraseña usando el hash, nunca en texto plano
    const contrasenaValida = await bcrypt.compare(contrasena, obtenerHashPassword());

    if (!usuarioValido || !contrasenaValida) {
        // Mensaje genérico a propósito: no decimos cuál de los dos campos
        // está mal, para no facilitarle pistas a quien intente adivinar.
        return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
    }

    req.session.esAdmin = true;

    // La ruta secreta del panel también vive en una variable de entorno
    // (ADMIN_ROUTE). Así, si esa ruta se filtra alguna vez, la cambias
    // desde Railway sin tocar ni una línea de código.
    const rutaPanel = '/' + (process.env.ADMIN_ROUTE || 'panel-control').replace(/^\/+/, '');
    res.json({ mensaje: 'Sesión iniciada correctamente.', rutaPanel });
};

exports.cerrarSesion = (req, res) => {
    req.session.destroy(() => {
        res.json({ mensaje: 'Sesión cerrada.' });
    });
};