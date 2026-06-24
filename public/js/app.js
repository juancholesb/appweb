// =========================================================================
// 🧩 1. CONFIGURACIÓN GLOBAL Y CAPTURA DE ELEMENTOS HTML
// =========================================================================
const NUMERO_WHATSAPP = "573052267408"; // ⚠️ TU NÚMERO DE WHATSAPP

// Memoria global de la tienda
let cacheProductosTienda = []; 
// Cargamos el carrito de LocalStorage o empezamos vacío
let carrito = JSON.parse(localStorage.getItem("cbflow_carrito")) || [];

// Captura segura del contenedor de productos
const getContenedorProductos = () => document.getElementById("contenedor-productos") || document.getElementById("productos-grid");

// =========================================================================
// 🔍 DETECTOR AUTOMÁTICO DE TU LISTA DE PRODUCTOS (SISTEMA DE SEGURIDAD)
// =========================================================================
function obtenerListaProductosGlobal() {
    if (typeof cacheProductosTienda !== 'undefined' && cacheProductosTienda.length > 0) return cacheProductosTienda;
    if (typeof productos !== 'undefined') return productos;
    if (typeof listaProductos !== 'undefined') return listaProductos;
    if (typeof vapes !== 'undefined') return vapes;
    return [];
}

// =========================================================================
// 🚀 2. INICIALIZADOR AUTOMÁTICO (Conectado al Servidor / Fallback Local)
// =========================================================================
document.addEventListener("DOMContentLoaded", async () => {
    console.log("CBFLOW Tienda inicializada. Cargando componentes...");
    
    // 🎡 1. Cargar Promociones del Carrusel
    try {
        const resPromo = await fetch('/api/promociones');
        if (resPromo.ok) {
            const promocionesLive = await resPromo.json();
            renderizarCarrusel(promocionesLive.length > 0 ? promocionesLive : carruselPorDefecto);
        } else {
            renderizarCarrusel(carruselPorDefecto);
        }
    } catch (error) {
        console.warn("Servidor desconectado. Cargando carrusel de respaldo.");
        renderizarCarrusel(carruselPorDefecto);
    }

    // 🏷️ 2. Cargar Categorías en el menú de filtro
    try {
        const resCat = await fetch('/api/categorias');
        if (resCat.ok) {
            const categorias = await resCat.json();
            renderizarCategorias(categorias);
        }
    } catch (error) {
        console.warn("No se pudieron cargar las categorías:", error);
    }

    // 📦 3. Cargar Productos de la Vitrina
    try {
        const resProd = await fetch('/api/productos');
        if (resProd.ok) {
            const productosLive = await resProd.json();
            cacheProductosTienda = productosLive; 
            renderizarProductos(productosLive);
        } else {
            console.warn("API de productos falló. Usando catálogo de respaldo.");
            cacheProductosTienda = productosPorDefecto;
            renderizarProductos(productosPorDefecto);
        }
    } catch (error) {
        console.error("Error de red. Cargando productos de respaldo:", error);
        cacheProductosTienda = productosPorDefecto;
        renderizarProductos(productosPorDefecto);
    }

    // Inicializar visualmente el carrito guardado
    actualizarInterfazCarrito();
});

