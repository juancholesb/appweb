// =========================================================================
// 🛠️ OPERACIONES CRUD DEL PANEL SECRETO (admin-crud.js)
// (Legacy - Ahora la mayor parte de la lógica está en admin.html)
// =========================================================================

// Nota: La funcionalidad principal del CRUD se ha movido directamente a admin.html
// para manejar mejor el nuevo sistema de stock individual por sabor.
// Este archivo se mantiene por retrocompatibilidad si alguna vista antigua lo requiere.

window.cargarProductosAdmin = async function() {
    if (typeof actualizarTodo === 'function') {
        // Si estamos en el nuevo admin.html, delegamos a su función nativa
        actualizarTodo();
        return;
    }
    
    // Fallback para vistas antiguas
    const tabla = document.getElementById("tabla-productos-body");
    if (!tabla) return;

    try {
        const res = await fetch('/api/productos');
        const productos = await res.json();

        if (productos.length === 0) {
            tabla.innerHTML = `<tr><td colspan="6" class="text-center py-6 text-zinc-500 text-xs italic">El inventario está vacío. Agrega tu primer Vape arriba.</td></tr>`;
            return;
        }

        tabla.innerHTML = productos.map(p => {
            // Manejar tanto el nuevo formato [{nombre, stock}] como el viejo string "sabor1, sabor2"
            let txtSabores = '';
            if (Array.isArray(p.sabores)) {
                txtSabores = p.sabores.map(s => typeof s === 'object' ? `${s.nombre} (${s.stock})` : s).join(', ');
            } else {
                txtSabores = String(p.sabores || '');
            }
            
            return `
            <tr class="border-b border-zinc-800/60 hover:bg-zinc-900/30 transition text-sm">
                <td class="p-3 text-zinc-500 font-mono text-xs">${p.id}</td>
                <td class="p-3 text-white font-bold">${p.nombre}</td>
                <td class="p-3 text-zinc-400 text-xs"><span class="bg-zinc-800 px-2 py-0.5 rounded text-zinc-300">${p.categoria || 'Desechables'}</span></td>
                <td class="p-3 text-cyan-400 font-mono font-bold">$${Number(p.precio).toLocaleString('es-CO')}</td>
                <td class="p-3 text-zinc-400 text-xs truncate max-w-[180px]" title="${txtSabores}">${txtSabores}</td>
                <td class="p-3 text-right flex justify-end gap-2">
                    <button onclick="prepararFormularioEdicion(${JSON.stringify(p).replace(/"/g, '&quot;')})" 
                            class="bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-black font-bold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-xl border border-amber-500/20 transition-all">
                        Editar
                    </button>
                    <button onclick="eliminarVapeAdmin(${p.id})" 
                            class="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-bold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-xl border border-red-500/20 transition-all">
                        Borrar
                    </button>
                </td>
            </tr>
            `;
        }).join('');
    } catch (err) {
        console.error("Fallo al sincronizar la tabla de administración:", err);
    }
};

window.procesarFormularioAdmin = async function(e) {
    if (e) e.preventDefault();

    const id = document.getElementById("form-id").value;
    const nombre = document.getElementById("form-nombre").value.trim();
    const precio = Number(document.getElementById("form-precio").value);
    const categoria = document.getElementById("form-categoria").value;
    
    // Fallback simple: Si usa el form viejo con un solo input de sabores
    const inputSabores = document.getElementById("form-sabores");
    let sabores = [];
    if (inputSabores) {
        sabores = inputSabores.value.split(',').map(s => ({
            nombre: s.trim(),
            stock: 0 // Si usa el form viejo, se inicia en 0 y debe editarlo en el nuevo form
        })).filter(s => s.nombre);
    }
    
    const descripcion = document.getElementById("form-descripcion").value.trim();
    const imagen = document.getElementById("form-imagen").value.trim() || "img/logo.png";

    if (!nombre || !precio) {
        alert("⚠️ Completa el nombre y precio del dispositivo obligatoriamente.");
        return;
    }

    const productoData = { nombre, precio, categoria, sabores, descripcion, imagen };
    const endpoint = id ? `/api/productos/${id}` : '/api/productos';
    const metodoHttp = id ? 'PUT' : 'POST';

    try {
        const respuesta = await fetch(endpoint, {
            method: metodoHttp,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productoData)
        });

        if (respuesta.ok) {
            alert(id ? "💾 ¡Cambios guardados en la base de datos!" : "🔥 ¡Nuevo Vape lanzado al mercado!");
            resetearFormularioAdmin();
            cargarProductosAdmin();
        } else {
            alert("❌ Ocurrió un inconveniente al intentar guardar.");
        }
    } catch (err) {
        console.error(err);
    }
};

window.prepararFormularioEdicion = function(p) {
    document.getElementById("form-id").value = p.id;
    document.getElementById("form-nombre").value = p.nombre;
    document.getElementById("form-precio").value = p.precio;
    document.getElementById("form-categoria").value = p.categoria || "Desechables";
    
    const inputSabores = document.getElementById("form-sabores");
    if (inputSabores) {
        if (Array.isArray(p.sabores)) {
            inputSabores.value = p.sabores.map(s => typeof s === 'object' ? s.nombre : s).join(', ');
        } else {
            inputSabores.value = p.sabores || "";
        }
    }
    
    document.getElementById("form-descripcion").value = p.descripcion || "";
    document.getElementById("form-imagen").value = p.imagen || "";
    
    const btn = document.getElementById("btn-submit-admin");
    if(btn) btn.innerText = "Guardar Modificaciones 💾";
};

window.eliminarVapeAdmin = async function(id) {
    if (!confirm("🚨 ¿Estás completamente seguro de que deseas eliminar este producto? Se borrará de forma inmediata en la base de datos.")) return;

    try {
        const respuesta = await fetch(`/api/productos/${id}`, { method: 'DELETE' });
        if (respuesta.ok) {
            cargarProductosAdmin();
        }
    } catch (err) {
        console.error(err);
    }
};

function resetearFormularioAdmin() {
    const form = document.getElementById("form-crud-admin");
    if(form) form.reset();
    const formId = document.getElementById("form-id");
    if (formId) formId.value = "";
    const btn = document.getElementById("btn-submit-admin");
    if(btn) btn.innerText = "Crear Vape 🔥";
}