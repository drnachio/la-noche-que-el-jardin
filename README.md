# La noche que el jardín

Consola de operador para la representación teatral del cumpleaños 80 de mamá.

- Panel derecho: páginas del cómic (A4 vertical), navegación con botones flotantes o flechas `← / →`.
- Panel izquierdo: configuración de salida de audio (Casa / Núcleo / IA) y lista de sonidos por página.

## Requisitos

**Solo funciona en Chrome o Edge** (Chromium). `HTMLMediaElement.setSinkId()` no está soportado en Safari/iOS, así que el enrutado a altavoces específicos no funcionaría ahí.

## Arrancar

```bash
pnpm install   # solo la primera vez
pnpm dev
```

Abrir `http://localhost:3000` en Chrome.

1. En el panel izquierdo, pulsa **Activar dispositivos** y concede el permiso de audio. A partir de ese momento aparecen los nombres reales de los altavoces (incluyendo Bluetooth conectados).
2. Asigna un dispositivo a cada ambiente (Casa, Núcleo, IA). Las elecciones se guardan en `localStorage`.
3. Conecta los altavoces Bluetooth — aparecen en caliente sin necesidad de recargar.

## Añadir sonidos

1. Pon el archivo en `public/sounds/` (mp3, wav, ogg…).
2. Añade una entrada en `lib/sounds-config.ts`:

   ```ts
   {
     id: "p3-ladrido",
     label: "Ladrido del perro",
     file: "/sounds/ladrido.mp3",
     page: "p3",
     defaultAmbient: "casa",
     loop: false,
     volume: 0.8,
   }
   ```

3. La fila aparece bajo "Página 3" en el panel izquierdo. ▶ reproduce, ■ para. El dropdown del lateral cambia el ambiente por defecto solo para esta sesión (se persiste).

## Stack

Next.js 16 · React 19 · Tailwind v4 · shadcn/ui · TypeScript · zustand
