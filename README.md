# 🖥️ Monitor de Escenario — [tools.alf.cl/monitor](https://tools.alf.cl/monitor)

Herramienta web creada para controlar contenido proyectado en tiempo real, ideal para iglesias, eventos, y presentaciones. Se compone de dos interfaces: un **panel de control** y una **pantalla de visualización**, comunicadas de forma local mediante `BroadcastChannel`.

---

## 🚀 Características

- ✅ **Pantalla principal (`index.html`)**
  - Visualización de letras o versículos vía iframe
  - Temporizador grande con estilos dinámicos (cambio de color, parpadeo)
  - Mensajes en pantalla tipo anuncio
  - Estilo fullscreen oscuro

- 🎛️ **Panel de control (`panel.html`)**
  - Botones para seleccionar qué mostrar: Contenido / Temporizador / Mensaje
  - Controles del temporizador: iniciar, pausar, reiniciar y actualizar tiempo
  - Envío de mensajes personalizados
  - Diseño oscuro, responsive y moderno (Bootstrap + FontAwesome)

- 🔒 **Privado y seguro**
  - Comunicación local entre pestañas (sin servidor)
  - No almacena datos
  - No requiere conexión externa para funcionar

---

## 📁 Estructura del proyecto
monitor/
├── index.html              ← Pantalla principal (escenario)
├── panel.html              ← Panel de control
├── css/
│   ├── index.css           ← Estilos del escenario
│   └── panel.css           ← Estilos del panel
├── js/
│   ├── index.js            ← Lógica del escenario
│   └── panel.js            ← Lógica del panel
└── assets/
└── logo.svg            ← Logo personalizado

---

## ⚙️ ¿Cómo usarlo?

1. Abre `index.html` en una pestaña (pantalla principal)
2. Abre `panel.html` en otra pestaña o ventana (panel de control)
3. Usa los botones para controlar lo que se muestra:
   - `Contenido`: muestra la URL embebida (letras o versículos)
   - `Temporizador`: muestra un reloj grande con control remoto
   - `Mensaje`: muestra un mensaje destacado

> ✅ El sistema funciona localmente y no necesita internet, ideal para usar con duplicación de pantalla o proyector.

---

## 📌 Personalización

- Puedes cambiar la URL por defecto del contenido en `index.html` → línea del iframe
- Puedes ajustar colores, fuentes o tamaños en `css/index.css`
- Todo el código está ordenado, comentado y listo para modificar

---

## ✨ Autor

Creado por [alf.cl](https://alf.cl) — © 2025  
Ubicación del proyecto: [`https://alf.cl/monitor`](https://tools.alf.cl/monitor)