// =========================================================================
// 🎡 RENDERIZADOR DEL CARRUSEL DE PROMOCIONES
// =========================================================================
function renderizarCarrusel(promociones) {
    const track = document.getElementById("carrusel-track");
    const indicadores = document.getElementById("carrusel-indicadores");
    if (!track) return;

    track.innerHTML = promociones.map((p, i) => `
        <div class="min-w-full snap-start relative flex items-center justify-center overflow-hidden"
             style="min-height:300px; background: ${p.color_fondo || p.colorFondo || '#18181b'}">
            ${p.imagen ? `<img src="${p.imagen}" class="absolute inset-0 w-full h-full object-cover opacity-30" alt="">` : ''}
            <div class="relative z-10 text-center px-8 py-12 max-w-2xl">
                ${p.subtitulo ? `<p class="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-3">${p.subtitulo}</p>` : ''}
                <h2 class="text-white text-3xl md:text-5xl font-black mb-4 leading-tight">${p.titulo || ''}</h2>
                ${p.descripcion ? `<p class="text-zinc-300 text-sm mb-6">${p.descripcion}</p>` : ''}
                ${p.enlace ? `<a href="${p.enlace}" class="inline-block bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-6 py-3 rounded-xl transition">${p.texto_boton || p.textoBoton || 'Ver más'}</a>` : ''}
            </div>
        </div>
    `).join('');

    if (indicadores) {
        indicadores.innerHTML = promociones.map((_, i) =>
            `<button onclick="irASlide(${i})" class="w-2 h-2 rounded-full bg-zinc-600 transition carrusel-dot" data-index="${i}"></button>`
        ).join('');
    }

    // Controles prev/next
    let slideActual = 0;
    const totalSlides = promociones.length;

    window.irASlide = function(index) {
        slideActual = (index + totalSlides) % totalSlides;
        track.scrollTo({ left: track.clientWidth * slideActual, behavior: 'smooth' });
        document.querySelectorAll('.carrusel-dot').forEach((dot, i) => {
            dot.classList.toggle('bg-cyan-400', i === slideActual);
            dot.classList.toggle('bg-zinc-600', i !== slideActual);
        });
    };

    const btnPrev = document.getElementById("prev-slide");
    const btnNext = document.getElementById("next-slide");
    if (btnPrev) btnPrev.onclick = () => irASlide(slideActual - 1);
    if (btnNext) btnNext.onclick = () => irASlide(slideActual + 1);

    // Auto-slide cada 5 segundos si hay más de 1 slide
    if (totalSlides > 1) {
        setInterval(() => irASlide(slideActual + 1), 5000);
    }

    irASlide(0);
}

// =========================================================================
// 🏷️ RENDERIZADOR DE CATEGORÍAS EN EL MENÚ DE FILTRO
// =========================================================================
function renderizarCategorias(categorias) {
    const menu = document.getElementById("menu-categorias");
    if (!menu) return;

    const todas = `<button onclick="filtrarPorCategoria('todas')" 
        class="cat-btn text-cyan-400 font-bold border-b-2 border-cyan-400 pb-1 cursor-pointer transition hover:text-cyan-300" 
        data-cat="todas">Todas</button>`;

    const botones = categorias.map(c => `
        <button onclick="filtrarPorCategoria('${c.nombre}')" 
            class="cat-btn text-zinc-400 hover:text-white cursor-pointer transition pb-1 border-b-2 border-transparent hover:border-zinc-500"
            data-cat="${c.nombre}">${c.nombre}</button>
    `).join('');

    menu.innerHTML = todas + botones;
}

window.filtrarPorCategoria = function(categoria) {
    // Actualizar estilos de botones activos
    document.querySelectorAll('.cat-btn').forEach(btn => {
        const activo = btn.dataset.cat === categoria;
        btn.classList.toggle('text-cyan-400', activo);
        btn.classList.toggle('font-bold', activo);
        btn.classList.toggle('border-cyan-400', activo);
        btn.classList.toggle('text-zinc-400', !activo);
        btn.classList.toggle('border-transparent', !activo);
    });

    if (categoria === 'todas') {
        renderizarProductos(cacheProductosTienda);
    } else {
        const filtrados = cacheProductosTienda.filter(p => p.categoria === categoria);
        renderizarProductos(filtrados);
    }
};

// =========================================================================
// 💾 DATOS DE RESPALDO (Por si el servidor está apagado)
// =========================================================================
const carruselPorDefecto = [
    {
        imagen: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=1200&auto=format&fit=crop&q=80", 
        titulo: "¡BIENVENIDO A CBFLOW TECH!",
        subtitulo: "Crea tu primera promoción desde el Panel de Control para verla aquí.",
        colorFondo: "from-zinc-900 via-zinc-900 to-cyan-950/40"
    }
];

const productosPorDefecto = [
    {
        id: 1,
        nombre: "Vape CBFlow Pro Max 10k",
        descripcion: "Sabor intenso de larga duración con pantalla indicadora de líquido y batería.",
        precio: 55000,
        categoria: "Desechables",
        imagen: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400",
        sabores: "Menta Helada, Uva Ice, Mango Loco, Sandía Burst"
    },
    {
        id: 2,
        nombre: "Vape CBFlow Pod Diamond",
        descripcion: "Diseño elegante y compacto, ideal para llevar a cualquier parte de forma discreta.",
        precio: 45000,
        categoria: "Pods",
        imagen: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400",
        sabores: "Fresa Banana, Arándano Azul, Menta"
    }
];

