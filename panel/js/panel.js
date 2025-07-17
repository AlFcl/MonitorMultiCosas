// ========================
// js/panel.js (Panel de Control - Versión Final Completa)
// ========================

// Sistema de logs integrado
class Logger {
  constructor() {
    this.logs = [];
    this.maxLogs = 100;
    this.createLogPanel();
  }

  createLogPanel() {
    // Crear panel de logs flotante
    const logPanel = document.createElement('div');
    logPanel.id = 'debug-log-panel';
    logPanel.innerHTML = `
      <div style="position: fixed; top: 10px; right: 10px; width: 400px; max-height: 300px; 
                  background: rgba(0,0,0,0.9); color: #00ff00; padding: 10px; 
                  border-radius: 8px; font-family: monospace; font-size: 11px; 
                  z-index: 10000; overflow-y: auto; border: 2px solid #333;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <strong style="color: #ffff00;">🔍 Debug Log</strong>
          <div>
            <button onclick="window.logger.toggle()" style="background: #333; color: white; border: none; padding: 2px 8px; border-radius: 4px; cursor: pointer; margin-right: 5px;">Toggle</button>
            <button onclick="window.logger.clear()" style="background: #666; color: white; border: none; padding: 2px 8px; border-radius: 4px; cursor: pointer;">Clear</button>
          </div>
        </div>
        <div id="log-content" style="white-space: pre-wrap; word-break: break-word; max-height: 240px; overflow-y: auto;"></div>
      </div>
    `;
    document.body.appendChild(logPanel);
    this.logContent = document.getElementById('log-content');
    this.logPanel = logPanel;
  }

