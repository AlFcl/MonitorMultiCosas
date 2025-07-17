// ========================
// panel/js/panel.js (Panel de Control Corregido - Versión Final con Logs)
// ========================

// Sistema de logs mejorado para el panel
class PanelLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 200;
    this.createLogPanel();
    this.isVisible = false;
  }

  createLogPanel() {
    const logPanel = document.createElement('div');
    logPanel.id = 'panel-debug-log';
    logPanel.innerHTML = `
      <div style="position: fixed; top: 10px; right: 10px; width: 500px; max-height: 450px; 
                  background: rgba(0,0,0,0.95); color: #00ff00; padding: 15px; 
                  border-radius: 12px; font-family: 'Courier New', monospace; font-size: 12px; 
                  z-index: 99999; overflow-y: auto; border: 2px solid #333;
                  backdrop-filter: blur(10px); display: none;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <strong style="color: #ffff00; font-size: 14px;">🎛️ Panel Debug Log</strong>
          <div>
            <button onclick="window.logger.testConexion()" style="background: #17a2b8; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; margin-right: 5px; font-size: 10px;">Test</button>
            <button onclick="window.logger.clear()" style="background: #dc3545; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; margin-right: 5px; font-size: 10px;">Clear</button>
            <button onclick="window.logger.toggle()" style="background: #6c757d; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 10px;">Hide</button>
          </div>
        </div>
        <div style="margin-bottom: 10px; padding: 8px; background: rgba(255, 193, 7, 0.1); border-radius: 6px; border-left: 4px solid #ffc107;">
          <div style="color: #ffc107; font-weight: bold; margin-bottom: 5px;">💡 Atajos y Funciones:</div>
          <div style="color: #ffffff; font-size: 11px; line-height: 1.4;">
            <strong>F12:</strong> Mostrar/Ocultar Logs | <strong>Ctrl+T:</strong> Test Conexión<br>
            <strong>testConexion():</strong> Probar comunicación | <strong>simularCambio():</strong> Test estados
          </div>
        </div>
        <div style="margin-bottom: 10px; padding: 6px; background: rgba(25, 135, 84, 0.1); border-radius: 6px;">
          <div style="color: #28a745; font-size: 11px;">
            <strong>Estado:</strong> <span id="panel-connection-status">Conectando...</span> | 
            <strong>Mensajes:</strong> <span id="panel-message-count">0</span> | 
            <strong>Heartbeat:</strong> <span id="panel-heartbeat">--:--:--</span>
          </div>
        </div>
        <div id="panel-log-content" style="white-space: pre-wrap; word-break: break-word; max-height: 300px; overflow-y: auto; line-height: 1.4;"></div>
        <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #444; font-size: 10px; color: #888;">
          Total logs: <span id="panel-log-count">0</span> | Última actualización: <span id="panel-last-update">--:--:--</span>
        </div>
      </div>
    `;
    document.body.appendChild(logPanel);
    
    this.logContent = document.getElementById('panel-log-content');
    this.logPanel = logPanel;
    this.logCountEl = document.getElementById('panel-log-count');
    this.lastUpdateEl = document.getElementById('panel-last-update');
    this.connectionStatusEl = document.getElementById('panel-connection-status');
    this.messageCountEl = document.getElementById('panel-message-count');
    this.heartbeatEl = document.getElementById('panel-heartbeat');
    
    this.messageCount = 0;
  }

  log(level, message, data = null) {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = {
      timestamp,
      level,
      message,
      data,
      id: Date.now() + Math.random()
    };
    
    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Mostrar en consola con colores
    const colors = {
      'error': 'color: #ff4444; font-weight: bold;',
      'warn': 'color: #ffaa00; font-weight: bold;',
      'info': 'color: #00aaff;',
      'success': 'color: #00ff88; font-weight: bold;',
      'debug': 'color: #888888;',
      'timer': 'color: #ffc107; font-weight: bold;',
      'comm': 'color: #e83e8c; font-weight: bold;',
      'ui': 'color: #6610f2; font-weight: bold;'
    };
    
    console.log(`%c[PANEL ${timestamp}] ${level.toUpperCase()}: ${message}`, colors[level] || '', data || '');
    
    // Actualizar panel visual
    this.updateLogPanel();
    
    // Actualizar contador de mensajes si es comunicación
    if (level === 'comm') {
      this.messageCount++;
      if (this.messageCountEl) {
        this.messageCountEl.textContent = this.messageCount;
      }
    }
  }

  updateLogPanel() {
    if (!this.logContent) return;
    
    const colors = {
      'error': '#ff4444',
      'warn': '#ffaa00', 
      'info': '#00aaff',
      'success': '#00ff88',
      'debug': '#888888',
      'timer': '#ffc107',
      'comm': '#e83e8c',
      'ui': '#6610f2'
    };

    const logText = this.logs.slice(-50).map(log => {
      const color = colors[log.level] || '#ffffff';
      const dataStr = log.data ? ` | ${JSON.stringify(log.data).substring(0, 100)}` : '';
      const icon = this.getLogIcon(log.level);
      return `<span style="color: ${color}; display: block; margin: 2px 0; padding: 2px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">${icon}[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}${dataStr}</span>`;
    }).join('');

    this.logContent.innerHTML = logText;
    this.logContent.scrollTop = this.logContent.scrollHeight;
    
    if (this.logCountEl) this.logCountEl.textContent = this.logs.length;
    if (this.lastUpdateEl) this.lastUpdateEl.textContent = new Date().toLocaleTimeString();
  }

  updateConnectionStatus(status) {
    if (this.connectionStatusEl) {
      const statusColors = {
        'conectado': '#00ff88',
        'desconectado': '#ff4444',
        'conectando': '#ffc107'
      };
      this.connectionStatusEl.style.color = statusColors[status] || '#ffffff';
      this.connectionStatusEl.textContent = status.toUpperCase();
    }
  }

  updateHeartbeat() {
    if (this.heartbeatEl) {
      this.heartbeatEl.textContent = new Date().toLocaleTimeString();
    }
  }

  getLogIcon(level) {
    const icons = {
      'error': '❌ ',
      'warn': '⚠️ ',
      'info': 'ℹ️ ',
      'success': '✅ ',
      'debug': '🔍 ',
      'timer': '⏱️ ',
      'comm': '📡 ',
      'ui': '🎨 '
    };
    return icons[level] || '• ';
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

  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  clear() {
    this.logs = [];
    this.messageCount = 0;
    if (this.logContent) this.logContent.innerHTML = '';
    if (this.logCountEl) this.logCountEl.textContent = '0';
    if (this.messageCountEl) this.messageCountEl.textContent = '0';
    this.success('🗑️ Logs limpiados');
  }

  testConexion() {
    this.info('🧪 Iniciando test de conexión manual');
    
    if (window.panelControl && window.panelControl.canal) {
      try {
        window.panelControl.canal.postMessage({
          tipo: 'test',
          mensaje: 'Test manual desde panel',
          timestamp: Date.now()
        });
        this.success('✅ Mensaje de test enviado correctamente');
      } catch (error) {
        this.error('❌ Error enviando mensaje de test', error);
      }
    } else {
      this.error('❌ Panel de control no disponible');
    }
  }

  // Métodos específicos por tipo de log
  error(message, data) { this.log('error', message, data); }
  warn(message, data) { this.log('warn', message, data); }
  info(message, data) { this.log('info', message, data); }
  success(message, data) { this.log('success', message, data); }
  debug(message, data) { this.log('debug', message, data); }
  timer(message, data) { this.log('timer', message, data); }
  comm(message, data) { this.log('comm', message, data); }
  ui(message, data) { this.log('ui', message, data); }
}

