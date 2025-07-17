// ========================
// js/panel.js (Panel de Control - Versión Corregida)
// ========================

class ControlPanel {
  constructor() {
    this.canal = new BroadcastChannel('control_escenario');
    this.tiempoActual = 0;
    this.tiempoTranscurrido = 0;
    this.tiempoInicial = 0;
    this.estadoTimer = 'inactivo';
    this.vistaActual = 'contenido';
    this.configuracion = this.cargarConfiguracion();
    this.intervaloPanelUpdate = null;
    this.ventanaEscenario = null;
    this.init();
  }

  init() {
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
  }

  // ========================
  // DETECCIÓN DE VENTANA DEL ESCENARIO
  // ========================
  
  iniciarDeteccionVentana() {
    // Verificar cada 2 segundos si la ventana del escenario está abierta
    setInterval(() => {
      this.verificarEstadoVentana();
    }, 2000);
  }

  verificarEstadoVentana() {
    const indicator = document.querySelector('.connection-status .status-indicator');
    const text = document.querySelector('.connection-status small');
    
    if (this.ventanaEscenario && !this.ventanaEscenario.closed) {
      // Ventana abierta
      indicator.className = 'status-indicator online';
      text.textContent = '🖥️ Pantalla de Escenario Conectada';
      text.className = 'text-success';
    } else {
      // Ventana cerrada o no existe
      indicator.className = 'status-indicator offline';
      text.textContent = '⚠️ Pantalla de Escenario Desconectada';
      text.className = 'text-warning';
      this.ventanaEscenario = null;
    }
  }

  // ========================
  // TIEMPO TRANSCURRIDO Y ACTUALIZACIÓN
  // ========================
  