// =========================================================================
// 📦 3. RENDERIZADOR DE PRODUCTOS EN VITRINA (CON SABORES)
// =========================================================================
function renderizarProductos(productos) {
    const contenedor = getContenedorProductos();
    if (!contenedor) return;

    if (!productos || productos.length === 0) {
        contenedor.innerHTML = `<p class="text-zinc-500 text-center col-span-full py-12">No hay vapers disponibles por ahora.</p>`;
        return;
    }

    contenedor.innerHTML = productos.map(p => {
        const listaSabores = p.sabores 
            ? (Array.isArray(p.sabores) ? p.sabores : p.sabores.split(",")) 
            : [];

        return `
        <div onclick="abrirDetalleProducto(${p.id})" 
             class="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl shadow-xl flex flex-col justify-between group cursor-pointer hover:border-zinc-700 transition-all duration-300 relative overflow-hidden">
            
            <div>
                <div class="bg-zinc-950 p-3 rounded-xl flex justify-center items-center h-48 mb-4 relative overflow-hidden">
                    <img src="${p.imagen}" class="h-full object-contain group-hover:scale-105 transition-transform duration-300" alt="${p.nombre}">
                </div>

                <span class="inline-block bg-cyan-950/50 border border-cyan-800/40 text-[10px] font-bold text-cyan-400 px-2 py-0.5 rounded uppercase tracking-wider mb-2">
                    ${p.categoria || 'Desechables'}
                </span>

                <h3 class="text-white font-bold text-md tracking-tight group-hover:text-cyan-400 transition-colors mb-1">${p.nombre}</h3>
                <p class="text-zinc-500 text-xs font-light line-clamp-2 mb-3">${p.descripcion || 'Sin descripción disponible.'}</p>
                
                <div class="mb-4" onclick="event.stopPropagation()">
                    <label class="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Elegir Sabor:</label>
                    <select id="select-sabor-${p.id}" class="w-full bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 p-2 rounded-xl outline-none focus:border-cyan-500 cursor-pointer font-medium">
                        ${listaSabores.length > 0 
                            ? listaSabores.map(sabor => `<option value="${sabor.trim()}">💨 ${sabor.trim()}</option>`).join('')
                            : '<option value="Original">💨 Sabor Original / Único</option>'
                        }
                    </select>
                </div>
            </div>

            <div class="flex justify-between items-center border-t border-zinc-800/50 pt-3 mt-auto" onclick="event.stopPropagation()">
                <button onclick="agregarAlCarritoDesdeVitrina(${p.id})" 
                        class="bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1 transition cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                    🛒 Agregar
                </button>

                <span class="text-cyan-400 font-mono font-bold text-md">
                    $${Number(p.precio).toLocaleString('es-CO')}
                </span>
            </div>
        </div>
        `;
    }).join('');
}

