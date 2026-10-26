# Tarea de Marlon Castillo Rivas - Domingo 25 OCT 
# Garantizar la calidad y estabilidad del software mediante pruebas automatizadas
# Rick and Morty Explorer

Aplicación Next.js 16 (App Router), React 19, TypeScript y Tailwind CSS 4 para explorar personajes y episodios de Rick and Morty. Incluye catálogo paginado, detalle de personaje, estados de carga y recuperación de errores.

## Instalación y ejecución

Requisitos: Node.js 24 o posterior y pnpm (lockfile generado con pnpm 12.3.4). Se recomienda una versión LTS de Node compatible. No requiere variables de entorno ni credenciales; la API pública está definida en `src/lib/api.ts`.

```bash
cd /Users/marloncastillo/rick-and-morty-testing-activity
pnpm install --frozen-lockfile
pnpm dev
```

Abrir http://localhost:3000. El catálogo usa `/?page=2` y los detalles `/character/1`.

```bash
pnpm build
pnpm start
```

La aplicación requiere acceso a Rick and Morty API; el build puede necesitar conexión para las fuentes de Google. Las pruebas no requieren servicios externos.

## Ejecutar las pruebas

```bash
pnpm test                 # modo interactivo
pnpm test:run             # una ejecución
pnpm exec vitest run --coverage
# equivalente:
pnpm test:coverage
```

`vitest.config.ts` configura jsdom, el alias `@`, el setup y cobertura V8. Los umbrales de Statements, Branches, Functions y Lines son 80 %, globalmente y por archivo. Una prueba fallida o una métrica inferior hace fallar el comando.

Se incluyen todos los archivos ejecutables `src/**/*.ts` y `src/**/*.tsx`, aunque no sean importados por una prueba. Solo se excluyen declaraciones e interfaces de `src/types`, que no generan código ejecutable. CSS, imágenes, configuración y tests no forman parte del denominador. No se excluyen páginas, layout ni estados de error para aumentar la cobertura.

## Suites

- `tests/api.test.ts`: solicitudes, página predeterminada y explícita, errores HTTP, de red y JSON; lista vacía de episodios sin fetch y normalización de uno o varios episodios.
- `tests/utils.test.ts`: validación de parámetros de página, extracción de identificadores y formato de fechas en UTC, con entradas inválidas y límites.
- `tests/components.test.tsx`: información y enlaces de tarjetas, estados, extremos de paginación, carga accesible y botón de recuperación.
- `tests/pages.test.tsx`: composición del catálogo y detalle, propagación de errores, episodios, layout, navegación y metadata.
- `tests/setup.ts`: matchers DOM, limpieza entre pruebas, bloqueo de fetch no simulado y mock de fuentes de Next.
- `tests/fixtures.ts`: datos estáticos tipados y reproducibles.

Se usan React Testing Library y user-event, priorizando roles, textos, enlaces e interacción. Los mocks se limitan a fronteras externas (fetch, API y fuentes); las utilidades y los componentes reales se ejecutan. No hay llamadas a la API real ni snapshots masivos.

Las páginas async se invocan y esperan explícitamente antes de renderizar su resultado. Esto prueba la orquestación del servidor y la composición React; no emula el transporte RSC, hidratación, router de Next ni un navegador real. Esta entrega cubre la base unitaria y algunas pruebas de integración de la pirámide; no incluye E2E. Un 100 % de cobertura no garantiza ausencia de defectos.

## Reportes y evidencia

Resultado de la ejecución del 25 de octubre de 2026: **53 pruebas aprobadas en 4 suites**.

| Archivo | Statements | Branches | Functions | Lines |
| --- | ---: | ---: | ---: | ---: |
| src/app/error.tsx | 100 % | 100 % | 100 % | 100 % |
| src/app/layout.tsx | 100 % | 100 % | 100 % | 100 % |
| src/app/loading.tsx | 100 % | 100 % | 100 % | 100 % |
| src/app/page.tsx | 100 % | 100 % | 100 % | 100 % |
| src/app/character/[id]/page.tsx | 100 % | 100 % | 100 % | 100 % |
| src/components/CharacterCard.tsx | 100 % | 100 % | 100 % | 100 % |
| src/components/Pagination.tsx | 100 % | 100 % | 100 % | 100 % |
| src/lib/api.ts | 100 % | 100 % | 100 % | 100 % |
| src/lib/utils.ts | 100 % | 100 % | 100 % | 100 % |
| **Global** | **100 %** | **100 %** | **100 %** | **100 %** |

Contadores globales: 54/54 statements, 39/39 branches, 19/19 functions, 50/50 líneas ejecutables.

- `coverage/index.html`: reporte HTML navegable, con desglose por archivo y líneas.
- `coverage/coverage-summary.json`: datos de cobertura procesables.
- `coverage/lcov.info`: formato interoperable para herramientas de CI.
- `coverage/console-summary.txt`: salida de consola de la ejecución entregada.
- `evidence/coverage-console.txt`: copia de evidencia que sobrevive a la limpieza automática de `coverage/`.

Abrir el reporte en macOS:

```bash
open coverage/index.html
```

`coverage/` se incluye intencionalmente en el repositorio como entregable, pero se excluye del lint porque es código generado. Al volver a ejecutar Vitest, la carpeta se regenera. Para actualizar también la evidencia, ejecutar en Bash:

```bash
set -o pipefail
pnpm exec vitest run --coverage 2>&1 | tee evidence/coverage-console.txt
# Solo si el comando anterior termina correctamente:
cp evidence/coverage-console.txt coverage/console-summary.txt
```

## Ajustes funcionales

`src/lib/utils.ts` centraliza la lógica reutilizable. El catálogo usa `parsePage` para evitar páginas negativas, decimales, NaN o números inseguros. El detalle reutiliza extracción de episodios y fechas UTC para evitar cambios de día según la zona horaria. El estado de carga expone un rol accesible. Se corrigió el apóstrofo JSX del mensaje de error.

Los valores incompletos de `allowBuilds` en `pnpm-workspace.yaml` se sustituyeron por `false`, conservando deshabilitados los scripts de sharp y unrs-resolver. Las dependencias de testing se registran en package.json y pnpm-lock.yaml. El proyecto usa módulos ESM y tipos de Node 24 compatibles con Vitest 5.

## Comprobaciones adicionales

```bash
pnpm exec tsc --noEmit
pnpm lint
```
