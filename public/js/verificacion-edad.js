// =========================================================================
// 🔞 VERIFICACIÓN DE EDAD (verificacion-edad.js)
// =========================================================================
const EDAD_MINIMA = 18;
const CLAVE_VERIFICACION = "cbflow_edad_verificada";

function calcularEdad(fechaNacimientoStr) {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimientoStr + "T00:00:00");
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const aunNoCumpleEsteAnio =
        hoy.getMonth() < nacimiento.getMonth() ||
        (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate());
    if (aunNoCumpleEsteAnio) edad--;
    return edad;
}

function yaFueVerificado() {
    try {
        const guardado = sessionStorage.getItem(CLAVE_VERIFICACION);
        return guardado === "true";
    } catch (e) {
        return false;
    }
}

function marcarComoVerificado() {
    try {
        sessionStorage.setItem(CLAVE_VERIFICACION, "true");
    } catch (e) {
    }
}

function construirPantallaVerificacion() {
    const overlay = document.createElement("div");
    overlay.id = "overlay-verificacion-edad";
    overlay.className = "fixed inset-0 z-[999] bg-black flex items-center justify-center p-6";

    overlay.innerHTML = `
        <div class="bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl p-8 w-full max-w-md text-center">
            <div class="text-5xl mb-3">🔞</div>
            <h2 class="text-xl font-black text-white mb-2">Verificación de Edad</h2>
            <p class="text-zinc-400 text-sm mb-6">
                Este sitio contiene productos de vapeo destinados exclusivamente para personas
                mayores de ${EDAD_MINIMA} años. Por favor confirma tu fecha de nacimiento para continuar.
            </p>

            <form id="form-verificacion-edad" class="space-y-3">
                <input
                    type="date"
                    id="input-fecha-nacimiento"
                    class="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white text-sm focus:border-cyan-500 outline-none"
                    required
                >
                <p id="mensaje-edad-error" class="text-red-400 text-xs hidden"></p>
                <button
                    type="submit"
                    class="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold p-3 rounded-xl transition cursor-pointer"
                >
                    Confirmar e Ingresar
                </button>
            </form>

            <p class="text-zinc-600 text-[11px] mt-5 leading-relaxed">
                Al ingresar declaras bajo tu responsabilidad que la fecha proporcionada es real.
                CBflow tech promueve el consumo responsable.
            </p>
        </div>
    `;

    document.body.appendChild(overlay);

    const formulario = overlay.querySelector("#form-verificacion-edad");
    const inputFecha = overlay.querySelector("#input-fecha-nacimiento");
    const mensajeError = overlay.querySelector("#mensaje-edad-error");

    inputFecha.max = new Date().toISOString().split("T")[0];

    formulario.addEventListener("submit", (e) => {
        e.preventDefault();
        const fecha = inputFecha.value;

        if (!fecha) return;

        const edad = calcularEdad(fecha);

        if (edad >= EDAD_MINIMA) {
            marcarComoVerificado();
            overlay.remove();
            document.body.style.overflow = "";
        } else {
            mensajeError.textContent = `Debes tener ${EDAD_MINIMA} años o más para ingresar a este sitio.`;
            mensajeError.classList.remove("hidden");
            formulario.reset();
        }
    });
}

function inicializarVerificacionEdad() {
    if (yaFueVerificado()) return;
    document.body.style.overflow = "hidden";
    construirPantallaVerificacion();
}

document.addEventListener("DOMContentLoaded", inicializarVerificacionEdad);