// Crear instancia global del logger
window.logger = new PanelLogger();

class ControlPanel {
  constructor() {
    logger.success('🚀 INICIANDO PANEL DE CONTROL v2.2');
    
    try {
      this.canal = new BroadcastChannel('control_escenario');
      logger.success('✅ BroadcastChannel creado correctamente');
      logger.updateConnectionStatus('conectado');
    } catch (error) {
      logger.error('❌ Error creando BroadcastChannel', error);
      logger.updateConnectionStatus('desconectado');
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
    this.heartbeatInterval = null;
    this.mensajesRecibidos = 0;
    
    logger.info('📊 Variables inicializadas', {
      estadoTimer: this.estadoTimer,
      vistaActual: this.vistaActual
    });
    
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
      this.iniciarHeartbeat();
      this.solicitarEstadoInicial();
      this.iniciarActualizacionPeriodica();
      
      // Actualizar estado inicial
      this.actualizarBadgeVista('contenido');
      this.actualizarBadgeTimer('inactivo');
      this.actualizarEstadoContenido('contenido', document.getElementById('url').value);
      
      logger.success('✅ Panel de Control inicializado correctamente');
      logger.updateConnectionStatus('conectado');
    } catch (error) {
      logger.error('❌ Error durante la inicialización', error);
      logger.updateConnectionStatus('desconectado');
    }
  }

  iniciarHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.canal) {
        try {
          this.canal.postMessage({
            tipo: 'heartbeat',
            timestamp: Date.now(),
            panel: 'activo'
          });
          logger.updateHeartbeat();
          logger.debug('💓 Heartbeat enviado al monitor');
        } catch (error) {
          logger.warn('⚠️ Error enviando heartbeat', error);
        }
      }
    }, 3000);
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
      if (indicator) {
        indicator.className = 'status-indicator online';
      }
      if (text) {
        text.textContent = '🖥️ Pantalla de Escenario Conectada';
        text.className = 'text-success';
      }
      logger.debug('🖥️ Ventana del escenario conectada');
    } else {
      if (indicator) {
        indicator.className = 'status-indicator offline';
      }
      if (text) {
        text.textContent = '⚠️ Pantalla de Escenario Desconectada';
        text.className = 'text-warning';
      }
      if (this.ventanaEscenario) {
        this.ventanaEscenario = null;
        logger.warn('⚠️ Ventana del escenario desconectada');
      }
    }
  }

  solicitarEstadoInicial() {
    logger.comm('📡 Solicitando estado inicial del monitor');
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
      
      // Log cada minuto
      if (this.tiempoTranscurrido % 60 === 0) {
        logger.timer(`⏱️ Tiempo transcurrido: ${this.formatearTiempo(this.tiempoTranscurrido)}`);
      }
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
    logger.comm('📥 Actualizando estado desde monitor', estado);
    
    if (estado.tiempoInicial !== undefined) {
      this.tiempoInicial = estado.tiempoInicial;
      logger.timer(`⏰ Tiempo inicial actualizado: ${this.formatearTiempo(this.tiempoInicial)}`);
    }
    
    if (estado.tiempoTranscurrido !== undefined) {
      this.tiempoTranscurrido = estado.tiempoTranscurrido;
    }
    
    if (estado.timer) {
      const estadoAnterior = this.estadoTimer;
      this.estadoTimer = estado.timer;
      this.actualizarBadgeTimer(estado.timer);
      
      if (estadoAnterior !== estado.timer) {
        logger.timer(`🔄 Estado del timer cambió: ${estadoAnterior} → ${estado.timer}`);
      }
    }

    if (estado.vista) {
      const vistaAnterior = this.vistaActual;
      this.vistaActual = estado.vista;
      this.actualizarBadgeVista(estado.vista);
      
      if (vistaAnterior !== estado.vista) {
        logger.ui(`🖥️ Vista cambió: ${vistaAnterior} → ${estado.vista}`);
      }
    }
    
    this.actualizarMostrarTiempo();
    this.actualizarEstadisticas();
    
    if (estado.timer === 'finalizado') {
      logger.success('🎉 ¡TEMPORIZADOR FINALIZADO!');
      this.mostrarNotificacion('🎉 ¡Temporizador finalizado!', 'success');
      this.reproducirNotificacionSonora();
    }
  }

  // ========================
  // COMUNICACIÓN CON EL ESCENARIO
  // ========================
  
  enviarComando(comando, datos = {}) {
    logger.comm(`📤 Enviando comando: ${comando}`, datos);
    
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
    logger.ui(`🖥️ Mostrando contenido: ${tipo}`);
    
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
      logger.success('✅ URL validada y configurada', url);
    }

    if (tipo === 'timer') {
      this.actualizarBadgeVista('temporizador');
      this.actualizarEstadoContenido('temporizador', 'Mostrando temporizador');
      logger.ui('⏱️ Vista cambiada a temporizador');
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
    logger.ui('💬 Enviando mensaje HTML al monitor');
    
    if (!mensajeHTML.trim()) {
      logger.warn('⚠️ Mensaje vacío');
      this.mostrarNotificacion('El mensaje no puede estar vacío', 'error');
      return;
    }

    // Validar longitud del contenido
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = mensajeHTML;
    const textoPlano = tempDiv.textContent || tempDiv.innerText || '';
    
    if (textoPlano.length > 800) {
      logger.warn('⚠️ Mensaje demasiado largo', { longitud: textoPlano.length });
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
      logger.success('✅ Mensaje HTML enviado correctamente', { longitud: mensajeHTML.length });
      
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

    logger.timer('⚙️ Actualizando tiempo del temporizador', { horas, minutos, segundos });

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
    logger.timer('▶️ Iniciando temporizador');
    
    if (this.tiempoActual <= 0) {
      logger.warn('⚠️ No se puede iniciar: tiempo no configurado');
      this.mostrarNotificacion('Configura un tiempo válido primero', 'warning');
      return;
    }
    
    this.estadoTimer = 'activo';
    this.enviarComando('start');
    this.actualizarBadgeTimer('activo');
    this.mostrarNotificacion(`⏰ Temporizador iniciado: ${this.formatearTiempo(this.tiempoActual)}`, 'success');
    logger.success('✅ Temporizador iniciado correctamente');
  }

  pausarTimer() {
    logger.timer('⏸️ Pausando temporizador');
    this.estadoTimer = 'pausado';
    this.enviarComando('pause');
    this.actualizarBadgeTimer('pausado');
    this.mostrarNotificacion('⏸️ Temporizador pausado', 'warning');
    logger.success('✅ Temporizador pausado correctamente');
  }

  reiniciarTimer() {
    logger.timer('🔄 Reiniciando temporizador');
    if (confirm('¿Estás seguro de que quieres reiniciar el temporizador?')) {
      this.estadoTimer = 'configurado';
      this.tiempoTranscurrido = 0;
      this.enviarComando('reset');
      this.actualizarBadgeTimer('configurado');
      this.mostrarNotificacion('🔄 Temporizador reiniciado', 'info');
      logger.success('✅ Temporizador reiniciado correctamente');
    } else {
      logger.info('🚫 Reinicio de temporizador cancelado por el usuario');
    }
  }

  // ========================
  // ACTUALIZACIÓN DE BADGES DE ESTADO
  // ========================
  
  actualizarBadgeVista(vista) {
    const badge = document.getElementById('estado-vista');
    if (!badge) {
      logger.warn('⚠️ Badge de vista no encontrado');
      return;
    }
    
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
        logger.warn('⚠️ Vista desconocida', vista);
    }
    
    badge.className = clases;
    badge.textContent = texto;
    logger.ui(`🎨 Badge de vista actualizado: ${texto}`);
  }

  actualizarBadgeTimer(estado) {
    const badge = document.getElementById('estado-timer');
    if (!badge) {
      logger.warn('⚠️ Badge de timer no encontrado');
      return;
    }
    
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
    logger.ui(`⏱️ Badge de timer actualizado: ${texto}`);
  }

  actualizarEstadoContenido(tipo, contenido) {
    const urlDiv = document.getElementById('url-actual');
    const mensajeDiv = document.getElementById('mensaje-actual');
    const tiempoDiv = document.getElementById('tiempo-restante');
    
    // Ocultar todos los divs primero
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
        logger.ui('🌐 Estado de contenido actualizado', contenido);
        break;
      case 'mensaje':
        if (mensajeDiv) {
          mensajeDiv.style.display = 'block';
          const preview = contenido.length > 50 ? contenido.substring(0, 50) + '...' : contenido;
          mensajeDiv.innerHTML = `
            <strong>💬 Mensaje:</strong>
            <small class="mensaje-display d-block mt-1">"${preview}"</small>
          `;
        }
        logger.ui('💬 Estado de mensaje actualizado', contenido.substring(0, 50));
        break;
      case 'temporizador':
        if (tiempoDiv) {
          tiempoDiv.style.display = 'block';
          this.actualizarMostrarTiempo();
        }
        logger.ui('⏱️ Estado de temporizador actualizado');
        break;
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
      logger.debug('🔔 Contenedor de notificaciones creado');
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
    }, 4000);

    logger.ui(`🔔 Notificación mostrada: ${tipo} - ${mensaje}`);
  }

  // ========================
  // ATAJOS DE TECLADO
  // ========================
  
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // No procesar si está escribiendo en un campo
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.contentEditable === 'true') {
        return;
      }

      // F12 para mostrar logs
      if (e.key === 'F12') {
        e.preventDefault();
        logger.toggle();
        return;
      }

      if ((e.ctrlKey || e.metaKey)) {
        switch(e.key) {
          case '1':
            e.preventDefault();
            this.mostrar('iframe');
            logger.ui('⌨️ Atajo Ctrl+1: Mostrar contenido');
            break;
          case '2':
            e.preventDefault();
            this.mostrar('timer');
            logger.ui('⌨️ Atajo Ctrl+2: Mostrar timer');
            break;
          case '3':
            e.preventDefault();
            this.mostrar('mensaje');
            logger.ui('⌨️ Atajo Ctrl+3: Mostrar mensaje');
            break;
          case 't':
          case 'T':
            e.preventDefault();
            logger.testConexion();
            break;
        }
      }

      switch(e.key) {
        case ' ':
          e.preventDefault();
          this.iniciarTimer();
          logger.ui('⌨️ Atajo Espacio: Iniciar timer');
          break;
        case 'r':
        case 'R':
          if (e.shiftKey) {
            e.preventDefault();
            this.reiniciarTimer();
            logger.ui('⌨️ Atajo Shift+R: Reiniciar timer');
          }
          break;
        case 'u':
        case 'U':
          e.preventDefault();
          this.actualizarTiempo();
          logger.ui('⌨️ Atajo U: Actualizar tiempo');
          break;
      }
    });

    logger.debug('⌨️ Atajos de teclado configurados');
  }

  // ========================
  // EVENT LISTENERS
  // ========================
  
  setupEventListeners() {
    logger.debug('🔗 Configurando event listeners del panel');

    // Guardar configuración cuando cambien los campos
    ['url', 'horas', 'minutos', 'segundos'].forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener('change', () => {
          this.guardarConfiguracion();
          logger.debug(`💾 Configuración guardada por cambio en ${id}`);
        });
      }
    });

    // Validar campos numéricos
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

    // Configurar listener para mensajes del monitor
    this.canal.addEventListener('message', (event) => {
      const { tipo, estado, tiempoTotal } = event.data;
      
      logger.comm('📥 Mensaje recibido del monitor', event.data);
      this.mensajesRecibidos++;
      
      if (tipo === 'status-update' && estado) {
        this.procesarActualizacionEstado(estado);
      }
      
      if (tipo === 'timer-finished') {
        logger.success('🎉 Timer finalizado - notificación recibida');
        this.estadoTimer = 'finalizado';
        this.tiempoTranscurrido = tiempoTotal || this.tiempoInicial;
        this.actualizarBadgeTimer('finalizado');
        this.actualizarMostrarTiempo();
        this.mostrarNotificacion('🎉 ¡Temporizador finalizado!', 'success');
        this.reproducirNotificacionSonora();
      }

      if (tipo === 'heartbeat') {
        logger.debug('💓 Heartbeat recibido del monitor');
      }

      if (tipo === 'test') {
        logger.success('🧪 Mensaje de test recibido del monitor', event.data);
      }
    });

    this.canal.addEventListener('error', (error) => {
      logger.error('❌ Error en BroadcastChannel', error);
      logger.updateConnectionStatus('desconectado');
    });

    logger.success('✅ Event listeners configurados correctamente');
  }

  // ========================
  // GESTIÓN DE VENTANA DEL ESCENARIO
  // ========================

  abrirPantalla() {
    logger.ui('🚀 Abriendo pantalla de escenario');
    
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
        logger.error('❌ No se pudo abrir la ventana del escenario');
        this.mostrarNotificacion('No se pudo abrir la ventana. Verifica los pop-ups bloqueados.', 'warning');
        return;
      }

      logger.success('✅ Ventana del escenario abierta correctamente');
      this.mostrarNotificacion('Pantalla de escenario abierta', 'success');
      
      // Intentar activar pantalla completa después de un delay
      setTimeout(() => {
        try {
          this.ventanaEscenario.focus();
          this.ventanaEscenario.postMessage({ action: 'requestFullscreen' }, '*');
          logger.debug('📡 Solicitud de pantalla completa enviada');
        } catch (error) {
          logger.warn('⚠️ No se pudo controlar la ventana del escenario', error);
        }
      }, 1000);
      
    } catch (error) {
      logger.error('❌ Error abriendo pantalla del escenario', error);
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
      const config = saved ? { ...defaultConfig, ...JSON.parse(saved) } : defaultConfig;
      logger.debug('💾 Configuración cargada', config);
      return config;
    } catch (error) {
      logger.error('❌ Error cargando configuración', error);
      return defaultConfig;
    }
  }

  guardarConfiguracion() {
    try {
      localStorage.setItem('monitor_configuracion', JSON.stringify(this.configuracion));
      logger.debug('💾 Configuración guardada correctamente');
    } catch (error) {
      logger.error('❌ Error guardando configuración', error);
    }
  }

  restaurarConfiguracion() {
    const urlField = document.getElementById('url');
    const horasField = document.getElementById('horas');
    const minutosField = document.getElementById('minutos');
    const segundosField = document.getElementById('segundos');

    if (urlField) urlField.value = this.configuracion.urlDefecto;
    if (horasField) horasField.value = this.configuracion.ultimoTiempo.horas;
    if (minutosField) minutosField.value = this.configuracion.ultimoTiempo.minutos;
    if (segundosField) segundosField.value = this.configuracion.ultimoTiempo.segundos;
    
    logger.success('✅ Configuración restaurada correctamente');
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

  actualizarEstadisticas() {
    const tiempoRestante = Math.max(0, this.tiempoInicial - this.tiempoTranscurrido);
    const porcentaje = this.tiempoInicial > 0 ? Math.round((this.tiempoTranscurrido / this.tiempoInicial) * 100) : 0;

    const elements = {
      'stat-tiempo-inicial': this.formatearTiempo(this.tiempoInicial),
      'stat-tiempo-transcurrido': this.formatearTiempo(this.tiempoTranscurrido),
      'stat-tiempo-restante': this.formatearTiempo(tiempoRestante),
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
      logger.success('🔊 Sonido de notificación reproducido');
    } catch (error) {
      logger.warn('⚠️ No se pudo reproducir sonido de notificación', error);
    }
  }

  destruir() {
    logger.info('🗑️ Destruyendo instancia del panel de control');
    
    if (this.intervaloPanelUpdate) {
      clearInterval(this.intervaloPanelUpdate);
    }
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    if (this.ventanaEscenario && !this.ventanaEscenario.closed) {
      this.ventanaEscenario.close();
    }
    
    if (this.canal) {
      this.canal.close();
    }
    
    logger.success('✅ Panel de control destruido correctamente');
  }
}