// =========================================================================
// 👁️ 4. VENTANA EMERGENTE / MODAL DETALLE
// =========================================================================
window.abrirDetalleProducto = function(id) {
    const listaGlobal = obtenerListaProductosGlobal();
    const prod = listaGlobal.find(p => Number(p.id) === Number(id));
    if (!prod) return;

    const modal = document.getElementById("modal-detalle");
    const contenido = document.getElementById("contenido-modal-detalle");
    if (!modal || !contenido) return;

    const listaSabores = prod.sabores 
        ? (Array.isArray(prod.sabores) ? prod.sabores : prod.sabores.split(",")) 
        : [];

    let saboresHtml = "";
    if (listaSabores.length > 0) {
        saboresHtml = `
            <div class="mb-5">
                <label class="block text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-2">Selecciona tu Sabor:</label>
                <select id="modal-sabor-select" class="w-full bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 rounded-xl p-3 outline-none focus:border-cyan-500 cursor-pointer">
                    ${listaSabores.map(s => `<option value="${s.trim()}">💨 ${s.trim()}</option>`).join('')}
                </select>
            </div>
        `;
    } else {
        saboresHtml = `<p class="text-xs text-zinc-500 italic mb-5">Sabor original estándar listo para envío.</p>`;
    }

    contenido.innerHTML = `
        <button onclick="cerrarDetalleProducto()" class="absolute top-4 right-4 text-zinc-400 bg-zinc-950/60 p-2.5 rounded-full z-20 cursor-pointer hover:text-white border border-zinc-800 transition active:scale-90">✕</button>
        <div class="grid grid-cols-1 md:grid-cols-2">
            <div class="bg-zinc-950 p-8 flex items-center justify-center min-h-[250px] relative">
                <div class="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-transparent opacity-60 blur-3xl"></div>
                <img src="${prod.imagen}" class="max-h-56 object-contain filter drop-shadow-[0_12px_24px_rgba(6,182,212,0.3)]">
            </div>
            <div class="p-6 bg-zinc-900 flex flex-col justify-between">
                <div>
                    <span class="text-[9px] tracking-widest font-bold uppercase text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/30 inline-block mb-3">${prod.categoria || 'Desechables'}</span>
                    <h3 class="text-xl font-black text-white mb-2">${prod.nombre}</h3>
                    <p class="text-zinc-400 text-xs mb-5 font-light leading-relaxed">${prod.descripcion || 'Sin descripción disponible.'}</p>
                    
                    ${saboresHtml}
                    
                    <div class="mb-4">
                        <label class="block text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-2">Cantidad:</label>
                        <div class="flex items-center gap-2">
                            <button type="button" onclick="alterarCantidadModal(-1)" class="w-10 h-10 bg-zinc-950 border border-zinc-800 text-md font-bold text-white hover:bg-zinc-800 hover:text-cyan-400 active:scale-90 rounded-xl flex items-center justify-center cursor-pointer transition">-</button>
                            <input type="number" id="modal-cantidad-input" value="1" min="1" class="w-14 h-10 bg-zinc-950 border border-zinc-800 text-center text-sm font-mono text-white rounded-xl outline-none" readonly>
                            <button type="button" onclick="alterarCantidadModal(1)" class="w-10 h-10 bg-zinc-950 border border-zinc-800 text-md font-bold text-white hover:bg-zinc-800 hover:text-cyan-400 active:scale-90 rounded-xl flex items-center justify-center cursor-pointer transition">+</button>
                        </div>
                    </div>
                </div>
                <div class="pt-4 border-t border-zinc-800/60 flex items-center justify-between gap-4 mt-6">
                    <div class="flex flex-col">
                        <span class="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Subtotal</span>
                        <span id="modal-precio-total" class="text-xl font-black text-white font-mono" data-base-price="${prod.precio}">$${Number(prod.precio).toLocaleString('es-CO')}</span>
                    </div>
                    <button onclick="agregarAlCarritoDesdeModal(${prod.id}, event)" class="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs py-3.5 px-4 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.25)] transition-all transform active:scale-95 cursor-pointer">Añadir al Carrito 🛒</button>
                </div>
            </div>
        </div>
    `;
    modal.classList.remove("hidden");
    setTimeout(() => modal.classList.remove("opacity-0"), 20);
};

window.alterarCantidadModal = function(cambio) {
    const input = document.getElementById("modal-cantidad-input");
    const precioTotalSpan = document.getElementById("modal-precio-total");
    if (!input || !precioTotalSpan) return;

    const precioBase = Number(precioTotalSpan.getAttribute("data-base-price"));
    let valorActual = Number(input.value) + cambio;
    if (valorActual < 1) valorActual = 1;
    
    input.value = valorActual;
    precioTotalSpan.innerText = "$" + (precioBase * valorActual).toLocaleString('es-CO');
};

window.cerrarDetalleProducto = function() {
    const modal = document.getElementById("modal-detalle");
    if(modal) {
        modal.classList.add("opacity-0");
        setTimeout(() => modal.classList.add("hidden"), 300);
    }
};

// =========================================================================
// 🛍️ 5. GESTIÓN COMPLETA DEL CARRITO DE COMPRAS
// =========================================================================
window.agregarAlCarritoDesdeVitrina = function(id) {
    const listaGlobal = obtenerListaProductosGlobal();
    const prod = listaGlobal.find(p => Number(p.id) === Number(id));
    if (!prod) return;

    const selector = document.getElementById(`select-sabor-${id}`);
    const saborElegido = selector ? selector.value : "Original";

    const existeEnCarrito = carrito.find(item => 
        Number(item.id) === Number(id) && 
        item.sabor.trim().toLowerCase() === saborElegido.trim().toLowerCase()
    );

    if (existeEnCarrito) {
        existeEnCarrito.cantidad += 1;
    } else {
        carrito.push({
            id: prod.id,
            nombre: prod.nombre,
            precio: Number(prod.precio),
            imagen: prod.imagen,
            sabor: saborElegido,
            cantidad: 1
        });
    }

    localStorage.setItem("cbflow_carrito", JSON.stringify(carrito));
    actualizarInterfazCarrito();
    window.abrirCarrito();
};

