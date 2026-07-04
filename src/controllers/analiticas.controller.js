const db = require('../config/db');

exports.obtenerEstadisticas = async (req, res) => {
    try {
        const queryPedidos = "SELECT total, items FROM pedidos WHERE estado = 'confirmado'";
        const resultado = await db.query(queryPedidos);
        
        let ventasTotales = 0;
        const conteoSabores = {};

        resultado.rows.forEach(pedido => {
            ventasTotales += Number(pedido.total || 0);

            let items = [];
            try {
                items = typeof pedido.items === 'string' ? JSON.parse(pedido.items) : pedido.items;
            } catch (e) {
                items = [];
            }

            items.forEach(item => {
                const nombreSabor = `${item.nombre} - ${item.sabor || 'Original'}`;
                const cantidad = Number(item.cantidad || 1);
                
                if (!conteoSabores[nombreSabor]) {
                    conteoSabores[nombreSabor] = 0;
                }
                conteoSabores[nombreSabor] += cantidad;
            });
        });

        // Ordenar los sabores más vendidos
        const saboresMasVendidos = Object.keys(conteoSabores)
            .map(nombre => ({ nombre, cantidad: conteoSabores[nombre] }))
            .sort((a, b) => b.cantidad - a.cantidad)
            .slice(0, 5); // Top 5

        res.json({
            ventasTotales,
            saboresMasVendidos,
            totalPedidos: resultado.rows.length
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al calcular analíticas', detalle: error.message });
    }
};
