/* ========================
   js/index.js (Lógica del Escenario - Versión Final Corregida)
   ======================== */

const contenedor = document.getElementById('contenedor');
const canal = new BroadcastChannel('control_escenario');
const URL_POR_DEFECTO = "https://ictuesantacruz.cl";

let cuentaRegresiva;
let tiempoRestante = 0;
let tiempoInicial = 0;
let tiempoTranscurrido = 0;
let estado = 'pausado';
let divTimer = null;
let divProgreso = null;
let tiempoInicioActual = null;
let modoActual = 'iframe'; // 'iframe', 'timer', 'mensaje'

// Mostrar URL por defecto al cargar
window.addEventListener('DOMContentLoaded', () => {
  mostrarIframe(URL_POR_DEFECTO);
  
  // Enviar estado inicial al panel
  setTimeout(() => {
    enviarEstadoAlPanel();
  }, 1000);
});

function mostrarIframe(url) {
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
  
  console.log('Mostrando iframe:', url);
  enviarEstadoAlPanel();
}

function mostrarMensaje(texto, esHTML = false) {
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
  
  console.log('Mostrando mensaje:', esHTML ? 'HTML' : 'texto', texto);
  enviarEstadoAlPanel();
}

function mostrarTimer() {
  contenedor.innerHTML = '';
  crearTimerContainer();
  modoActual = 'timer';
  
  console.log('Mostrando timer');
  actualizarPantalla();
  enviarEstadoAlPanel();
}

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

function crearTimerContainer() {
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
  
  console.log('Timer container creado');
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
  
  // Enviar actualización de estado al panel
  enviarEstadoAlPanel();
}

function iniciarCuenta() {
  if (cuentaRegresiva) clearInterval(cuentaRegresiva);
  
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
      
      // Notificar al panel que el timer terminó
      canal.postMessage({
        tipo: 'timer-finished',
        tiempoTotal: tiempoInicial,
        timestamp: Date.now()
      });
      
      console.log('Timer finalizado');
    }
  }, 1000);
  
  console.log('Timer iniciado');
}

function pausarTimer() {
  estado = 'pausado';
  if (cuentaRegresiva) {
    clearInterval(cuentaRegresiva);
  }
  actualizarPantalla();
  console.log('Timer pausado');
}

function reiniciarTimer() {
  estado = 'pausado';
  if (cuentaRegresiva) {
    clearInterval(cuentaRegresiva);
  }
  tiempoRestante = tiempoInicial;
  tiempoTranscurrido = 0;
  tiempoInicioActual = null;
  actualizarPantalla();
  console.log('Timer reiniciado');
}

function configurarTiempo(segundos) {
  tiempoInicial = segundos;
  tiempoRestante = segundos;
  tiempoTranscurrido = 0;
  estado = 'configurado';
  tiempoInicioActual = null;
  
  // Si estamos en modo timer, actualizar la pantalla
  if (modoActual === 'timer') {
    actualizarPantalla();
  }
  
  console.log('Tiempo configurado:', segundos, 'segundos');
}

function enviarEstadoAlPanel() {
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
  
  canal.postMessage(mensaje);
  console.log('Estado enviado al panel:', mensaje.estado);
}

// Manejar mensajes del panel
canal.onmessage = (event) => {
  const { tipo, url, mensaje, mensajeHTML, comando, tiempo } = event.data;
  
  console.log('Mensaje recibido:', event.data);

  if (tipo === 'iframe') {
    mostrarIframe(url);
  }

  if (tipo === 'mensaje') {
    // Si hay mensajeHTML, usarlo; si no, usar mensaje normal
    if (mensajeHTML) {
      mostrarMensaje(mensajeHTML, true); // true indica que es HTML
    } else {
      mostrarMensaje(mensaje, false); // false indica que es texto plano
    }
  }

  if (tipo === 'timer-control') {
    // Si no estamos en modo timer y recibimos un comando de timer, cambiar a modo timer
    if (modoActual !== 'timer') {
      mostrarTimer();
    }
    
    if (comando === 'setTime') {
      configurarTiempo(tiempo);
    }
    
    if (comando === 'start') {
      if (tiempoRestante > 0) {
        iniciarCuenta();
      } else {
        console.log('No se puede iniciar: tiempo restante es 0');
      }
    }
    
    if (comando === 'pause') {
      pausarTimer();
    }
    
    if (comando === 'reset') {
      reiniciarTimer();
    }
  }

  // Cuando se solicita mostrar el timer directamente
  if (tipo === 'timer') {
    mostrarTimer();
  }

  // Responder a solicitudes de estado
  if (tipo === 'request-status') {
    enviarEstadoAlPanel();
  }
};

// Detectar cuando se cierra la ventana
window.addEventListener('beforeunload', () => {
  if (cuentaRegresiva) {
    clearInterval(cuentaRegresiva);
  }
});

// Enviar estado cada 5 segundos para mantener sincronización
setInterval(() => {
  enviarEstadoAlPanel();
}, 5000);