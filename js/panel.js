const canal = new BroadcastChannel('control_escenario');
let tiempoInicial = 0;

function abrirPantalla() {
  window.open('index.html', '_blank');
}

function actualizarTiempo() {
  const horas    = parseInt(document.getElementById('horas').value)    || 0;
  const minutos  = parseInt(document.getElementById('minutos').value)  || 0;
  const segundos = parseInt(document.getElementById('segundos').value) || 0;
  tiempoInicial  = horas * 3600 + minutos * 60 + segundos;

  canal.postMessage({ tipo: 'timer-control', comando: 'setTime', tiempo: tiempoInicial });
}

function iniciarTimer() {
  actualizarTiempo();
  setTimeout(() => canal.postMessage({ tipo: 'timer-control', comando: 'start', tiempo: tiempoInicial }), 40);
}

function enviarComando(comando) {
  canal.postMessage({ tipo: 'timer-control', comando, tiempo: tiempoInicial });
}

function mostrar(tipo) {
  canal.postMessage({
    tipo,
    mensaje: document.getElementById('mensaje').value
  });
}
