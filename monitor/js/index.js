// ========================
// monitor/js/index.js (Monitor de Escenario - Versión Final Corregida)
// ========================

// Sistema de logs avanzado para debugging
class MonitorLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 200;
    this.createLogPanel();
    this.isVisible = false;
  }

  createLogPanel() {
    const logPanel = document.createElement('div');
    logPanel.id = 'monitor-debug-panel';
    logPanel.innerHTML = `
      <div style="position: fixed; top: 10px; left: 10px; width: 450px; max-height: 400px; 
                  background: rgba(0,0,0,0.95); color: #00ff00; padding: 15px; 
                  border-radius: 12px; font-family: 'Courier New', monospace; font-size: 12px; 
                  z-index: 99999; overflow-y: auto; border: 2px solid #333;
                  backdrop-filter: blur(10px); display: none;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <strong style="color: #ffff00; font-size: 14px;">🖥️ Monitor Debug Log</strong>
          <div>
            <button onclick="window.logger.clear()" style="background: #dc3545; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; margin-right: 5px; font-size: 10px;">Clear</button>
            <button onclick="window.logger.toggle()" style="background: #6c757d; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 10px;">Hide</button>
          </div>
        </div>
        <div style="margin-bottom: 10px; padding: 8px; background: rgba(13, 202, 240, 0.1); border-radius: 6px; border-left: 4px solid #0dcaf0;">
          <div style="color: #0dcaf0; font-weight: bold; margin-bottom: 5px;">💡 Atajos:</div>
          <div style="color: #ffffff; font-size: 11px; line-height: 1.4;">
            <strong>F12:</strong> Mostrar/Ocultar | <strong>F11:</strong> Pantalla Completa<br>
            <strong>testMonitor():</strong> Estado | <strong>simularMensaje():</strong> Test
          </div>
        </div>
        <div id="monitor-log-content" style="white-space: pre-wrap; word-break: break-word; max-height: 280px; overflow-y: auto; line-height: 1.4;"></div>
        <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #444; font-size: 10px; color: #888;">
          Total: <span id="log-count">0</span> | Actualizado: <span id="last-update">--:--:--</span>
        </div>
      </div>
    `;
    document.body.appendChild(logPanel);
    
    this.logContent = document.getElementById('monitor-log-content');
    this.logPanel = logPanel;
    this.logCountEl = document.getElementById('log-count');
    this.lastUpdateEl = document.getElementById('last-update');
  }

  log(level, message, data = null) {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = { timestamp, level, message, data, id: Date.now() + Math.random() };
    
    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) this.logs.shift();

    const colors = {
      'error': 'color: #ff4444; font-weight: bold;',
      'warn': 'color: #ffaa00; font-weight: bold;',
      'info': 'color: #00aaff;',
      'success': 'color: #00ff88; font-weight: bold;',
      'debug': 'color: #888888;',
      'timer': 'color: #ffc107; font-weight: bold;',
      'comm': 'color: #e83e8c; font-weight: bold;'
    };
    
    console.log(`%c[MONITOR ${timestamp}] ${level.toUpperCase()}: ${message}`, colors[level] || '', data || '');
    this.updateLogPanel();
  }

  updateLogPanel() {
    if (!this.logContent) return;
    
    const colors = {
      'error': '#ff4444', 'warn': '#ffaa00', 'info': '#00aaff',
      'success': '#00ff88', 'debug': '#888888', 'timer': '#ffc107', 'comm': '#e83e8c'
    };

    const icons = {
      'error': '❌ ', 'warn': '⚠️ ', 'info': 'ℹ️ ', 'success': '✅ ',
      'debug': '🔍 ', 'timer': '⏱️ ', 'comm': '📡 '
    };

    const logText = this.logs.slice(-50).map(log => {
      const color = colors[log.level] || '#ffffff';
      const icon = icons[log.level] || '• ';
      const dataStr = log.data ? ` | ${JSON.stringify(log.data).substring(0, 100)}` : '';
      return `<span style="color: ${color}; display: block; margin: 2px 0; padding: 2px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">${icon}[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}${dataStr}</span>`;
    }).join('');

    this.logContent.innerHTML = logText;
    this.logContent.scrollTop = this.logContent.scrollHeight;
    
    if (this.logCountEl) this.logCountEl.textContent = this.logs.length;
    if (this.lastUpdateEl) this.lastUpdateEl.textContent = new Date().toLocaleTimeString();
  }

  show() {
    if (this.logPanel) {
      this.logPanel.querySelector('div').style.display = 'block';
      this.isVisible = true;
      this.info('📖 Panel de logs mostrado');
    }
  }

  hide() {
    if (this.logPanel) {
      this.logPanel.querySelector('div').style.display = 'none';
      this.isVisible = false;
    }
  }

  toggle() { this.isVisible ? this.hide() : this.show(); }

  clear() {
    this.logs = [];
    if (this.logContent) this.logContent.innerHTML = '';
    if (this.logCountEl) this.logCountEl.textContent = '0';
    this.success('🗑️ Logs limpiados');
  }

  error(message, data) { this.log('error', message, data); }
  warn(message, data) { this.log('warn', message, data); }
  info(message, data) { this.log('info', message, data); }
  success(message, data) { this.log('success', message, data); }
  debug(message, data) { this.log('debug', message, data); }
  timer(message, data) { this.log('timer', message, data); }
  comm(message, data) { this.log('comm', message, data); }
}