// ========================
// FUNCIONES GLOBALES
// ========================

let panelControl;

// Función de inicialización principal
document.addEventListener('DOMContentLoaded', () => {
  logger.success('✅ Panel.js cargado correctamente - DOM ready');
  
  try {
    panelControl = new ControlPanel();
    window.panelControl = panelControl; // Para debugging
    
    // Mostrar mensaje de bienvenida en consola
    console.log('%c🎛️ PANEL DE CONTROL v2.2', 'color: #ffc107; font-size: 24px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);');
    console.log('%c📡 Sistema de Comunicación Activado', 'color: #e83e8c; font-size: 16px; font-weight: bold;');
    console.log('%c🔧 Creado por kombi.cl', 'color: #17a2b8; font-size: 14px;');
    console.log('%c💡 Presiona F12 para mostrar/ocultar panel de logs', 'color: #28a745; font-size: 12px;');
    
  } catch (error) {
    logger.error('❌ Error inicializando ControlPanel', error);
    console.error('Error crítico inicializando panel:', error);
  }
});

// Funciones para los botones del HTML
function mostrar(tipo) {
  logger.ui(`🎯 Función mostrar llamada: ${tipo}`);
  if (panelControl) {
    panelControl.mostrar(tipo);
  } else {
    logger.error('❌ Panel de control no disponible');
  }
}

