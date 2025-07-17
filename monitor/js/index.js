<!-- ========================
     monitor/index.html (Pantalla de Escenario Corregida)
     ======================== -->
     <!DOCTYPE html>
     <html lang="es">
     <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>Monitor de Escenario</title>
       <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
       <link rel="stylesheet" href="../css/index.css">
       <link rel="icon" href="../assets/logo.svg" type="image/svg+xml">
     </head>
     <body>
       <div id="contenedor"></div>
       <script src="js/index.js"></script>
     </body>
     </html>

// Sistema de logs para debugging
class MonitorLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 50;
  }

  log(level, message, data = null) {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = { timestamp, level, message, data };
    
    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Mostrar en consola con colores
    const colors = {
      'error': 'color: #ff4444',
      'warn': 'color: #ffaa00',
      'info': 'color: #00aaff',
      'success': 'color: #00ff88',
      'debug': 'color: #888888'
    };
    
    console.log(`%c[${timestamp}] ${level.toUpperCase()}: ${message}`, colors[level] || '', data || '');
  }

  error(message, data) { this.log('error', message, data); }
  warn(message, data) { this.log('warn', message, data); }
  info(message, data) { this.log('info', message, data); }
  success(message, data) { this.log('success', message, data); }
  debug(message, data) { this.log('debug', message, data); }
}

// Crear logger global
const logger = new MonitorLogger();

// Variables globales
const contenedor = document.getElementById('contenedor');
const URL_POR_DEFECTO = "https://kombi.cl";

let canal;
let cuentaRegresiva;
let tiempoRestante = 0;
let tiempoInicial = 0;
let tiempoTranscurrido = 0;
let estado = 'pausado';
let divTimer = null;
let divProgreso = null;
let tiempoInicioActual = null;
let modoActual = 'iframe';

// ========================
// INICIALIZACIÓN
// ========================

function inicializar() {
  logger.info('🚀 Iniciando Monitor de Escenario');

  try {
    // Crear canal de comunicación
    canal = new BroadcastChannel('control_escenario');
    logger.success('✅ BroadcastChannel creado correctamente');

    // Configurar listeners
    setupEventListeners();
    
    // Mostrar URL por defecto
    mostrarIframe(URL_POR_DEFECTO);
    
    // Enviar estado inicial
    setTimeout(() => {
      enviarEstadoAlPanel();
      logger.info('📡 Estado inicial enviado al panel');
    }, 1000);

    // Intentar pantalla completa automática
    setTimeout(() => {
      intentarPantallaCompleta();
    }, 2000);

    logger.success('✅ Monitor inicializado correctamente');

  } catch (error) {
    logger.error('❌ Error inicializando monitor', error);
  }
}

function setupEventListeners() {
  logger.debug('🔗 Configurando event listeners');

  // Listener para mensajes del panel
  canal.onmessage = (event) => {
    logger.info('📥 Mensaje recibido del panel', event.data);
    procesarMensajePanel(event.data);
  };

  // Listener para errores del canal
  canal.onerror = (error) => {
    logger.error('❌ Error en BroadcastChannel', error);
  };

  // Listeners para pantalla completa
  document.addEventListener('dblclick', togglePantallaCompleta);
  document.addEventListener('keydown', handleKeyPress);

  // Listener para cuando se cierra la ventana
  window.addEventListener('beforeunload', () => {
    if (cuentaRegresiva) {
      clearInterval(cuentaRegresiva);
    }
    if (canal) {
      canal.close();
    }
    logger.info('🚪 Monitor cerrándose');
  });

  // Listener para detectar cambios de visibilidad
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      logger.info('👁️ Monitor visible, enviando estado');
      setTimeout(enviarEstadoAlPanel, 500);
    }
  });

  // Listener para mensajes desde ventana padre (para pantalla completa)
  window.addEventListener('message', (event) => {
    if (event.data.action === 'requestFullscreen') {
      logger.info('📡 Solicitud de pantalla completa recibida');
      intentarPantallaCompleta();
    }
  });

  logger.success('✅ Event listeners configurados');
}

function procesarMensajePanel(data) {
  const { tipo, url, mensaje, mensajeHTML, comando, tiempo } = data;

  logger.debug(`🎯 Procesando comando: ${tipo}`, data);

  switch (tipo) {
    case 'iframe':
      mostrarIframe(url);
      break;

    case 'mensaje':
      if (mensajeHTML) {
        mostrarMensaje(mensajeHTML, true);
      } else {
        mostrarMensaje(mensaje, false);
      }
      break;

    case 'timer':
      mostrarTimer();
      break;

    case 'timer-control':
      procesarControlTimer(comando, tiempo);
      break;

    case 'request-status':
      logger.info('📡 Solicitud de estado recibida, enviando respuesta');
      enviarEstadoAlPanel();
      break;

    case 'test':
      logger.success('🧪 Mensaje de prueba recibido', data);
      break;

    default:
      logger.warn('⚠️ Tipo de mensaje desconocido', tipo);
  }
}

