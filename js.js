// script.js
let facturas = JSON.parse(localStorage.getItem('facturas')) || [];

const form = document.getElementById('factura-form');
const facturasDiv = document.getElementById('facturas');
const pagadasDiv = document.createElement('div');
pagadasDiv.id = 'pagadas';
document.querySelector('.container').appendChild(pagadasDiv);

function mostrarFacturas() {
  facturasDiv.innerHTML = '';
  pagadasDiv.innerHTML = '<h2>Pagadas</h2>';

  facturas.forEach((factura, i) => {
    const diasRestantes = Math.ceil((new Date(factura.fecha) - new Date()) / (1000 * 60 * 60 * 24));

    const div = document.createElement('div');
    div.className = 'factura';

    if (!factura.pagado) {
      div.innerHTML = `
        <div>
          <strong>${factura.nombre}</strong><br>
          Fecha de pago: ${factura.fecha}<br>
          Faltan ${diasRestantes} días para pagar.
        </div>
        <button onclick="marcarPagado(${i})">Ya Pagado</button>
      `;
      facturasDiv.appendChild(div);
    } else {
      div.innerHTML = `
        <div>
          <strong>${factura.nombre}</strong><br>
          Fecha de pago: ${factura.fecha}<br>
          Estado: ✅ Pagado
        </div>
      `;
      pagadasDiv.appendChild(div);
    }
  });
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const nombre = document.getElementById('nombre').value;
  const fecha = document.getElementById('fecha').value;

  if (nombre && fecha) {
    const nuevaFactura = { nombre, fecha, pagado: false };
    facturas.push(nuevaFactura);
    localStorage.setItem('facturas', JSON.stringify(facturas));
    form.reset();
    mostrarFacturas();

    const diasRestantes = Math.ceil((new Date(fecha) - new Date()) / (1000 * 60 * 60 * 24));
    if (diasRestantes <= 5 && diasRestantes >= 0) {
      enviarNotificacion(`Faltan ${diasRestantes} días para pagar: ${nombre}`);
    }
  }
});

function marcarPagado(index) {
  facturas[index].pagado = true;
  localStorage.setItem('facturas', JSON.stringify(facturas));
  mostrarFacturas();
}

function enviarNotificacion(mensaje) {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    new Notification(mensaje);
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification(mensaje);
      }
    });
  }
}

function verificarNotificaciones() {
  const ahora = new Date();
  facturas.forEach(f => {
    const fechaPago = new Date(f.fecha);
    const diff = (fechaPago - ahora) / (1000 * 60 * 60 * 24);

    if (!f.pagado && diff <= 5 && diff >= 0) {
      const mensaje = `Faltan ${Math.ceil(diff)} días para pagar: ${f.nombre}`;
      enviarNotificacion(mensaje);
    }
  });
}

setInterval(() => {
  verificarNotificaciones();
}, 1000 * 60 * 60 * 3);

verificarNotificaciones();
mostrarFacturas();
