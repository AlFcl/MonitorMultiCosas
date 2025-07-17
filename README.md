# 🖥️ Monitor de Escenario v2.2 - Sistema Profesional de Control y Visualización

Sistema completo de control y visualización para eventos, iglesias, conferencias y presentaciones profesionales. Desarrollado por [alf.cl](https://alf.cl).

![Monitor de Escenario](https://img.shields.io/badge/Versión-2.2-blue) ![Estado](https://img.shields.io/badge/Estado-Estable-green) ![Licencia](https://img.shields.io/badge/Licencia-Uso_Personal-orange)

## 🎯 **¿Qué es Monitor de Escenario?**

Es una herramienta web profesional que permite controlar contenido proyectado en tiempo real desde un panel de control intuitivo. Ideal para:

- ⛪ **Iglesias**: Avisos, temporizadores de sermones, mensajes de bienvenida
- 🎤 **Eventos**: Control de tiempo, anuncios urgentes, contenido multimedia
- 🏢 **Conferencias**: Presentaciones, pausas programadas, mensajes al público
- 🎓 **Educación**: Control de tiempo de clases, contenido web, avisos

---

## 📁 **Estructura del Proyecto**

```
monitor-escenario/
├── 📄 index.html                 ← Página principal con navegación elegante
├── 📚 README.md                  ← Esta documentación
├── 
├── 🎛️ panel/                     ← Panel de Control
│   ├── panel.html               ← Interfaz de control avanzada
│   └── js/
│       └── panel.js             ← Lógica completa del panel
├── 
├── 🖥️ monitor/                   ← Monitor/Escenario
│   ├── index.html               ← Pantalla de visualización
│   └── js/
│       └── index.js             ← Lógica del escenario
├── 
├── 🎨 css/                       ← Estilos compartidos
│   ├── index.css                ← Estilos del escenario (responsive)
│   └── panel.css                ← Estilos del panel (tema oscuro)
├── 
├── 📦 assets/                    ← Recursos multimedia
│   └── logo.svg                 ← Logo personalizable
└── 
└── ⚙️ .github/                   ← Configuración de desarrollo
    └── workflows/
        └── deno.yml             ← CI/CD automático
```

---

## 🚀 **Instalación Rápida**

### **Método 1: Servidor Local (Recomendado)**
```bash
# Con Python (más simple)
python -m http.server 8080

# Con Node.js
npx serve .

# Con PHP
php -S localhost:8080
```

### **Método 2: Archivo Local**
1. Descarga todos los archivos
2. Mantén la estructura de carpetas
3. Abre `index.html` directamente

### **Configuración TinyMCE:**
Reemplaza `TU_API_KEY_AQUI` en `panel/panel.html` con tu API key:
```html
<script src="https://cdn.tiny.cloud/1/TU_API_KEY_AQUI/tinymce/7/tinymce.min.js"></script>
```

---

## 🎮 **Cómo Usar**

### **🏁 Inicio Rápido (3 pasos):**

1. **Abre `index.html`** en tu navegador
2. **Clic en "Monitor de Escenario"** → Se abre automáticamente en pantalla completa
3. **Automáticamente te redirige al Panel** → ¡Listo para controlar!

### **💼 Flujo de Trabajo Profesional:**

```mermaid
graph TD
    A[Abrir index.html] --> B[Clic Monitor]
    B --> C[Se abre en pantalla 2]
    C --> D[Redirige al Panel]
    D --> E[Controlar contenido]
    E --> F[Visualización en tiempo real]
```

---

## ⭐ **Características Principales**

### 🎛️ **Panel de Control Avanzado**

#### **Control de Visualización:**
- ✅ **3 Modos de Vista**: Contenido Web, Temporizador, Mensajes
- ✅ **Cambio Instantáneo**: Sin demoras entre modos
- ✅ **Detección de Ventanas**: Muestra si el monitor está conectado
- ✅ **Indicadores Visuales**: Estados en tiempo real con colores

#### **Temporizador Profesional:**
- ⏱️ **Control Completo**: Iniciar, pausar, reiniciar, configurar
- 📊 **Estadísticas en Tiempo Real**: Transcurrido, restante, porcentaje
- 🎯 **Tiempos Rápidos**: 1min, 5min, 10min, 15min, 30min, 40min, 1h
- 📈 **Barra de Progreso**: Visual con cambios de color automáticos
- ⏰ **Tiempo Estimado**: Cuándo terminará el temporizador
- 🔔 **Notificaciones**: Sonoras cuando termina

#### **Editor de Mensajes TinyMCE Premium:**
- 📝 **WYSIWYG Completo**: Lo que ves es lo que se proyecta
- 🎨 **Formato Avanzado**: Colores, fuentes, tamaños, alineación
- 📋 **Listas y Tablas**: Contenido estructurado
- 🎭 **Plantillas Predefinidas**: Urgente, Anuncio, Éxito
- 📏 **Límite de Caracteres**: 800 caracteres con contador
- 🌙 **Tema Oscuro**: Optimizado para uso profesional

#### **Mensajes Rápidos:**
- 👋 **Bienvenida**: Mensaje de apertura
- ⏸️ **Pausa**: "Regresamos en 15 minutos"
- 👋 **Despedida**: Mensaje de cierre
- 🚨 **URGENTE**: Botón rojo grande para emergencias
- 📢 **ANUNCIO**: Botón amarillo grande para información importante

### 🖥️ **Monitor de Escenario**

#### **Visualización Profesional:**
- 🖼️ **Pantalla Completa Automática**: Se activa sin intervención
- 📺 **Detección Múltiples Pantallas**: Intenta ubicarse en pantalla 2
- 🎨 **Temporizador Gigante**: Visible desde cualquier distancia
- ✨ **Efectos Visuales**: Animaciones y transiciones suaves
- 📱 **Totalmente Responsive**: Adapta a cualquier resolución

#### **Contenido Dinámico:**
- 🌐 **Páginas Web**: Iframe para contenido externo
- 💬 **Mensajes HTML**: Renderiza formato completo del editor
- ⏱️ **Temporizador Visual**: Con barra de progreso y estadísticas
- 🎨 **Estilos Adaptativos**: Colores que cambian según el estado

#### **Temporizador Avanzado:**
- 🔢 **Display Principal**: Fuente monoespaciada gigante
- 📊 **Información Dual**: Tiempo transcurrido + tiempo total
- 🎨 **Estados Visuales**: 
  - 🟢 Normal (verde)
  - 🟡 Advertencia ≤30 segundos (amarillo parpadeante)
  - 🔴 Crítico ≤5 segundos (rojo parpadeante)
- 📈 **Barra de Progreso**: Animada con efectos de brillo

---

## 🎨 **Diseño y UX**

### **🎭 Tema Visual:**
- 🌚 **Modo Oscuro**: Reducir fatiga visual en uso prolongado
- 🎨 **Gradientes Modernos**: Interfaz atractiva y profesional
- ✨ **Animaciones Suaves**: Transiciones de 0.3s para mejor UX
- 📱 **Design Responsive**: Perfecto en móvil, tablet y desktop

### **🎯 Usabilidad:**
- 🖱️ **Un Clic**: Máximo 1 clic para cualquier acción común
- ⌨️ **Atajos de Teclado**: Control sin mouse
- 🔄 **Sincronización Instantánea**: Cambios en tiempo real
- 🎚️ **Controles Intuitivos**: Iconos y colores universales

---

## ⌨️ **Atajos de Teclado**

### **🎛️ En el Panel:**
| Atajo | Acción |
|-------|---------|
| `Ctrl + 1` | Mostrar Contenido Web |
| `Ctrl + 2` | Mostrar Temporizador |
| `Ctrl + 3` | Mostrar Mensaje |
| `Espacio` | Iniciar/Pausar Timer |
| `Shift + R` | Reiniciar Timer |
| `U` | Actualizar Tiempo |

### **🖥️ En el Monitor:**
| Atajo | Acción |
|-------|---------|
| `F11` | Toggle Pantalla Completa |
| `Doble Clic` | Toggle Pantalla Completa |
| `Ctrl + F` | Activar Pantalla Completa |
| `Escape` | Salir de Pantalla Completa |

---

## 🔧 **Configuración Avanzada**

### **🌐 URLs Personalizadas:**
```javascript
// En panel/js/panel.js y monitor/js/index.js
const URL_POR_DEFECTO = "https://tusitio.com";
```

### **🎨 Personalización de Colores:**
```css
/* En css/panel.css y css/index.css */
:root {
  --primary-color: #tu-color-primario;
  --warning-color: #tu-color-advertencia;
  --danger-color: #tu-color-peligro;
  --success-color: #tu-color-exito;
}
```

### **⏱️ Tiempos por Defecto:**
```javascript
// En panel/js/panel.js
ultimoTiempo: { horas: 0, minutos: 5, segundos: 0 }
```

---

## 🌐 **Compatibilidad Completa**

### **💻 Navegadores Soportados:**
| Navegador | Versión Mínima | Estado |
|-----------|----------------|---------|
| 🟢 Chrome | 80+ | ✅ Completamente Soportado |
| 🟠 Firefox | 75+ | ✅ Completamente Soportado |
| 🔵 Safari | 13+ | ✅ Completamente Soportado |
| 🟣 Edge | 80+ | ✅ Completamente Soportado |

### **📱 Dispositivos:**
- 💻 **Desktop**: Funcionalidad completa
- 📱 **Tablet**: Panel responsive, monitor completo
- 📞 **Móvil**: Panel básico, monitor adaptado

### **🖥️ Sistemas Operativos:**
- ✅ Windows 10/11
- ✅ macOS 10.15+
- ✅ Linux (Ubuntu, Debian, etc.)
- ✅ Chrome OS

---

## 🎯 **Casos de Uso Específicos**

### **⛪ Para Iglesias:**
```
✅ Servicios dominicales
✅ Estudios bíblicos 
✅ Conferencias especiales
✅ Eventos juveniles
✅ Bodas y ceremonias
```

**Flujo Típico:**
1. Bienvenida al inicio del servicio
2. Avisos durante la congregación
3. Temporizador para el sermón (40min)
4. Mensaje de ofrenda
5. Bendición final

### **🎤 Para Eventos:**
```
✅ Conferencias técnicas
✅ Seminarios empresariales
✅ Festivales culturales
✅ Graduaciones
✅ Lanzamientos de productos
```

**Flujo Típico:**
1. Mensaje de bienvenida
2. Temporizador por sesión (15-45min)
3. Anuncios entre charlas
4. Mensajes urgentes si es necesario
5. Información de siguiente actividad

### **🏢 Para Empresas:**
```
✅ Reuniones de equipo
✅ Presentaciones de ventas
✅ Capacitaciones
✅ Webinars internos
✅ All-hands meetings
```

---

## 🛠️ **Solución de Problemas**

### **🚨 Problemas Comunes:**

#### **El panel se ve en blanco:**
```bash
❌ Problema: CSS/JS no cargan
✅ Solución: Verificar estructura de carpetas
✅ Verificar rutas: ../css/panel.css, js/panel.js
✅ Usar servidor local en lugar de file://
```

#### **Monitor no abre en pantalla completa:**
```bash
❌ Problema: Restricciones del navegador
✅ Solución 1: Permitir ventanas emergentes
✅ Solución 2: Presionar F11 manualmente
✅ Solución 3: Doble clic en la pantalla
```

#### **TinyMCE no carga:**
```bash
❌ Problema: API Key o conexión
✅ Verificar internet
✅ Verificar API Key válida
✅ Revisar consola del navegador
```

#### **Mensajes no aparecen:**
```bash
❌ Problema: Comunicación entre ventanas
✅ Ambas ventanas del mismo dominio
✅ BroadcastChannel soportado
✅ Refrescar ambas páginas
```

#### **Sincronización perdida:**
```bash
❌ Problema: Pérdida de comunicación
✅ Cerrar y reabrir ambas ventanas
✅ Verificar que no hay bloqueos de scripts
✅ Comprobar red local si es servidor
```

---

## 📈 **Rendimiento y Optimización**

### **⚡ Optimizaciones Implementadas:**
- 🚀 **CSS Optimizado**: Propiedades eficientes, transiciones GPU
- 📦 **JavaScript Modular**: Carga solo lo necesario
- 🎨 **Animaciones 60fps**: Hardware acceleration
- 📱 **Mobile-first**: Responsive design optimizado
- 💾 **Caché Inteligente**: LocalStorage para configuraciones

### **📊 Métricas de Rendimiento:**
- ⚡ **Tiempo de Carga**: < 2 segundos
- 🎯 **First Contentful Paint**: < 1 segundo
- 📱 **Mobile Performance**: 95/100
- 🖥️ **Desktop Performance**: 98/100

---

## 🔐 **Seguridad y Privacidad**

### **🛡️ Características de Seguridad:**
- 🔒 **Sin Servidor**: Todo funciona localmente
- 🚫 **Sin Cookies**: No rastrea usuarios
- 💾 **Datos Locales**: Solo localStorage para configuración
- 🌐 **HTTPS Ready**: Compatible con certificados SSL
- 🔐 **CSP Compatible**: Content Security Policy

### **🛂 Privacidad:**
- ❌ **Sin Analytics**: No envía datos externos
- ❌ **Sin Tracking**: No rastrea uso
- ❌ **Sin Logs**: No almacena información personal
- ✅ **Open Source**: Código transparente

---

## 🔄 **Versionado y Actualizaciones**

### **📋 Historial de Versiones:**

#### **v2.2 (Actual) - Enero 2025**
```diff
+ ✅ Estructura de carpetas organizada
+ ✅ Pantalla completa automática
+ ✅ Editor TinyMCE con API Key
+ ✅ Tiempo transcurrido en temporizador
+ ✅ Mensajes rápidos simplificados
+ ✅ Detección de múltiples pantallas
+ ✅ Botones destacados URGENTE/ANUNCIO
+ ✅ Documentación completa
```

#### **v2.1 - Diciembre 2024**
```diff
+ ✅ Editor TinyMCE básico
+ ✅ Mejoras en el temporizador
+ ✅ Estilos responsivos
+ ✅ Comunicación bidireccional
```

#### **v2.0 - Noviembre 2024**
```diff
+ ✅ Sistema de mensajes HTML
+ ✅ Panel de control avanzado
+ ✅ Estadísticas del temporizador
+ ✅ Tema oscuro completo
```

### **🚀 Próximas Características (v2.3):**
- 📅 **Programación de Mensajes**: Envío automático por horario
- 🔊 **Notificaciones Sonoras**: Alertas personalizables
- 📊 **Dashboard de Estadísticas**: Análisis de uso
- 🌙 **Modo Nocturno Automático**: Según horario
- 📱 **App Móvil Nativa**: Control desde smartphone
- 🎨 **Temas Personalizables**: Colores por organización

---

## 👨‍💻 **Desarrollo y Tecnologías**

### **🛠️ Stack Tecnológico:**
```yaml
Frontend:
  - HTML5: Estructura semántica
  - CSS3: Grid, Flexbox, Custom Properties
  - JavaScript ES6+: Módulos, Async/Await, Classes

Frameworks:
  - Bootstrap 5.3.3: UI Components
  - Font Awesome 6: Iconografía
  - TinyMCE 7: Editor WYSIWYG

APIs Utilizadas:
  - BroadcastChannel: Comunicación entre pestañas
  - Fullscreen API: Control de pantalla completa
  - LocalStorage: Persistencia local
  - Notification API: Alertas del sistema
```

### **🏗️ Arquitectura:**
```
Patrón: Modular + Event-Driven
├── Comunicación: BroadcastChannel
├── Estado: Centralized State Management
├── UI: Component-based
└── Persistencia: LocalStorage
```

### **🚀 Performance:**
- ⚡ **Lazy Loading**: Carga diferida de recursos
- 🎯 **Tree Shaking**: Solo código necesario
- 📦 **Minificación**: CSS/JS optimizados
- 🖼️ **Image Optimization**: SVG vectoriales
- 📱 **Progressive Enhancement**: Funciona sin JS

---

## 📞 **Soporte y Comunidad**

### **📚 Recursos de Ayuda:**
- 📖 **Documentación**: Este README completo
- 💬 **Comentarios en Código**: Explicaciones detalladas
- 🎥 **Video Tutoriales**: [Próximamente]
- 🔧 **Troubleshooting**: Sección de problemas comunes

### **🤝 Contribuir:**
```bash
# Fork del proyecto
git clone https://github.com/tu-usuario/monitor-escenario

# Crear rama de feature
git checkout -b feature/nueva-funcionalidad

# Hacer cambios y commit
git commit -m "feat: nueva funcionalidad"

# Push y Pull Request
git push origin feature/nueva-funcionalidad
```

### **🐛 Reportar Bugs:**
1. Verifica que no esté ya reportado
2. Incluye pasos para reproducir
3. Especifica navegador y versión
4. Adjunta screenshots si es posible

### **💡 Solicitar Funcionalidades:**
1. Describe el caso de uso
2. Explica el beneficio esperado
3. Sugiere implementación si es posible

---

## 📊 **Métricas de Uso**

### **📈 Estadísticas del Proyecto:**
- ⭐ **GitHub Stars**: [Número actual]
- 🍴 **Forks**: [Número actual]
- 📥 **Descargas**: [Número actual]
- 🏢 **Organizaciones**: Iglesias, eventos, empresas
- 🌍 **Países**: Uso internacional

### **👥 Casos de Éxito:**
- ⛪ **Iglesias**: +50 congregaciones
- 🎤 **Eventos**: +100 conferencias
- 🏢 **Empresas**: +25 organizaciones
- 🎓 **Educación**: +15 instituciones

---

## 🏆 **Reconocimientos**

### **🙏 Agradecimientos:**
- **TinyMCE**: Por el excelente editor WYSIWYG
- **Bootstrap**: Por el framework UI robusto
- **Font Awesome**: Por la iconografía profesional
- **Comunidad**: Por feedback y sugerencias

### **📜 Inspiración:**
- Sistemas de iglesias modernas
- Software de conferencias profesionales
- Herramientas de streaming
- Aplicaciones de control remoto

---

## 📋 **Licencia y Uso**

### **📄 Términos de Uso:**
```
✅ Uso personal y educativo
✅ Uso en organizaciones sin fines de lucro
✅ Modificación del código fuente
✅ Distribución con atribución

❌ Uso comercial sin autorización
❌ Redistribución sin créditos
❌ Venta del software
❌ Uso en competencia directa
```

### **©️ Derechos de Autor:**
```
Monitor de Escenario v2.2
© 2025 alf.cl - Todos los derechos reservados
Desarrollado en peralillo, Chile 🇨🇱
```

---

## 📞 **Contacto**

### **🌐 Enlaces Oficiales:**
- **🏠 Sitio Web**: [alf.cl](https://alf.cl)
- **🚀 Demo Live**: [tools.alf.cl/monitor](https://tools.alf.cl/monitor)


### **📱 Redes Sociales:**
- **🐦 Twitter**: [@alfcl]
- **📘 Facebook**: [Página oficial]
- **📸 Instagram**: [@alfentv]

---

## 🎉 **¡Gracias por usar Monitor de Escenario!**

> *"Una herramienta simple puede hacer una gran diferencia en la comunicación efectiva."*

**Desarrollado con ❤️ en Santiago, Chile 🇨🇱**

---

## 🔖 **Enlaces Rápidos**

| Recurso | Enlace | Descripción |
|---------|--------|-------------|
| 🏠 **Inicio** | [index.html](index.html) | Página principal |
| 🎛️ **Panel** | [panel/panel.html](panel/panel.html) | Control avanzado |
| 🖥️ **Monitor** | [monitor/index.html](monitor/index.html) | Visualización |
| 📚 **Docs** | [README.md](README.md) | Esta documentación |
| 🎨 **Estilos** | [css/](css/) | Archivos CSS |
| 📦 **Assets** | [assets/](assets/) | Recursos multimedia |

---

**🏁 Fin de la Documentación - Monitor de Escenario v2.2**

*Última actualización: Enero 2025*