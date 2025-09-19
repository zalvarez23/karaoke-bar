# Centro de Notificaciones

## Descripción

Sistema de notificaciones que muestra automáticamente las visitas pendientes obtenidas directamente de Firebase mediante listeners en tiempo real.

## Características

- **Campana con contador**: Muestra el número de visitas pendientes
- **Panel deslizante**: Se desliza desde la derecha ocupando toda la altura de la pantalla
- **Diseño amplio**: Panel de 384px (w-96) para mejor legibilidad
- **Tiempo real**: Actualización automática cuando hay nuevas visitas pendientes
- **Aceptar/Rechazar**: Acciones directas para gestionar visitas
- **Click fuera**: Cierra el panel automáticamente
- **Animación suave**: Transición de 300ms con ease-in-out
- **Cards minimalistas**: Diseño limpio con borde verde izquierdo

## Ubicación

- **Componente**: `src/pages/layout/components/notification-center.tsx`
- **Cards**: `src/pages/layout/components/request-card.tsx`
- **Servicio**: `src/pages/visits-manage/services/visits-services.ts`
- **Integración**: Header del layout principal (`src/pages/layout/main-layout-container.tsx`)

## Diseño del Panel

### Características visuales:

- **Ancho**: 384px (w-96)
- **Altura**: 100% de la pantalla (h-full)
- **Posición**: Fixed desde la derecha (right-0)
- **Animación**: Desliza desde la derecha con `translate-x-full` → `translate-x-0`
- **Sombra**: Sombra pronunciada (shadow-2xl) para efecto flotante
- **Borde**: Borde izquierdo sutil (border-l border-gray-200)

### Estructura del panel:

1. **Header**: Título, contador de no leídas, botones de acción
2. **Contenido**: Lista scrolleable de notificaciones
3. **Estado vacío**: Mensaje centrado cuando no hay notificaciones

## Uso

### 1. Importar el hook

```typescript
import { useNotifications } from "@/shared/contexts/notification-context";
```

### 2. Usar en el componente

```typescript
const { addNotification, markAsRead, clearAll } = useNotifications();

// Agregar notificación
addNotification({
  title: "Título de la notificación",
  message: "Mensaje descriptivo",
  type: "success", // "info" | "warning" | "success" | "error"
});
```

### 3. Ejemplos de uso

#### Notificación de éxito

```typescript
addNotification({
  title: "Operación exitosa",
  message: "Los datos se han guardado correctamente",
  type: "success",
});
```

#### Notificación de error

```typescript
addNotification({
  title: "Error en la operación",
  message: "No se pudo conectar con el servidor",
  type: "error",
});
```

#### Notificación de advertencia

```typescript
addNotification({
  title: "Advertencia",
  message: "El usuario está a punto de ser eliminado",
  type: "warning",
});
```

#### Notificación informativa

```typescript
addNotification({
  title: "Información",
  message: "Nueva actualización disponible",
  type: "info",
});
```

## Estructura de datos

```typescript
interface Notification {
  id: string; // ID único generado automáticamente
  title: string; // Título de la notificación
  message: string; // Mensaje descriptivo
  type: "info" | "warning" | "success" | "error"; // Tipo de notificación
  timestamp: Date; // Fecha y hora de creación
  read: boolean; // Estado de lectura
}
```

## Métodos disponibles

- `addNotification(notification)`: Agrega una nueva notificación
- `markAsRead(id)`: Marca una notificación como leída
- `clearAll()`: Elimina todas las notificaciones
- `removeNotification(id)`: Elimina una notificación específica

## Estilos visuales

### Tipos de notificación:

- **Success**: Borde verde, fondo verde claro, ícono ✅, badge verde
- **Error**: Borde rojo, fondo rojo claro, ícono ❌, badge rojo
- **Warning**: Borde amarillo, fondo amarillo claro, ícono ⚠️, badge amarillo
- **Info**: Borde azul, fondo azul claro, ícono ℹ️, badge azul

### Estados:

- **No leída**: Fondo azul claro, borde azul, punto azul indicador
- **Leída**: Fondo blanco/gris claro, sin indicador
- **Hover**: Sombra suave y transición suave

### Elementos del panel:

- **Header**: Fondo gris claro (bg-gray-50), padding 24px
- **Notificaciones**: Padding 16px, espaciado 12px entre elementos
- **Íconos**: Tamaño 2xl (24px) para mejor visibilidad
- **Texto**: Títulos en base (16px), mensajes en sm (14px)

## Integración global

El sistema está integrado en:

1. **App.tsx**: Envuelto con `NotificationProvider`
2. **MainLayoutContainer**: Header con el componente `NotificationCenter`
3. **Todas las páginas**: Acceso global al hook `useNotifications`

## Notas técnicas

- Las notificaciones se almacenan en memoria (no persisten entre sesiones)
- El contador se actualiza automáticamente
- El panel se cierra al hacer click en el overlay o en el botón X
- Las notificaciones se ordenan por fecha (más recientes primero)
- Soporte para notificaciones con más de 99 elementos (muestra "99+")
- Animación CSS con `transform` y `transition` para mejor rendimiento
- Z-index alto (z-50) para asegurar que esté por encima de otros elementos
