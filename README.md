# Los Hijos del Acantilado — Área de investigación

Aplicación SPA construida con Next.js (App Router) para explorar el caso "Los Hijos del Acantilado" con estética de expediente policial. Integra contenidos desde Strapi (REST + Media) y preserva el progreso en `localStorage`.

## Requisitos

- Node 18+
- Yarn
- Variables de entorno:
  - `STRAPI_URL` o `NEXT_PUBLIC_STRAPI_URL`: URL base de Strapi (sin `/api`). Se usa tanto para API como para media.
  - `STRAPI_API_TOKEN` (opcional): token de acceso si tu Strapi requiere autenticación.

## Puesta en marcha

```bash
yarn install
yarn dev
```

La aplicación se levanta en `http://localhost:3000`.

## Flujo principal

- **Caso**: briefing, objetivo y seguimiento de eventos con estados "Abierto / Revisado / Conclusión provisional".
- **Evidencias**: grid filtrable por tipo, evento, ubicación y personaje. Visor integrado para documentos, imágenes y audio. Las evidencias bloqueadas muestran el motivo de restricción.
- **Mapa**: mapa ilustrado con pins desbloqueables; cada ubicación abre panel con notas y evidencias asociadas.
- **Teorías**: redacción de hipótesis, selección de evidencias de soporte, comprobación suave y guardado en localStorage. Botón para exportar notas mediante impresión/PDF.
- **Cronología**: preguntas de investigación desde Strapi con desbloqueos de evidencias, eventos y ubicaciones. Permite solicitar hasta dos pistas sin penalización.

## Persistencia

El progreso se guarda en `localStorage` con clave versionada (`los-hijos-acantilado-<version>`). Incluye eventos revisados, evidencias vistas, desbloqueos, teorías y respuestas a preguntas. El botón "Reiniciar caso" limpia los datos locales.

## Integración con Strapi

La app intenta cargar los siguientes endpoints (REST, con `?populate=*`):
- `/case`
- `/events`
- `/evidences`
- `/locations`
- `/questions`
- `/characters`

Si la carga falla, se utiliza un conjunto de datos de respaldo para seguir investigando offline.

## Estilo

Estética desktop-first responsive con terminología policial (Informe, Evidencia, Análisis, Conclusión provisional, Acceso restringido) evitando lenguaje de videojuego. Todo el código está en TypeScript.