function procesarControlTimer(comando, tiempo) {
  logger.info(`⏱️ Control de timer: ${comando}`, { tiempo });

  switch (comando) {
    case 'setTime':
      configurarTiempo(tiempo);
      break;
    case 'start':
      if (tiempoRestante > 0) {
        iniciarCuenta();
      } else {
        logger.warn('⚠️ No se puede iniciar: tiempo restante es 0');
      }
      break;
    case 'pause':
      pausarTimer();
      break;
    case 'reset':
      reiniciarTimer();
      break;
    default:
      logger.warn('⚠️ Comando de timer desconocido', comando);
  }
}

// ========================
// FUNCIONES DE PANTALLA COMPLETA
// ========================

function intentarPantallaCompleta() {
  logger.info('🖥️ Intentando activar pantalla completa');

  if (document.fullscreenElement) {
    logger.info('ℹ️ Ya está en pantalla completa');
    return;
  }

  const element = document.documentElement;
  
  if (element.requestFullscreen) {
    element.requestFullscreen()
      .then(() => {
        logger.success('✅ Pantalla completa activada');
        document.body.classList.add('fullscreen-mode');
      })
      .catch(error => {
        logger.warn('⚠️ No se pudo activar pantalla completa automáticamente', error);
      });
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
    logger.success('✅ Pantalla completa activada (webkit)');
    document.body.classList.add('fullscreen-mode');
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen();
    logger.success('✅ Pantalla completa activada (ms)');
    document.body.classList.add('fullscreen-mode');
  } else {
    logger.warn('⚠️ Pantalla completa no soportada en este navegador');
  }
}

function togglePantallaCompleta() {
  if (document.fullscreenElement) {
    document.exitFullscreen()
      .then(() => {
        logger.info('📤 Saliendo de pantalla completa');
        document.body.classList.remove('fullscreen-mode');
      });
  } else {
    intentarPantallaCompleta();
  }
}

function handleKeyPress(event) {
  switch (event.key) {
    case 'F11':
      event.preventDefault();
      togglePantallaCompleta();
      break;
    case 'Escape':
      if (document.fullscreenElement) {
        document.exitFullscreen();
        document.body.classList.remove('fullscreen-mode');
      }
      break;
    case 'f':
    case 'F':
      if (event.ctrlKey) {
        event.preventDefault();
        intentarPantallaCompleta();
      }
      break;
  }
}

// ========================
// FUNCIONES DE CONTENIDO
// ========================

function mostrarIframe(url) {
  logger.info('🌐 Mostrando iframe', url);
  
  contenedor.innerHTML = '';
  
  const iframe = document.createElement('iframe');
  iframe.src = url || URL_POR_DEFECTO;
  iframe.style.width = "100vw";
  iframe.style.height = "100vh";
  iframe.style.border = "none";
  iframe.style.display = "block";
  iframe.allowFullscreen = true;
  
  contenedor.appendChild(iframe);
  
  modoActual = 'iframe';
  divTimer = null;
  divProgreso = null;
  
  enviarEstadoAlPanel();
}

function mostrarMensaje(texto, esHTML = false) {
  logger.info('💬 Mostrando mensaje', { esHTML, longitud: texto.length });
  
  contenedor.innerHTML = '';
  
  const div = document.createElement('div');
  div.className = 'mensaje-escenario';
  
  if (esHTML) {
    div.innerHTML = texto;
  } else {
    div.textContent = texto;
  }
  
  contenedor.appendChild(div);
  
  modoActual = 'mensaje';
  divTimer = null;
  divProgreso = null;
  
  enviarEstadoAlPanel();
}

function mostrarTimer() {
  logger.info('⏰ Mostrando temporizador');
  
  contenedor.innerHTML = '';
  crearTimerContainer();
  modoActual = 'timer';
  
  actualizarPantalla();
  enviarEstadoAlPanel();
}

// ========================
// FUNCIONES DE TIMER
// ========================

