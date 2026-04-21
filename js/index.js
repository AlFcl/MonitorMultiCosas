const contenedor = document.getElementById('contenedor');
const canal = new BroadcastChannel('control_escenario');

let cuentaRegresiva;
let tiempoRestante = 0;
let tiempoNegativo = 0;
let tiempoInicial = 0;
let estado = 'pausado';
let modoNegativo = false;
let divTimer = null;

window.addEventListener('DOMContentLoaded', () => {
  mostrarInicio();
});

function mostrarInicio() {
  if (cuentaRegresiva) clearInterval(cuentaRegresiva);
  divTimer = null;
  contenedor.innerHTML = '';
  const div = document.createElement('div');
  div.id = 'pantalla-inicio';
  div.innerHTML = `
    <img src="assets/logo.svg" alt="alf.cl" class="inicio-logo">
    <p class="inicio-subtitulo">Monitor listo</p>
    <span class="inicio-dot"></span>
  `;
  contenedor.appendChild(div);
}

function formatTiempo(total) {
  const abs = Math.abs(total);
  const horas = Math.floor(abs / 3600);
  const minutos = String(Math.floor((abs % 3600) / 60)).padStart(2, '0');
  const segundos = String(abs % 60).padStart(2, '0');
  const signo = total < 0 ? '+' : '';
  return horas > 0
    ? `${signo}${horas}:${minutos}:${segundos}`
    : `${signo}${minutos}:${segundos}`;
}

function actualizarPantalla() {
  if (!divTimer) return;
  divTimer.classList.remove('timer-warning', 'timer-danger', 'timer-negativo');

  if (modoNegativo) {
    divTimer.classList.add('timer-negativo');
    divTimer.textContent = formatTiempo(-tiempoNegativo);
  } else {
    if (tiempoRestante <= 5) {
      divTimer.classList.add('timer-danger');
    } else if (tiempoRestante <= 10) {
      divTimer.classList.add('timer-warning');
    }
    divTimer.textContent = formatTiempo(tiempoRestante);
  }
}

function iniciarCuenta() {
  if (cuentaRegresiva) clearInterval(cuentaRegresiva);
  cuentaRegresiva = setInterval(() => {
    if (estado !== 'activo') return;
    if (modoNegativo) {
      tiempoNegativo++;
      actualizarPantalla();
    } else {
      tiempoRestante--;
      actualizarPantalla();
      if (tiempoRestante <= 0) {
        modoNegativo = true;
        tiempoNegativo = 0;
      }
    }
  }, 1000);
}

canal.onmessage = (event) => {
  const { tipo, mensaje, comando, tiempo } = event.data;

  if (tipo === 'inicio') {
    mostrarInicio();
  }

  if (tipo === 'mensaje') {
    if (cuentaRegresiva) clearInterval(cuentaRegresiva);
    divTimer = null;
    contenedor.innerHTML = '';
    const div = document.createElement('div');
    div.id = 'mensaje';
    div.textContent = mensaje;
    contenedor.appendChild(div);
  }

  if (tipo === 'timer-control') {
    if (!divTimer) {
      contenedor.innerHTML = '';
      divTimer = document.createElement('div');
      divTimer.id = 'timer';
      contenedor.appendChild(divTimer);
    }

    if (comando === 'setTime') {
      if (cuentaRegresiva) clearInterval(cuentaRegresiva);
      tiempoRestante = tiempo;
      tiempoInicial = tiempo;
      modoNegativo = false;
      tiempoNegativo = 0;
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
      if (cuentaRegresiva) clearInterval(cuentaRegresiva);
      estado = 'pausado';
      tiempoRestante = tiempo;
      modoNegativo = false;
      tiempoNegativo = 0;
      actualizarPantalla();
    }
  }
};
