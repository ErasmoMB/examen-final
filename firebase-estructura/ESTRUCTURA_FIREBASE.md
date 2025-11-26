# Estructura de Datos en Firebase

## Proyecto: mbe1-7a7b0

Este documento describe la estructura completa de las colecciones en Firebase Firestore para el ecosistema de conservación de especies en peligro.

---

## Colección: `sensores`

Almacena las lecturas de todos los sensores IoT simulados en FlowFuse.

### Estructura del Documento:

```json
{
  "valor": 25,
  "tipo": "temperatura",
  "latido": 85,
  "movimiento": 1,
  "humedad": 65,
  "depredador": 0,
  "timestamp": "2025-11-21T20:00:00Z"
}
```

### Campos Requeridos:

| Campo | Tipo | Descripción | Rango/Valores |
|-------|------|-------------|---------------|
| `valor` | number | Temperatura corporal | 20-35°C |
| `tipo` | string | Tipo de sensor | "temperatura" |
| `latido` | number | Latido cardíaco | 60-120 bpm |
| `movimiento` | number | Acelerómetro | 0 (inactivo) o 1 (activo) |
| `humedad` | number | Humedad del hábitat | 40-80% |
| `depredador` | number | Detector PIR | 0 (no) o 1 (sí) |
| `timestamp` | timestamp | Fecha y hora | ISO format |

### Origen de los Datos:
- **Generado por:** FlowFuse/Node-RED
- **Frecuencia:** Cada 5 segundos
- **Método:** HTTP POST a API REST de Firestore

---

## Colección: `alertas`

Almacena las alertas generadas por el modelo ML cuando detecta riesgo.

### Estructura del Documento:

```json
{
  "riesgo": 1,
  "tipo": "prediccion_ml",
  "temperatura": 29,
  "latido": 98,
  "movimiento": 1,
  "mensaje": "Riesgo detectado",
  "timestamp": "2025-11-21T20:20:45Z"
}
```

### Campos Requeridos:

| Campo | Tipo | Descripción | Rango/Valores |
|-------|------|-------------|---------------|
| `riesgo` | number | Nivel de riesgo | 0 (normal) o 1 (riesgo) |
| `tipo` | string | Origen de la alerta | "prediccion_ml" |
| `temperatura` | number | Temperatura al momento de la alerta | 20-35°C |
| `latido` | number | Latido al momento de la alerta | 60-120 bpm |
| `movimiento` | number | Movimiento al momento de la alerta | 0 o 1 |
| `mensaje` | string | Mensaje descriptivo | "Riesgo detectado" o "Estado normal" |
| `timestamp` | timestamp | Fecha y hora de la alerta | ISO format |

### Origen de los Datos:
- **Generado por:** Google Colab (Modelo ML - RandomForestClassifier)
- **Condición:** Cuando `prediccion == 1` (riesgo detectado)
- **Método:** HTTP POST a API REST de Firestore
- **Consumido por:** A-Frame (actualiza visualización en tiempo real)

---

## Colección: `comportamientos`

Almacena eventos de comportamiento del animal basados en análisis de sensores.

### Estructura del Documento:

```json
{
  "animal": "lobo",
  "accion": "activo",
  "timestamp": "2025-11-21T20:15:30Z"
}
```

### Campos Requeridos:

| Campo | Tipo | Descripción | Valores Posibles |
|-------|------|-------------|------------------|
| `animal` | string | Especie monitoreada | "lobo" |
| `accion` | string | Comportamiento detectado | "activo", "descansando", "caminando" |
| `timestamp` | timestamp | Fecha y hora del comportamiento | ISO format |

### Lógica de Comportamiento:
- **activo:** `movimiento === 1 && latido > 90`
- **caminando:** `movimiento === 1 && latido < 90`
- **descansando:** `movimiento === 0`