  log(level, message, data = null) {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = {
      timestamp,
      level,
      message,
      data
    };
    
    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Mostrar en consola
    console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`, data || '');
    
    // Mostrar en panel
    this.updateLogPanel();
  }

  updateLogPanel() {
    if (!this.logContent) return;
    
    const colors = {
      'error': '#ff4444',
      'warn': '#ffaa00', 
      'info': '#00aaff',
      'success': '#00ff88',
      'debug': '#888888'
    };

    const logText = this.logs.map(log => {
      const color = colors[log.level] || '#ffffff';
      const dataStr = log.data ? ` | ${JSON.stringify(log.data)}` : '';
      return `<span style="color: ${color}">[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}${dataStr}</span>`;
    }).join('\n');

    this.logContent.innerHTML = logText;
    this.logContent.scrollTop = this.logContent.scrollHeight;
  }

  toggle() {
    const content = this.logPanel.querySelector('#log-content').parentElement;
    content.style.display = content.style.display === 'none' ? 'block' : 'none';
  }

  clear() {
    this.logs = [];
    if (this.logContent) this.logContent.innerHTML = '';
  }

  error(message, data) { this.log('error', message, data); }
  warn(message, data) { this.log('warn', message, data); }
  info(message, data) { this.log('info', message, data); }
  success(message, data) { this.log('success', message, data); }
  debug(message, data) { this.log('debug', message, data); }
}

// Crear instancia global del logger
window.logger = new Logger();

class ControlPanel {
  constructor() {
    logger.info('🚀 Inicializando Panel de Control...');
    
    try {
      this.canal = new BroadcastChannel('control_escenario');
      logger.success('✅ BroadcastChannel creado correctamente');
    } catch (error) {
      logger.error('❌ Error creando BroadcastChannel', error);
      return;
    }

    this.tiempoActual = 0;
    this.tiempoTranscurrido = 0;
    this.tiempoInicial = 0;
    this.estadoTimer = 'inactivo';
    this.vistaActual = 'contenido';
    this.configuracion = this.cargarConfiguracion();
    this.intervaloPanelUpdate = null;
    this.ventanaEscenario = null;
    
    logger.info('📊 Estado inicial configurado');
    this.init();
  }

  init() {
    logger.info('🔧 Inicializando componentes del panel');
    
    try {
      this.setupEventListeners();
      this.restaurarConfiguracion();
      this.setupNotifications();
      this.setupKeyboardShortcuts();
      this.iniciarDeteccionVentana();
      this.solicitarEstadoInicial();
      this.iniciarActualizacionPeriodica();
      
      // Actualizar estado inicial
      this.actualizarBadgeVista('contenido');
      this.actualizarBadgeTimer('inactivo');
      this.actualizarEstadoContenido('contenido', document.getElementById('url').value);
      
      logger.success('✅ Panel de Control inicializado correctamente');
    } catch (error) {
      logger.error('❌ Error durante la inicialización', error);
    }
  }

  // ========================
  // DETECCIÓN DE VENTANA DEL ESCENARIO
  // ========================
  
  iniciarDeteccionVentana() {
    setInterval(() => {
      this.verificarEstadoVentana();
    }, 2000);
  }

  verificarEstadoVentana() {
    const indicator = document.querySelector('.connection-status .status-indicator');
    const text = document.querySelector('.connection-status small');
    
    if (this.ventanaEscenario && !this.ventanaEscenario.closed) {
      indicator.className = 'status-indicator online';
      text.textContent = '🖥️ Pantalla de Escenario Conectada';
      text.className = 'text-success';
    } else {
      indicator.className = 'status-indicator offline';
      text.textContent = '⚠️ Pantalla de Escenario Desconectada';
      text.className = 'text-warning';
      if (this.ventanaEscenario) {
        this.ventanaEscenario = null;
      }
    }
  }

  solicitarEstadoInicial() {
    logger.info('📡 Solicitando estado inicial del escenario');
    try {
      const mensaje = {
        tipo: 'request-status',
        timestamp: Date.now()
      };
      this.canal.postMessage(mensaje);
      logger.debug('📤 Solicitud de estado enviada');
    } catch (error) {
      logger.error('❌ Error enviando solicitud de estado', error);
    }
  }

  iniciarActualizacionPeriodica() {
    this.intervaloPanelUpdate = setInterval(() => {
      if (this.estadoTimer === 'activo') {
        this.actualizarTiempoLocal();
      }
      this.verificarEstadoVentana();
    }, 1000);
  }

  actualizarTiempoLocal() {
    if (this.tiempoInicial > 0 && this.estadoTimer === 'activo') {
      this.tiempoTranscurrido++;
      this.actualizarMostrarTiempo();
      this.actualizarEstadisticas();
    }
  }

  actualizarMostrarTiempo() {
    const tiempoDiv = document.getElementById('tiempo-restante');
    
    if (tiempoDiv && tiempoDiv.style.display !== 'none') {
      const tiempoRestante = Math.max(0, this.tiempoInicial - this.tiempoTranscurrido);
      const porcentaje = this.tiempoInicial > 0 ? Math.round((this.tiempoTranscurrido / this.tiempoInicial) * 100) : 0;
      
      tiempoDiv.innerHTML = `
        <div class="d-flex justify-content-between mb-2">
          <strong>⏱️ Tiempo Restante:</strong>
          <span class="tiempo-display ${tiempoRestante <= 30 ? 'text-danger fw-bold' : tiempoRestante <= 60 ? 'text-warning fw-bold' : 'text-success'}">${this.formatearTiempo(tiempoRestante)}</span>
        </div>
        <div class="d-flex justify-content-between mb-2">
          <strong>🕐 Transcurrido:</strong>
          <span class="tiempo-display text-info">${this.formatearTiempo(this.tiempoTranscurrido)}</span>
        </div>
        <div class="d-flex justify-content-between mb-2">
          <strong>⏰ Total:</strong>
          <span class="tiempo-display text-muted">${this.formatearTiempo(this.tiempoInicial)}</span>
        </div>
        <div class="progress mt-2" style="height: 8px;">
          <div class="progress-bar ${porcentaje >= 90 ? 'bg-danger' : porcentaje >= 75 ? 'bg-warning' : 'bg-success'}" 
               role="progressbar" 
               style="width: ${porcentaje}%" 
               aria-valuenow="${porcentaje}" 
               aria-valuemin="0" 
               aria-valuemax="100">
          </div>
        </div>
        <small class="text-muted d-block mt-1">Progreso: ${porcentaje}%</small>
      `;
    }
  }

  procesarActualizacionEstado(estado) {
    logger.info('📥 Actualizando estado desde escenario', estado);
    
    if (estado.tiempoInicial !== undefined) {
      this.tiempoInicial = estado.tiempoInicial;
    }
    
    if (estado.tiempoTranscurrido !== undefined) {
      this.tiempoTranscurrido = estado.tiempoTranscurrido;
    }
    
    if (estado.timer) {
      this.estadoTimer = estado.timer;
      this.actualizarBadgeTimer(estado.timer);
    }

    if (estado.vista) {
      this.vistaActual = estado.vista;
      this.actualizarBadgeVista(estado.vista);
    }
    
    this.actualizarMostrarTiempo();
    this.actualizarEstadisticas();
    
    if (estado.timer === 'finalizado') {
      logger.success('🎉 ¡Temporizador finalizado!');
      this.mostrarNotificacion('🎉 ¡Temporizador finalizado!', 'success');
      this.reproducirNotificacionSonora();
    }
  }

  // ========================
  // COMUNICACIÓN CON EL ESCENARIO
  // ========================
  
  enviarComando(comando, datos = {}) {
    logger.info(`📤 Enviando comando: ${comando}`);
    
    try {
      const mensaje = {
        tipo: 'timer-control',
        comando,
        tiempo: this.tiempoActual,
        timestamp: Date.now(),
        ...datos
      };
      
      this.canal.postMessage(mensaje);
      logger.success(`✅ Comando enviado: ${comando}`, mensaje);
    } catch (error) {
      logger.error(`❌ Error enviando comando ${comando}`, error);
      this.mostrarNotificacion('Error al enviar comando', 'error');
    }
  }

  mostrar(tipo) {
    logger.info(`🖥️ Mostrando contenido: ${tipo}`);
    
    const url = document.getElementById('url').value.trim();

    if (tipo === 'iframe') {
      if (!this.validarURL(url)) {
        logger.error('❌ URL inválida', url);
        this.mostrarNotificacion('URL inválida', 'error');
        return;
      }
      this.configuracion.urlDefecto = url;
      this.actualizarBadgeVista('contenido');
      this.actualizarEstadoContenido('contenido', url);
    }

    if (tipo === 'timer') {
      this.actualizarBadgeVista('temporizador');
      this.actualizarEstadoContenido('temporizador', 'Mostrando temporizador');
    }

    try {
      const data = {
        tipo: tipo,
        url: url,
        timestamp: Date.now()
      };
      
      this.canal.postMessage(data);
      this.guardarConfiguracion();
      this.mostrarNotificacion(`Mostrando ${tipo}`, 'success');
      logger.success(`✅ Comando mostrar enviado: ${tipo}`);
      
    } catch (error) {
      logger.error(`❌ Error mostrando ${tipo}`, error);
      this.mostrarNotificacion('Error al mostrar contenido', 'error');
    }
  }

  mostrarMensajeHTML(mensajeHTML) {
    logger.info('💬 Enviando mensaje HTML');
    
    if (!mensajeHTML.trim()) {
      logger.warn('⚠️ No se pudo reproducir sonido', error);
    }
  }

  // ========================
  // SISTEMA DE NOTIFICACIONES
  // ========================
  
  setupNotifications() {
    if (!document.getElementById('notifications')) {
      const container = document.createElement('div');
      container.id = 'notifications';
      container.className = 'position-fixed top-0 end-0 p-3';
      container.style.zIndex = '9999';
      document.body.appendChild(container);
    }
  }

  mostrarNotificacion(mensaje, tipo = 'info') {
    const container = document.getElementById('notifications');
    const id = 'notification-' + Date.now();
    
    const colores = {
      success: 'bg-success',
      error: 'bg-danger',
      warning: 'bg-warning text-dark',
      info: 'bg-info'
    };

    const iconos = {
      success: 'fas fa-check-circle',
      error: 'fas fa-exclamation-triangle',
      warning: 'fas fa-exclamation-circle',
      info: 'fas fa-info-circle'
    };

    const toast = document.createElement('div');
    toast.id = id;
    toast.className = `toast show ${colores[tipo]} text-white`;
    toast.innerHTML = `
      <div class="toast-body">
        <i class="${iconos[tipo]} me-2"></i>
        ${mensaje}
        <button type="button" class="btn-close btn-close-white float-end" onclick="document.getElementById('${id}').remove()"></button>
      </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      if (document.getElementById(id)) {
        document.getElementById(id).remove();
      }
    }, 3000);
  }

  // ========================
  // ATAJOS DE TECLADO
  // ========================
  
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if ((e.ctrlKey || e.metaKey)) {
        switch(e.key) {
          case '1':
            e.preventDefault();
            this.mostrar('iframe');
            break;
          case '2':
            e.preventDefault();
            this.mostrar('timer');
            break;
          case '3':
            e.preventDefault();
            this.mostrar('mensaje');
            break;
        }
      }

      switch(e.key) {
        case ' ':
          e.preventDefault();
          this.iniciarTimer();
          break;
        case 'r':
          if (e.shiftKey) {
            e.preventDefault();
            this.reiniciarTimer();
          }
          break;
        case 'u':
          e.preventDefault();
          this.actualizarTiempo();
          break;
      }
    });
  }

  // ========================
  // EVENT LISTENERS
  // ========================
  
  setupEventListeners() {
    ['url', 'horas', 'minutos', 'segundos'].forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener('change', () => {
          this.guardarConfiguracion();
        });
      }
    });

    ['horas', 'minutos', 'segundos'].forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener('input', (e) => {
          const value = parseInt(e.target.value);
          const max = id === 'horas' ? 23 : 59;
          
          if (value < 0) e.target.value = 0;
          if (value > max) e.target.value = max;
        });
      }
    });

    // Configurar listener para mensajes del escenario
    this.canal.addEventListener('message', (event) => {
      const { tipo, estado, tiempoTotal } = event.data;
      
      logger.info('📥 Mensaje recibido del escenario', event.data);
      
      if (tipo === 'status-update' && estado) {
        this.procesarActualizacionEstado(estado);
      }
      
      if (tipo === 'timer-finished') {
        logger.success('🎉 Timer finalizado');
        this.estadoTimer = 'finalizado';
        this.tiempoTranscurrido = tiempoTotal || this.tiempoInicial;
        this.actualizarBadgeTimer('finalizado');
        this.actualizarMostrarTiempo();
        this.mostrarNotificacion('🎉 ¡Temporizador finalizado!', 'success');
        this.reproducirNotificacionSonora();
      }
    });

    this.canal.addEventListener('error', (error) => {
      logger.error('❌ Error en BroadcastChannel', error);
    });
  }

  destruir() {
    if (this.intervaloPanelUpdate) {
      clearInterval(this.intervaloPanelUpdate);
    }
    
    if (this.ventanaEscenario && !this.ventanaEscenario.closed) {
      this.ventanaEscenario.close();
    }
    
    if (this.canal) {
      this.canal.close();
    }
    
    logger.success('✅ ControlPanel destruido');
  }
}