// Variables globales
const logger = new MonitorLogger();
window.logger = logger;

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
let heartbeatInterval = null;

// ========================
// INICIALIZACIÓN
// ========================

function inicializar() {
  logger.success('🚀 INICIANDO MONITOR DE ESCENARIO v2.2');

  try {
    // Crear canal de comunicación
    canal = new BroadcastChannel('control_escenario');
    logger.success('✅ BroadcastChannel creado correctamente');

    // Configurar listeners INMEDIATAMENTE
    setupEventListeners();
    
    // Mostrar URL por defecto
    mostrarIframe(URL_POR_DEFECTO);
    
    // Configurar heartbeat
    iniciarHeartbeat();
    
    // Enviar estado inicial
    setTimeout(() => {
      enviarEstadoAlPanel();
      logger.comm('📡 Estado inicial enviado al panel');
    }, 1000);

    // Intentar pantalla completa
    setTimeout(() => {
      intentarPantallaCompleta();
    }, 2000);

    logger.success('✅ Monitor inicializado correctamente');

  } catch (error) {
    logger.error('❌ Error crítico inicializando monitor', error);
    mostrarError('Error de inicialización', error.message);
  }
}

function setupEventListeners() {
  logger.debug('🔗 Configurando event listeners');

  // CRÍTICO: Configurar listener del canal CORRECTAMENTE
  canal.onmessage = (event) => {
    logger.comm('📥 MENSAJE RECIBIDO DEL PANEL', event.data);
    procesarMensajePanel(event.data);
  };

  canal.onerror = (error) => {
    logger.error('❌ Error en BroadcastChannel', error);
  };

  // Event listeners adicionales
  document.addEventListener('dblclick', togglePantallaCompleta);
  document.addEventListener('keydown', handleKeyPress);

  window.addEventListener('beforeunload', () => {
    logger.info('🚪 Monitor cerrándose - limpiando recursos');
    limpiarRecursos();
  });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      logger.info('👁️ Monitor visible, enviando estado actualizado');
      setTimeout(enviarEstadoAlPanel, 500);
    }
  });

  window.addEventListener('message', (event) => {
    if (event.data.action === 'requestFullscreen') {
      logger.comm('📡 Solicitud de pantalla completa recibida');
      intentarPantallaCompleta();
    }
  });

  document.addEventListener('fullscreenchange', () => {
    const isFullscreen = !!document.fullscreenElement;
    logger.info(`🖥️ Estado pantalla completa: ${isFullscreen ? 'ACTIVADA' : 'DESACTIVADA'}`);
    
    if (isFullscreen) {
      document.body.classList.add('fullscreen-mode');
    } else {
      document.body.classList.remove('fullscreen-mode');
    }
  });

  logger.success('✅ Event listeners configurados correctamente');
}