function enviarComando(comando) {
  logger.timer(`🎯 Función enviarComando llamada: ${comando}`);
  if (!panelControl) {
    logger.error('❌ Panel de control no disponible');
    return;
  }

  switch(comando) {
    case 'start':
      panelControl.iniciarTimer();
      break;
    case 'pause':
      panelControl.pausarTimer();
      break;
    case 'reset':
      panelControl.reiniciarTimer();
      break;
    default:
      logger.warn('⚠️ Comando desconocido', comando);
  }
}

function actualizarTiempo() {
  logger.timer('🎯 Función actualizarTiempo llamada');
  if (panelControl) {
    panelControl.actualizarTiempo();
  } else {
    logger.error('❌ Panel de control no disponible');
  }
}

function abrirPantalla() {
  logger.ui('🎯 Función abrirPantalla llamada');
  if (panelControl) {
    panelControl.abrirPantalla();
  } else {
    logger.error('❌ Panel de control no disponible');
  }
}

function setTiempoRapido(horas, minutos, segundos) {
  logger.timer('🎯 Configurando tiempo rápido', { horas, minutos, segundos });
  
  const horasField = document.getElementById('horas');
  const minutosField = document.getElementById('minutos');
  const segundosField = document.getElementById('segundos');
  
  if (horasField) horasField.value = horas;
  if (minutosField) minutosField.value = minutos;
  if (segundosField) segundosField.value = segundos;
  
  actualizarTiempo();
}

