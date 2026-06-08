# 🥖 Bakery Inventory API

Backend MVP para el sistema de inventario de una panadería argentina.
Construido con Node.js, Express, Supabase y Jest, siguiendo arquitectura MVC estricta y patrones de diseño profesionales.

---

## Tabla de Contenidos

- [Arquitectura](#arquitectura)
- [Estructura de carpetas](#estructura-de-carpetas)
- [Modelo de datos](#modelo-de-datos)
- [Endpoints](#endpoints)
- [Instalación y configuración](#instalación-y-configuración)
- [Ejecución](#ejecución)
- [Tests](#tests)
- [Git Flow](#git-flow)
- [Decisiones técnicas](#decisiones-técnicas)

---

## Arquitectura

### Patrón MVC estricto

```
Request → Route → Controller → Service → Model → Supabase
                      ↕
                 Strategy (lógica de negocio del stock)
```

- **Routes**: mapean HTTP → Controller. Sin lógica.
- **Controllers**: reciben req/res, delegan al Service, manejan respuestas HTTP.
- **Services**: orquestan la lógica de negocio, usan Models y Strategies.
- **Models**: acceso a datos (Supabase). Sin lógica de negocio.
- **Strategies**: encapsulan las reglas de cada tipo de movimiento de stock.
- **Middlewares**: manejo centralizado de errores.

### Patrones de diseño

| Patrón | Dónde | Por qué |
|--------|-------|---------|
| **Singleton** | `src/config/database.js` | Una sola instancia del cliente Supabase durante toda la vida de la app. Evita múltiples conexiones y facilita el testing. |
| **Strategy** | `src/strategies/movimientoStrategies.js` | Encapsula la lógica de ingreso, egreso y ajuste de stock en clases intercambiables. Permite agregar nuevos tipos de movimiento sin modificar el servicio. |
| **MVC** | Toda la app | Separación clara de responsabilidades. |

---

## Estructura de carpetas

```
bakery-inventory/
├── src/
│   ├── config/
│   │   ├── database.js          # Singleton Supabase
│   │   └── schema.sql           # DDL para Supabase
│   ├── controllers/
│   │   ├── MateriaPrimaController.js
│   │   └── MovimientoStockController.js
│   ├── middlewares/
│   │   └── errorHandler.js      # Manejo centralizado de errores
│   ├── models/
│   │   ├── MateriaPrimaModel.js
│   │   └── MovimientoStockModel.js
│   ├── routes/
│   │   ├── materiaPrimaRoutes.js
│   │   └── movimientoStockRoutes.js
│   ├── services/
│   │   ├── MateriaPrimaService.js
│   │   └── MovimientoStockService.js
│   ├── strategies/
│   │   └── movimientoStrategies.js  # Strategy Pattern
│   ├── app.js                   # Configuración Express
│   └── server.js                # Entry point
├── tests/
│   └── unit/
│       ├── database.test.js
│       ├── errorHandler.test.js
│       ├── MateriaPrimaController.test.js
│       ├── MateriaPrimaService.test.js
│       ├── MovimientoStockController.test.js
│       ├── MovimientoStockService.test.js
│       └── movimientoStrategies.test.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## Modelo de datos

### `materias_primas`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID (PK) | Identificador único |
| `nombre` | TEXT | Nombre de la materia prima |
| `unidad` | TEXT | Unidad de medida (kg, gr, litros, unidades…) |
| `stock_actual` | NUMERIC(10,2) | Stock disponible actual |
| `stock_minimo` | NUMERIC(10,2) | Umbral de alerta de stock bajo |
| `created_at` | TIMESTAMPTZ | Fecha de creación |
| `updated_at` | TIMESTAMPTZ | Última actualización |

### `movimientos_stock`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID (PK) | Identificador único |
| `materia_prima_id` | UUID (FK) | Referencia a `materias_primas` |
| `tipo` | TEXT | `ingreso` \| `egreso` \| `ajuste` |
| `cantidad` | NUMERIC(10,2) | Cantidad movida (siempre > 0) |
| `stock_anterior` | NUMERIC(10,2) | Stock previo al movimiento |
| `stock_posterior` | NUMERIC(10,2) | Stock resultante |
| `motivo` | TEXT | Descripción (obligatorio en ajuste) |
| `usuario` | TEXT | Quién realizó el movimiento |
| `created_at` | TIMESTAMPTZ | Fecha del movimiento |

### Constraints de base de datos

- `stock_actual >= 0` — No puede ser negativo.
- `stock_minimo >= 0` — No puede ser negativo.
- `cantidad > 0` — Todo movimiento requiere cantidad positiva.
- `tipo IN ('ingreso', 'egreso', 'ajuste')` — Valores controlados.

---

## Endpoints

Base URL: `http://localhost:3000`

### Health

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Estado del servidor |

### Materias Primas

| Método | Ruta | Descripción | Body |
|--------|------|-------------|------|
| GET | `/api/materias-primas` | Listar todas | — |
| GET | `/api/materias-primas/alertas` | Materias con stock < mínimo | — |
| GET | `/api/materias-primas/:id` | Obtener por ID | — |
| POST | `/api/materias-primas` | Crear | `{ nombre, unidad, stock_actual?, stock_minimo? }` |
| PUT | `/api/materias-primas/:id` | Actualizar | `{ nombre?, unidad?, stock_minimo? }` |
| DELETE | `/api/materias-primas/:id` | Eliminar | — |

### Movimientos de Stock

| Método | Ruta | Descripción | Body / Query |
|--------|------|-------------|--------------|
| GET | `/api/movimientos` | Listar movimientos | Query: `materia_prima_id`, `tipo`, `limit`, `offset` |
| GET | `/api/movimientos/:id` | Obtener por ID | — |
| POST | `/api/movimientos` | Registrar movimiento | `{ materia_prima_id, tipo, cantidad, motivo?, usuario? }` |

### Ejemplos de requests

**Crear materia prima:**
```json
POST /api/materias-primas
{
  "nombre": "Harina 000",
  "unidad": "kg",
  "stock_actual": 150,
  "stock_minimo": 50
}
```

**Registrar ingreso:**
```json
POST /api/movimientos
{
  "materia_prima_id": "uuid-aqui",
  "tipo": "ingreso",
  "cantidad": 50,
  "usuario": "Juan"
}
```

**Registrar egreso:**
```json
POST /api/movimientos
{
  "materia_prima_id": "uuid-aqui",
  "tipo": "egreso",
  "cantidad": 30,
  "usuario": "María"
}
```

**Registrar ajuste (motivo obligatorio):**
```json
POST /api/movimientos
{
  "materia_prima_id": "uuid-aqui",
  "tipo": "ajuste",
  "cantidad": 80,
  "motivo": "Corrección por recuento físico",
  "usuario": "Admin"
}
```

### Respuesta con alerta

Cuando el stock queda por debajo del mínimo, la respuesta incluye el campo `alerta`:

```json
{
  "success": true,
  "movimiento": { ... },
  "alerta": {
    "tipo": "stock_minimo",
    "mensaje": "Stock de \"Harina 000\" (10 kg) es menor al mínimo (50 kg)."
  }
}
```

### Códigos HTTP

| Código | Situación |
|--------|-----------|
| 200 | Operación exitosa |
| 201 | Recurso creado |
| 204 | Eliminación exitosa |
| 400 | Error de validación |
| 404 | Recurso no encontrado |
| 500 | Error interno del servidor |

---

## Instalación y configuración

### Prerrequisitos

- Node.js >= 18
- Cuenta en [Supabase](https://supabase.com)

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/bakery-inventory.git
cd bakery-inventory
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Variables de entorno

```bash
cp .env.example .env
```

Editar `.env`:

```env
PORT=3000
NODE_ENV=development
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu-anon-key
```

### 4. Crear la base de datos

En el **SQL Editor** de Supabase, ejecutar el contenido de `src/config/schema.sql`.

---

## Ejecución

```bash
# Producción
npm start

# Desarrollo (con recarga automática)
npm run dev
```

---

## Tests

```bash
# Ejecutar todos los tests con cobertura
npm test

# Modo watch (desarrollo)
npm run test:watch
```

### Resultados esperados

```
Test Suites: 7 passed, 7 total
Tests:       73 passed, 73 total
Coverage:    ~97%
```

### Estrategia de testing

Los tests unitarios **mockean** todas las dependencias externas (Supabase, red) para:
- Ser rápidos (< 2s para toda la suite)
- No requerir conexión a DB
- Tener cobertura determinista

Los archivos excluidos de cobertura (`models/`, `routes/`, `app.js`) dependen de infraestructura y se prueban en tests de integración (fuera del scope del MVP).

---

## Git Flow

```
main          ← producción estable
  └─ develop  ← integración
       ├─ feature/materias-primas
       ├─ feature/movimientos-stock
       ├─ feature/strategy-pattern
       └─ fix/stock-negativo
```

### Convención de commits

```
feat: agregar endpoint de alertas de stock
fix: corregir validación de stock negativo en egreso
test: agregar tests unitarios para AjusteStrategy
refactor: extraer lógica de movimientos a Strategy pattern
docs: completar README con ejemplos de API
chore: configurar cobertura de Jest
```

### Flujo de trabajo

```bash
git checkout develop
git checkout -b feature/nombre-feature
# ... desarrollar ...
git add .
git commit -m "feat: descripción"
git push origin feature/nombre-feature
# Abrir Pull Request a develop
# Code review → merge
# Al cerrar sprint: merge develop → main + tag
git tag v1.0.0
```

---

## Decisiones técnicas

### ¿Por qué Singleton para Supabase?

El cliente de Supabase mantiene internamente un pool de conexiones. Instanciarlo múltiples veces en Node.js genera overhead innecesario y puede agotar los límites del plan. El Singleton garantiza exactamente una instancia durante toda la vida del proceso.

### ¿Por qué Strategy para movimientos?

Cada tipo de movimiento (ingreso, egreso, ajuste) tiene reglas de negocio distintas:
- **Ingreso**: suma, cantidad > 0.
- **Egreso**: resta, no permite stock negativo.
- **Ajuste**: reemplaza stock, requiere motivo.

Con Strategy, agregar un nuevo tipo (ej. `merma`, `devolucion`) es añadir una clase sin tocar el servicio ni los tests existentes — principio Open/Closed.

### ¿Por qué no usar ORM?

Supabase provee un cliente tipo Active Record que ya abstrae SQL. Agregar un ORM adicional sería una capa innecesaria para este MVP.

### Escalabilidad

- La inyección de dependencias en Services y Controllers facilita el reemplazo de implementaciones (ej. cambiar Supabase por PostgreSQL directo).
- Los Strategies son stateless y pueden registrarse en un mapa — agregar tipos sin modificar código existente.
- Las rutas están desacopladas de los controllers mediante clases instanciables.