function iniciarHeartbeat() {
  heartbeatInterval = setInterval(() => {
    if (canal) {
      try {
        canal.postMessage({
          tipo: 'heartbeat',
          timestamp: Date.now(),
          estado: {
            modo: modoActual,
            timer: estado,
            pantalla: document.fullscreenElement ? 'completa' : 'ventana'
          }
        });
        logger.debug('💓 Heartbeat enviado');
      } catch (error) {
        logger.warn('⚠️ Error enviando heartbeat', error);
      }
    }
  }, 3000);
}

function limpiarRecursos() {
  if (cuentaRegresiva) {
    clearInterval(cuentaRegresiva);
    logger.debug('🗑️ Timer limpiado');
  }
  
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    logger.debug('🗑️ Heartbeat limpiado');
  }
  
  if (canal) {
    canal.close();
    logger.debug('🗑️ Canal de comunicación cerrado');
  }
}

function procesarMensajePanel(data) {
  const { tipo, url, mensaje, mensajeHTML, comando, tiempo } = data;

  logger.comm(`🎯 PROCESANDO COMANDO: ${tipo}`, { comando, tiempo });

  switch (tipo) {
    case 'iframe':
      logger.info('🌐 Cambiando a vista iframe', { url });
      mostrarIframe(url);
      break;

    case 'mensaje':
      logger.info('💬 Cambiando a vista mensaje', { 
        tieneHTML: !!mensajeHTML, 
        longitud: mensajeHTML ? mensajeHTML.length : (mensaje ? mensaje.length : 0)
      });
      if (mensajeHTML) {
        mostrarMensaje(mensajeHTML, true);
      } else if (mensaje) {
        mostrarMensaje(mensaje, false);
      }
      break;

    case 'timer':
      logger.timer('⏱️ CAMBIANDO A VISTA TEMPORIZADOR');
      mostrarTimer();
      break;

    case 'timer-control':
      logger.timer(`🎮 Control de timer: ${comando}`, { tiempo });
      procesarControlTimer(comando, tiempo);
      break;

    case 'request-status':
      logger.comm('📡 Solicitud de estado recibida, enviando respuesta');
      enviarEstadoAlPanel();
      break;

    case 'heartbeat':
      logger.debug('💓 Heartbeat recibido del panel');
      break;

    case 'test':
      logger.success('🧪 MENSAJE DE PRUEBA RECIBIDO CORRECTAMENTE', data);
      break;

    default:
      logger.warn('⚠️ Tipo de mensaje desconocido', { tipo, data });
  }
}

function procesarControlTimer(comando, tiempo) {
  logger.timer(`⏱️ Ejecutando comando de timer: ${comando}`, { tiempo, estadoActual: estado });

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
      logger.warn('⚠️ Comando de timer desconocido', { comando });
  }
}

// ========================
// FUNCIONES DE PANTALLA COMPLETA
// ========================

function intentarPantallaCompleta() {
  logger.info('🖥️ Intentando activar pantalla completa');

  if (document.fullscreenElement) {
    logger.info('ℹ️ Ya está en pantalla completa');
    return Promise.resolve();
  }

  const element = document.documentElement;
  
  const intentos = [
    () => element.requestFullscreen?.(),
    () => element.webkitRequestFullscreen?.(),
    () => element.msRequestFullscreen?.(),
    () => element.mozRequestFullScreen?.()
  ];

  for (const intento of intentos) {
    try {
      const resultado = intento();
      if (resultado && resultado.then) {
        return resultado
          .then(() => {
            logger.success('✅ Pantalla completa activada correctamente');
            document.body.classList.add('fullscreen-mode');
          })
          .catch(error => {
            logger.warn('⚠️ No se pudo activar pantalla completa automáticamente', error);
          });
      } else if (resultado !== undefined) {
        logger.success('✅ Pantalla completa activada (método síncrono)');
        document.body.classList.add('fullscreen-mode');
        return Promise.resolve();
      }
    } catch (error) {
      logger.debug('🔍 Método de pantalla completa no disponible', error);
    }
  }
  
  logger.warn('⚠️ Pantalla completa no soportada en este navegador');
  return Promise.reject(new Error('Pantalla completa no soportada'));
}

