const db = require('../config/db');

exports.obtenerTodos = async (req, res) => {
    try {
        const resultado = await db.query('SELECT * FROM productos ORDER BY id DESC');

        // Para cada producto, traemos sus sabores, imágenes extra y reseñas
        const productos = await Promise.all(resultado.rows.map(async (p) => {
            const resSabores = await db.query(
                'SELECT id, nombre, stock FROM producto_sabores WHERE producto_id = $1 ORDER BY id',
                [p.id]
            );

            let saboresConStock = [];
            let stockTotal = 0;
            if (resSabores.rows.length > 0) {
                saboresConStock = resSabores.rows;
                stockTotal = saboresConStock.reduce((sum, s) => sum + Number(s.stock || 0), 0);
            } else {
                let saboresFormateados = p.sabores;
                if (typeof p.sabores === 'string' && p.sabores.includes(',')) {
                    saboresFormateados = p.sabores.split(',').map(s => ({ nombre: s.trim(), stock: -1 }));
                } else if (typeof p.sabores === 'string' && p.sabores) {
                    saboresFormateados = [{ nombre: p.sabores.trim(), stock: -1 }];
                } else {
                    saboresFormateados = [];
                }
                saboresConStock = saboresFormateados;
            }

            // Cargar imágenes extra
            let imagenesExtra = [];
            try {
                const resImagenes = await db.query('SELECT url_imagen FROM producto_imagenes WHERE producto_id = $1 ORDER BY orden', [p.id]);
                imagenesExtra = resImagenes.rows.map(r => r.url_imagen);
            } catch(e) { /* Si la tabla no existe aún, no rompe */ }

            // Cargar reseñas
            let resenas = [];
            try {
                const resResenas = await db.query('SELECT nombre_cliente, calificacion, comentario, fecha FROM resenas WHERE producto_id = $1 ORDER BY fecha DESC', [p.id]);
                resenas = resResenas.rows;
            } catch(e) { /* Si la tabla no existe aún, no rompe */ }

            return { 
                ...p, 
                sabores: saboresConStock, 
                stock: stockTotal > 0 ? stockTotal : p.stock,
                imagenesExtra,
                resenas
            };
        }));

        res.json(productos);
    } catch (error) {
        res.status(500).json({ error: 'Error al consultar el inventario en Postgres.', detalle: error.message });
    }
};

exports.crearProducto = async (req, res) => {
    const { nombre, descripcion, precio, categoria, imagen, sabores, stock, imagenesExtra } = req.body;
    try {
        // Preparar string de sabores para la columna legacy
        let stringSabores = '';
        if (Array.isArray(sabores)) {
            stringSabores = sabores.map(s => typeof s === 'object' ? s.nombre : s).join(', ');
        } else {
            stringSabores = String(sabores || '');
        }

        const stockTotal = Array.isArray(sabores)
            ? sabores.reduce((sum, s) => sum + Number(typeof s === 'object' ? s.stock : (stock || 0)), 0)
            : Number(stock) || 0;

        const querySQL = `
            INSERT INTO productos (nombre, descripcion, precio, categoria, imagen, sabores, stock) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING id
        `;
        const valores = [nombre, descripcion, precio, categoria, imagen || 'img/logo.png', stringSabores, stockTotal];
        
        const resultado = await db.query(querySQL, valores);
        const productoId = resultado.rows[0].id;

        // Insertar sabores individuales con su stock
        if (Array.isArray(sabores) && sabores.length > 0) {
            for (const sabor of sabores) {
                const nombreSabor = typeof sabor === 'object' ? sabor.nombre : sabor;
                const stockSabor = typeof sabor === 'object' ? Number(sabor.stock || 0) : Number(stock || 0);
                await db.query(
                    'INSERT INTO producto_sabores (producto_id, nombre, stock) VALUES ($1, $2, $3)',
                    [productoId, nombreSabor.trim(), stockSabor]
                );
            }
        }

        // Insertar imágenes extra
        if (Array.isArray(imagenesExtra) && imagenesExtra.length > 0) {
            for (let i = 0; i < imagenesExtra.length; i++) {
                if (imagenesExtra[i] && imagenesExtra[i].trim()) {
                    await db.query(
                        'INSERT INTO producto_imagenes (producto_id, url_imagen, orden) VALUES ($1, $2, $3)',
                        [productoId, imagenesExtra[i].trim(), i]
                    );
                }
            }
        }

        res.status(201).json({ mensaje: 'Vape registrado en Postgres', id: productoId });
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar el producto.', detalle: error.message });
    }
};

exports.editarProducto = async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, precio, categoria, imagen, sabores, stock, imagenesExtra } = req.body;
    try {
        // Preparar string de sabores para la columna legacy
        let stringSabores = '';
        if (Array.isArray(sabores)) {
            stringSabores = sabores.map(s => typeof s === 'object' ? s.nombre : s).join(', ');
        } else {
            stringSabores = String(sabores || '');
        }

        const stockTotal = Array.isArray(sabores)
            ? sabores.reduce((sum, s) => sum + Number(typeof s === 'object' ? s.stock : 0), 0)
            : (stock !== undefined && stock !== null && stock !== '') ? Number(stock) : null;

        const stockFinal = stockTotal !== null ? stockTotal : 0;

        await db.query(
            `UPDATE productos SET nombre=$1, descripcion=$2, precio=$3, categoria=$4, imagen=$5, sabores=$6, stock=$7 WHERE id=$8`,
            [nombre, descripcion, precio, categoria, imagen, stringSabores, stockFinal, id]
        );

        // Reemplazar sabores: borrar los viejos e insertar los nuevos con stock actualizado
        if (Array.isArray(sabores)) {
            await db.query('DELETE FROM producto_sabores WHERE producto_id = $1', [id]);
            for (const sabor of sabores) {
                const nombreSabor = typeof sabor === 'object' ? sabor.nombre : sabor;
                const stockSabor = typeof sabor === 'object' ? Number(sabor.stock || 0) : 0;
                if (nombreSabor && nombreSabor.trim()) {
                    await db.query(
                        'INSERT INTO producto_sabores (producto_id, nombre, stock) VALUES ($1, $2, $3)',
                        [id, nombreSabor.trim(), stockSabor]
                    );
                }
            }
        }

        // Reemplazar imágenes extra
        if (Array.isArray(imagenesExtra)) {
            await db.query('DELETE FROM producto_imagenes WHERE producto_id = $1', [id]);
            for (let i = 0; i < imagenesExtra.length; i++) {
                if (imagenesExtra[i] && imagenesExtra[i].trim()) {
                    await db.query(
                        'INSERT INTO producto_imagenes (producto_id, url_imagen, orden) VALUES ($1, $2, $3)',
                        [id, imagenesExtra[i].trim(), i]
                    );
                }
            }
        }

        res.json({ mensaje: 'Vape actualizado correctamente en Postgres.' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el producto.', detalle: error.message });
    }
};

exports.eliminarProducto = async (req, res) => {
    const { id } = req.params;
    try {
        // producto_sabores se borra automáticamente por ON DELETE CASCADE
        await db.query('DELETE FROM productos WHERE id = $1', [id]);
        res.json({ mensaje: 'Producto removido de Postgres.' });
    } catch (error) {
        res.status(500).json({ error: 'Error al remover el producto.', detalle: error.message });
    }
};