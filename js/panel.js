// Canal de comunicación entre panel y escenario
const canal = new BroadcastChannel('control_escenario');
let tiempoActual = 0;

// Enviar comandos al escenario
function enviarComando(comando) {
  const data = {
    tipo: 'timer-control',
    comando,
    tiempo: tiempoActual
  };
  canal.postMessage(data);
}

// Calcular tiempo ingresado y enviarlo
function actualizarTiempo() {
  const horas = parseInt(document.getElementById('horas').value) || 0;
  const minutos = parseInt(document.getElementById('minutos').value) || 0;
  const segundos = parseInt(document.getElementById('segundos').value) || 0;
  tiempoActual = horas * 3600 + minutos * 60 + segundos;

  const data = {
    tipo: 'timer-control',
    comando: 'setTime',
    tiempo: tiempoActual
  };
  canal.postMessage(data);
}

// Enviar tipo de vista a mostrar (iframe, mensaje o timer)
function mostrar(tipo) {
  const data = {
    tipo: tipo,
    url: document.getElementById('url').value,
    mensaje: document.getElementById('mensaje').value
  };
  canal.postMessage(data);
}