function togglePantallaCompleta() {
  logger.info('🔄 Toggle pantalla completa solicitado');
  
  if (document.fullscreenElement) {
    document.exitFullscreen()
      .then(() => {
        logger.info('📤 Saliendo de pantalla completa');
        document.body.classList.remove('fullscreen-mode');
      })
      .catch(error => {
        logger.error('❌ Error saliendo de pantalla completa', error);
      });
  } else {
    intentarPantallaCompleta();
  }
}

function handleKeyPress(event) {
  if (event.key === 'F12') {
    event.preventDefault();
    logger.toggle();
    return;
  }

  switch (event.key) {
    case 'F11':
      event.preventDefault();
      togglePantallaCompleta();
      logger.info('⌨️ F11 presionado - toggle pantalla completa');
      break;
    case 'Escape':
      if (document.fullscreenElement) {
        document.exitFullscreen();
        document.body.classList.remove('fullscreen-mode');
        logger.info('⌨️ Escape presionado - saliendo de pantalla completa');
      }
      break;
    case 'f':
    case 'F':
      if (event.ctrlKey) {
        event.preventDefault();
        intentarPantallaCompleta();
        logger.info('⌨️ Ctrl+F presionado - activando pantalla completa');
      }
      break;
    case 'r':
    case 'R':
      if (event.ctrlKey) {
        logger.info('⌨️ Ctrl+R presionado - recargando página');
        location.reload();
      }
      break;
  }
}

// ========================
// FUNCIONES DE CONTENIDO
// ========================

function mostrarIframe(url) {
  const urlFinal = url || URL_POR_DEFECTO;
  logger.info('🌐 Mostrando iframe', { url: urlFinal });
  
  contenedor.innerHTML = '';
  
  const iframe = document.createElement('iframe');
  iframe.src = urlFinal;
  iframe.style.width = "100vw";
  iframe.style.height = "100vh";
  iframe.style.border = "none";
  iframe.style.display = "block";
  iframe.allowFullscreen = true;
  
  iframe.onload = () => {
    logger.success('✅ Iframe cargado correctamente', { url: urlFinal });
  };
  
  iframe.onerror = (error) => {
    logger.error('❌ Error cargando iframe', { url: urlFinal, error });
  };
  
  contenedor.appendChild(iframe);
  
  modoActual = 'iframe';
  divTimer = null;
  divProgreso = null;
  
  enviarEstadoAlPanel();
  logger.success('✅ Vista iframe configurada correctamente');
}

function mostrarMensaje(texto, esHTML = false) {
  logger.info('💬 Mostrando mensaje', { 
    esHTML, 
    longitud: texto ? texto.length : 0,
    preview: texto ? texto.substring(0, 50) + '...' : 'vacío'
  });
  
  if (!texto || texto.trim() === '') {
    logger.warn('⚠️ Mensaje vacío recibido');
    mostrarError('Mensaje vacío', 'No se recibió contenido para mostrar');
    return;
  }
  
  contenedor.innerHTML = '';
  
  const div = document.createElement('div');
  div.className = 'mensaje-escenario';
  
  if (esHTML) {
    try {
      div.innerHTML = texto;
      logger.success('✅ Mensaje HTML renderizado correctamente');
    } catch (error) {
      logger.error('❌ Error renderizando HTML', error);
      div.textContent = texto;
    }
  } else {
    div.textContent = texto;
    logger.success('✅ Mensaje de texto renderizado correctamente');
  }
  
  contenedor.appendChild(div);
  
  modoActual = 'mensaje';
  divTimer = null;
  divProgreso = null;
  
  enviarEstadoAlPanel();
}

