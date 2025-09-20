# Karaoke Pages Structure

Este directorio contiene las páginas de la aplicación de karaoke migradas desde `movile-karaoke`.

## 📁 Estructura de Archivos

```
pages/karaoke/
├── index.ts                           # Exportaciones centralizadas
├── colors/                            # Sistema de colores de KantoBar
│   ├── index.ts
│   └── colors.ts                      # Paleta de colores migrada
├── components/                        # Componentes reutilizables
│   └── index.ts
├── constants/                         # Constantes globales
│   ├── index.ts
│   └── global.constants.ts            # Constantes de la aplicación
├── helpers/                           # Funciones helper
│   └── index.ts
├── services/                          # Servicios de API
│   └── index.ts
├── types/                             # Tipos TypeScript
│   ├── index.ts
│   ├── user.types.ts                  # Tipos de usuario
│   ├── visits.types.ts                # Tipos de visitas
│   ├── location.types.ts              # Tipos de ubicaciones
│   ├── navigation.types.ts            # Tipos de navegación
│   └── card.types.ts                  # Tipos de tarjetas
├── pages/                             # Páginas de la aplicación
│   ├── index.ts                       # Exportaciones de páginas
│   ├── login/
│   │   └── login-page.tsx             # Página de login
│   ├── home/
│   │   └── home-page.tsx              # Dashboard principal
│   ├── visit-manage/
│   │   └── visit-manage-page.tsx      # Gestión de mesas
│   ├── visit-manage-online/
│   │   └── visit-manage-online-page.tsx # Mesa online activa
│   ├── live/
│   │   └── live-page.tsx              # Karaoke en vivo
│   ├── user-register/
│   │   └── user-register-page.tsx     # Registro de usuarios
│   └── profile/
│       └── profile-page.tsx           # Perfil de usuario
└── README.md                          # Este archivo
```

## 🛣️ Rutas Configuradas

Las siguientes rutas están configuradas en `App.tsx`:

### Rutas Públicas (Sin Autenticación)

- `/karaoke/login` - Página de login
- `/karaoke/register` - Registro de usuarios

### Rutas Protegidas (Con Autenticación)

- `/karaoke` - Dashboard principal (redirige a home)
- `/karaoke/home` - Dashboard principal
- `/karaoke/mesas` - Gestión de mesas
- `/karaoke/mesas-online` - Mesa online activa
- `/karaoke/live` - Karaoke en vivo
- `/karaoke/profile` - Perfil de usuario

## 📱 Correspondencia con Móvil

| Móvil (React Navigation) | Web (React Router)      | Componente                   | Descripción      |
| ------------------------ | ----------------------- | ---------------------------- | ---------------- |
| Login                    | `/karaoke/login`        | KaraokeLoginPage             | Autenticación    |
| UserCreation             | `/karaoke/register`     | KaraokeUserRegisterPage      | Registro         |
| HomeTabs/Home            | `/karaoke/home`         | KaraokeHomePage              | Dashboard        |
| VisitManage              | `/karaoke/mesas`        | KaraokeVisitManagePage       | Gestión de mesas |
| VisitManageIsOnline      | `/karaoke/mesas-online` | KaraokeVisitManageOnlinePage | Mesa activa      |
| Live                     | `/karaoke/live`         | KaraokeLivePage              | Karaoke en vivo  |
| ProfileSettings          | `/karaoke/profile`      | KaraokeProfilePage           | Configuración    |

## 🎨 Estilo

Todas las páginas utilizan:

- **KantoBar Colors** - Sistema de colores migrado desde móvil
- **Tailwind CSS** para estilos base
- **Dark mode** por defecto usando `KaraokeColors.base.darkPrimary`
- **Responsive design** con clases de Tailwind
- **Consistencia visual** con el sistema de diseño de KantoBar

## 🏗️ Arquitectura por Features

La estructura está organizada por features para mejor mantenibilidad:

### **🎨 Colors**

- `KaraokeColors` - Paleta completa de colores
- `KaraokeTailwindClasses` - Clases de Tailwind personalizadas
- `KaraokeCSSVars` - Variables CSS personalizadas

### **📝 Types**

- `user.types.ts` - Tipos de usuario y autenticación
- `visits.types.ts` - Tipos de visitas y canciones
- `location.types.ts` - Tipos de ubicaciones/mesas
- `navigation.types.ts` - Tipos de navegación web
- `card.types.ts` - Tipos de tarjetas de beneficios

### **⚙️ Constants**

- `global.constants.ts` - Constantes de la aplicación
- Configuración de API, Firebase, UI
- Claves de storage, validaciones, mensajes

### **🔧 Services** (Próximo)

- Servicios de API para usuarios, visitas, ubicaciones
- Integración con Firebase
- Manejo de estado global

### **🧩 Components** (Próximo)

- Componentes reutilizables de UI
- Componentes específicos de karaoke
- Sistema de diseño consistente

## 🚀 Estado Actual

- ✅ Estructura de archivos creada
- ✅ Rutas configuradas
- ✅ Páginas básicas con placeholder
- ⏳ Pendiente: Implementación de funcionalidades
- ⏳ Pendiente: Componentes reutilizables
- ⏳ Pendiente: Integración con servicios
- ⏳ Pendiente: Contextos y estado global

## 📝 Próximos Pasos

1. Migrar componentes reutilizables desde `movile-karaoke`
2. Implementar contextos de estado (UsersContext, etc.)
3. Migrar servicios (UserServices, VisitsServices, etc.)
4. Implementar funcionalidades específicas de cada página
5. Agregar navegación entre páginas
6. Optimizar para web (SEO, performance, etc.)
