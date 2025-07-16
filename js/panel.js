// ========================
// js/panel.js (Lógica del Panel - Versión Mejorada)
// ========================

class ControlPanel {
  constructor() {
    this.canal = new BroadcastChannel('control_escenario');
    this.tiempoActual = 0;
    this.configuracion = this.cargarConfiguracion();
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.restaurarConfiguracion();
    this.setupNotifications();
    this.setupKeyboardShortcuts();
  }

  // ========================
  // ACTUALIZACIÓN DE ESTADO DE LA INTERFAZ
  // ========================
  actualizarBadgeVista(vista) {
    const badge = document.getElementById('estado-vista');
    if (badge) {
      let texto = '';
      let clases = 'status-badge ';
      
      // Agregar animación de cambio
      badge.classList.add('slide-up');
      
      switch(vista) {
        case 'iframe':
          texto = 'Contenido Web';
          clases += 'badge-vista-contenido';
          break;
        case 'timer':
          texto = 'Temporizador';
          clases += 'badge-vista-temporizador';
          break;
        case 'mensaje':
          texto = 'Mensaje';
          clases += 'badge-vista-mensaje';
          break;
        default:
          texto = 'Desconocido';
          clases += 'badge-timer-inactivo';
      }
      
      badge.className = clases;
      badge.textContent = texto;
      
      // Remover la clase de animación después de un tiempo
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
      
      // Agregar animación de cambio
      badge.classList.add('slide-up');
      
      switch(estado) {
        case 'activo':
          texto = 'En Marcha';
          clases += 'badge-timer-activo';
          break;
        case 'pausado':
          texto = 'Pausado';
          clases += 'badge-timer-pausado';
          break;
        case 'finalizado':
          texto = '¡Terminado!';
          clases += 'badge-timer-finalizado';
          break;
        case 'configurado':
          texto = 'Listo';
          clases += 'badge-timer-configurado';
          break;
        default:
          texto = 'Inactivo';
          clases += 'badge-timer-inactivo';
      }
      
      badge.className = clases;
      badge.textContent = texto;
      
      // Remover la clase de animación después de un tiempo
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
    
    // Agregar efecto de transición
    container.style.opacity = '0.5';
    
    setTimeout(() => {
      // Ocultar todos primero
      urlDiv.style.display = 'none';
      mensajeDiv.style.display = 'none';
      tiempoDiv.style.display = 'none';
      
      switch(tipo) {
        case 'contenido':
          urlDiv.style.display = 'block';
          urlDiv.innerHTML = `
            <strong>URL Activa:</strong>
            <small class="url-display" title="${contenido}">${contenido}</small>
          `;
          break;
        case 'mensaje':
          mensajeDiv.style.display = 'block';
          mensajeDiv.innerHTML = `
            <strong>Mensaje Mostrado:</strong>
            <small class="mensaje-display" title="${contenido}">"${contenido}"</small>
          `;
          break;
        case 'temporizador':
          tiempoDiv.style.display = 'block';
          tiempoDiv.innerHTML = `
            <strong>Estado:</strong>
            <small class="tiempo-display">${contenido}</small>
          `;
          break;
      }
      
      // Restaurar opacidad con animación
      container.style.opacity = '1';
    }, 150);
  }

  actualizarTiempoRestante(tiempo) {
    const tiempoDiv = document.getElementById('tiempo-restante');
    if (tiempoDiv.style.display !== 'none') {
      const tiempoFormateado = this.formatearTiempo(tiempo);
      tiempoDiv.innerHTML = `
        <strong>Tiempo Restante:</strong>
        <small class="tiempo-display">${tiempoFormateado}</small>
      `;
      
      // Cambiar color según el tiempo restante
      const small = tiempoDiv.querySelector('small');
      if (tiempo <= 10) {
        small.style.color = '#dc3545'; // Rojo
      } else if (tiempo <= 60) {
        small.style.color = '#ffc107'; // Amarillo
      } else {
        small.style.color = '#20c997'; // Verde
      }
    }
  }

  formatearTiempo(segundos) {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segs = segundos % 60;
    
    if (horas > 0) {
      return `${horas}:${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
    } else {
      return `${minutos}:${segs.toString().padStart(2, '0')}`;
    }
  }

  // Función para notificar cambios al usuario
  notificarCambioEstado(mensaje) {
    // Actualizar indicador de conexión brevemente
    const indicator = document.querySelector('.status-indicator');
    const text = document.querySelector('.connection-status small');
    
    if (indicator && text) {
      const originalText = text.textContent;
      text.textContent = mensaje;
      indicator.style.background = '#ffc107';
      
      setTimeout(() => {
        text.textContent = originalText;
        indicator.style.background = 'var(--success-color)';
      }, 2000);
    }
  }

  // ========================
  // CONFIGURACIÓN Y PERSISTENCIA
  // ========================
  cargarConfiguracion() {
    const defaultConfig = {
      urlDefecto: 'https://ictuesantacruz.cl',
      ultimoMensaje: '',
      ultimoTiempo: { horas: 0, minutos: 5, segundos: 0 },
      tema: 'oscuro'
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
  // VALIDACIÓN DE DATOS
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
    return mensaje.trim().substring(0, 200); // Limitar a 200 caracteres
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
      this.mostrarNotificacion(`Comando ${comando} enviado`, 'success');
    } catch (error) {
      console.error('Error enviando comando:', error);
      this.mostrarNotificacion('Error al enviar comando', 'error');
    }
  }

  mostrar(tipo) {
    const url = document.getElementById('url').value.trim();
    const mensaje = document.getElementById('mensaje').value.trim();

    // Validaciones específicas por tipo
    if (tipo === 'iframe') {
      if (!this.validarURL(url)) {
        this.mostrarNotificacion('URL inválida', 'error');
        return;
      }
      this.configuracion.urlDefecto = url;
    }

    if (tipo === 'mensaje') {
      if (!mensaje) {
        this.mostrarNotificacion('El mensaje no puede estar vacío', 'error');
        return;
      }
      this.configuracion.ultimoMensaje = this.sanitizarMensaje(mensaje);
    }

    try {
      const data = {
        tipo: tipo,
        url: url,
        mensaje: this.sanitizarMensaje(mensaje),
        timestamp: Date.now()
      };
      
      this.canal.postMessage(data);
      this.guardarConfiguracion();
      this.mostrarNotificacion(`Mostrando ${tipo}`, 'success');
    } catch (error) {
      console.error('Error mostrando contenido:', error);
      this.mostrarNotificacion('Error al mostrar contenido', 'error');
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
    this.configuracion.ultimoTiempo = { horas, minutos, segundos };
    
    this.enviarComando('setTime');
    this.guardarConfiguracion();
  }

  iniciarTimer() {
    if (this.tiempoActual <= 0) {
      this.mostrarNotificacion('Configura un tiempo válido primero', 'warning');
      return;
    }
    this.enviarComando('start');
  }

  pausarTimer() {
    this.enviarComando('pause');
  }

  reiniciarTimer() {
    if (confirm('¿Estás seguro de que quieres reiniciar el temporizador?')) {
      this.enviarComando('reset');
    }
  }

  // ========================
  // UTILIDADES
  // ========================
  abrirPantalla() {
    try {
      const ventana = window.open('index.html', '_blank', 'fullscreen=yes');
      if (!ventana) {
        this.mostrarNotificacion('No se pudo abrir la ventana. Verifica los pop-ups bloqueados.', 'warning');
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
    // Crear contenedor de notificaciones si no existe
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

    // Auto-remover después de 3 segundos
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
      // Solo activar si no estamos en un input
      if (e.target.tagName === 'INPUT') return;

      // Ctrl/Cmd + número para cambiar vista
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

      // Teclas especiales para el timer
      switch(e.key) {
        case ' ': // Espacio para iniciar/pausar
          e.preventDefault();
          this.iniciarTimer();
          break;
        case 'r': // R para reiniciar
          if (e.shiftKey) {
            e.preventDefault();
            this.reiniciarTimer();
          }
          break;
        case 'u': // U para actualizar tiempo
          e.preventDefault();
          this.actualizarTiempo();
          break;
      }
    });

    // Mostrar ayuda de atajos
    this.mostrarAtajosAyuda();
  }

  mostrarAtajosAyuda() {
    const ayuda = document.createElement('div');
    ayuda.className = 'alert alert-dark mt-3';
    ayuda.innerHTML = `
      <h6><i class="fas fa-keyboard me-2"></i>Atajos de Teclado:</h6>
      <small>
        <strong>Ctrl+1:</strong> Mostrar Contenido | 
        <strong>Ctrl+2:</strong> Mostrar Timer | 
        <strong>Ctrl+3:</strong> Mostrar Mensaje<br>
        <strong>Espacio:</strong> Iniciar Timer | 
        <strong>Shift+R:</strong> Reiniciar Timer | 
        <strong>U:</strong> Actualizar Tiempo
      </small>
    `;
    document.querySelector('.container').appendChild(ayuda);
  }

  // ========================
  // EVENT LISTENERS
  // ========================
  setupEventListeners() {
    // Auto-guardar cuando cambian los inputs
    ['url', 'mensaje', 'horas', 'minutos', 'segundos'].forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener('change', () => {
          this.guardarConfiguracion();
        });
      }
    });

    // Validación en tiempo real para el timer
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

    // Escuchar mensajes del escenario (para sincronización bidireccional)
    this.canal.addEventListener('message', (event) => {
      const { tipo, estado } = event.data;
      if (tipo === 'status-update') {
        console.log('Estado del escenario actualizado:', estado);
        
        // Actualizar badges de estado con animación
        if (estado.vista) {
          this.actualizarBadgeVista(estado.vista);
          this.notificarCambioEstado(`Vista cambiada a: ${estado.vista}`);
        }
        
        // Actualizar estado del timer
        if (estado.timer) {
          this.actualizarBadgeTimer(estado.timer);
        }
        
        // Actualizar tiempo restante si está disponible
        if (estado.tiempoRestante !== undefined && estado.tiempoRestante >= 0) {
          this.actualizarTiempoRestante(estado.tiempoRestante);
        }
      }
    });
  }
}

// ========================
// FUNCIONES GLOBALES (para mantener compatibilidad con HTML)
// ========================
let panelControl;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  panelControl = new ControlPanel();
});

// Funciones globales para los botones del HTML
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