function mostrarTimer() {
  logger.timer('⏰ CONFIGURANDO VISTA DE TEMPORIZADOR');
  
  contenedor.innerHTML = '';
  crearTimerContainer();
  modoActual = 'timer';
  
  actualizarPantalla();
  enviarEstadoAlPanel();
  
  logger.success('✅ Vista de temporizador configurada correctamente');
}

function mostrarError(titulo, mensaje) {
  logger.error('🚨 Mostrando pantalla de error', { titulo, mensaje });
  
  contenedor.innerHTML = `
    <div class="error-message">
      <i class="fas fa-exclamation-triangle"></i>
      <h2>${titulo}</h2>
      <p>${mensaje}</p>
      <small>Revisa los logs (F12) para más detalles</small>
    </div>
  `;
  
  modoActual = 'error';
}

// ========================
// FUNCIONES DE TIMER
// ========================

function crearTimerContainer() {
  logger.debug('🏗️ Creando contenedor del temporizador');

  const timerContainer = document.createElement('div');
  timerContainer.className = 'timer-container';
  
  divTimer = document.createElement('div');
  divTimer.className = 'timer-display';
  divTimer.id = 'timer';
  divTimer.textContent = formatTiempo(tiempoRestante);
  
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
  
  const progressContainer = document.createElement('div');
  progressContainer.className = 'timer-progress';
  divProgreso = document.createElement('div');
  divProgreso.className = 'timer-progress-bar';
  
  const porcentajeInicial = tiempoInicial > 0 ? ((tiempoInicial - tiempoRestante) / tiempoInicial) * 100 : 0;
  divProgreso.style.width = `${Math.max(0, Math.min(100, porcentajeInicial))}%`;
  
  progressContainer.appendChild(divProgreso);
  
  timerContainer.appendChild(divTimer);
  timerContainer.appendChild(timerInfo);
  timerContainer.appendChild(progressContainer);
  contenedor.appendChild(timerContainer);
  
  logger.success('✅ Contenedor del temporizador creado correctamente');
}

function configurarTiempo(segundos) {
  logger.timer('⚙️ Configurando tiempo del temporizador', { 
    segundos, 
    formatoLegible: formatTiempo(segundos) 
  });
  
  tiempoInicial = segundos;
  tiempoRestante = segundos;
  tiempoTranscurrido = 0;
  estado = 'configurado';
  tiempoInicioActual = null;
  
  if (modoActual === 'timer') {
    actualizarPantalla();
  }
  
  enviarEstadoAlPanel();
  logger.success('✅ Tiempo configurado correctamente', { 
    inicial: formatTiempo(tiempoInicial),
    restante: formatTiempo(tiempoRestante)
  });
}

