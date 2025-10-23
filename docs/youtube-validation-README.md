# 🎥 Sistema de Validación de Videos de YouTube

## ❓ ¿En qué se basa para indicar que una canción es correcta?

### 📊 Método de Validación Implementado:

#### **Validación con ReactPlayer Individual** (Método Definitivo) ⭐

```typescript
<ReactPlayer
  onError={(error) => {
    // Detecta errores de reproducción REALES
    if (error.data === 150 || error.data === 101) {
      // Video bloqueado para reproducción embebida
    }
  }}
/>
```

**Detecta:**

- ✅ **Restricciones de derechos de autor** (LatinAutor, UMPG, etc.)
- ✅ **Bloqueos de reproducción embebida**
- ✅ **Todos los errores de YouTube**

**Códigos de error de YouTube:**

- `101`: Video no disponible
- `150`: El propietario no permite la reproducción embebida
- `2`: Solicitud inválida
- `5`: Error de reproducción HTML5
- `100`: Video no encontrado o privado

---

## ✅ **Solución Implementada:**

### **Validación Individual con ReactPlayer en Modal de Búsqueda**

Cada video de los resultados de búsqueda se valida individualmente usando un `ReactPlayer` oculto:

1. **Validación Automática:**

   - Se crea un `ReactPlayer` oculto para cada resultado
   - Cada video se valida independientemente
   - **Detección 100% precisa** de restricciones de derechos de autor

2. **Indicadores Visuales en Tiempo Real:**

   - ⏳ **Reloj gris**: Pendiente de validación
   - 🔄 **Spinner azul**: Validando actualmente
   - ✅ **Check verde**: Video disponible
   - ❌ **Alerta roja**: Video bloqueado/no disponible

3. **Prevención de Selección:**
   - Los videos no disponibles **NO se pueden seleccionar**
   - **Previene errores** antes de llegar al reproductor principal

---

## 🔄 **Flujo de Validación:**

```
🔍 Usuario busca "La Pregunta Grupo Bryndis"
   ↓
📡 API devuelve 7 resultados
   ↓
🎬 Se crean 7 ReactPlayer ocultos automáticamente
   ↓
⏳ Cada video muestra "Pendiente" → 🔄 "Validando"
   ↓
✅ Videos disponibles: Check verde + seleccionables
❌ Videos bloqueados: Alerta roja + NO seleccionables
   ↓
👆 Usuario solo puede seleccionar videos válidos
```

---

## 💡 **Recomendaciones:**

### Para Usuarios:

1. **Buscar videos específicamente de "karaoke"** - tienen menos restricciones
2. **Buscar canales oficiales de karaoke** (Karafun, Sing King, etc.)
3. **Evitar videos musicales oficiales** - siempre tienen restricciones

### Para Desarrolladores:

1. **Confiar en el `onError` de ReactPlayer** - es la única fuente confiable
2. **Implementar logs detallados** para debugging
3. **Auto-skip en errores** para mejor UX
4. **Considerar una lista negra** de videos conocidos con problemas

---

## 🔧 **Mejoras Futuras:**

### Opción 1: Base de Datos de Videos Validados

- Guardar en Firebase los videos que han funcionado correctamente
- Marcar videos con errores conocidos
- Priorizar videos validados en búsquedas

### Opción 2: Servicio de Validación Backend

- Crear un worker que valide videos periódicamente
- Usar YouTube Data API v3 para obtener más información
- Cache de resultados de validación

### Opción 3: Integración con Canales de Karaoke

- Colaborar con canales oficiales de karaoke
- API directa con proveedores de karaoke
- Lista curada de videos confiables

---

## 📝 **Ejemplo de Error Real:**

```
Error: Video no disponible
Mensaje: "Este video tiene contenido de LatinAutor - UMPG,
         quien bloqueó su reproducción en este sitio web
         o en esta aplicación."
```

**Solución actual:**

- El reproductor detecta el error
- Marca la canción como completada automáticamente
- Salta a la siguiente canción en la lista
- Log del error en consola

---

## 🎯 **Conclusión:**

**La validación previa es útil pero limitada.** La única forma 100% confiable de detectar restricciones de derechos de autor es **intentar reproducir el video** y capturar errores en tiempo real con ReactPlayer.

Por eso implementamos:

1. ✅ Validación individual con ReactPlayer (100% confiable)
2. ✅ Detección de errores en reproducción
3. ✅ Prevención de selección de videos problemáticos
4. ✅ Logs detallados para debugging

---

## 📁 **Archivos del Sistema:**

- `src/shared/components/YouTubeVideoValidator.tsx` - Componente de validación individual
- `src/shared/hooks/useReactPlayerValidation.tsx` - Hook para gestión de estado
- `src/pages/karaoke/pages/visit-manage/components/modal-search-songs.tsx` - Integración en modal

**Sistema limpio y eficiente sin código obsoleto.** 🚀