function crearTimerContainer() {
  logger.debug('🏗️ Creando contenedor del timer');

  // Crear contenedor principal
  const timerContainer = document.createElement('div');
  timerContainer.className = 'timer-container';
  
  // Crear display del timer
  divTimer = document.createElement('div');
  divTimer.className = 'timer-display';
  divTimer.id = 'timer';
  divTimer.textContent = formatTiempo(tiempoRestante);
  
  // Crear información adicional del tiempo
  const timerInfo = document.createElement('div');
  timerInfo.className = 'timer-info';
  timerInfo.innerHTML = `
    <div class="tiempo-transcurrido">
      <span class="label">Transcurrido:</span>
      <span class="valor" id="tiempo-transcurrido">${formatTiempo(tiempoTranscurrido)}</span>
    </div>
    <div class="tiempo-total">
      <span class="label">Total:</span>
      <span class="valor" id="tiempo-total">${formatTiempo(tiempoInicial)}</span>
    </div>
  `;
  
  // Crear barra de progreso
  const progressContainer = document.createElement('div');
  progressContainer.className = 'timer-progress';
  divProgreso = document.createElement('div');
  divProgreso.className = 'timer-progress-bar';
  
  // Calcular progreso inicial
  const porcentajeInicial = tiempoInicial > 0 ? ((tiempoInicial - tiempoRestante) / tiempoInicial) * 100 : 0;
  divProgreso.style.width = `${porcentajeInicial}%`;
  
  progressContainer.appendChild(divProgreso);
  
  // Ensamblar todo
  timerContainer.appendChild(divTimer);
  timerContainer.appendChild(timerInfo);
  timerContainer.appendChild(progressContainer);
  contenedor.appendChild(timerContainer);
}

function configurarTiempo(segundos) {
  logger.info('⚙️ Configurando tiempo', { segundos });
  
  tiempoInicial = segundos;
  tiempoRestante = segundos;
  tiempoTranscurrido = 0;
  estado = 'configurado';
  tiempoInicioActual = null;
  
  if (modoActual === 'timer') {
    actualizarPantalla();
  }
  
  enviarEstadoAlPanel();
}

function iniciarCuenta() {
  if (cuentaRegresiva) clearInterval(cuentaRegresiva);
  
  logger.info('▶️ Iniciando cuenta regresiva');
  
  estado = 'activo';
  tiempoInicioActual = Date.now();
  
  cuentaRegresiva = setInterval(() => {
    if (estado !== 'activo') return;
    
    tiempoRestante--;
    tiempoTranscurrido = tiempoInicial - tiempoRestante;
    
    if (tiempoRestante < 0) {
      tiempoRestante = 0;
      tiempoTranscurrido = tiempoInicial;
    }
    
    actualizarPantalla();
    
    if (tiempoRestante <= 0) {
      clearInterval(cuentaRegresiva);
      estado = 'finalizado';
      actualizarPantalla();
      
      logger.success('🎉 Timer finalizado');
      
      // Notificar al panel que el timer terminó
      canal.postMessage({
        tipo: 'timer-finished',
        tiempoTotal: tiempoInicial,
        timestamp: Date.now()
      });
    }
  }, 1000);
  
  enviarEstadoAlPanel();
}

function pausarTimer() {
  logger.info('⏸️ Pausando timer');
  
  estado = 'pausado';
  if (cuentaRegresiva) {
    clearInterval(cuentaRegresiva);
  }
  actualizarPantalla();
  enviarEstadoAlPanel();
}

function reiniciarTimer() {
  logger.info('🔄 Reiniciando timer');
  
  estado = 'pausado';
  if (cuentaRegresiva) {
    clearInterval(cuentaRegresiva);
  }
  tiempoRestante = tiempoInicial;
  tiempoTranscurrido = 0;
  tiempoInicioActual = null;
  actualizarPantalla();
  enviarEstadoAlPanel();
}