function iniciarCuenta() {
  if (cuentaRegresiva) {
    clearInterval(cuentaRegresiva);
    logger.debug('🗑️ Timer anterior limpiado');
  }
  
  logger.timer('▶️ INICIANDO CUENTA REGRESIVA', { 
    tiempoInicial: formatTiempo(tiempoInicial),
    tiempoRestante: formatTiempo(tiempoRestante)
  });
  
  estado = 'activo';
  tiempoInicioActual = Date.now();
  
  cuentaRegresiva = setInterval(() => {
    if (estado !== 'activo') {
      logger.debug('⏸️ Timer pausado, deteniendo intervalo');
      return;
    }
    
    tiempoRestante--;
    tiempoTranscurrido = tiempoInicial - tiempoRestante;
    
    if (tiempoRestante < 0) {
      tiempoRestante = 0;
      tiempoTranscurrido = tiempoInicial;
    }
    
    if (tiempoRestante % 30 === 0 || tiempoRestante <= 10) {
      logger.timer(`⏱️ Tiempo restante: ${formatTiempo(tiempoRestante)}`);
    }
    
    actualizarPantalla();
    
    if (tiempoRestante <= 0) {
      clearInterval(cuentaRegresiva);
      estado = 'finalizado';
      actualizarPantalla();
      
      logger.success('🎉 TEMPORIZADOR FINALIZADO!', { 
        tiempoTotal: formatTiempo(tiempoInicial),
        tiempoFin: new Date().toLocaleTimeString()
      });
      
      canal.postMessage({
        tipo: 'timer-finished',
        tiempoTotal: tiempoInicial,
        timestamp: Date.now()
      });
    }
  }, 1000);
  
  enviarEstadoAlPanel();
  logger.success('✅ Cuenta regresiva iniciada correctamente');
}

function pausarTimer() {
  logger.timer('⏸️ Pausando temporizador', { 
    tiempoRestante: formatTiempo(tiempoRestante),
    transcurrido: formatTiempo(tiempoTranscurrido)
  });
  
  estado = 'pausado';
  if (cuentaRegresiva) {
    clearInterval(cuentaRegresiva);
  }
  actualizarPantalla();
  enviarEstadoAlPanel();
  
  logger.success('✅ Temporizador pausado correctamente');
}

function reiniciarTimer() {
  logger.timer('🔄 Reiniciando temporizador', { 
    tiempoInicial: formatTiempo(tiempoInicial)
  });
  
  estado = 'pausado';
  if (cuentaRegresiva) {
    clearInterval(cuentaRegresiva);
  }
  tiempoRestante = tiempoInicial;
  tiempoTranscurrido = 0;
  tiempoInicioActual = null;
  actualizarPantalla();
  enviarEstadoAlPanel();
  
  logger.success('✅ Temporizador reiniciado correctamente');
}

function actualizarPantalla() {
  if (!divTimer || modoActual !== 'timer') {
    logger.debug('🔍 No se puede actualizar pantalla - elementos no disponibles');
    return;
  }
  
  divTimer.classList.remove('timer-warning', 'timer-danger', 'timer-finished');
  
  if (tiempoRestante <= 0 && estado === 'finalizado') {
    divTimer.classList.add('timer-finished');
    divTimer.textContent = "¡Tiempo!";
    logger.timer('🎉 Timer finalizado - mostrando mensaje final');
  } else {
    if (tiempoRestante <= 5 && tiempoRestante > 0) {
      divTimer.classList.add('timer-danger');
    } else if (tiempoRestante <= 30 && tiempoRestante > 0) {
      divTimer.classList.add('timer-warning');
    }
    divTimer.textContent = formatTiempo(tiempoRestante);
  }
  
  const transcurridoEl = document.getElementById('tiempo-transcurrido');
  const totalEl = document.getElementById('tiempo-total');
  
  if (transcurridoEl && totalEl) {
    transcurridoEl.textContent = formatTiempo(tiempoTranscurrido);
    totalEl.textContent = formatTiempo(tiempoInicial);
  }
  
  if (divProgreso && tiempoInicial > 0) {
    const porcentajeTranscurrido = ((tiempoInicial - tiempoRestante) / tiempoInicial) * 100;
    const porcentajeFinal = Math.max(0, Math.min(100, porcentajeTranscurrido));
    divProgreso.style.width = `${porcentajeFinal}%`;
    
    if (porcentajeFinal >= 90) {
      divProgreso.style.background = 'var(--danger-color)';
      divProgreso.style.boxShadow = '0 0 20px rgba(255, 68, 68, 0.5)';
    } else if (porcentajeFinal >= 75) {
      divProgreso.style.background = 'var(--warning-color)';
      divProgreso.style.boxShadow = '0 0 20px rgba(255, 140, 0, 0.5)';
    } else {
      divProgreso.style.background = 'var(--success-color)';
      divProgreso.style.boxShadow = '0 0 20px rgba(0, 255, 136, 0.5)';
    }
  }
  
  enviarEstadoAlPanel();
}

