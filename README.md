# GameXtore

Biblioteca de videojuegos creada con Next.js, React, TypeScript y Motion.

## Desarrollo

```sh
npm ci
npm run dev
```

Abre http://localhost:3000.

- `/`: portada con carrusel de 26 plataformas.
- `/platform/psp`: biblioteca PSP con búsqueda, filtros, favoritos, recientes y ajustes.
- `/platform/wii`: biblioteca Wii con carrusel, fichas, sonidos originales y cursor de manita.
- Las demás rutas de plataforma conservan su presentación de consola.

## Validación

```sh
npx tsc --noEmit
npm run lint
npm run build
```

## Recursos y límites actuales

Los favoritos, recientes y preferencias se guardan en el navegador. La aplicación permite consultar juegos; no incluye ejecución de ROMs, descargas ni checkout.

Los manifiestos registran procedencia, derechos y recursos pendientes:

- `public/consoles/manifest.json`
- `public/psp/resources.json`
- `public/assets/wii/resources.json`

Las imágenes comerciales de juegos conservan los derechos de sus titulares. La identificación de una fuente como fair use en Wikipedia no constituye una licencia comercial general. Las carátulas PSP y algunas fotografías de consolas permanecen pendientes. Las imágenes Wii de Mario Kart Wii y Wii Sports conservan los formatos de origen y difieren de las cajas de la referencia.

Los sonidos Wii se sintetizan con Web Audio; el puntero es un SVG original creado para GameXtore. No hay integración con Wiimote físico ni con un sistema de mensajes.

El `index.html` del historial inicial del repositorio se conserva como archivo heredado; la aplicación actual se ejecuta desde Next.js.