// ========================
// FUNCIONES GLOBALES
// ========================

let panelControl;

document.addEventListener('DOMContentLoaded', () => {
  logger.success('✅ Panel.js cargado correctamente');
  
  try {
    panelControl = new ControlPanel();
    window.panelControl = panelControl; // Para debugging
  } catch (error) {
    logger.error('❌ Error inicializando ControlPanel', error);
  }
});

// Funciones para los botones del HTML
function mostrar(tipo) {
  logger.info(`🎯 Función mostrar llamada: ${tipo}`);
  panelControl?.mostrar(tipo);
}

function enviarComando(comando) {
  logger.info(`🎯 Función enviarComando llamada: ${comando}`);
  switch(comando) {
    case 'start':
      panelControl?.iniciarTimer();
      break;
    case 'pause':
      panelControl?.pausarTimer();
      break;
    case 'reset':
      panelControl?.reiniciarTimer();
      break;
  }
}

function actualizarTiempo() {
  logger.info('🎯 Función actualizarTiempo llamada');
  panelControl?.actualizarTiempo();
}

function abrirPantalla() {
  logger.info('🎯 Función abrirPantalla llamada');
  panelControl?.abrirPantalla();
}

function setTiempoRapido(horas, minutos, segundos) {
  logger.info('🎯 Configurando tiempo rápido', { horas, minutos, segundos });
  document.getElementById('horas').value = horas;
  document.getElementById('minutos').value = minutos;
  document.getElementById('segundos').value = segundos;
  actualizarTiempo();
}