// ========================
// COMUNICACIÓN CON EL PANEL
// ========================

function enviarEstadoAlPanel() {
  if (!canal) {
    logger.warn('⚠️ No se puede enviar estado - canal no disponible');
    return;
  }

  let estadoTimer = estado;
  if (tiempoInicial === 0) {
    estadoTimer = 'inactivo';
  } else if (tiempoRestante === 0 && estado === 'finalizado') {
    estadoTimer = 'finalizado';
  } else if (tiempoInicial > 0 && estado === 'pausado' && tiempoRestante === tiempoInicial) {
    estadoTimer = 'configurado';
  }
  
  const estadoActual = {
    vista: modoActual,
    timer: estadoTimer,
    tiempoRestante: Math.max(0, tiempoRestante),
    tiempoTranscurrido: tiempoTranscurrido,
    tiempoInicial: tiempoInicial,
    porcentajeCompletado: tiempoInicial > 0 ? Math.round(((tiempoInicial - tiempoRestante) / tiempoInicial) * 100) : 0,
    pantalla: document.fullscreenElement ? 'completa' : 'ventana'
  };
  
  const mensaje = {
    tipo: 'status-update',
    estado: estadoActual,
    timestamp: Date.now()
  };
  
  try {
    canal.postMessage(mensaje);
    logger.comm('📤 Estado enviado al panel', estadoActual);
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

function mostrarAlerta(mensaje, duracion = 5000) {
  logger.info('🔔 Mostrando alerta temporal', { mensaje, duracion });
  
  const alerta = document.createElement('div');
  alerta.className = 'alerta-temporal';
  alerta.textContent = mensaje;
  
  document.body.appendChild(alerta);
  
  setTimeout(() => {
    if (alerta.parentNode) {
      alerta.parentNode.removeChild(alerta);
      logger.debug('🗑️ Alerta temporal removida');
    }
  }, duracion);
}

// ========================
// FUNCIONES DE TESTING Y DEBUG
// ========================

window.testMonitor = function() {
  logger.info('🧪 Ejecutando función de test del monitor');
  
  const estadoCompleto = {
    modoActual,
    estado,
    tiempoInicial,
    tiempoRestante,
    tiempoTranscurrido,
    pantallaCompleta: !!document.fullscreenElement,
    canalDisponible: !!canal,
    canalListener: !!canal?.onmessage,
    elementosTimer: {
      divTimer: !!divTimer,
      divProgreso: !!divProgreso
    }
  };
  
  logger.success('📊 Estado actual del monitor', estadoCompleto);
  console.table(estadoCompleto);
  return estadoCompleto;
};

window.simularMensaje = function(tipo, contenido) {
  logger.info('🧪 Simulando mensaje desde panel', { tipo, contenido });
  
  const mensajeSimulado = {
    tipo,
    timestamp: Date.now()
  };
  
  if (tipo === 'mensaje') {
    mensajeSimulado.mensajeHTML = contenido;
  } else if (tipo === 'iframe') {
    mensajeSimulado.url = contenido;
  } else if (tipo === 'timer-control') {
    mensajeSimulado.comando = contenido;
  }
  
  procesarMensajePanel(mensajeSimulado);
};

window.forzarPantallaCompleta = function() {
  logger.info('🧪 Forzando pantalla completa desde función de test');
  return intentarPantallaCompleta();
};

window.obtenerLogs = function() {
  return logger.logs;
};

window.exportarLogs = function() {
  const logs = logger.logs.map(log => 
    `[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}${log.data ? ' | ' + JSON.stringify(log.data) : ''}`
  ).join('\n');
  
  const blob = new Blob([logs], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `monitor-logs-${new Date().toISOString().slice(0, 19)}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  logger.success('💾 Logs exportados correctamente');
};

window.repararCanal = function() {
  logger.warn('🔧 Reparando canal de comunicación');
  
  if (canal) {
    canal.close();
  }
  
  canal = new BroadcastChannel('control_escenario');
  canal.onmessage = (event) => {
    logger.comm('📥 MENSAJE RECIBIDO DEL PANEL (REPARADO)', event.data);
    procesarMensajePanel(event.data);
  };
  
  canal.onerror = (error) => {
    logger.error('❌ Error en BroadcastChannel reparado', error);
  };
  
  logger.success('✅ Canal reparado correctamente');
  return canal;
};

// ========================
// DETECCIÓN DE PROBLEMAS COMUNES
// ========================

function verificarEstadoSistema() {
  const problemas = [];
  
  if (!canal) {
    problemas.push('Canal de comunicación no disponible');
  }
  
  if (!canal?.onmessage) {
    problemas.push('Listener del canal no configurado');
  }
  
  if (!contenedor) {
    problemas.push('Contenedor principal no encontrado');
  }
  
  if (modoActual === 'timer' && (!divTimer || !divProgreso)) {
    problemas.push('Elementos del timer no disponibles');
  }
  
  if (problemas.length > 0) {
    logger.error('🚨 Problemas detectados en el sistema', problemas);
    return false;
  }
  
  logger.success('✅ Sistema funcionando correctamente');
  return true;
}

// Verificar estado cada 10 segundos
setInterval(verificarEstadoSistema, 10000);

// ========================
// INICIALIZACIÓN AUTOMÁTICA
// ========================

// Mostrar mensaje de bienvenida en consola
console.log('%c🖥️ MONITOR DE ESCENARIO v2.2', 'color: #00ff88; font-size: 24px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);');
console.log('%c📡 Sistema de Logs Avanzado Activado', 'color: #0dcaf0; font-size: 16px; font-weight: bold;');
console.log('%c🔧 Creado por kombi.cl', 'color: #ffc107; font-size: 14px;');
console.log('%c💡 Presiona F12 para mostrar/ocultar panel de logs', 'color: #17a2b8; font-size: 12px;');

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    logger.info('📄 DOM cargado, iniciando sistema');
    inicializar();
  });
} else {
  logger.info('📄 DOM ya disponible, iniciando sistema inmediatamente');
  inicializar();
}

// Enviar estado periódicamente para mantener sincronización
setInterval(() => {
  if (canal && verificarEstadoSistema()) {
    enviarEstadoAlPanel();
  }
}, 5000);

// Mostrar funciones disponibles
setTimeout(() => {
  console.log('%c💡 FUNCIONES DE DEBUG DISPONIBLES:', 'color: #ffc107; font-weight: bold;');
  console.log('%c   testMonitor() - Ver estado completo del sistema', 'color: #ffffff;');
  console.log('%c   simularMensaje(tipo, contenido) - Simular mensajes del panel', 'color: #ffffff;');
  console.log('%c   forzarPantallaCompleta() - Activar pantalla completa', 'color: #ffffff;');
  console.log('%c   repararCanal() - Reparar comunicación si falla', 'color: #ffffff;');
  console.log('%c   logger.show() - Mostrar panel de logs', 'color: #ffffff;');
  console.log('%c   logger.clear() - Limpiar logs', 'color: #ffffff;');
  console.log('%c   exportarLogs() - Descargar logs como archivo', 'color: #ffffff;');
  console.log('%c🎯 ATAJOS DE TECLADO:', 'color: #e83e8c; font-weight: bold;');
  console.log('%c   F12 - Mostrar/Ocultar logs | F11 - Pantalla completa', 'color: #ffffff;');
  console.log('%c   Ctrl+R - Recargar | Escape - Salir pantalla completa', 'color: #ffffff;');
}, 3000);

logger.success('🎬 Monitor de Escenario cargado completamente con sistema de logs avanzado');