function setMensajeRapido(mensaje) {
  logger.ui('🎯 Configurando mensaje rápido');
  
  // Función para compatibilidad con diferentes editores
  if (window.editorInstance) {
    window.editorInstance.setContent(mensaje);
  } else if (window.editorContent) {
    window.editorContent.innerHTML = mensaje;
  } else {
    const mensajeField = document.getElementById('mensaje');
    if (mensajeField) {
      mensajeField.value = mensaje;
    }
  }
  
  mostrar('mensaje');
}

function obtenerMensajeEditor() {
  // Función para obtener contenido del editor
  if (window.editorInstance) {
    return window.editorInstance.getContent();
  } else if (window.editorContent) {
    return window.editorContent.innerHTML;
  } else {
    const mensajeField = document.getElementById('mensaje');
    return mensajeField ? mensajeField.value : '';
  }
}

function insertarMensajeRapido(tipo) {
  logger.ui(`🎯 Insertando mensaje rápido: ${tipo}`);
  
  let contenido = '';
  
  switch(tipo) {
    case 'bienvenida':
      contenido = '<h1 style="text-align: center; color: #ffc107;">¡Bienvenidos!</h1><p style="text-align: center; font-size: 1.3em;">Al evento de hoy</p>';
      break;
    case 'pausa':
      contenido = '<div style="text-align: center; padding: 20px;"><h2 style="color: #17a2b8;">⏰ PAUSA</h2><p><strong>Regresamos en 15 minutos</strong></p><p><em>Tiempo para descansar</em></p></div>';
      break;
    case 'despedida':
      contenido = '<div style="background: #28a745; color: white; padding: 15px; border-radius: 8px; text-align: center;"><h1>¡Gracias por participar!</h1><p>Hasta la próxima</p><p><strong>¡Que tengan un excelente día!</strong></p></div>';
      break;
    case 'urgente':
      contenido = '<div style="background: #dc3545; color: white; padding: 15px; border-radius: 8px; text-align: center;"><h1>🚨 URGENTE</h1><p style="font-size: 1.5em;"><strong>ATENCIÓN INMEDIATA</strong></p><p>Información crítica</p></div>';
      break;
    case 'anuncio':
      contenido = '<div style="background: #ffc107; color: black; padding: 15px; border-radius: 8px; text-align: center;"><h1>📢 ANUNCIO</h1><p style="font-size: 1.3em;"><strong>INFORMACIÓN IMPORTANTE</strong></p><p>Detalles del anuncio aquí</p></div>';
      break;
    default:
      logger.warn('⚠️ Tipo de mensaje rápido desconocido', tipo);
      return;
  }
  
  // Insertar contenido en el editor
  if (window.editorInstance) {
    window.editorInstance.setContent(contenido);
  } else if (window.editorContent) {
    window.editorContent.innerHTML = contenido;
    if (window.updateCharCount) window.updateCharCount();
  } else {
    const mensajeField = document.getElementById('mensaje');
    if (mensajeField) {
      mensajeField.value = contenido.replace(/<[^>]*>/g, ''); // Strip HTML para textarea simple
    }
  }
  
  logger.success(`✅ Mensaje rápido "${tipo}" insertado correctamente`);
}