function setMensajeRapido(mensaje) {
  logger.info('🎯 Configurando mensaje rápido');
  if (window.editorInstance) {
    window.editorInstance.setContent(mensaje);
  } else {
    document.getElementById('mensaje').value = mensaje;
  }
  mostrar('mensaje');
}

function obtenerMensajeEditor() {
  if (window.editorInstance) {
    return window.editorInstance.getContent();
  }
  return document.getElementById('mensaje').value;
}

function insertarMensajeRapido(tipo) {
  logger.info(`🎯 Insertando mensaje rápido: ${tipo}`);
  // Esta función se implementa en el HTML
}

function limpiarMensaje() {
  logger.info('🎯 Limpiando mensaje');
  if (window.editorInstance) {
    window.editorInstance.setContent('');
  } else {
    document.getElementById('mensaje').value = '';
  }
}

// Limpiar al cerrar la ventana
window.addEventListener('beforeunload', () => {
  if (panelControl) {
    panelControl.destruir();
  }
});

// Funciones de testing para debugging
window.testearConexion = function() {
  logger.info('🧪 Iniciando test de conexión');
  
  if (!panelControl) {
    logger.error('❌ ControlPanel no inicializado');
    return;
  }
  
  logger.info('📡 Enviando mensaje de prueba...');
  panelControl.canal.postMessage({
    tipo: 'test',
    mensaje: 'Mensaje de prueba desde panel',
    timestamp: Date.now()
  });
  
  logger.info('✅ Mensaje de prueba enviado');
};

