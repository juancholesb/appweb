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
// 🔧 UTILIDADES DE SABORES (nuevo formato {nombre, stock})
// =========================================================================
function parsearSabores(saboresRaw) {
    if (!saboresRaw) return [];
    if (Array.isArray(saboresRaw)) {
        return saboresRaw.map(s => {
            if (typeof s === 'object' && s.nombre) return { nombre: s.nombre.trim(), stock: Number(s.stock || 0) };
            return { nombre: String(s).trim(), stock: -1 }; // -1 = stock desconocido
        });
    }
    if (typeof saboresRaw === 'string') {
        return saboresRaw.split(',').map(s => ({ nombre: s.trim(), stock: -1 }));
    }
    return [];
}

function obtenerStockTotal(sabores) {
    const parsed = parsearSabores(sabores);
    if (parsed.length === 0) return -1;
    if (parsed.some(s => s.stock === -1)) return -1;
    return parsed.reduce((sum, s) => sum + s.stock, 0);
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
// 🎡 RENDERIZADOR DEL CARRUSEL DE PROMOCIONES (PREMIUM)
// =========================================================================
function renderizarCarrusel(promociones) {
    const track = document.getElementById("carrusel-track");
    const indicadores = document.getElementById("carrusel-indicadores");
    if (!track) return;

    track.innerHTML = promociones.map((p, i) => `
        <div class="carrusel-slide min-w-full snap-start relative flex items-center justify-center overflow-hidden"
             style="min-height:300px;">
            <!-- Imagen de fondo a pantalla completa -->
            ${p.imagen ? `<img src="${p.imagen}" class="absolute inset-0 w-full h-full object-cover" alt="" style="filter: brightness(0.35) saturate(1.2);">` : ''}
            <!-- Overlay gradiente premium -->
            <div class="absolute inset-0" style="background: linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 40%, rgba(6,182,212,0.15) 100%);"></div>
            <!-- Efecto de partículas / brillo sutil -->
            <div class="absolute inset-0 opacity-30" style="background: radial-gradient(circle at 70% 30%, rgba(6,182,212,0.3) 0%, transparent 50%);"></div>
            <!-- Contenido con animación -->
            <div class="relative z-10 text-center px-8 py-12 max-w-2xl carrusel-contenido">
                ${p.subtitulo ? `<p class="text-cyan-400 text-xs font-bold uppercase tracking-[0.3em] mb-4 animate-slideDown" style="text-shadow: 0 0 20px rgba(6,182,212,0.5);">${p.subtitulo}</p>` : ''}
                <h2 class="text-white text-3xl md:text-5xl font-black mb-5 leading-tight animate-slideUp" style="text-shadow: 0 4px 30px rgba(0,0,0,0.8);">${p.titulo || ''}</h2>
                ${p.descripcion ? `<p class="text-zinc-300/90 text-sm mb-7 max-w-lg mx-auto animate-fadeIn" style="animation-delay: 0.3s;">${p.descripcion}</p>` : ''}
                ${p.enlace ? `
                    <a href="${p.enlace}" class="inline-block bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-black font-black px-8 py-3.5 rounded-2xl transition-all duration-300 shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_50px_rgba(6,182,212,0.6)] hover:scale-105 animate-fadeIn" style="animation-delay: 0.5s;">
                        ${p.texto_boton || p.textoBoton || 'Ver más'} →
                    </a>` : ''}
            </div>
            <!-- Línea decorativa inferior -->
            <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
        </div>
    `).join('');

    // Indicadores tipo barra con progreso
    if (indicadores) {
        indicadores.innerHTML = promociones.map((_, i) =>
            `<button onclick="irASlide(${i})" class="carrusel-barra relative h-1 rounded-full overflow-hidden transition-all duration-300 cursor-pointer" data-index="${i}" style="width: ${promociones.length > 1 ? '40px' : '60px'}; background: rgba(161,161,170,0.3);">
                <span class="carrusel-barra-progreso absolute inset-0 rounded-full bg-cyan-400 origin-left scale-x-0 transition-transform"></span>
            </button>`
        ).join('');
    }

    // Controles prev/next
    let slideActual = 0;
    const totalSlides = promociones.length;
    let autoSlideInterval;

    window.irASlide = function(index) {
        slideActual = (index + totalSlides) % totalSlides;
        track.scrollTo({ left: track.clientWidth * slideActual, behavior: 'smooth' });
        
        document.querySelectorAll('.carrusel-barra').forEach((barra, i) => {
            const progreso = barra.querySelector('.carrusel-barra-progreso');
            if (i === slideActual) {
                barra.style.width = promociones.length > 1 ? '60px' : '60px';
                barra.style.background = 'rgba(6,182,212,0.2)';
                if (progreso) {
                    progreso.style.transition = 'none';
                    progreso.style.transform = 'scaleX(0)';
                    setTimeout(() => {
                        progreso.style.transition = 'transform 5s linear';
                        progreso.style.transform = 'scaleX(1)';
                    }, 50);
                }
            } else {
                barra.style.width = '40px';
                barra.style.background = 'rgba(161,161,170,0.3)';
                if (progreso) {
                    progreso.style.transition = 'none';
                    progreso.style.transform = 'scaleX(0)';
                }
            }
        });

        // Reset auto-slide timer
        if (autoSlideInterval) clearInterval(autoSlideInterval);
        if (totalSlides > 1) {
            autoSlideInterval = setInterval(() => irASlide(slideActual + 1), 5000);
        }
    };

    const btnPrev = document.getElementById("prev-slide");
    const btnNext = document.getElementById("next-slide");
    if (btnPrev) btnPrev.onclick = () => irASlide(slideActual - 1);
    if (btnNext) btnNext.onclick = () => irASlide(slideActual + 1);

    if (totalSlides > 1) {
        autoSlideInterval = setInterval(() => irASlide(slideActual + 1), 5000);
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
// 📦 3. RENDERIZADOR DE PRODUCTOS EN VITRINA (PREMIUM)
// =========================================================================
function renderizarProductos(productos) {
    const contenedor = getContenedorProductos();
    if (!contenedor) return;

    if (!productos || productos.length === 0) {
        contenedor.innerHTML = `<p class="text-zinc-500 text-center col-span-full py-12">No hay vapers disponibles por ahora.</p>`;
        return;
    }

    contenedor.innerHTML = productos.map((p, index) => {
        const saboresParsed = parsearSabores(p.sabores);
        const stockTotal = obtenerStockTotal(p.sabores);
        const tieneStock = stockTotal === -1 || stockTotal > 0;
        const agotado = stockTotal === 0;

        // Badge de stock
        let stockBadge = '';
        if (stockTotal >= 0) {
            if (agotado) {
                stockBadge = `<span class="inline-flex items-center gap-1 bg-red-500/10 border border-red-500/20 text-[10px] font-bold text-red-400 px-2 py-0.5 rounded-full uppercase tracking-wider"><span class="w-1.5 h-1.5 rounded-full bg-red-400"></span>Agotado</span>`;
            } else if (stockTotal <= 5) {
                stockBadge = `<span class="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-400 px-2 py-0.5 rounded-full uppercase tracking-wider"><span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>Últimas ${stockTotal}u</span>`;
            } else {
                stockBadge = `<span class="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-wider"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>${stockTotal} disp.</span>`;
            }
        }

        // Sabores como select con stock
        let saboresHtml = '';
        if (saboresParsed.length > 0) {
            saboresHtml = `
                <div class="mb-3" onclick="event.stopPropagation()">
                    <label class="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1.5">💨 Sabor:</label>
                    <select id="select-sabor-${p.id}" class="w-full bg-zinc-950/80 border border-zinc-700/50 text-xs text-zinc-200 p-2 rounded-xl outline-none focus:border-cyan-500/50 cursor-pointer font-medium backdrop-blur-sm">
                        ${saboresParsed.map(s => {
                            const stockInfo = s.stock >= 0 ? ` (${s.stock > 0 ? s.stock + ' disp.' : 'Agotado'})` : '';
                            const disabled = s.stock === 0 ? 'disabled' : '';
                            return `<option value="${s.nombre}" ${disabled} ${s.stock === 0 ? 'class="text-zinc-600"' : ''}>${s.nombre}${stockInfo}</option>`;
                        }).join('')}
                    </select>
                </div>
            `;
        }

        return `
        <div onclick="abrirDetalleProducto(${p.id})" 
             class="producto-card group cursor-pointer relative overflow-hidden rounded-2xl ${agotado ? 'opacity-60' : ''}"
             style="animation: fadeInUp 0.5s ease-out ${index * 0.08}s both;">
            
            <!-- Fondo con glassmorphism -->
            <div class="absolute inset-0 bg-gradient-to-b from-zinc-900/95 via-zinc-900/98 to-zinc-950 border border-zinc-700/30 rounded-2xl group-hover:border-cyan-500/30 transition-all duration-500"></div>
            <!-- Resplandor hover -->
            <div class="absolute -inset-1 bg-gradient-to-r from-cyan-500/0 via-cyan-500/0 to-cyan-500/0 group-hover:from-cyan-500/5 group-hover:via-cyan-400/10 group-hover:to-cyan-500/5 rounded-2xl blur-xl transition-all duration-700 opacity-0 group-hover:opacity-100"></div>
            
            <div class="relative z-10 p-4 flex flex-col justify-between h-full">
                <!-- Imagen del producto (MÁS GRANDE Y CON BORDES DIFUMINADOS) -->
                <div class="relative rounded-xl overflow-hidden mb-5 bg-gradient-to-br from-zinc-800/30 to-zinc-900/30 p-2 flex justify-center items-center h-60">
                    <!-- Overlay de bordes difuminados (Vignette) para que se mezcle con el fondo -->
                    <div class="absolute inset-0 shadow-[inset_0_0_40px_rgba(24,24,27,1)] z-20 pointer-events-none rounded-xl mix-blend-multiply"></div>
                    <div class="absolute inset-0 shadow-[inset_0_0_20px_rgba(24,24,27,0.8)] z-20 pointer-events-none rounded-xl"></div>
                    
                    <!-- Resplandor detrás del producto -->
                    <div class="absolute inset-0 bg-gradient-to-t from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <!-- Imagen más grande con mask para difuminar bordes suaves -->
                    <img src="${p.imagen}" class="w-full h-full object-contain relative z-10 group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)] [mask-image:radial-gradient(ellipse_at_center,black_70%,transparent_100%)] -webkit-[mask-image:radial-gradient(ellipse_at_center,black_70%,transparent_100%)]" alt="${p.nombre}" loading="lazy">
                </div>

                <!-- Info -->
                <div class="flex flex-wrap gap-1.5 mb-2.5">
                    <span class="inline-flex items-center bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-bold text-cyan-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        ${p.categoria || 'Desechables'}
                    </span>
                    ${stockBadge}
                </div>

                <h3 class="text-white font-bold text-[15px] tracking-tight group-hover:text-cyan-400 transition-colors duration-300 mb-1 line-clamp-2">${p.nombre}</h3>
                <p class="text-zinc-500 text-[11px] font-light line-clamp-2 mb-3 leading-relaxed">${p.descripcion || 'Sin descripción disponible.'}</p>
                
                ${saboresHtml}

                <!-- Precio y botón -->
                <div class="flex justify-between items-center border-t border-zinc-800/50 pt-3 mt-auto" onclick="event.stopPropagation()">
                    <span class="text-cyan-400 font-mono font-black text-lg tracking-tight">
                        $${Number(p.precio).toLocaleString('es-CO')}
                    </span>
                    <button onclick="agregarAlCarritoDesdeVitrina(${p.id})" 
                            class="bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-black font-black text-[11px] px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all duration-300 cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] active:scale-95 ${agotado ? 'opacity-50 pointer-events-none' : ''}">
                        🛒 Agregar
                    </button>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

// =========================================================================
// 👁️ 4. VENTANA EMERGENTE / MODAL DETALLE (PREMIUM)
// =========================================================================
window.abrirDetalleProducto = function(id) {
    const listaGlobal = obtenerListaProductosGlobal();
    const prod = listaGlobal.find(p => Number(p.id) === Number(id));
    if (!prod) return;

    const modal = document.getElementById("modal-detalle");
    const contenido = document.getElementById("contenido-modal-detalle");
    if (!modal || !contenido) return;

    const saboresParsed = parsearSabores(prod.sabores);
    const stockTotal = obtenerStockTotal(prod.sabores);
    const agotado = stockTotal === 0;
    const primerSaborDisponible = saboresParsed.find(s => s.stock !== 0);

    // Generar chips de sabores
    let saboresHtml = "";
    if (saboresParsed.length > 0) {
        saboresHtml = `
            <div class="mb-5">
                <label class="block text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-3">Selecciona tu Sabor</label>
                <div class="flex flex-wrap gap-2" id="modal-sabores-chips">
                    ${saboresParsed.map((s, i) => {
                        const esAgotado = s.stock === 0;
                        const esSeleccionado = primerSaborDisponible ? s.nombre === primerSaborDisponible.nombre : i === 0;
                        const stockLabel = s.stock >= 0 ? (s.stock > 0 ? `${s.stock}u` : 'Agotado') : '';
                        return `
                            <button type="button" 
                                onclick="seleccionarSaborModal('${s.nombre.replace(/'/g, "\\'")}')" 
                                data-sabor="${s.nombre}"
                                class="sabor-chip px-3 py-2 rounded-xl text-xs font-bold border transition-all duration-200 cursor-pointer flex items-center gap-2
                                ${esAgotado 
                                    ? 'bg-zinc-900/50 border-zinc-800/50 text-zinc-600 cursor-not-allowed opacity-50' 
                                    : esSeleccionado 
                                        ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                                        : 'bg-zinc-900/60 border-zinc-700/40 text-zinc-300 hover:border-zinc-500 hover:bg-zinc-800/60'
                                }"
                                ${esAgotado ? 'disabled' : ''}>
                                <span>💨</span>
                                <span>${s.nombre}</span>
                                ${stockLabel ? `<span class="text-[9px] font-mono ${esAgotado ? 'text-red-500' : 'text-zinc-500'}">${stockLabel}</span>` : ''}
                            </button>
                        `;
                    }).join('')}
                </div>
                <input type="hidden" id="modal-sabor-select" value="${primerSaborDisponible ? primerSaborDisponible.nombre : (saboresParsed[0]?.nombre || 'Original')}">
            </div>
        `;
    } else {
        saboresHtml = `
            <p class="text-xs text-zinc-500 italic mb-5 flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Sabor original estándar listo para envío.
            </p>
            <input type="hidden" id="modal-sabor-select" value="Original">
        `;
    }

    // Stock badge para el modal
    let stockBadgeModal = '';
    if (stockTotal >= 0) {
        if (agotado) {
            stockBadgeModal = `<span class="inline-flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 text-[10px] font-bold text-red-400 px-2.5 py-1 rounded-full"><span class="w-1.5 h-1.5 rounded-full bg-red-400"></span>Agotado</span>`;
        } else {
            stockBadgeModal = `<span class="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 px-2.5 py-1 rounded-full"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>${stockTotal} disponibles</span>`;
        }
    }

    contenido.innerHTML = `
        <!-- Botón cerrar -->
        <button onclick="cerrarDetalleProducto()" class="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-zinc-400 bg-zinc-950/80 backdrop-blur-md rounded-full z-20 cursor-pointer hover:text-white hover:bg-zinc-800 border border-zinc-700/50 transition-all duration-200 active:scale-90 text-lg">✕</button>
        
        <div class="grid grid-cols-1 md:grid-cols-2">
            <!-- Imagen con efecto premium -->
            <div class="relative p-8 flex items-center justify-center min-h-[280px] overflow-hidden bg-zinc-950">
                <!-- Resplandor difuso del producto -->
                <div class="absolute inset-0 bg-gradient-to-br from-cyan-500/8 via-transparent to-purple-500/5"></div>
                <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-cyan-500/10 rounded-full blur-[60px]"></div>
                <!-- Patrón decorativo -->
                <div class="absolute top-4 left-4 w-16 h-16 border border-cyan-500/10 rounded-full"></div>
                <div class="absolute bottom-4 right-4 w-8 h-8 border border-cyan-500/10 rounded-full"></div>
                <!-- Imagen -->
                <img src="${prod.imagen}" class="max-h-64 object-contain relative z-10 drop-shadow-[0_20px_40px_rgba(6,182,212,0.2)] hover:scale-105 transition-transform duration-500" alt="${prod.nombre}">
            </div>
            
            <!-- Info del producto -->
            <div class="p-6 md:p-8 bg-zinc-900 flex flex-col justify-between">
                <div>
                    <!-- Badges -->
                    <div class="flex flex-wrap items-center gap-2 mb-4">
                        <span class="text-[9px] tracking-widest font-bold uppercase text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20 inline-flex items-center gap-1">
                            <span class="w-1 h-1 rounded-full bg-cyan-400"></span>${prod.categoria || 'Desechables'}
                        </span>
                        ${stockBadgeModal}
                    </div>
                    
                    <h3 class="text-xl md:text-2xl font-black text-white mb-3 leading-tight">${prod.nombre}</h3>
                    <p class="text-zinc-400 text-sm mb-6 font-light leading-relaxed">${prod.descripcion || 'Sin descripción disponible.'}</p>
                    
                    ${saboresHtml}
                    
                    <!-- Cantidad -->
                    <div class="mb-4">
                        <label class="block text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-2">Cantidad</label>
                        <div class="flex items-center gap-1">
                            <button type="button" onclick="alterarCantidadModal(-1)" class="w-11 h-11 bg-zinc-950/80 border border-zinc-700/50 text-lg font-bold text-white hover:bg-zinc-800 hover:text-cyan-400 hover:border-cyan-500/30 active:scale-90 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200">−</button>
                            <input type="number" id="modal-cantidad-input" value="1" min="1" class="w-14 h-11 bg-zinc-950/80 border border-zinc-700/50 text-center text-sm font-mono font-bold text-white rounded-xl outline-none" readonly>
                            <button type="button" onclick="alterarCantidadModal(1)" class="w-11 h-11 bg-zinc-950/80 border border-zinc-700/50 text-lg font-bold text-white hover:bg-zinc-800 hover:text-cyan-400 hover:border-cyan-500/30 active:scale-90 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200">+</button>
                        </div>
                    </div>
                </div>
                
                <!-- Subtotal y CTA -->
                <div class="pt-5 border-t border-zinc-800/60 flex items-center justify-between gap-4 mt-4">
                    <div class="flex flex-col">
                        <span class="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Subtotal</span>
                        <span id="modal-precio-total" class="text-2xl font-black text-white font-mono" data-base-price="${prod.precio}">$${Number(prod.precio).toLocaleString('es-CO')}</span>
                    </div>
                    <button onclick="agregarAlCarritoDesdeModal(${prod.id}, event)" 
                            class="flex-1 max-w-[220px] bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-black font-black text-sm py-3.5 px-4 rounded-xl shadow-[0_0_25px_rgba(6,182,212,0.3)] hover:shadow-[0_0_40px_rgba(6,182,212,0.5)] transition-all duration-300 transform active:scale-95 cursor-pointer ${agotado ? 'opacity-50 pointer-events-none' : ''}">
                        Añadir al Carrito 🛒
                    </button>
                </div>
            </div>
        </div>
    `;

    // Mostrar modal con animación
    modal.classList.remove("hidden");
    modal.style.display = "flex";
    setTimeout(() => modal.classList.remove("opacity-0"), 20);
};

// Seleccionar sabor en modal (chips)
window.seleccionarSaborModal = function(sabor) {
    document.querySelectorAll('.sabor-chip:not([disabled])').forEach(chip => {
        const esSelecc = chip.dataset.sabor === sabor;
        chip.className = chip.className.replace(/bg-cyan-500\/15|border-cyan-500\/50|text-cyan-400|shadow-\[0_0_15px_rgba\(6,182,212,0\.15\)\]|bg-zinc-900\/60|border-zinc-700\/40|text-zinc-300|hover:border-zinc-500|hover:bg-zinc-800\/60/g, '');
        if (esSelecc) {
            chip.classList.add('bg-cyan-500/15', 'border-cyan-500/50', 'text-cyan-400', 'shadow-[0_0_15px_rgba(6,182,212,0.15)]');
        } else {
            chip.classList.add('bg-zinc-900/60', 'border-zinc-700/40', 'text-zinc-300', 'hover:border-zinc-500', 'hover:bg-zinc-800/60');
        }
    });
    const hiddenInput = document.getElementById("modal-sabor-select");
    if (hiddenInput) hiddenInput.value = sabor;
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
        setTimeout(() => {
            modal.classList.add("hidden");
            modal.style.display = "";
        }, 300);
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
        boton.innerHTML = "✅ ¡Añadido!";
        boton.classList.add("from-emerald-500", "to-emerald-400");
        boton.classList.remove("from-cyan-500", "to-cyan-400");
        setTimeout(() => { 
            boton.innerHTML = textoOriginal;
            boton.classList.remove("from-emerald-500", "to-emerald-400");
            boton.classList.add("from-cyan-500", "to-cyan-400");
            cerrarDetalleProducto();
            window.abrirCarrito();
        }, 500);
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
            
            let listaSabores = [{ nombre: item.sabor || "Original", stock: -1 }];
            if (productoOriginal && productoOriginal.sabores) {
                listaSabores = parsearSabores(productoOriginal.sabores);
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
                                const sabClean = sabor.nombre.trim();
                                const stockInfo = sabor.stock >= 0 ? ` (${sabor.stock})` : '';
                                return `<option value="${sabClean}" ${sabClean.toLowerCase() === saborSeguro.toLowerCase() ? 'selected' : ''}>💨 ${sabClean}${stockInfo}</option>`;
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
// 🔄 6. CONTROLES AVANZADOS DEL CARRITO
// =========================================================================
window.cambiarCantidad = function(id, sabor, cambio) {
    const sabBuscado = String(sabor || '').trim().toLowerCase();

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

window.eliminarDelCarrito = function(id, sabor) {
    const sabBuscado = String(sabor || '').trim().toLowerCase();
    carrito = carrito.filter(p => !(
        String(p.id) === String(id) && 
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

window.enviarPedidoWhatsApp = async function() {
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

    // Guardar pedido en la base de datos
    try {
        await fetch('/api/pedidos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                cliente_nombre: nombre,
                cliente_direccion: direccion,
                ubicacion,
                metodo_pago: pago,
                items: carrito.map(item => ({
                    id: item.id,
                    nombre: item.nombre,
                    sabor: item.sabor,
                    cantidad: item.cantidad,
                    precio: item.precio
                })),
                total: totalTotal
            })
        });
    } catch(e) {
        console.warn('No se pudo registrar el pedido en la DB:', e);
    }

    const urlValidada = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`;
    window.open(urlValidada, '_blank');
};