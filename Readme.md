# CampusSync — Gestión Académica Integral

> Plataforma móvil para estudiantes universitarios. Seguimiento de semestres, materias, calificaciones y evaluaciones en tiempo real, con agenda académica, temporizador Pomodoro y notas rápidas — todo bajo una estética Dark Academic Premium.


## Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Stack Tecnológico](#stack-tecnológico)
- [Arquitectura](#arquitectura)
- [Funcionalidades](#funcionalidades)
- [Requisitos Funcionales](#requisitos-funcionales)
- [Requisitos No Funcionales](#requisitos-no-funcionales)
- [Reglas de Negocio](#reglas-de-negocio)
- [Diseño de la Interfaz](#diseño-de-la-interfaz)
- [Instalación y Configuración](#instalación-y-configuración)
- [Variables de Entorno](#variables-de-entorno)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [API Reference](#api-reference)
- [Base de Datos](#base-de-datos)
- [Seguridad](#seguridad)

---

## Descripción General

**CampusSync** es una aplicación móvil cliente-servidor construida con **Ionic React** que centraliza toda la vida académica de un estudiante universitario. Permite registrar semestres, materias y evaluaciones; visualizar el promedio acumulado en tiempo real; y planificar entregas desde un calendario dinámico mensual.

### ¿Qué problema resuelve?

- Sin la app: notas dispersas en cuadernos, promedios calculados a mano, fechas de entrega olvidadas, sin visibilidad del rendimiento global.
- Con la app: historial académico centralizado, cálculo automático de promedios ponderados por porcentaje, calendario de entregas con vista mensual, y herramientas de productividad integradas (Pomodoro + notas locales).

---

## Stack Tecnológico

### Frontend
| Tecnología | Uso |
|------------|-----|
| **Ionic React** | Framework móvil multiplataforma (iOS / Android / PWA) |
| **TypeScript** | Tipado estático en toda la capa de presentación |
| **Tailwind CSS** | Utilidades de layout y composición base |
| **CSS-in-JS** | Sistema de diseño Dark Academic Premium |
| **React Router** | Navegación y rutas protegidas |
| **Recharts** | Gráfico de área para rendimiento histórico |
| **Zustand** | Estado global de autenticación |
| **react-hot-toast** | Sistema de notificaciones glassmorphism |

### Backend
| Tecnología | Uso |
|------------|-----|
| **Node.js + Express** | Servidor REST API |
| **PostgreSQL** | Base de datos relacional principal |
| **JWT** | Autenticación stateless de sesiones |
| **bcrypt** | Hashing seguro de contraseñas |
| **Nodemailer / SendGrid** | Envío de emails de recuperación de contraseña |
| **crypto** | Generación de tokens de reset seguros |

---

## Arquitectura

```
┌──────────────────────────────────────────────────────┐
│                   CLIENTE MÓVIL                      │
│           Ionic React (iOS / Android / PWA)          │
│                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐  │
│  │  Auth    │ │Semestres │ │Materias  │ │Evalua. │  │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────────┐  │
│  │Calendario│ │Pomodoro  │ │  Dashboard + Gráfico  │  │
│  └──────────┘ └──────────┘ └──────────────────────┘  │
└────────────────────────┬─────────────────────────────┘
                         │ HTTPS / REST (JWT)
┌────────────────────────▼─────────────────────────────┐
│                      BACKEND                         │
│                 Node.js + Express                    │
│                                                      │
│  ┌───────────┐ ┌───────────┐ ┌──────────────────┐   │
│  │   Auth    │ │  Terms /  │ │   Evaluations    │   │
│  │  Routes   │ │ Subjects  │ │     Routes       │   │
│  └───────────┘ └───────────┘ └──────────────────┘   │
│  ┌───────────────────────────────────────────────┐   │
│  │     Dashboard / Calendar Aggregation          │   │
│  │  (promedio global, chart_data, eventos)       │   │
│  └───────────────────────────────────────────────┘   │
└────────────────────────┬─────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────┐
│                    PostgreSQL                         │
│  users │ terms │ subjects │ evaluations │             │
│  password_reset_tokens                               │
└──────────────────────────────────────────────────────┘
```

---

## Funcionalidades

### Gestión Académica
- **Semestres** — Crea y administra periodos académicos con estado activo/finalizado
- **Materias por semestre** — Registra materias con nota meta individual; visualiza el promedio actual con barra de progreso hacia la meta
- **Evaluaciones ponderadas** — Registra actividades con porcentaje de peso y nota obtenida; el sistema calcula el promedio acumulado automáticamente
- **Dashboard con métricas** — Promedio global, conteo de materias activas, anillo de progreso y gráfico de rendimiento histórico por semestre

### Agenda y Calendario
- **Calendario mensual dinámico** — Vista mensual con pills de evento dentro de cada celda del día, construido sin librerías externas
- **Tipología visual de entregas** — Cada tipo de actividad (evaluación, taller, trabajo, quiz, foro) tiene emoji + color semántico propio
- **Detalle por día** — Al seleccionar un día se despliega el panel de entregas con materia, tipo y porcentaje de peso

### Productividad
- **Temporizador Pomodoro** — Ciclos 25m estudio / 5m pausa con anillo SVG animado, vibración y audio de alerta
- **Wake Lock** — Mantiene la pantalla encendida automáticamente durante la sesión activa
- **Notas rápidas locales** — Bloc de notas persistente en localStorage por usuario, con indicador "Guardado" y contador de palabras
- **Consejos de estudio** — Tip aleatorio que rota con cada sesión Pomodoro completada

### Autenticación
- **Registro e inicio de sesión** con correo institucional y contraseña
- **Recuperación de contraseña** via email con token seguro de un solo uso y expiración de 1 hora
- **Validación de contraseñas** en tiempo real con indicador de fortaleza (débil / regular / fuerte)

---

## Requisitos Funcionales

### RF-01 — Autenticación y Gestión de Sesión
El sistema permite el registro e inicio de sesión con correo y contraseña. La sesión se mantiene mediante JWT almacenado en el estado global de Zustand. El logout limpia el estado de forma inmediata.

### RF-02 — Recuperación de Contraseña por Email
Al solicitar recuperación:
1. El backend genera un token criptográfico único con expiración de **1 hora**
2. Se envía al correo un enlace con el token en la URL: `/reset-password/:token`
3. El frontend valida en tiempo real que las contraseñas coincidan antes de habilitar el botón de envío
4. Tras la confirmación exitosa, el token se invalida y el usuario es redirigido al login en 2.8 segundos

### RF-03 — Gestión Jerárquica de Datos Académicos
La estructura de datos sigue una jerarquía estricta:

```
Usuario
  └── Semestres (Terms)
        └── Materias (Subjects)  ─── nota_meta, promedio_actual
              └── Evaluaciones    ─── titulo, peso_%, nota
```

Cada nivel solo puede accederse si el nivel superior pertenece al usuario autenticado.

### RF-04 — Cálculo Automático de Promedios
Al crear, editar o eliminar una evaluación, el backend recalcula y retorna:
- `current_accumulated_score`: suma de `(nota × peso / 100)` para evaluaciones con nota asignada
- `total_weight_assigned`: suma de porcentajes de todas las evaluaciones de la materia

### RF-05 — Dashboard con Agregación Global
El endpoint `/api/dashboard/summary` retorna en una sola llamada:
- `global_average`: promedio ponderado de todas las materias activas del usuario
- `active_subjects`: conteo de materias con semestre activo
- `chart_data`: array `[{ name: "Semestre X", promedio: Y }]` para el gráfico histórico

### RF-06 — Calendario de Entregas
El endpoint `/api/calendar/events` retorna todas las evaluaciones del usuario con `due_date`, `type`, `subject_name` y `weight_percentage` para renderizarlas en la grilla mensual.

### RF-07 — Temporizador Pomodoro con Hardware
El temporizador de 25/5 minutos integra:
- **Wake Lock API**: solicita bloqueo de pantalla al iniciar y lo libera al pausar o salir
- **Vibration API**: patrón `[500, 200, 500, 200, 1000]` al completar el ciclo
- **HTMLAudioElement**: reproduce `/assets/sounds/alarm.mp3` al finalizar
- Reactivación automática del Wake Lock si el usuario minimiza y vuelve a la app

### RF-08 — Notas Rápidas Persistentes
Las notas se guardan en `localStorage` bajo la clave `campussync_notes_${user.id}`, con persistencia entre sesiones sin necesidad de conexión.

---

## Requisitos No Funcionales

### RNF-01 — Cálculo de Promedios en el Servidor (Crítico)
Ningún promedio se calcula en el frontend. Toda aritmética ocurre en el backend con los datos de la base de datos.

### RNF-02 — Invalidación de Tokens de Reset
Un token de recuperación se invalida **inmediatamente** tras ser usado con éxito, independientemente del tiempo de expiración restante.

### RNF-03 — Autorización por Pertenencia de Recurso
Cada endpoint verifica que el recurso pertenezca al `user_id` del JWT. No es posible acceder a datos de otro usuario conociendo su UUID.

### RNF-04 — Usabilidad Móvil con Componentes Nativos
- Pull-to-refresh con `IonRefresher` en el Dashboard
- Skeletons animados (shimmer) durante la carga, en lugar de spinners centrados
- Bottom sheets con handle para modales, en lugar de modales centrados en pantalla pequeña

### RNF-05 — Persistencia Offline de Notas
Las notas rápidas funcionan sin conexión a internet. El contenido previo se carga sincrónicamente desde `localStorage` antes del primer render.

### RNF-06 — Responsividad del Calendario
La grilla mensual se construye dinámicamente en JavaScript puro (sin librerías externas), calculando correctamente años bisiestos, meses de 28/29/30/31 días y el desplazamiento del primer día.

---

## Reglas de Negocio

| # | Regla |
|---|-------|
| **RN-01** | La suma de porcentajes de evaluaciones de una materia no debe superar 100%; el frontend muestra el peso disponible restante al crear una nueva evaluación |
| **RN-02** | Un semestre marcado como `is_active = false` no aporta materias al conteo del Dashboard |
| **RN-03** | Eliminar un semestre borra en cascada todas sus materias y evaluaciones (`ON DELETE CASCADE`) |
| **RN-04** | Eliminar una materia borra en cascada todas sus evaluaciones y recalcula las métricas |
| **RN-05** | Una evaluación puede registrarse sin nota (`score = null`) para planificación anticipada; el peso se contabiliza pero la nota no entra en el promedio hasta ser asignada |
| **RN-06** | El promedio global del Dashboard solo considera materias del semestre activo más reciente |
| **RN-07** | El token de recuperación de contraseña expira en 60 minutos y es de un solo uso |
| **RN-08** | La contraseña mínima es de 6 caracteres — validado en cliente y servidor independientemente |

---

## Diseño de la Interfaz

La app implementa un sistema de diseño llamado **Dark Academic Premium**, consistente en todas las vistas.

### Sistema de Color

| Token | Valor | Uso |
|-------|-------|-----|
| `background` | `#020817 → #0f172a → #080d1a` | Fondo principal (gradiente 160°) |
| `accent-indigo` | `#6366f1 → #8b5cf6` | Acciones primarias, botones, anillos |
| `accent-cyan` | `#06b6d4` | Gradiente de logo, acentos secundarios |
| `surface-glass` | `rgba(15,23,42,0.72)` | Cards glassmorphism |
| `surface-inner` | `rgba(30,41,59,0.55)` | Inputs, chips, elementos secundarios |
| `border-indigo` | `rgba(99,102,241,0.18)` | Bordes de cards |
| `text-primary` | `#f8fafc` | Títulos y valores numéricos |
| `text-secondary` | `rgba(148,163,184,0.65)` | Labels, descripciones |
| `success` | `#34d399` | Promedio alto (>= 4.0), estado activo |
| `warning` | `#fb923c` | Promedio medio (< 3.0) |
| `danger` | `#f87171` | Acciones destructivas, promedio bajo |

### Tipografía

| Familia | Peso | Uso |
|---------|------|-----|
| **Sora** | 800 | Títulos, números de promedio, temporizador |
| **Sora** | 700 | Subtítulos, botones primarios |
| **DM Sans** | 700 | Labels en mayúsculas (`tracking-widest`) |
| **DM Sans** | 500-600 | Textos de soporte, placeholders |

### Glassmorphism Card (base)

```
background: rgba(15,23,42,0.72)
backdrop-filter: blur(28px)
border: 1px solid rgba(99,102,241,0.18)
box-shadow: 0 20px 48px rgba(0,0,0,0.45),
            inset 0 1px 0 rgba(255,255,255,0.06)
border-radius: 24-28px
```

### Paleta de tipos de evaluación (Calendario)

| Tipo | Emoji | Color |
|------|-------|-------|
| Evaluación / Examen | emoji-pencil | Rojo `#f87171` |
| Taller / Workshop | emoji-wrench | Naranja `#fb923c` |
| Trabajo / Proyecto | emoji-folder | Cyan `#22d3ee` |
| Cuestionario / Quiz | emoji-question | Rosa `#f472b6` |
| Foro | emoji-speech | Verde `#34d399` |
| Otro | emoji-calendar | Indigo `#818cf8` |

### Mejoras de Diseño Aplicadas

- `IonHeader` / `IonToolbar` eliminados en todas las pantallas — reemplazados por headers custom coherentes con el sistema de diseño
- `window.confirm` reemplazado por modales de confirmación glassmorphism con ícono, descripción del riesgo y botones semánticos
- Skeletons shimmer animados en lugar de spinners genéricos durante la carga
- Colores semánticos dinámicos (verde/indigo/naranja) según el valor del promedio
- Cards de materia con iniciales coloreadas de una paleta de 6 colores rotativos y barra de progreso hacia la nota meta
- Anillo SVG en tiempo real para el temporizador Pomodoro con glow al estar activo
- Contador de sesiones Pomodoro con 4 puntos iluminables con glow indigo
- Indicador "Guardado" con fade-out automático en el bloc de notas
- Calendario dinámico construido sin librerías externas, con pills de evento por celda

---

## Instalación y Configuración

### Requisitos Previos

- Node.js `>= 18`
- PostgreSQL `>= 14`
- Ionic CLI: `npm install -g @ionic/cli`

### Backend

```bash
git clone https://github.com/tu-usuario/campussync.git
cd campussync/backend
npm install
cp .env.example .env
# Editar .env con tus credenciales
psql -U postgres -d campussync -f schema.sql
npm run dev
```

### Frontend

```bash
cd campussync/frontend
npm install
ionic serve

# Android
ionic cap run android

# iOS
ionic cap run ios
```

### Configuración requerida en el frontend

Agregar en `public/index.html` dentro de `<head>`:

```html
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet" />
```

Agregar en `src/theme/variables.css`:

```css
ion-content { --background: transparent !important; }
ion-page    { background: transparent !important; }
```

---

## Variables de Entorno

Crear un archivo `.env` en `/backend`:

```env
# Servidor
PORT=5000
NODE_ENV=development

# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=campussync
DB_USER=postgres
DB_PASSWORD=tu_password

# JWT
JWT_SECRET=tu_secreto_jwt_muy_largo_y_seguro

# Email (recuperación de contraseña)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_correo@gmail.com
SMTP_PASS=tu_app_password_de_gmail

# URL del frontend (para links de reset)
FRONTEND_URL=http://localhost:8100
```

---

## Estructura del Proyecto

```
campussync/
├── backend/
│   ├── config/
│   │   └── db.js                        # Pool de conexión PostgreSQL
│   ├── controllers/
│   │   ├── authController.js            # Login, registro, reset password
│   │   ├── termController.js            # CRUD de semestres
│   │   ├── subjectController.js         # CRUD de materias + promedio
│   │   ├── evaluationController.js      # CRUD de evaluaciones + métricas
│   │   ├── dashboardController.js       # Agregación global de métricas
│   │   └── calendarController.js        # Eventos para la agenda
│   ├── middlewares/
│   │   └── authMiddleware.js            # Verificación JWT + inyección user_id
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── termRoutes.js
│   │   ├── subjectRoutes.js
│   │   ├── evaluationRoutes.js
│   │   ├── dashboardRoutes.js
│   │   └── calendarRoutes.js
│   ├── services/
│   │   └── emailService.js              # Envío de emails de recuperación
│   ├── schema.sql
│   └── index.js
│
└── frontend/
    └── src/
        ├── pages/
        │   ├── Login.tsx
        │   ├── Register.tsx
        │   ├── ResetPassword.tsx
        │   ├── Dashboard.tsx
        │   ├── Terms.tsx
        │   ├── Subjects.tsx
        │   ├── Evaluations.tsx
        │   ├── Calendar.tsx
        │   └── StudyMethods.tsx
        ├── services/
        │   ├── authService.ts
        │   ├── dashboardService.ts
        │   ├── termService.ts
        │   ├── subjectService.ts
        │   ├── evaluationService.ts
        │   └── calendarService.ts
        ├── store/
        │   └── authStore.ts             # Zustand: user, token, setAuth, logout
        ├── theme/
        │   └── variables.css
        └── App.tsx                      # Router + CustomToaster global
```

---

## API Reference

Todas las rutas protegidas requieren:
```
Authorization: Bearer <token>
```

### Auth

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `POST` | `/api/auth/register` | Registrar nuevo usuario | No |
| `POST` | `/api/auth/login` | Iniciar sesión | No |
| `POST` | `/api/auth/reset-password` | Solicitar email de recuperación | No |
| `POST` | `/api/auth/confirm-reset/:token` | Confirmar nueva contraseña | No |

### Dashboard

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `GET` | `/api/dashboard/summary` | Promedio global, materias activas, chart_data | Sí |

### Semestres

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `GET` | `/api/terms` | Listar semestres del usuario | Sí |
| `POST` | `/api/terms` | Crear semestre `{ name }` | Sí |
| `DELETE` | `/api/terms/:id` | Eliminar semestre en cascada | Sí |

### Materias

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `GET` | `/api/subjects?term_id=` | Materias de un semestre | Sí |
| `POST` | `/api/subjects` | Crear materia | Sí |
| `PUT` | `/api/subjects/:id` | Actualizar nombre o nota meta | Sí |
| `DELETE` | `/api/subjects/:id` | Eliminar materia en cascada | Sí |

### Evaluaciones

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `GET` | `/api/evaluations?subject_id=` | Evaluaciones de una materia | Sí |
| `POST` | `/api/evaluations` | Crear evaluación → devuelve `{ evaluation, subject_metrics }` | Sí |
| `PUT` | `/api/evaluations/:id` | Actualizar → devuelve `{ evaluation, subject_metrics }` | Sí |
| `DELETE` | `/api/evaluations/:id` | Eliminar → devuelve `{ subject_metrics }` | Sí |

Estructura `subject_metrics`:
```json
{
  "total_weight_assigned": 60,
  "current_accumulated_score": "3.8"
}
```

### Calendario

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `GET` | `/api/calendar/events` | Evaluaciones con due_date, type, subject_name, weight_percentage | Sí |

---

## Base de Datos

### Esquema Principal

```sql
-- Usuarios
CREATE TABLE users (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email        VARCHAR(150) UNIQUE NOT NULL,
  password     VARCHAR(255) NOT NULL,
  created_at   TIMESTAMP DEFAULT NOW()
);

-- Semestres
CREATE TABLE terms (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  name         VARCHAR(100) NOT NULL,
  is_active    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMP DEFAULT NOW()
);

-- Materias
CREATE TABLE subjects (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term_id         UUID REFERENCES terms(id) ON DELETE CASCADE,
  name            VARCHAR(150) NOT NULL,
  target_score    NUMERIC(3,1) NOT NULL DEFAULT 3.0,
  current_average NUMERIC(4,2),
  created_at      TIMESTAMP DEFAULT NOW()
);

-- Evaluaciones
CREATE TABLE evaluations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id          UUID REFERENCES subjects(id) ON DELETE CASCADE,
  title               VARCHAR(200) NOT NULL,
  weight_percentage   NUMERIC(5,2) NOT NULL,
  score               NUMERIC(3,1),           -- NULL = sin calificar
  due_date            TIMESTAMP,
  type                VARCHAR(50),            -- evaluation | taller | trabajo | quiz | foro
  created_at          TIMESTAMP DEFAULT NOW()
);

-- Tokens de recuperación de contraseña
CREATE TABLE password_reset_tokens (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  token        VARCHAR(255) UNIQUE NOT NULL,
  expires_at   TIMESTAMP NOT NULL,            -- NOW() + INTERVAL '1 hour'
  used         BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMP DEFAULT NOW()
);
```

### Cálculo del Promedio Acumulado

```sql
-- Se ejecuta en el backend tras cada INSERT / UPDATE / DELETE en evaluations
UPDATE subjects
SET current_average = (
  SELECT COALESCE(SUM(score * weight_percentage / 100.0), 0)
  FROM evaluations
  WHERE subject_id = $1
    AND score IS NOT NULL
)
WHERE id = $1;
```

### Flujo de datos: evaluación sin nota

```
Evaluación creada  →  score = NULL
                       weight_percentage = 20
                       ↓
  current_average  NO cambia  (solo cuenta notas asignadas)
  total_weight     SÍ aumenta (el peso siempre se contabiliza)
```

### Índices recomendados

```sql
CREATE INDEX idx_terms_user_id        ON terms(user_id);
CREATE INDEX idx_subjects_term_id     ON subjects(term_id);
CREATE INDEX idx_evaluations_subject  ON evaluations(subject_id);
CREATE INDEX idx_evaluations_due_date ON evaluations(due_date);
CREATE INDEX idx_reset_tokens_token   ON password_reset_tokens(token);
```

---

## Seguridad

- Todas las peticiones viajan bajo **HTTPS / TLS 1.2+**
- Contraseñas hasheadas con **bcrypt** (salt rounds: 10)
- Sesiones manejadas con **JWT** en memoria (Zustand), no en `localStorage`
- Tokens de reset generados con `crypto.randomBytes(32)` — 256 bits de entropía
- Cada recurso valida que `user_id` del JWT coincida con el propietario del registro
- El campo `password` nunca se retorna en ninguna respuesta de la API

---

## Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.

---

*Desarrollado por Yerson Rodriguez*

**Hecho para estudiantes que toman en serio su rendimiento académico.**