window.mostrarEstadisticas = function() {
  if (!panelControl) {
    logger.error('❌ ControlPanel no disponible');
    return;
  }
  
  const stats = {
    estadoTimer: panelControl.estadoTimer,
    vistaActual: panelControl.vistaActual,
    tiempoInicial: panelControl.tiempoInicial,
    tiempoTranscurrido: panelControl.tiempoTranscurrido,
    ventanaEscenario: panelControl.ventanaEscenario ? 'Abierta' : 'Cerrada',
    configuracion: panelControl.configuracion
  };
  
  logger.info('📊 Estadísticas del sistema', stats);
  console.table(stats);
};

// Funciones adicionales para compatibilidad con HTML inline
window.actualizarTiempoFinalizacion = function() {
  if (panelControl && panelControl.estadoTimer === 'activo') {
    const tiempoFin = panelControl.calcularTiempoEstimadoFinalizacion();
    const elemento = document.getElementById('tiempo-finalizacion');
    if (elemento) {
      elemento.textContent = tiempoFin;
    }
  }
};

window.actualizarEstadisticas = function(datos) {
  if (!panelControl) return;
  
  const {
    tiempoInicial = panelControl.tiempoInicial,
    tiempoTranscurrido = panelControl.tiempoTranscurrido,
    tiempoRestante = Math.max(0, panelControl.tiempoInicial - panelControl.tiempoTranscurrido),
    porcentaje = panelControl.tiempoInicial > 0 ? Math.round((panelControl.tiempoTranscurrido / panelControl.tiempoInicial) * 100) : 0
  } = datos || {};

  const elements = {
    'stat-tiempo-inicial': panelControl.formatearTiempo(tiempoInicial),
    'stat-tiempo-transcurrido': panelControl.formatearTiempo(tiempoTranscurrido),
    'stat-tiempo-restante': panelControl.formatearTiempo(tiempoRestante),
    'stat-porcentaje': porcentaje + '%'
  };

  Object.entries(elements).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  });

  const progressBar = document.getElementById('progress-global');
  if (progressBar) {
    progressBar.style.width = porcentaje + '%';
    progressBar.setAttribute('aria-valuenow', porcentaje);
    
    progressBar.className = 'progress-bar bg-gradient ';
    if (porcentaje >= 90) {
      progressBar.classList.add('bg-danger');
    } else if (porcentaje >= 75) {
      progressBar.classList.add('bg-warning');
    } else if (porcentaje >= 50) {
      progressBar.classList.add('bg-info');
    } else {
      progressBar.classList.add('bg-success');
    }
  }

  const statsPanel = document.getElementById('timer-stats');
  if (statsPanel) {
    statsPanel.style.display = tiempoInicial > 0 ? 'block' : 'none';
  }
};

