# Segmentos de usuario y roles (documentación funcional)

Referencia alineada con la matriz de necesidades (estudiantes, docentes, empresas, público general) y con lo implementado hoy en **app** y **backend**.

## Backend (`UCAPConnect-main`)

| Rol en JWT / BD (`Rol` enum) | Uso actual |
|-----------------------------|------------|
| `ESTUDIANTE` | Registro, login, perfil académico (`/api/v1/student/profile`). |
| `DOCENTE` | Misma autenticación que estudiante; endpoints específicos docente **pendientes**. |
| `ADMIN` | Autorización amplia; pantallas pueden mostrar textos de gestión. |
| *Empresa* | **No existe** aún en el enum. Cuando se agregue `EMPRESA` en BD y JWT, la app ya tiene segmento `empresa` preparado en `segmentConfig.ts`. |

**Público general:** no es un rol de API. En la app corresponde a **modo invitado** (sin token).

Endpoints públicos: `GET /api/v1/courses/**`. El resto de `/api/**` requiere JWT con autoridad `ESTUDIANTE`, `DOCENTE` o `ADMIN`.

## App móvil (`ucapconnect-mobile`)

| Segmento producto | Cómo se resuelve | Comportamiento resumido |
|-------------------|------------------|-------------------------|
| Público general | `isGuest === true` | Dashboard orientado a catálogo, eventos y contacto; textos en placeholders acordes. |
| Estudiante | `rol === 'ESTUDIANTE'` | Accesos rápidos clásicos; estadísticas demo; pestañas "Mis cursos", "Horario", "Notas". |
| Docente | `rol === 'DOCENTE'` | Etiquetas de pestañas: Mis grupos, Calendario, Reportes; textos de placeholders docente. |
| Administración | `rol === 'ADMIN'` | Similar a docente con matices de gestión en copy. |
| Empresa | `rol === 'EMPRESA'` (futuro) | Catálogo / solicitudes / indicadores en textos y accesos rápidos. |

Lógica central: `src/roles/segmentConfig.ts` (`resolveSegment`, `getTabLabels`, `getDashboardQuickItems`, `getFeaturePlaceholder`, etc.).

## Próximos pasos sugeridos (fuera de este alcance)

- Endpoints y tablas para **inscripciones**, **horarios reales**, **notas**, **pagos**.
- Rol **EMPRESA** + API de solicitudes e indicadores.
- **Docente:** grupos, asistencia, materiales, reportes desde backend.
- **Público:** webinars y contacto con CMS o formulario backend.