function actualizarPantalla() {
  if (!divTimer || modoActual !== 'timer') return;
  
  // Actualizar clases de estado
  divTimer.classList.remove('timer-warning', 'timer-danger', 'timer-finished');
  
  if (tiempoRestante <= 0 && estado === 'finalizado') {
    divTimer.classList.add('timer-finished');
    divTimer.textContent = "¡Tiempo!";
  } else {
    if (tiempoRestante <= 5 && tiempoRestante > 0) {
      divTimer.classList.add('timer-danger');
    } else if (tiempoRestante <= 30 && tiempoRestante > 0) {
      divTimer.classList.add('timer-warning');
    }
    divTimer.textContent = formatTiempo(tiempoRestante);
  }
  
  // Actualizar información de tiempo transcurrido
  const transcurridoEl = document.getElementById('tiempo-transcurrido');
  const totalEl = document.getElementById('tiempo-total');
  
  if (transcurridoEl && totalEl) {
    transcurridoEl.textContent = formatTiempo(tiempoTranscurrido);
    totalEl.textContent = formatTiempo(tiempoInicial);
  }
  
  // Actualizar barra de progreso
  if (divProgreso && tiempoInicial > 0) {
    const porcentajeTranscurrido = ((tiempoInicial - tiempoRestante) / tiempoInicial) * 100;
    divProgreso.style.width = `${Math.max(0, Math.min(100, porcentajeTranscurrido))}%`;
    
    // Cambiar color de la barra según el progreso
    if (porcentajeTranscurrido >= 90) {
      divProgreso.style.background = 'var(--danger-color)';
      divProgreso.style.boxShadow = '0 0 20px rgba(255, 68, 68, 0.5)';
    } else if (porcentajeTranscurrido >= 75) {
      divProgreso.style.background = 'var(--warning-color)';
      divProgreso.style.boxShadow = '0 0 20px rgba(255, 140, 0, 0.5)';
    } else {
      divProgreso.style.background = 'var(--success-color)';
      divProgreso.style.boxShadow = '0 0 20px rgba(0, 255, 136, 0.5)';
    }
  }
  
  // Enviar actualización de estado al panel cada actualización
  enviarEstadoAlPanel();
}

// ========================
// COMUNICACIÓN CON EL PANEL
// ========================

function enviarEstadoAlPanel() {
  if (!canal) return;

  // Determinar el estado actual del timer
  let estadoTimer = estado;
  if (tiempoInicial === 0) {
    estadoTimer = 'inactivo';
  } else if (tiempoRestante === 0 && estado === 'finalizado') {
    estadoTimer = 'finalizado';
  } else if (tiempoInicial > 0 && estado === 'pausado' && tiempoRestante === tiempoInicial) {
    estadoTimer = 'configurado';
  }
  
  const mensaje = {
    tipo: 'status-update',
    estado: {
      vista: modoActual,
      timer: estadoTimer,
      tiempoRestante: Math.max(0, tiempoRestante),
      tiempoTranscurrido: tiempoTranscurrido,
      tiempoInicial: tiempoInicial,
      porcentajeCompletado: tiempoInicial > 0 ? Math.round(((tiempoInicial - tiempoRestante) / tiempoInicial) * 100) : 0
    },
    timestamp: Date.now()
  };
  
  try {
    canal.postMessage(mensaje);
    logger.debug('📤 Estado enviado al panel', mensaje.estado);
  } catch (error) {
    logger.error('❌ Error enviando estado al panel', error);
  }
}

// ========================
// UTILIDADES
// ========================

function formatTiempo(total) {
  if (total < 0) total = 0;
  const horas = Math.floor(total / 3600);
  const minutos = Math.floor((total % 3600) / 60);
  const segundos = total % 60;
  
  if (horas > 0) {
    return `${horas}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
  } else {
    return `${minutos}:${segundos.toString().padStart(2, '0')}`;
  }
}

function mostrarAlerta(mensaje, duracion = 3000) {
  const alerta = document.createElement('div');
  alerta.className = 'alerta-temporal';
  alerta.textContent = mensaje;
  
  document.body.appendChild(alerta);
  
  setTimeout(() => {
    if (alerta.parentNode) {
      alerta.parentNode.removeChild(alerta);
    }
  }, duracion);
}

// ========================
// FUNCIONES DE TESTING
// ========================

window.testMonitor = function() {
  logger.info('🧪 Función de test disponible');
  logger.info('📊 Estado actual:', {
    modoActual,
    estado,
    tiempoInicial,
    tiempoRestante,
    tiempoTranscurrido
  });
};

window.simularMensaje = function(tipo, contenido) {
  logger.info('🧪 Simulando mensaje', { tipo, contenido });
  procesarMensajePanel({ tipo, [tipo]: contenido });
};

// ========================
// INICIALIZACIÓN AUTOMÁTICA
// ========================

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializar);
} else {
  inicializar();
}

// Enviar estado periódicamente para mantener sincronización
setInterval(() => {
  if (canal) {
    enviarEstadoAlPanel();
  }
}, 5000);

logger.info('🎬 Monitor de Escenario cargado completamente');
console.log('💡 Funciones de testing disponibles:');
console.log('   - testMonitor() - Ver estado actual');
console.log('   - simularMensaje(tipo, contenido) - Simular mensajes del panel');