window.formatearTiempoLocal = function(segundos) {
  if (segundos < 0) segundos = 0;
  
  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  const segs = segundos % 60;
  
  if (horas > 0) {
    return `${horas}:${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
  } else {
    return `${minutos}:${segs.toString().padStart(2, '0')}`;
  }
};

// Función para simular cambios de estado (útil para testing)
window.simularCambioEstado = function(tipo, valor) {
  if (panelControl) {
    switch(tipo) {
      case 'vista':
        panelControl.actualizarBadgeVista(valor);
        break;
      case 'timer':
        panelControl.actualizarBadgeTimer(valor);
        break;
      case 'contenido':
        panelControl.actualizarEstadoContenido('contenido', valor);
        break;
    }
  }
};

// Auto-actualización para mantener la sincronización
setInterval(() => {
  if (panelControl && panelControl.estadoTimer === 'activo') {
    window.actualizarTiempoFinalizacion();
  }
}, 1000);

logger.success('🚀 Panel JS cargado completamente');
console.log('💡 Funciones de debugging disponibles:');
console.log('   - testearConexion()');
console.log('   - mostrarEstadisticas()');
console.log('   - simularCambioEstado(tipo, valor)');
console.log('💡 Acceso directo:');
console.log('   - window.logger (sistema de logs)');
console.log('   - window.panelControl (instancia principal)');⚠️ Mensaje vacío');
      this.mostrarNotificacion('El mensaje no puede estar vacío', 'error');
      return;
    }

    // Validar longitud del contenido
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = mensajeHTML;
    const textoPlano = tempDiv.textContent || tempDiv.innerText || '';
    
    if (textoPlano.length > 800) {
      logger.warn('⚠️ Mensaje demasiado largo');
      this.mostrarNotificacion('El mensaje es demasiado largo (máximo 800 caracteres)', 'error');
      return;
    }

    this.configuracion.ultimoMensaje = textoPlano;
    this.actualizarBadgeVista('mensaje');
    this.actualizarEstadoContenido('mensaje', textoPlano);

    try {
      const data = {
        tipo: 'mensaje',
        mensaje: textoPlano,
        mensajeHTML: mensajeHTML,
        timestamp: Date.now()
      };
      
      this.canal.postMessage(data);
      this.guardarConfiguracion();
      this.mostrarNotificacion('Mensaje enviado con formato', 'success');
      logger.success('✅ Mensaje HTML enviado correctamente');
      
    } catch (error) {
      logger.error('❌ Error enviando mensaje HTML', error);
      this.mostrarNotificacion('Error al enviar mensaje', 'error');
    }
  }

  // ========================
  // CONTROL DEL TEMPORIZADOR
  // ========================
  
  actualizarTiempo() {
    const horas = parseInt(document.getElementById('horas').value) || 0;
    const minutos = parseInt(document.getElementById('minutos').value) || 0;
    const segundos = parseInt(document.getElementById('segundos').value) || 0;

    logger.info('⚙️ Actualizando tiempo', { horas, minutos, segundos });

    const errores = this.validarTiempo(horas, minutos, segundos);
    if (errores.length > 0) {
      logger.error('❌ Errores de validación', errores);
      this.mostrarNotificacion(errores.join('. '), 'error');
      return;
    }

    this.tiempoActual = horas * 3600 + minutos * 60 + segundos;
    this.tiempoInicial = this.tiempoActual;
    this.tiempoTranscurrido = 0;
    this.estadoTimer = 'configurado';
    this.configuracion.ultimoTiempo = { horas, minutos, segundos };
    
    this.enviarComando('setTime');
    this.guardarConfiguracion();
    this.actualizarBadgeTimer('configurado');
    this.mostrarNotificacion(`Tiempo configurado: ${this.formatearTiempo(this.tiempoActual)}`, 'success');
    logger.success(`✅ Tiempo actualizado: ${this.formatearTiempo(this.tiempoActual)} (${this.tiempoActual}s)`);
  }

  iniciarTimer() {
    logger.info('▶️ Iniciando timer');
    
    if (this.tiempoActual <= 0) {
      logger.warn('⚠️ No se puede iniciar: tiempo no configurado');
      this.mostrarNotificacion('Configura un tiempo válido primero', 'warning');
      return;
    }
    
    this.estadoTimer = 'activo';
    this.enviarComando('start');
    this.actualizarBadgeTimer('activo');
    this.mostrarNotificacion(`⏰ Temporizador iniciado: ${this.formatearTiempo(this.tiempoActual)}`, 'success');
    logger.success('✅ Timer iniciado');
  }

  pausarTimer() {
    logger.info('⏸️ Pausando timer');
    this.estadoTimer = 'pausado';
    this.enviarComando('pause');
    this.actualizarBadgeTimer('pausado');
    this.mostrarNotificacion('⏸️ Temporizador pausado', 'warning');
    logger.success('✅ Timer pausado');
  }

  reiniciarTimer() {
    logger.info('🔄 Reiniciando timer');
    if (confirm('¿Estás seguro de que quieres reiniciar el temporizador?')) {
      this.estadoTimer = 'configurado';
      this.tiempoTranscurrido = 0;
      this.enviarComando('reset');
      this.actualizarBadgeTimer('configurado');
      this.mostrarNotificacion('🔄 Temporizador reiniciado', 'info');
      logger.success('✅ Timer reiniciado');
    }
  }

  // ========================
  // ACTUALIZACIÓN DE BADGES DE ESTADO
  // ========================
  
  actualizarBadgeVista(vista) {
    const badge = document.getElementById('estado-vista');
    if (!badge) return;
    
    let texto = '';
    let clases = 'status-badge ';
    
    switch(vista) {
      case 'iframe':
      case 'contenido':
        texto = 'CONTENIDO WEB';
        clases += 'badge-vista-contenido';
        this.vistaActual = 'contenido';
        break;
      case 'timer':
      case 'temporizador':
        texto = 'TEMPORIZADOR';
        clases += 'badge-vista-temporizador';
        this.vistaActual = 'temporizador';
        break;
      case 'mensaje':
        texto = 'MENSAJE';
        clases += 'badge-vista-mensaje';
        this.vistaActual = 'mensaje';
        break;
      default:
        texto = 'DESCONOCIDO';
        clases += 'badge-timer-inactivo';
    }
    
    badge.className = clases;
    badge.textContent = texto;
  }

  actualizarBadgeTimer(estado) {
    const badge = document.getElementById('estado-timer');
    if (!badge) return;
    
    let texto = '';
    let clases = 'status-badge ';
    
    switch(estado) {
      case 'activo':
        texto = 'EN MARCHA';
        clases += 'badge-timer-activo';
        break;
      case 'pausado':
        texto = 'PAUSADO';
        clases += 'badge-timer-pausado';
        break;
      case 'finalizado':
        texto = '¡TERMINADO!';
        clases += 'badge-timer-finalizado';
        break;
      case 'configurado':
        texto = 'LISTO';
        clases += 'badge-timer-configurado';
        break;
      default:
        texto = 'INACTIVO';
        clases += 'badge-timer-inactivo';
    }
    
    badge.className = clases;
    badge.textContent = texto;
  }

  actualizarEstadoContenido(tipo, contenido) {
    const urlDiv = document.getElementById('url-actual');
    const mensajeDiv = document.getElementById('mensaje-actual');
    const tiempoDiv = document.getElementById('tiempo-restante');
    
    if (urlDiv) urlDiv.style.display = 'none';
    if (mensajeDiv) mensajeDiv.style.display = 'none';
    if (tiempoDiv) tiempoDiv.style.display = 'none';
    
    switch(tipo) {
      case 'contenido':
        if (urlDiv) {
          urlDiv.style.display = 'block';
          urlDiv.innerHTML = `
            <strong>🌐 URL Activa:</strong>
            <small class="url-display d-block mt-1">${contenido}</small>
          `;
        }
        break;
      case 'mensaje':
        if (mensajeDiv) {
          mensajeDiv.style.display = 'block';
          mensajeDiv.innerHTML = `
            <strong>💬 Mensaje:</strong>
            <small class="mensaje-display d-block mt-1">"${contenido}"</small>
          `;
        }
        break;
      case 'temporizador':
        if (tiempoDiv) {
          tiempoDiv.style.display = 'block';
          this.actualizarMostrarTiempo();
        }
        break;
    }
  }

  // ========================
  // UTILIDADES
  // ========================
  
  formatearTiempo(segundos) {
    if (segundos < 0) segundos = 0;
    
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segs = segundos % 60;
    
    if (horas > 0) {
      return `${horas}:${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
    } else {
      return `${minutos}:${segs.toString().padStart(2, '0')}`;
    }
  }

  calcularTiempoEstimadoFinalizacion() {
    if (this.estadoTimer === 'activo' && this.tiempoInicial > 0) {
      const tiempoRestante = this.tiempoInicial - this.tiempoTranscurrido;
      const ahora = new Date();
      const tiempoFin = new Date(ahora.getTime() + (tiempoRestante * 1000));
      
      return tiempoFin.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    }
    return '--:--:--';
  }

  abrirPantalla() {
    logger.info('🚀 Abriendo pantalla de escenario');
    
    try {
      const features = [
        'fullscreen=yes',
        'toolbar=no',
        'location=no',
        'directories=no',
        'status=no',
        'menubar=no',
        'scrollbars=no',
        'resizable=no',
        'width=' + screen.width,
        'height=' + screen.height,
        'left=' + screen.width,
        'top=0'
      ].join(',');
      
      this.ventanaEscenario = window.open('../monitor/index.html', 'MonitorEscenario', features);
      
      if (!this.ventanaEscenario) {
        logger.error('❌ No se pudo abrir la ventana');
        this.mostrarNotificacion('No se pudo abrir la ventana. Verifica los pop-ups bloqueados.', 'warning');
        return;
      }

      logger.success('✅ Ventana del escenario abierta');
      this.mostrarNotificacion('Pantalla de escenario abierta', 'success');
      
      setTimeout(() => {
        try {
          this.ventanaEscenario.focus();
          this.ventanaEscenario.postMessage({ action: 'requestFullscreen' }, '*');
        } catch (error) {
          logger.warn('⚠️ No se pudo controlar la ventana', error);
        }
      }, 1000);
      
    } catch (error) {
      logger.error('❌ Error abriendo pantalla', error);
      this.mostrarNotificacion('Error al abrir pantalla', 'error');
    }
  }

  // ========================
  // CONFIGURACIÓN Y PERSISTENCIA
  // ========================
  
  cargarConfiguracion() {
    const defaultConfig = {
      urlDefecto: 'https://kombi.cl',
      ultimoMensaje: '',
      ultimoTiempo: { horas: 0, minutos: 5, segundos: 0 }
    };

    try {
      const saved = localStorage.getItem('monitor_configuracion');
      return saved ? { ...defaultConfig, ...JSON.parse(saved) } : defaultConfig;
    } catch (error) {
      logger.error('❌ Error cargando configuración', error);
      return defaultConfig;
    }
  }

  guardarConfiguracion() {
    try {
      localStorage.setItem('monitor_configuracion', JSON.stringify(this.configuracion));
      logger.debug('💾 Configuración guardada');
    } catch (error) {
      logger.error('❌ Error guardando configuración', error);
    }
  }

  restaurarConfiguracion() {
    document.getElementById('url').value = this.configuracion.urlDefecto;
    document.getElementById('horas').value = this.configuracion.ultimoTiempo.horas;
    document.getElementById('minutos').value = this.configuracion.ultimoTiempo.minutos;
    document.getElementById('segundos').value = this.configuracion.ultimoTiempo.segundos;
    logger.success('✅ Configuración restaurada');
  }

  // ========================
  // VALIDACIONES
  // ========================
  
  validarURL(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  validarTiempo(horas, minutos, segundos) {
    const errors = [];
    
    if (horas < 0 || horas > 23) errors.push('Las horas deben estar entre 0-23');
    if (minutos < 0 || minutos > 59) errors.push('Los minutos deben estar entre 0-59');
    if (segundos < 0 || segundos > 59) errors.push('Los segundos deben estar entre 0-59');
    if (horas === 0 && minutos === 0 && segundos === 0) errors.push('El tiempo no puede ser 0');

    return errors;
  }

  actualizarEstadisticas() {
    const tiempoRestante = Math.max(0, this.tiempoInicial - this.tiempoTranscurrido);
    const porcentaje = this.tiempoInicial > 0 ? Math.round((this.tiempoTranscurrido / this.tiempoInicial) * 100) : 0;

    const statTiempoInicial = document.getElementById('stat-tiempo-inicial');
    const statTiempoTranscurrido = document.getElementById('stat-tiempo-transcurrido');
    const statTiempoRestante = document.getElementById('stat-tiempo-restante');
    const statPorcentaje = document.getElementById('stat-porcentaje');
    const progressGlobal = document.getElementById('progress-global');

    if (statTiempoInicial) statTiempoInicial.textContent = this.formatearTiempo(this.tiempoInicial);
    if (statTiempoTranscurrido) statTiempoTranscurrido.textContent = this.formatearTiempo(this.tiempoTranscurrido);
    if (statTiempoRestante) statTiempoRestante.textContent = this.formatearTiempo(tiempoRestante);
    if (statPorcentaje) statPorcentaje.textContent = porcentaje + '%';

    if (progressGlobal) {
      progressGlobal.style.width = porcentaje + '%';
      progressGlobal.setAttribute('aria-valuenow', porcentaje);
      
      progressGlobal.className = 'progress-bar bg-gradient ';
      if (porcentaje >= 90) {
        progressGlobal.classList.add('bg-danger');
      } else if (porcentaje >= 75) {
        progressGlobal.classList.add('bg-warning');
      } else if (porcentaje >= 50) {
        progressGlobal.classList.add('bg-info');
      } else {
        progressGlobal.classList.add('bg-success');
      }
    }

    const statsPanel = document.getElementById('timer-stats');
    if (statsPanel) {
      statsPanel.style.display = this.tiempoInicial > 0 ? 'block' : 'none';
    }
  }

  reproducirNotificacionSonora() {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 1);
      logger.info('🔊 Sonido de notificación reproducido');
    } catch (error) {
      logger.warn('⚠️ No se pudo reproducir sonido', error);
      this.mostrarNotificacion('No se pudo reproducir sonido de notificación', 'warning
      );
    }
  }
  