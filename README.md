# Monitor de Escenario

Herramienta web para control y visualización en eventos, iglesias y presentaciones. Desarrollado por [alf.cl](https://alf.cl).

[![Demo](https://img.shields.io/badge/Demo-tools.alf.cl%2Fmonitor-orange)](https://tools.alf.cl/monitor)
[![Versión](https://img.shields.io/badge/Versión-3.0-blue)](https://github.com/AlFcl/MonitorMultiCosas)
[![Estado](https://img.shields.io/badge/Estado-Producción-green)](https://tools.alf.cl/monitor)

---

## ¿Qué es?

Sistema de dos pantallas que se comunican en tiempo real:

- **Panel de control** (`panel.html`) — Lo maneja el operador desde su dispositivo
- **Escenario** (`index.html`) — Se proyecta en la pantalla grande del lugar

Ideal para iglesias, eventos pequeños, conferencias y cualquier actividad donde necesites controlar lo que se muestra en pantalla desde otro dispositivo.

---

## Estructura

```
MonitorMultiCosas/
├── index.html          ← Pantalla del escenario (proyector)
├── panel.html          ← Panel de control del operador
├── css/
│   ├── index.css       ← Estilos del escenario
│   └── panel.css       ← Estilos del panel
├── js/
│   ├── index.js        ← Lógica del escenario
│   └── panel.js        ← Lógica del panel
└── assets/
    └── logo.svg        ← Logo personalizable
```

---

## Cómo usar

1. Abre `index.html` en la pantalla del escenario (pantalla completa con F11)
2. Abre `panel.html` en el dispositivo del operador
3. Ambas páginas deben estar en el mismo dominio para comunicarse

### Instalación local

```bash
# Con Python
python -m http.server 8080

# Con PHP
php -S localhost:8080

# Con Node.js
npx serve .
```

Luego abre:
- `http://localhost:8080/index.html` → Escenario
- `http://localhost:8080/panel.html` → Panel

---

## Funciones del Panel

### Temporizador
- Ingresa horas, minutos y segundos
- Iniciar, pausar y reiniciar
- El escenario muestra el tiempo en grande con cambios de color al acercarse al límite

### Mensaje al escenario
- Escribe cualquier texto y envíalo directamente a la pantalla grande

### Pantalla de inicio
- Vuelve a la pantalla inicial con el logo cuando no hay contenido activo

---

## Comunicación entre pantallas

Usa `BroadcastChannel` del navegador — no requiere servidor, funciona directamente entre pestañas o ventanas del mismo origen.

---

## Compatibilidad

| Navegador | Soporte |
|-----------|---------|
| Chrome 80+ | ✅ |
| Firefox 75+ | ✅ |
| Safari 13+ | ✅ |
| Edge 80+ | ✅ |

---

## Demo en producción

**[tools.alf.cl/monitor](https://tools.alf.cl/monitor)**

---

## Créditos

Desarrollado por [alf.cl](https://alf.cl) · Chile 🇨🇱

Código fuente: [github.com/AlFcl/MonitorMultiCosas](https://github.com/AlFcl/MonitorMultiCosas)