function limpiarMensaje() {
  logger.ui('🎯 Limpiando mensaje');
  
  if (window.editorInstance) {
    window.editorInstance.setContent('');
  } else if (window.editorContent) {
    window.editorContent.innerHTML = '';
    if (window.updateCharCount) window.updateCharCount();
  } else {
    const mensajeField = document.getElementById('mensaje');
    if (mensajeField) {
      mensajeField.value = '';
    }
  }
  
  logger.success('✅ Mensaje limpiado correctamente');
}

// Limpiar recursos al cerrar la ventana
window.addEventListener('beforeunload', () => {
  logger.info('🚪 Ventana del panel cerrándose');
  if (panelControl) {
    panelControl.destruir();
  }
});

// ========================
// FUNCIONES DE TESTING Y DEBUG
// ========================

window.testearConexion = function() {
  logger.info('🧪 Iniciando test de conexión manual');
  
  if (!panelControl) {
    logger.error('❌ ControlPanel no inicializado');
    console.error('Panel de control no disponible');
    return false;
  }
  
  if (!panelControl.canal) {
    logger.error('❌ Canal de comunicación no disponible');
    return false;
  }
  
  try {
    const mensajeTest = {
      tipo: 'test',
      mensaje: 'Test de conexión desde panel',
      timestamp: Date.now(),
      testId: Math.random().toString(36).substr(2, 9)
    };
    
    panelControl.canal.postMessage(mensajeTest);
    logger.success('✅ Mensaje de test enviado correctamente', mensajeTest);
    
    // Mostrar también en la UI
    if (panelControl.mostrarNotificacion) {
      panelControl.mostrarNotificacion('Test de conexión enviado', 'info');
    }
    
    return true;
  } catch (error) {
    logger.error('❌ Error enviando test de conexión', error);
    return false;
  }
};

