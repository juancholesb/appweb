// =========================================================================
// 🔞 VERIFICACIÓN DE EDAD (verificacion-edad.js)
// =========================================================================
const CLAVE_VERIFICACION = "cbflow_edad_verificada";

function yaFueVerificado() {
    try {
        return sessionStorage.getItem(CLAVE_VERIFICACION) === "true";
    } catch (e) {
        return false;
    }
}

function marcarComoVerificado() {
    try {
        sessionStorage.setItem(CLAVE_VERIFICACION, "true");
    } catch (e) {}
}

function construirPantallaVerificacion() {
    const overlay = document.createElement("div");
    overlay.id = "overlay-verificacion-edad";
    overlay.style.cssText = `
        position: fixed;
        inset: 0;
        z-index: 999999;
        background: linear-gradient(135deg, #000000 0%, #0a0a0f 50%, #050510 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1.5rem;
        font-family: 'Inter', system-ui, sans-serif;
    `;

    overlay.innerHTML = `
        <!-- Fondo decorativo -->
        <div style="position:absolute;inset:0;overflow:hidden;pointer-events:none;">
            <div style="position:absolute;top:-20%;left:-10%;width:500px;height:500px;background:radial-gradient(circle,rgba(6,182,212,0.06) 0%,transparent 70%);border-radius:50%;"></div>
            <div style="position:absolute;bottom:-20%;right:-10%;width:500px;height:500px;background:radial-gradient(circle,rgba(139,92,246,0.06) 0%,transparent 70%);border-radius:50%;"></div>
        </div>

        <!-- Card -->
        <div style="
            background: rgba(9,9,11,0.95);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 24px;
            padding: 2.5rem 2rem;
            max-width: 400px;
            width: 100%;
            text-align: center;
            box-shadow: 0 40px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(6,182,212,0.05);
            position: relative;
            z-index: 1;
            animation: ageGateIn 0.5s cubic-bezier(0.16,1,0.3,1) both;
        ">
            <!-- Logo -->
            <div style="margin-bottom:1.5rem;">
                <img src="img/logo.png" alt="CBflow Tech" style="height:48px;width:auto;object-fit:contain;border-radius:8px;margin:0 auto 0.75rem;display:block;" onerror="this.style.display='none'">
                <span style="font-size:1.4rem;font-weight:900;letter-spacing:-0.03em;background:linear-gradient(to right,#34d399,#22d3ee);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">CBFLOW TECH</span>
            </div>

            <!-- Icono -->
            <div style="width:64px;height:64px;background:rgba(6,182,212,0.08);border:1px solid rgba(6,182,212,0.2);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1.25rem;font-size:1.8rem;">🔞</div>

            <!-- Título -->
            <h2 style="color:#fff;font-size:1.4rem;font-weight:800;margin:0 0 0.5rem;line-height:1.2;">Verificación de Edad</h2>
            <p style="color:#71717a;font-size:0.82rem;margin:0 0 1.5rem;line-height:1.6;">
                Este sitio vende productos de vapeo. El uso de estos productos está <strong style="color:#a1a1aa;">reservado exclusivamente para mayores de 18 años.</strong>
            </p>

            <!-- Línea divisora -->
            <div style="height:1px;background:rgba(255,255,255,0.06);margin:0 0 1.5rem;"></div>

            <p style="color:#e4e4e7;font-size:1rem;font-weight:600;margin:0 0 1.25rem;">¿Eres mayor de 18 años?</p>

            <!-- Botones -->
            <div style="display:flex;flex-direction:column;gap:0.75rem;">
                <button id="age-gate-yes-btn" style="
                    background: linear-gradient(135deg, #06b6d4, #0891b2);
                    color: #fff;
                    font-weight: 700;
                    font-size: 0.95rem;
                    border: none;
                    border-radius: 12px;
                    padding: 0.9rem 1.5rem;
                    cursor: pointer;
                    width: 100%;
                    letter-spacing: 0.01em;
                    box-shadow: 0 4px 20px rgba(6,182,212,0.25);
                    transition: transform 0.15s ease, box-shadow 0.15s ease;
                ">
                    ✅ Sí, soy mayor de 18 años
                </button>

                <button id="age-gate-no-btn" style="
                    background: transparent;
                    color: #71717a;
                    font-weight: 500;
                    font-size: 0.85rem;
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 12px;
                    padding: 0.75rem 1.5rem;
                    cursor: pointer;
                    width: 100%;
                    transition: border-color 0.15s, color 0.15s;
                ">
                    No, soy menor de 18 años
                </button>
            </div>

            <!-- Nota legal -->
            <p style="color:#3f3f46;font-size:0.7rem;margin:1.25rem 0 0;line-height:1.5;">
                Al ingresar confirmas que tienes 18 años o más y aceptas nuestros términos de uso.
            </p>
        </div>

        <style>
            @keyframes ageGateIn {
                from { opacity: 0; transform: scale(0.92) translateY(20px); }
                to   { opacity: 1; transform: scale(1) translateY(0); }
            }
        </style>
    `;

    document.body.appendChild(overlay);

    // Pantalla de acceso bloqueado
    const blocked = document.createElement("div");
    blocked.id = "age-gate-blocked-screen";
    blocked.style.cssText = `
        display: none;
        position: fixed;
        inset: 0;
        z-index: 999999;
        background: #000;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        text-align: center;
        padding: 2rem;
        font-family: 'Inter', system-ui, sans-serif;
    `;
    blocked.innerHTML = `
        <div style="font-size:3rem;margin-bottom:1rem;">🚫</div>
        <h2 style="color:#fff;font-size:1.3rem;font-weight:800;margin:0 0 0.5rem;">Acceso Restringido</h2>
        <p style="color:#71717a;font-size:0.85rem;max-width:300px;line-height:1.6;">Debes ser mayor de 18 años para ingresar a este sitio.</p>
    `;
    document.body.appendChild(blocked);

    // Eventos de los botones
    overlay.querySelector("#age-gate-yes-btn").addEventListener("click", function () {
        marcarComoVerificado();
        overlay.style.opacity = "0";
        overlay.style.transition = "opacity 0.4s ease";
        document.body.style.overflow = "";
        setTimeout(() => overlay.remove(), 400);
    });

    overlay.querySelector("#age-gate-no-btn").addEventListener("click", function () {
        overlay.remove();
        blocked.style.display = "flex";
    });
}

function inicializarVerificacionEdad() {
    if (yaFueVerificado()) return;
    document.body.style.overflow = "hidden";
    construirPantallaVerificacion();
}

document.addEventListener("DOMContentLoaded", inicializarVerificacionEdad);