  solicitarEstadoInicial() {
    this.canal.postMessage({
      tipo: 'request-status',
      timestamp: Date.now()
    });
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

      // Agregar animación de parpadeo si queda poco tiempo
      const tiempoRestanteSpan = tiempoDiv.querySelector('.text-danger');
      if (tiempoRestanteSpan && tiempoRestante <= 10) {
        tiempoRestanteSpan.style.animation = 'blink-danger 0.8s infinite';
      }
    }
  }

  procesarActualizacionEstado(estado) {
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
      this.mostrarNotificacion('🎉 ¡Temporizador finalizado!', 'success');
      this.reproducirNotificacionSonora();
    }
  }

  actualizarEstadisticas() {
    const tiempoRestante = Math.max(0, this.tiempoInicial - this.tiempoTranscurrido);
    const porcentaje = this.tiempoInicial > 0 ? Math.round((this.tiempoTranscurrido / this.tiempoInicial) * 100) : 0;

    // Actualizar elementos de estadísticas si existen
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
      
      // Cambiar clase de color
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

    // Mostrar/ocultar panel de estadísticas
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
    } catch (error) {
      console.log('No se pudo reproducir sonido de notificación:', error);
    }
  }

  // ========================
  // ACTUALIZACIÓN DE BADGES DE ESTADO
  // ========================
  
  actualizarBadgeVista(vista) {
    const badge = document.getElementById('estado-vista');
    if (badge) {
      let texto = '';
      let clases = 'status-badge ';
      
      badge.classList.add('slide-up');
      
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
      
      setTimeout(() => {
        badge.classList.remove('slide-up');
      }, 300);
    }
  }

  actualizarBadgeTimer(estado) {
    const badge = document.getElementById('estado-timer');
    if (badge) {
      let texto = '';
      let clases = 'status-badge ';
      
      badge.classList.add('slide-up');
      
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
      
      setTimeout(() => {
        badge.classList.remove('slide-up');
      }, 300);
    }
  }

  actualizarEstadoContenido(tipo, contenido) {
    const urlDiv = document.getElementById('url-actual');
    const mensajeDiv = document.getElementById('mensaje-actual');
    const tiempoDiv = document.getElementById('tiempo-restante');
    const container = document.getElementById('contenido-actual');
    
    if (!container) return;
    
    container.style.opacity = '0.5';
    
    setTimeout(() => {
      if (urlDiv) urlDiv.style.display = 'none';
      if (mensajeDiv) mensajeDiv.style.display = 'none';
      if (tiempoDiv) tiempoDiv.style.display = 'none';
      
      switch(tipo) {
        case 'contenido':
          if (urlDiv) {
            urlDiv.style.display = 'block';
            urlDiv.innerHTML = `
              <strong>🌐 URL Activa:</strong>
              <small class="url-display d-block mt-1" title="${contenido}">${contenido}</small>
            `;
          }
          break;
        case 'mensaje':
          if (mensajeDiv) {
            mensajeDiv.style.display = 'block';
            mensajeDiv.innerHTML = `
              <strong>💬 Mensaje Mostrado:</strong>
              <small class="mensaje-display d-block mt-1" title="${contenido}">"${contenido}"</small>
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
      
      container.style.opacity = '1';
    }, 150);
  }

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
    return null;
  }

  // ========================
  // CONFIGURACIÓN Y PERSISTENCIA
  // ========================
  
  cargarConfiguracion() {
    const defaultConfig = {
      urlDefecto: 'https://ictuesantacruz.cl',
      ultimoMensaje: '',
      ultimoTiempo: { horas: 0, minutos: 5, segundos: 0 }
    };

    try {
      const saved = localStorage.getItem('monitor_configuracion');
      return saved ? { ...defaultConfig, ...JSON.parse(saved) } : defaultConfig;
    } catch (error) {
      console.error('Error cargando configuración:', error);
      return defaultConfig;
    }
  }

  guardarConfiguracion() {
    try {
      localStorage.setItem('monitor_configuracion', JSON.stringify(this.configuracion));
    } catch (error) {
      console.error('Error guardando configuración:', error);
      this.mostrarNotificacion('Error al guardar configuración', 'error');
    }
  }

  restaurarConfiguracion() {
    document.getElementById('url').value = this.configuracion.urlDefecto;
    document.getElementById('mensaje').value = this.configuracion.ultimoMensaje;
    document.getElementById('horas').value = this.configuracion.ultimoTiempo.horas;
    document.getElementById('minutos').value = this.configuracion.ultimoTiempo.minutos;
    document.getElementById('segundos').value = this.configuracion.ultimoTiempo.segundos;
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

  sanitizarMensaje(mensaje) {
    return mensaje.trim().substring(0, 200);
  }

  // ========================
  // COMUNICACIÓN CON EL ESCENARIO
  // ========================
  
  enviarComando(comando, datos = {}) {
    try {
      const mensaje = {
        tipo: 'timer-control',
        comando,
        tiempo: this.tiempoActual,
        timestamp: Date.now(),
        ...datos
      };
      
      this.canal.postMessage(mensaje);
      console.log(`Comando enviado: ${comando}`, mensaje);
    } catch (error) {
      console.error('Error enviando comando:', error);
      this.mostrarNotificacion('Error al enviar comando', 'error');
    }
  }

  mostrar(tipo) {
    const url = document.getElementById('url').value.trim();

    if (tipo === 'iframe') {
      if (!this.validarURL(url)) {
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
      
      console.log('Comando enviado:', data);
    } catch (error) {
      console.error('Error mostrando contenido:', error);
      this.mostrarNotificacion('Error al mostrar contenido', 'error');
    }
  }

  // Nueva función para manejar mensajes HTML desde TinyMCE
  mostrarMensajeHTML(mensajeHTML) {
    if (!mensajeHTML.trim()) {
      this.mostrarNotificacion('El mensaje no puede estar vacío', 'error');
      return;
    }

    // Validar longitud del contenido de texto (sin HTML)
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = mensajeHTML;
    const textoPlano = tempDiv.textContent || tempDiv.innerText || '';
    
    if (textoPlano.length > 800) {
      this.mostrarNotificacion('El mensaje es demasiado largo (máximo 800 caracteres)', 'error');
      return;
    }

    // Guardar mensaje en configuración (solo texto plano para compatibilidad)
    this.configuracion.ultimoMensaje = textoPlano;
    this.actualizarBadgeVista('mensaje');
    this.actualizarEstadoContenido('mensaje', textoPlano);

    try {
      const data = {
        tipo: 'mensaje',
        mensaje: textoPlano,
        mensajeHTML: mensajeHTML, // Incluir HTML para el escenario
        timestamp: Date.now()
      };
      
      this.canal.postMessage(data);
      this.guardarConfiguracion();
      this.mostrarNotificacion('Mensaje enviado con formato', 'success');
      
      console.log('Mensaje HTML enviado:', data);
    } catch (error) {
      console.error('Error enviando mensaje:', error);
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

    const errores = this.validarTiempo(horas, minutos, segundos);
    if (errores.length > 0) {
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
  }

  iniciarTimer() {
    if (this.tiempoActual <= 0) {
      this.mostrarNotificacion('Configura un tiempo válido primero', 'warning');
      return;
    }
    this.estadoTimer = 'activo';
    this.enviarComando('start');
    this.actualizarBadgeTimer('activo');
    this.mostrarNotificacion(`⏰ Temporizador iniciado: ${this.formatearTiempo(this.tiempoActual)}`, 'success');
  }

  pausarTimer() {
    this.estadoTimer = 'pausado';
    this.enviarComando('pause');
    this.actualizarBadgeTimer('pausado');
    this.mostrarNotificacion('⏸️ Temporizador pausado', 'warning');
  }

  reiniciarTimer() {
    if (confirm('¿Estás seguro de que quieres reiniciar el temporizador?')) {
      this.estadoTimer = 'configurado';
      this.tiempoTranscurrido = 0;
      this.enviarComando('reset');
      this.actualizarBadgeTimer('configurado');
      this.mostrarNotificacion('🔄 Temporizador reiniciado', 'info');
    }
  }

  // ========================
  // UTILIDADES
  // ========================
  
  abrirPantalla() {
    try {
      this.ventanaEscenario = window.open('index.html', '_blank', 'fullscreen=yes,width=1920,height=1080');
      if (!this.ventanaEscenario) {
        this.mostrarNotificacion('No se pudo abrir la ventana. Verifica los pop-ups bloqueados.', 'warning');
      } else {
        this.mostrarNotificacion('Pantalla de escenario abierta', 'success');
        setTimeout(() => this.verificarEstadoVentana(), 1000);
      }
    } catch (error) {
      console.error('Error abriendo pantalla:', error);
      this.mostrarNotificacion('Error al abrir pantalla', 'error');
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
      if (e.target.tagName === 'INPUT') return;

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
    ['url', 'mensaje', 'horas', 'minutos', 'segundos'].forEach(id => {
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

    this.canal.addEventListener('message', (event) => {
      const { tipo, estado, tiempoTotal } = event.data;
      
      if (tipo === 'status-update' && estado) {
        console.log('Estado del escenario actualizado:', estado);
        this.procesarActualizacionEstado(estado);
      }
      
      if (tipo === 'timer-finished') {
        console.log('Timer finalizado');
        this.estadoTimer = 'finalizado';
        this.tiempoTranscurrido = tiempoTotal || this.tiempoInicial;
        this.actualizarBadgeTimer('finalizado');
        this.actualizarMostrarTiempo();
        this.mostrarNotificacion('🎉 ¡Temporizador finalizado!', 'success');
        this.reproducirNotificacionSonora();
      }
    });
  }

  destruir() {
    if (this.intervaloPanelUpdate) {
      clearInterval(this.intervaloPanelUpdate);
    }
    if (this.ventanaEscenario && !this.ventanaEscenario.closed) {
      this.ventanaEscenario.close();
    }
  }
}

// ========================
// FUNCIONES GLOBALES
// ========================

let panelControl;

document.addEventListener('DOMContentLoaded', () => {
  panelControl = new ControlPanel();
});

// Funciones para los botones del HTML
function mostrar(tipo) {
  panelControl?.mostrar(tipo);
}

function enviarComando(comando) {
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
  panelControl?.actualizarTiempo();
}

function abrirPantalla() {
  panelControl?.abrirPantalla();
}

// Funciones adicionales para el HTML
function setTiempoRapido(horas, minutos, segundos) {
  document.getElementById('horas').value = horas;
  document.getElementById('minutos').value = minutos;
  document.getElementById('segundos').value = segundos;
  actualizarTiempo();
}

function setMensajeRapido(mensaje) {
  document.getElementById('mensaje').value = mensaje;
  mostrar('mensaje');
}

// Limpiar al cerrar la ventana
window.addEventListener('beforeunload', () => {
  if (panelControl) {
    panelControl.destruir();
  }
});