window.agregarAlCarritoDesdeModal = function(id, event) {
    const listaGlobal = obtenerListaProductosGlobal();
    const prod = listaGlobal.find(p => Number(p.id) === Number(id));
    if (!prod) return;

    const selectSabor = document.getElementById("modal-sabor-select");
    const saborElegido = selectSabor ? selectSabor.value : "Original";
    const cantidad = Number(document.getElementById("modal-cantidad-input").value) || 1;

    const existeEnCarrito = carrito.find(item => 
        Number(item.id) === Number(id) && 
        item.sabor.trim().toLowerCase() === saborElegido.trim().toLowerCase()
    );

    if (existeEnCarrito) {
        existeEnCarrito.cantidad += cantidad;
    } else {
        carrito.push({
            id: prod.id,
            nombre: prod.nombre,
            precio: Number(prod.precio),
            imagen: prod.imagen,
            sabor: saborElegido,
            cantidad: cantidad
        });
    }

    localStorage.setItem("cbflow_carrito", JSON.stringify(carrito));
    actualizarInterfazCarrito();

    if (event && event.currentTarget) {
        const boton = event.currentTarget;
        const textoOriginal = boton.innerHTML;
        boton.innerHTML = "✅ ¡Añadido Exitosamente!";
        setTimeout(() => { 
            boton.innerHTML = textoOriginal; 
            cerrarDetalleProducto();
            window.abrirCarrito();
        }, 400);
    } else {
        cerrarDetalleProducto();
        window.abrirCarrito();
    }
};

