// BroadcastChannel para recibir mensajes del panel
const contenedor = document.getElementById('contenedor');
const canal = new BroadcastChannel('control_escenario');

let cuentaRegresiva;
let tiempoRestante = 0;
let estado = 'pausado';
let divTimer = null;

// Formatea el tiempo en formato HH:MM:SS
function formatTiempo(total) {
  const horas = String(Math.floor(total / 3600)).padStart(1, '0');
  const minutos = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  const segundos = String(total % 60).padStart(2, '0');
  return `${horas}:${minutos}:${segundos}`;
}

// Actualiza la pantalla del temporizador
function actualizarPantalla() {
  if (!divTimer) return;

  divTimer.classList.remove('timer-warning', 'timer-danger');

  if (tiempoRestante <= 5) {
    divTimer.classList.add('timer-danger');
  } else if (tiempoRestante <= 10) {
    divTimer.classList.add('timer-warning');
  }

  divTimer.textContent = formatTiempo(tiempoRestante);
}

// Ejecuta la cuenta regresiva
function iniciarCuenta() {
  if (cuentaRegresiva) clearInterval(cuentaRegresiva);
  cuentaRegresiva = setInterval(() => {
    if (estado !== 'activo') return;

    tiempoRestante--;
    actualizarPantalla();

    if (tiempoRestante <= 0) {
      clearInterval(cuentaRegresiva);
      divTimer.classList.remove('timer-warning', 'timer-danger');
      divTimer.textContent = "¡Tiempo!";
      estado = 'pausado';
    }
  }, 1000);
}

// Procesa los mensajes recibidos desde el panel
canal.onmessage = (event) => {
  const { tipo, url, mensaje, comando, tiempo } = event.data;

  if (tipo === 'iframe') {
    contenedor.innerHTML = '';
    const iframe = document.createElement('iframe');
    iframe.src = url || 'https://ejemplo.com/letras';
    contenedor.appendChild(iframe);
    divTimer = null;
  }

  if (tipo === 'mensaje') {
    contenedor.innerHTML = '';
    const div = document.createElement('div');
    div.id = 'mensaje';
    div.textContent = mensaje;
    contenedor.appendChild(div);
    divTimer = null;
  }

  if (tipo === 'timer-control') {
    // Si es la primera vez que se muestra el temporizador
    if (!divTimer) {
      contenedor.innerHTML = '';
      divTimer = document.createElement('div');
      divTimer.id = 'timer';
      contenedor.appendChild(divTimer);
    }

    // Comandos
    if (comando === 'setTime') {
      tiempoRestante = tiempo;
      estado = 'pausado';
      actualizarPantalla();
    }

    if (comando === 'start') {
      estado = 'activo';
      iniciarCuenta();
    }

    if (comando === 'pause') {
      estado = 'pausado';
    }

    if (comando === 'reset') {
      estado = 'pausado';
      actualizarPantalla();
    }
  }
};