### Origen de los Datos:
- **Generado por:** FlowFuse/Node-RED (análisis de sensores)
- **Frecuencia:** Cuando cambia el comportamiento
- **Consumido por:** A-Frame (opcional, para análisis histórico)

---

## Colección: `eventos`

Almacena eventos generales del sistema y cambios significativos.

### Estructura del Documento:

```json
{
  "tipo": "cambio_comportamiento",
  "descripcion": "Animal cambió de descansando a activo",
  "timestamp": "2025-11-21T20:15:30Z",
  "animal": "lobo"
}
```

### Campos Requeridos:

| Campo | Tipo | Descripción | Valores Posibles |
|-------|------|-------------|------------------|
| `tipo` | string | Tipo de evento | "cambio_comportamiento", "sistema", "error" |
| `descripcion` | string | Descripción del evento | Texto libre |
| `timestamp` | timestamp | Fecha y hora del evento | ISO format |
| `animal` | string | Especie relacionada | "lobo" (opcional) |

### Origen de los Datos:
- **Generado por:** FlowFuse/Node-RED o sistema
- **Frecuencia:** Cuando ocurre un evento significativo
- **Propósito:** Historial y auditoría del sistema

---

## Flujo Completo de Datos

```
FlowFuse (Node-RED)
    ↓
Genera datos simulados:
- temperatura: 20-35°C
- latido: 60-120 bpm
- movimiento: 0 o 1
- humedad: 40-80%
- depredador: 0 o 1 (10% prob)
    ↓
HTTP POST → Firebase Firestore
Colección: "sensores"
    ↓
Google Colab (ML)
    ↓
Consulta datos de Firebase
    ↓
RandomForestClassifier predice riesgo
    ↓
Si riesgo == 1:
    HTTP POST → Firebase Firestore
    Colección: "alertas"
    ↓
A-Frame (onSnapshot)
    ↓
Detecta cambio en tiempo real
    ↓
Actualiza visualización:
- Animal cambia a color rojo
- Anillo rojo pulsante
- Panel de alerta visible
- Mapa de calor rojo
```

---

## Reglas de Firestore (Desarrollo)

Para desarrollo, las reglas deben permitir lectura y escritura:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**⚠️ IMPORTANTE:** Estas reglas son solo para desarrollo. En producción, implementar autenticación adecuada.

---

## Configuración de la API REST

### URL Base:
```
https://firestore.googleapis.com/v1/projects/mbe1-7a7b0/databases/(default)/documents
```

### Endpoints por Colección:

- **Sensores:** `/sensores`
- **Alertas:** `/alertas`
- **Comportamientos:** `/comportamientos`
- **Eventos:** `/eventos`

### Formato de Datos para API REST:

Los valores deben estar envueltos en objetos según el tipo:

```json
{
  "fields": {
    "valor": { "integerValue": "25" },
    "tipo": { "stringValue": "temperatura" },
    "latido": { "integerValue": "85" },
    "movimiento": { "integerValue": "1" },
    "humedad": { "integerValue": "65" },
    "depredador": { "integerValue": "0" },
    "timestamp": { "timestampValue": "2025-11-21T20:00:00Z" }
  }
}
```

---

## Notas Importantes

1. **Todos los campos de sensores deben estar en el mismo documento** de la colección `sensores`. A-Frame lee el último documento y extrae todos los campos para mostrarlos en los paneles.

2. **Las alertas se generan automáticamente** cuando el modelo ML detecta riesgo (`riesgo === 1`). No se requiere intervención manual.

3. **La sincronización en tiempo real** se realiza mediante `onSnapshot` en A-Frame, que detecta cambios instantáneamente sin necesidad de polling.

4. **El formato de timestamp** debe ser ISO 8601 con timezone UTC (formato: `YYYY-MM-DDTHH:MM:SS.sssZ`).

5. **Para producción**, implementar:
   - Autenticación de usuarios
   - Reglas de seguridad más estrictas
   - Validación de datos
   - Manejo de errores robusto
   - Límites de cuota y rate limiting