function actualizarInterfazCarrito() {
    try {
        const totalItems = carrito.reduce((suma, item) => suma + Number(item.cantidad || 0), 0);
        const precioTotal = carrito.reduce((suma, item) => suma + (Number(item.precio || 0) * Number(item.cantidad || 0)), 0);

        const headerPrecio = document.getElementById("header-carrito-total");
        const headerContador = document.getElementById("header-badge-carrito");
        const sidebarPrecio = document.getElementById("carrito-total");
        const contenedorItems = document.getElementById("carrito-items");

        if (headerPrecio) headerPrecio.innerText = `$${precioTotal.toLocaleString('es-CO')}`;
        if (headerContador) headerContador.innerText = totalItems;
        if (sidebarPrecio) sidebarPrecio.innerText = `$${precioTotal.toLocaleString('es-CO')}`;

        if (!contenedorItems) return;

        if (carrito.length === 0) {
            contenedorItems.innerHTML = `<p class="text-zinc-500 text-sm text-center mt-10 italic">Tu carrito está vacío.</p>`;
            return;
        }

        const listaGlobal = obtenerListaProductosGlobal();

        contenedorItems.innerHTML = carrito.map((item, index) => {
            const productoOriginal = listaGlobal.find(p => Number(p.id) === Number(item.id));
            
            let listaSabores = [item.sabor || "Original"];
            if (productoOriginal && productoOriginal.sabores) {
                listaSabores = Array.isArray(productoOriginal.sabores) 
                    ? productoOriginal.sabores 
                    : productoOriginal.sabores.split(",");
            }

            const precioUnitario = Number(item.precio || 0);
            const cantidadItem = Number(item.cantidad || 1);
            const subtotalItem = precioUnitario * cantidadItem;
            const saborSeguro = (item.sabor || "Original").trim();
            const saborEscapado = saborSeguro.replace(/'/g, "\\'");

            return `
            <div class="flex items-center gap-3 bg-zinc-900 p-3 rounded-xl border border-zinc-800/60 transition-all">
                <div class="w-12 h-12 bg-zinc-950 rounded-lg flex items-center justify-center p-1 flex-shrink-0 border border-zinc-800">
                    <img src="${item.imagen || ''}" class="h-full object-contain" alt="${item.nombre || 'Vaper'}">
                </div>
                <div class="flex-1 min-w-0">
                    <h4 class="text-white text-xs font-bold truncate">${item.nombre || 'Producto'}</h4>
                    <div class="mt-1">
                        <select onchange="window.cambiarSaborEnCarrito(${item.id}, '${saborEscapado}', this.value)" 
                                class="bg-zinc-950 border border-zinc-800 text-[10px] text-cyan-400 font-black uppercase tracking-wider py-0.5 px-1.5 rounded-md outline-none focus:border-cyan-500 cursor-pointer max-w-full truncate">
                            ${listaSabores.map(sabor => {
                                const sabClean = sabor.trim();
                                return `<option value="${sabClean}" ${sabClean.toLowerCase() === saborSeguro.toLowerCase() ? 'selected' : ''}>💨 ${sabClean}</option>`;
                            }).join('')}
                        </select>
                    </div>
                    <p class="text-zinc-500 text-[10px] font-mono mt-1">$${precioUnitario.toLocaleString('es-CO')} c/u</p>
                </div>
                <div class="flex items-center gap-2 bg-zinc-950 px-2 py-1 rounded-lg border border-zinc-800 shadow-inner flex-shrink-0">
                    <button onclick="window.cambiarCantidad(${item.id}, '${saborEscapado}', -1)" class="text-zinc-400 hover:text-red-400 font-bold text-xs cursor-pointer px-1 active:scale-90 transition">-</button>
                    <span class="text-white font-mono text-xs font-bold px-0.5">${cantidadItem}</span>
                    <button onclick="window.cambiarCantidad(${item.id}, '${saborEscapado}', 1)" class="text-zinc-400 hover:text-cyan-400 font-bold text-xs cursor-pointer px-1 active:scale-90 transition">+</button>
                </div>
                <div class="text-right min-w-[65px] flex-shrink-0">
                    <span class="text-cyan-400 font-mono text-xs font-bold block">$${subtotalItem.toLocaleString('es-CO')}</span>
                </div>
                <button onclick="window.eliminarDelCarrito(${item.id}, '${saborEscapado}')" 
                        class="text-zinc-500 hover:text-red-500 font-black text-sm p-1 cursor-pointer active:scale-75 transition-all flex-shrink-0">
                    ✕
                </button>
            </div>
            `;
        }).join('');

    } catch (error) {
        console.error("Error crítico al renderizar la interfaz del carrito:", error);
    }
}

// =========================================================================
// 🔄 6. CONTROLES AVANZADOS DEL CARRITO (EXPUESTOS A WINDOW)
// =========================================================================
window.cambiarCantidad = function(id, sabor, cambio) {
    const sabBuscado = String(sabor || '').trim().toLowerCase();

    const item = carrito.find(p => 
        Number(p.id) === Number(id) && 
        String(p.sabor || '').trim().toLowerCase() === sabBuscado
    );
    if (!item) return;

    item.cantidad += cambio;

    if (item.cantidad <= 0) {
        window.eliminarDelCarrito(id, sabor);
        return;
    }

    localStorage.setItem("cbflow_carrito", JSON.stringify(carrito));
    actualizarInterfazCarrito();
};

window.cambiarSaborEnCarrito = function(id, saborAnterior, nuevoSabor) {
    const sabAntClean = String(saborAnterior || '').trim().toLowerCase();
    const sabNueClean = String(nuevoSabor || '').trim().toLowerCase();

    if (sabAntClean === sabNueClean) return;

    const itemAModificar = carrito.find(p => 
        Number(p.id) === Number(id) && 
        String(p.sabor || '').trim().toLowerCase() === sabAntClean
    );
    if (!itemAModificar) return;

    const itemDuplicado = carrito.find(p => 
        Number(p.id) === Number(id) && 
        String(p.sabor || '').trim().toLowerCase() === sabNueClean
    );

    if (itemDuplicado) {
        itemDuplicado.amount += itemAModificar.cantidad;
        carrito = carrito.filter(p => !(
            Number(p.id) === Number(id) && 
            String(p.sabor || '').trim().toLowerCase() === sabAntClean
        ));
    } else {
        itemAModificar.sabor = nuevoSabor;
    }

    localStorage.setItem("cbflow_carrito", JSON.stringify(carrito));
    actualizarInterfazCarrito();
};

window.eliminarDelCarrito = function(id, sabor) {
    const sabBuscado = String(sabor || '').trim().toLowerCase();
    carrito = carrito.filter(p => !(
        Number(p.id) === Number(id) && 
        String(p.sabor || '').trim().toLowerCase() === sabBuscado
    ));
    localStorage.setItem("cbflow_carrito", JSON.stringify(carrito));
    actualizarInterfazCarrito();
};

window.abrirCarrito = function() {
    const sidebar = document.getElementById("sidebar-carrito");
    if(sidebar) sidebar.classList.remove("translate-x-full");
};

window.cerrarCarrito = function() {
    const sidebar = document.getElementById("sidebar-carrito");
    if(sidebar) sidebar.classList.add("translate-x-full");
};

// =========================================================================
// 🚚 7. INTELIGENCIA DE ENVÍOS Y EMBUDO WHATSAPP
// =========================================================================
window.actualizarMetodosPago = function() {
    const ubicacion = document.getElementById("checkout-ubicacion").value;
    const selectPago = document.getElementById("checkout-pago");
    
    if(!selectPago) return;
    selectPago.innerHTML = ""; 
    
    if (ubicacion === "Riohacha") {
        selectPago.innerHTML = `
            <option value="Contra Entrega">Efectivo - Contra Entrega 🛵</option>
            <option value="Transferencia Bancaria">Transferencia Bancaria (Bancolombia/Nequi) 🏦</option>
        `;
        selectPago.disabled = false;
    } else if (ubicacion === "Nacional") {
        selectPago.innerHTML = `
            <option value="Pago Anticipado (Transferencia)">Pago Anticipado por Transferencia Bancaria 🚚</option>
        `;
        selectPago.disabled = false;
    } else {
        selectPago.innerHTML = `<option value="">Selecciona la ubicación primero...</option>`;
        selectPago.disabled = true;
    }
};

window.enviarPedidoWhatsApp = function() {
    if (carrito.length === 0) return alert("Tu carrito está vacío.");
    
    const nombre = document.getElementById("checkout-nombre").value.trim();
    const direccion = document.getElementById("checkout-direccion").value.trim();
    const ubicacion = document.getElementById("checkout-ubicacion").value;
    const pago = document.getElementById("checkout-pago").value;

    if (!nombre || !direccion || !ubicacion || !pago) {
        return alert("Por favor completa tus datos de envío antes de continuar con la compra.");
    }

    let totalTotal = 0;
    let mensaje = `*🚀 NUEVO PEDIDO - CBFLOW TECH*\n`;
    mensaje += `---------------------------\n`;
    mensaje += `👤 *Cliente:* ${nombre}\n`;
    mensaje += `📍 *Ubicación:* ${ubicacion === "Riohacha" ? "Riohacha (Local)" : "Envío Nacional (Colombia)"}\n`;
    mensaje += `🏠 *Dirección:* ${direccion}\n`;
    mensaje += `💳 *Método de Pago:* ${pago}\n`;
    mensaje += `---------------------------\n`;
    mensaje += `*🛒 DETALLE DE COMPRA:*\n\n`;

    carrito.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        totalTotal += subtotal;
        mensaje += `▪️ ${item.cantidad}x *${item.nombre}*\n`;
        mensaje += `   Sabor: ${item.sabor}\n`;
        mensaje += `   Subtotal: $${subtotal.toLocaleString('es-CO')}\n\n`;
    });

    mensaje += `---------------------------\n`;
    mensaje += `💰 *TOTAL A PAGAR: $${totalTotal.toLocaleString('es-CO')}*`;
    
    if (ubicacion === "Nacional") {
        mensaje += `\n\n_(Nota: El costo de la empresa transportadora se coordina por aquí o se paga contraentrega al recibir)_`;
    }

    const urlValidada = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`;
    window.open(urlValidada, '_blank');
};
// =========================================================================
// 🔄 9. CONTROLADOR DE CANTIDADES (NORMALIZACIÓN ABSOLUTA)
// =========================================================================
window.cambiarCantidad = function(id, sabor, cambio) {
    const sabBuscado = String(sabor || '').trim().toLowerCase();

    // Buscamos ignorando espacios ocultos y mayúsculas
    const item = carrito.find(p => 
        String(p.id) === String(id) && 
        String(p.sabor || '').trim().toLowerCase() === sabBuscado
    );
    if (!item) return;

    item.cantidad += cambio;

    if (item.cantidad <= 0) {
        carrito = carrito.filter(p => !(
            String(p.id) === String(id) && 
            String(p.sabor || '').trim().toLowerCase() === sabBuscado
        ));
    }

    localStorage.setItem("cbflow_carrito", JSON.stringify(carrito));
    actualizarInterfazCarrito();
};

// =========================================================================
// 🔄 10. CAMBIAR SABOR DESDE EL CARRITO (NORMALIZACIÓN ABSOLUTA)
// =========================================================================
window.cambiarSaborEnCarrito = function(id, saborAnterior, nuevoSabor) {
    const sabAntClean = String(saborAnterior || '').trim().toLowerCase();
    const sabNueClean = String(nuevoSabor || '').trim().toLowerCase();

    if (sabAntClean === sabNueClean) return;

    const itemAModificar = carrito.find(p => 
        String(p.id) === String(id) && 
        String(p.sabor || '').trim().toLowerCase() === sabAntClean
    );
    if (!itemAModificar) return;

    const itemDuplicado = carrito.find(p => 
        String(p.id) === String(id) && 
        String(p.sabor || '').trim().toLowerCase() === sabNueClean
    );

    if (itemDuplicado) {
        itemDuplicado.cantidad += itemAModificar.cantidad;
        carrito = carrito.filter(p => !(
            String(p.id) === String(id) && 
            String(p.sabor || '').trim().toLowerCase() === sabAntClean
        ));
    } else {
        itemAModificar.sabor = nuevoSabor;
    }

    localStorage.setItem("cbflow_carrito", JSON.stringify(carrito));
    actualizarInterfazCarrito();
};
// =========================================================================
// 📥 11-C. AGREGAR AL CARRITO DESDE EL MODAL DE DETALLES (BLINDADO)
// =========================================================================
window.agregarAlCarritoDesdeModal = function(id, event) {
    // 🛡️ Comparación de ID segura
    const productoSeleccionado = cacheProductosTienda.find(p => String(p.id) === String(id));
    if (!productoSeleccionado) return;

    // Capturamos el sabor seleccionado en el menú desplegable del modal
    const selectSabor = document.getElementById(`modal-select-sabor-${id}`);
    const saborElegido = selectSabor ? selectSabor.value.trim() : "Original";

    // 🧠 Verificación cruzada limpia
    const existeEnCarrito = carrito.find(item => 
        String(item.id) === String(id) && 
        String(item.sabor || '').trim().toLowerCase() === saborElegido.toLowerCase()
    );

    if (existeEnCarrito) {
        existeEnCarrito.cantidad += 1; 
    } else {
        carrito.push({
            id: productoSeleccionado.id,
            nombre: productoSeleccionado.nombre,
            precio: Number(productoSeleccionado.precio),
            imagen: productoSeleccionado.imagen,
            sabor: saborElegido,
            cantidad: 1
        });
    }

    localStorage.setItem("cbflow_carrito", JSON.stringify(carrito));
    actualizarInterfazCarrito();

    // Animación de feedback en el botón antes de cerrar
    if (event && event.currentTarget) {
        const boton = event.currentTarget;
        const textoOriginal = boton.innerHTML;
        boton.innerHTML = "✅ ¡Añadido Exitosamente!";
        
        setTimeout(() => { 
            boton.innerHTML = textoOriginal; 
            if (typeof cerrarModalDetalle === "function") cerrarModalDetalle();
        }, 600);
    }
};

// =========================================================================
// 🗑️ 12. ELIMINAR PRODUCTO COMPLETO (NORMALIZACIÓN ABSOLUTA)
// =========================================================================
window.eliminarDelCarrito = function(id, sabor) {
    const sabBuscado = String(sabor || '').trim().toLowerCase();

    // Filtramos barriendo cualquier espacio en blanco o diferencia de letras
    carrito = carrito.filter(p => !(
        String(p.id) === String(id) && 
        String(p.sabor || '').trim().toLowerCase() === sabBuscado
    ));

    localStorage.setItem("cbflow_carrito", JSON.stringify(carrito));
    actualizarInterfazCarrito();
};