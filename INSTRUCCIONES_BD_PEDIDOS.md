## 🚨 INSTRUCCIONES IMPORTANTES: Crear tabla de Pedidos

El sistema de pedidos requiere que ejecutes este script SQL en tu base de datos de **Railway**.

### ¿POR QUÉ?
La tabla `pedidos` no fue creada en la migración inicial. Sin ella, los pedidos no se guardan en la BD.

### PASOS PARA EJECUTAR:

1. **Abre tu proyecto en Railway**
   - Ve a: https://railway.app/project
   - Selecciona tu proyecto

2. **Accede a la base de datos PostgreSQL**
   - Click en el servicio "Postgres" (lado izquierdo)

3. **Abre el Query Editor**
   - Click en la pestaña "Data" o "Query"
   - O haz click en el botón con ícono de terminal/código

4. **Copia y pega el contenido del archivo**
   - Abre este archivo: `src/config/crear-pedidos.sql`
   - Copia TODO el contenido
   - Pégalo en el Query Editor de Railway

5. **Ejecuta la query**
   - Click en el botón "Execute" o presiona Ctrl+Enter
   - Deberías ver un mensaje de éxito

### VERIFICAR QUE FUNCIONÓ:

Después de ejecutar, verifica con esta query:

```sql
SELECT * FROM pedidos LIMIT 1;
```

Si no da error, ¡listo! Ya está creada.

### AHORA SÍ:

- ✅ Los pedidos se guardarán en la BD
- ✅ Aparecerán en el panel de admin
- ✅ Podrás confirmar y cancelar pedidos

---

**Si tienes error al ejecutar:**
- Haz screenshot del error
- Verifica que estés en la BD correcta (check `SHOW current_database;`)
- Intenta ejecutar primero solo: `CREATE TABLE IF NOT EXISTS pedidos (...)`
