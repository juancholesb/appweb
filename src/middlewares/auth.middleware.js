// =========================================================================
// 🔐 MIDDLEWARE DE AUTENTICACIÓN DEL PANEL ADMIN
// =========================================================================
// Este archivo decide quién puede entrar al panel y quién puede usar
// las rutas de la API que crean, editan o borran información.
//
// IMPORTANTE: el usuario y la contraseña NUNCA están escritos aquí.
// Se leen desde las variables de entorno que configuras en Railway:
//   ADMIN_USER
//   ADMIN_PASSWORD
// =========================================================================

// Protege las VISTAS del admin (el HTML). Si no hay sesión activa,
// redirige al formulario de login en vez de mostrar el panel.
exports.protegerVistaAdmin = (req, res, next) => {
    if (req.session && req.session.esAdmin) {
        return next();
    }
    return res.redirect('/admin-login.html');
};

// Protege las RUTAS DE LA API que modifican datos (crear, editar, borrar).
// Si alguien intenta llamar a estos endpoints sin haber iniciado sesión
// (por ejemplo directo desde el navegador o con una herramienta como
// Postman), se le bloquea con un error 401, sin importar que conozca
// la URL exacta del endpoint.
exports.protegerApiAdmin = (req, res, next) => {
    if (req.session && req.session.esAdmin) {
        return next();
    }
    return res.status(401).json({ error: 'No autorizado. Debes iniciar sesión en el panel de administración.' });
};