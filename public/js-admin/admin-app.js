document.addEventListener("DOMContentLoaded", () => {
    console.log("⚙️ Sistema Operativo del Panel Admin Inicializado.");
    
    // 1. Cargamos los productos directo en la tabla
    if (typeof window.cargarProductosAdmin === "function") {
        window.cargarProductosAdmin();
    }

    // 2. Escuchamos cuando decidas guardar o crear un vape
    const formularioAdmin = document.getElementById("form-crud-admin");
    if (formularioAdmin) {
        formularioAdmin.addEventListener("submit", window.procesarFormularioAdmin);
    }
});