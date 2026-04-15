# UCAPConnect Mobile

Aplicacion movil de UCAPConnect construida con Expo + React Native para iOS y Android.

## Vision general

UCAPConnect Mobile centraliza la experiencia del estudiante para:

- autenticacion y acceso seguro a la cuenta
- exploracion del catalogo de cursos
- consulta de detalle e inscripcion de capacitaciones
- visualizacion de perfil y datos academicos (segun endpoints disponibles)

La app usa una arquitectura cliente liviana conectada a un backend Spring Boot.

## Stack tecnico

- Expo SDK 54
- React Native 0.81 + React 19
- TypeScript
- React Navigation (stack + bottom tabs)
- Expo Secure Store para sesion local
- Expo Local Authentication para Face ID / huella

## Arquitectura funcional (alto nivel)

### Navegacion

- `AuthStack`: flujo de autenticacion (`Login`, `Register`)
- `MainTab`: flujo principal autenticado/invitado
  - `HomeTab` (stack interno con dashboard, catalogo, detalle e inscripcion)
  - `MyCoursesTab` (placeholder)
  - `ScheduleTab` (placeholder)
  - `GradesTab` (placeholder)
  - `ProfileTab`

### Estado de autenticacion

`AuthContext` orquesta:

- sesion autenticada
- modo invitado
- desbloqueo biometrico pendiente
- preferencia de inicio con biometria

Comportamiento resumido:

1. Login con credenciales guarda token en almacenamiento seguro.
2. Si biometria esta activada y existe sesion guardada, la app solicita desbloqueo al abrir.
3. Si usuario cancela desbloqueo y elige volver a password, se limpia sesion y preferencia biometrica.
4. Cerrar sesion limpia token; la preferencia de biometria puede mantenerse para proximo login.

## Integraciones y configuracion

### API

- Base URL en `src/config.ts`
- Variable opcional: `EXPO_PUBLIC_API_URL`
- Valor por defecto actual: `https://ucapconnect.ing.software`

### Configuracion Expo

- `app.json` define:
  - identificadores de paquete iOS/Android
  - splash/iconos
  - plugins (`expo-secure-store`, `expo-font`, `@react-native-community/datetimepicker`)
  - `extra.eas.projectId` para EAS

## Estructura base del proyecto

```txt
src/
  api/            # cliente HTTP y servicios (auth, courses, student)
  components/     # componentes reutilizables (UI, graficas, campos)
  context/        # estado global (AuthContext)
  data/           # mocks y catálogos locales
  navigation/     # stacks, tabs y tipos de rutas
  screens/        # pantallas principales
  storage/        # persistencia segura/local (sesion, invitado, biometria)
  theme.ts        # tokens de color, tipografia, espaciado
  types/          # contratos tipados de API
  utils/          # utilitarios de formato/validacion/fechas
```

## Flujos disponibles hoy

- Login/registro de usuario
- Modo invitado
- Catalogo de cursos y detalle
- Pantalla de perfil con secciones funcionales y placeholders
- Activacion y uso de inicio con biometria (Face ID / huella) bajo condiciones del dispositivo

## Modulos placeholder (en progreso)

- Mis cursos
- Horario
- Calificaciones

Estos modulos dependen de endpoints backend o de reglas de negocio que aun no estan cerradas.

## Requisitos de entorno

- Node.js LTS
- npm
- Expo CLI (via `npx expo`)
- Dispositivo fisico o emulador/simulador para pruebas

## Instalacion y ejecucion

```bash
npm install
npx expo start
```

Atajos utiles:

- `npm run android`
- `npm run ios`
- `npm run prebuild`

## Biometria: notas operativas

- Requiere hardware compatible y biometria registrada en el sistema operativo.
- En iOS simulator debes habilitar Face ID enrollado manualmente.
- Si no hay hardware/enrollment, la app hace fallback natural al login por password.

## Convenciones de diseno

- Tokens centralizados en `src/theme.ts`
- Espaciados, radios y tipografia reutilizables entre pantallas
- Colores alineados al sistema visual de UCAP/Figma, con capacidad de evolucion

## Roadmap recomendado

1. Completar integraciones reales para `Mis cursos`, `Horario` y `Calificaciones`.
2. Sustituir placeholders por datos backend.
3. Afinar estados vacios/error/carga por pantalla.
4. Completar pipeline EAS para publicacion en tiendas.
5. Endurecer observabilidad y telemetria de errores de red/autenticacion.

## Estado del proyecto

Proyecto funcional en fase de iteracion activa, con base de navegacion, autenticacion, seguridad local y tema visual ya establecidos.