window.mostrarEstadisticas = function() {
  if (!panelControl) {
    logger.error('❌ ControlPanel no disponible');
    return null;
  }
  
  const stats = {
    estadoTimer: panelControl.estadoTimer,
    vistaActual: panelControl.vistaActual,
    tiempoInicial: panelControl.tiempoInicial,
    tiempoTranscurrido: panelControl.tiempoTranscurrido,
    tiempoActual: panelControl.tiempoActual,
    ventanaEscenario: panelControl.ventanaEscenario ? 'Abierta' : 'Cerrada',
    mensajesRecibidos: panelControl.mensajesRecibidos || 0,
    configuracion: panelControl.configuracion,
    canalDisponible: !!panelControl.canal,
    heartbeatActivo: !!panelControl.heartbeatInterval
  };
  
  logger.info('📊 Estadísticas del sistema', stats);
  console.table(stats);
  return stats;
};

window.simularCambioEstado = function(tipo, valor) {
  if (!panelControl) {
    logger.error('❌ Panel de control no disponible');
    return;
  }
  
  logger.info('🧪 Simulando cambio de estado', { tipo, valor });
  
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
    case 'mensaje':
      panelControl.actualizarEstadoContenido('mensaje', valor);
      break;
    default:
      logger.warn('⚠️ Tipo de simulación desconocido', tipo);
  }
};

window.enviarComandoManual = function(comando, datos = {}) {
  if (!panelControl) {
    logger.error('❌ Panel de control no disponible');
    return;
  }
  
  logger.info('🧪 Enviando comando manual', { comando, datos });
  panelControl.enviarComando(comando, datos);
};

window.forzarSincronizacion = function() {
  if (!panelControl) {
    logger.error('❌ Panel de control no disponible');
    return;
  }
  
  logger.info('🔄 Forzando sincronización con monitor');
  panelControl.solicitarEstadoInicial();
};

// Auto-actualización para mantener la sincronización
setInterval(() => {
  if (panelControl && panelControl.estadoTimer === 'activo') {
    // Actualizar estimación de tiempo de finalización si existe la función
    if (typeof window.actualizarTiempoFinalizacion === 'function') {
      window.actualizarTiempoFinalizacion();
    }
  }
}, 1000);

// Mostrar funciones disponibles después de cargar
setTimeout(() => {
  console.log('%c💡 FUNCIONES DE DEBUG DISPONIBLES:', 'color: #ffc107; font-weight: bold;');
  console.log('%c   testearConexion() - Probar comunicación con monitor', 'color: #ffffff;');
  console.log('%c   mostrarEstadisticas() - Ver estado completo del sistema', 'color: #ffffff;');
  console.log('%c   simularCambioEstado(tipo, valor) - Simular cambios de estado', 'color: #ffffff;');
  console.log('%c   enviarComandoManual(comando, datos) - Enviar comandos directos', 'color: #ffffff;');
  console.log('%c   forzarSincronizacion() - Solicitar estado del monitor', 'color: #ffffff;');
  console.log('%c   logger.show() - Mostrar panel de logs', 'color: #ffffff;');
  console.log('%c   logger.clear() - Limpiar logs', 'color: #ffffff;');
  console.log('%c🎯 ATAJOS DE TECLADO:', 'color: #e83e8c; font-weight: bold;');
  console.log('%c   F12 - Mostrar/Ocultar logs | Ctrl+T - Test conexión', 'color: #ffffff;');
  console.log('%c   Ctrl+1/2/3 - Cambiar vista | Espacio - Iniciar timer', 'color: #ffffff;');
  console.log('%c   Shift+R - Reiniciar timer | U - Actualizar tiempo', 'color: #ffffff;');
}, 3000);

logger.success('🚀 Panel de Control cargado completamente con sistema de logs avanzado');