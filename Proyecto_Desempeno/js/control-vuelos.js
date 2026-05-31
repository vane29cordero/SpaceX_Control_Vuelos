// =============================================================================
//  🚀  SPACEX FLIGHT CONTROL CENTER
//  Centro de Control de Lanzamientos Espaciales
//
//  Proyecto de Desempeño · SENA Formación Complementaria 3406211
//  Módulo: JavaScript · Unidades 1 a 7
//
//  INSTRUCCIONES PARA EL APRENDIZ:
//  ─────────────────────────────────────────────────────────────────────────────
//  Este archivo está vacío. Tu tarea es implementar todas las funciones
//  necesarias para que la aplicación funcione de acuerdo al enunciado.
//
//  Pasos recomendados:
//    1. Lee el enunciado completo en ENUNCIADO.md
//    2. Abre spacex_control_vuelos.html en el navegador con F12 activo
//    3. Revisa el HTML para conocer los IDs disponibles
//    4. Revisa el CSS para conocer las clases que debes aplicar
//    5. Implementa las secciones de este archivo en orden
//
//  IMPORTANTE: No modifiques spacex_control_vuelos.html ni styles-vuelos.css
// =============================================================================


// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 1 — ALMACÉN DE DATOS
//
//  Declara aquí las constiables que guardarán el estado global de la aplicación:
//  la colección de lanzamientos registrados y cualquier constiable de control
//  que necesites para el funcionamiento de la interfaz.
//
//  Piensa en qué tipo de estructura de datos es más apropiada para
//  mantener una lista de registros, cada uno con múltiples propiedades.
// ─────────────────────────────────────────────────────────────────────────────

const lanzamientos = [];
let filtro = 'todos';
let idEdicion = null;
let id = 1;

// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 2 — FUNCIONES UTILITARIAS
//
//  Funciones de propósito general que pueden reutilizarse en distintas
//  partes del código. Considera qué operaciones se repiten frecuentemente
//  y valdría la pena encapsular como función auxiliar.
//
//  Por ejemplo: generar un identificador único para cada registro,
//  o transformar una fecha al formato que se mostrará en las tarjetas.
// ─────────────────────────────────────────────────────────────────────────────

function generarID () {
    const annActual = new Date().getFullYear();
    const numeroFormateado = String(id).padStart(3, '0');
    id++;
    return `SX-${annActual}-${numeroFormateado}`;
}

const gridHover = document.getElementById('grid-lanzamientos');
const formLanzamiento = document.getElementById('form-lanzamiento');

const gridLanzamientos = document.getElementById('grid-lanzamientos');
const btnCancelarE = document.getElementById('btn-cancelar-edicion');
const grupoFiltros = document.getElementById('grupo-filtros');

// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 3 — RENDERIZADO DE TARJETAS
//
//  Funciones que leen el almacén de datos y convierten cada lanzamiento
//  en un elemento HTML visible dentro del contenedor del grid.
//
//  La tarjeta debe construirse como un elemento del DOM con la estructura
//  documentada en el archivo HTML. Revisa los comentarios del grid para
//  conocer exactamente qué clases y atributos debe tener cada parte.
//
//  IDs relevantes del HTML:
//    · #grid-lanzamientos  → contenedor donde se insertan las tarjetas
//    · #estado-vacio       → se muestra cuando no hay tarjetas
//    · #contador-visibles  → muestra cuántas tarjetas son visibles
//    · #contador-lanzamientos → contador de vuelos en la topbar
// ─────────────────────────────────────────────────────────────────────────────

function renderizarTarjetas() {
    const contenedor = document.getElementById('grid-lanzamientos');
    contenedor.innerHTML = "";

    const estadoVacio = document.getElementById('estado-vacio');
    if (estadoVacio) {
        estadoVacio.classList.toggle('u-hidden', lanzamientos.length > 0);
    }

    let visibles = 0;

    lanzamientos.forEach(function (vuelo) {
        if (filtro.toLowerCase() !== 'todos' && vuelo.estado.toLowerCase() !== filtro.toLowerCase()) {
            return;
        }

        visibles++;

        const card = document.createElement('article');

        card.className = `organism-launch-card organism-launch-card--${vuelo.estado.toLowerCase()}`;
        card.setAttribute('data-id', vuelo.id);
        card.setAttribute('data-tipo', vuelo.tipoCohete);
        card.setAttribute('data-estado', vuelo.estado.toLowerCase());

        const esEditable = vuelo.estado.toLowerCase() === "pendiente";
        const attDisabled = esEditable ? '' : 'disabled';

        card.innerHTML = `
             <div class="molecule-card-header">
               <span class="molecule-card-header__id atom-mono">ID: ${vuelo.id}</span>
               <span class="atom-badge atom-badge--${vuelo.estado.toUpperCase()}">${vuelo.estado.toLowerCase()}</span>
             </div>

             <div class="molecule-card-body">
               <div class="molecule-card-body__name">${vuelo.nombreSerie}</div>
               <div class="molecule-card-body__type">${vuelo.tipoCohete.toUpperCase()}</div>
               <div class="molecule-card-body__objective">${vuelo.objetivoMision}</div>
               <div class="molecule-card-body__date atom-mono">${vuelo.fechaLanzamiento}</div>
             </div>

             <div class="molecule-card-footer">
               <button class="atom-btn atom-btn--secondary atom-btn--sm"
                       data-action="editar" data-id="${vuelo.id}" ${attDisabled}>EDITAR</button>
               <button class="atom-btn atom-btn--danger atom-btn--sm"
                       data-action="cancelar" data-id="${vuelo.id}" ${attDisabled}>CANCELAR</button>
             </div>
        `;
        contenedor.appendChild(card);
    });
    document.getElementById('contador-lanzamientos').textContent = lanzamientos.length;
    const palRegistro = visibles === 1 ? 'REGISTRO' : 'REGISTROS';
    document.getElementById('contador-visibles').textContent = `${visibles} ${palRegistro}`;
    estadisticas();
}

// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 4 — ANIMACIONES DE TARJETAS (HOVER)
//
//  Cada tarjeta creada debe escuchar eventos del cursor y responder
//  aplicando o removiendo la clase CSS que activa la animación.
//
//  La clase de activación está definida en el archivo de estilos.
//  El CSS ya tiene la transición configurada para entrada y salida.
//
//  Eventos que debes capturar en cada tarjeta:
//    · mouseover  → acticonst el estado de hover
//    · mouseout   → desacticonst el estado de hover
// ─────────────────────────────────────────────────────────────────────────────

function monitorearLanzamiento() {
    const ahoraMs = Date.now();
    let huboCambios = false;
    lanzamientos.forEach(function(vuelo) {
        if (vuelo.estado === "pendiente") {
            const fechaMs = new Date(vuelo.fechaLanzamiento + 'Z').getTime();
            if (fechaMs <= ahoraMs) {
                vuelo.estado = "lanzado";
                huboCambios = true;
            }
        }
    });
    if (huboCambios) {
        renderizarTarjetas();
    }
}

gridHover.addEventListener('mouseover', function (e) { 
    const tarjeta = e.target.closest('.organism-launch-card');
    if (tarjeta) {
        tarjeta.classList.add('is-hovered');
    }
});

gridHover.addEventListener('mouseout', function (e) { 
    const tarjeta = e.target.closest('.organism-launch-card');
    if (tarjeta) {
        tarjeta.classList.remove('is-hovered');
    }
});

// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 5 — FORMULARIO: REGISTRO Y EDICIÓN
//
//  Función que responde al evento de envío del formulario.
//  Debe leer el valor de cada campo, verificar que no estén vacíos,
//  construir el objeto del lanzamiento y añadirlo al almacén.
//  Si el campo oculto de edición contiene un ID, debe actualizar el
//  registro existente en lugar de crear uno nuevo.
//
//  IDs relevantes del HTML:
//    · #form-lanzamiento        → el elemento <form>
//    · #input-nombre-serie      → campo texto nombre
//    · #select-tipo-cohete      → campo selección tipo
//    · #input-fecha-lanzamiento → campo fecha y hora
//    · #input-objetivo-mision   → campo texto objetivo
//    · #input-id-edicion        → campo oculto con el ID en modo edición
//    · #btn-registrar           → botón principal del formulario
//    · #btn-cancelar-edicion    → botón para salir del modo edición
// ─────────────────────────────────────────────────────────────────────────────

formLanzamiento.addEventListener ('submit', function (e) {
    e.preventDefault(); // Evita que la página se recargue

    try {
        const nombre = document.getElementById('input-nombre-serie').value;
        const tipo = document.getElementById('select-tipo-cohete').value;
        const fecha = document.getElementById('input-fecha-lanzamiento').value;
        const texto = document.getElementById('input-objetivo-mision').value;

        if (nombre === "" || tipo === "" || fecha === "" || texto === "") {
            throw new Error("Campos incompletos.");
        } else {
            if (idEdicion === null) {
                const nuevoLanzamiento = {
                id: generarID(),
                nombreSerie: nombre,
                tipoCohete: tipo,
                fechaLanzamiento: fecha,
                objetivoMision: texto,
                estado: "pendiente"
                };
            lanzamientos.push(nuevoLanzamiento);
            
            } else {
                const vuelo = lanzamientos.find(function (item) {
                    return item.id === idEdicion;
                });

                if (vuelo && vuelo.estado.toLowerCase() === 'pendiente') {
                    vuelo.nombreSerie = nombre;
                    vuelo.tipoCohete = tipo;
                    vuelo.fechaLanzamiento = fecha;
                    vuelo.objetivoMision = texto;
                }

                idEdicion = null;
                document.getElementById('btn-registrar').textContent = "REGISTRAR LANZAMIENTO";
                document.getElementById('btn-cancelar-edicion').classList.add('u-hidden'); // add para que ya no se vea
            }
            renderizarTarjetas();
            formLanzamiento.reset();
        }
    } catch (error) {
        alert(error.message);
    }
});

// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 6 — CAMBIOS DE ESTADO
//
//  Funciones que modifican un lanzamiento existente:
//    · Modo edición: cargar los datos del registro en el formulario
//    · Cancelación: cambiar el estado del registro a "cancelado"
//
//  Las tarjetas tienen botones con los atributos data-id y data-action.
//  Puedes usar estos atributos para saber qué registro modificar y
//  qué acción ejecutar cuando el usuario hace clic.
// ─────────────────────────────────────────────────────────────────────────────

gridLanzamientos.addEventListener ('click', function (e) {
    const accion = (e.target.getAttribute('data-action'));

    if (!accion) return; 

    const idVuelo = e.target.getAttribute('data-id');
    const vuelo = lanzamientos.find(function (item) {
            return item.id === idVuelo;
    });

    if (vuelo && vuelo.estado.toLowerCase() === 'pendiente') {
        if (accion === 'cancelar') {
            vuelo.estado = "cancelado";

            if (idEdicion === idVuelo) {
                idEdicion = null;
                formLanzamiento.reset();
                document.getElementById('btn-registrar').textContent = "REGISTRAR LANZAMIENTO";
                btnCancelarE.classList.add('u-hidden');
            }
            renderizarTarjetas();
        }
        
        if (accion === 'editar') {
            if (vuelo) {
                document.getElementById('input-nombre-serie').value  = vuelo.nombreSerie;
                document.getElementById('select-tipo-cohete').value = vuelo.tipoCohete;
                document.getElementById('input-fecha-lanzamiento').value = vuelo.fechaLanzamiento;
                document.getElementById('input-objetivo-mision').value = vuelo.objetivoMision;
                
                idEdicion = idVuelo;

                document.getElementById('btn-registrar').textContent = "GUARDAR CAMBIOS";
                btnCancelarE.classList.remove('u-hidden'); // remove para que se pueda ver
            }
        }
    }

});

btnCancelarE.addEventListener ('click', function () {
    idEdicion = null;
    formLanzamiento.reset();
    document.getElementById('btn-registrar').textContent = "REGISTRAR LANZAMIENTO";
    btnCancelarE.classList.add('u-hidden');
    console.log("Edición cancelada por el usuario.");
});

// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 7 — FILTRADO POR ESTADO
//
//  Funciones que muestran u ocultan tarjetas según el filtro activo.
//  Al aplicar un filtro, solo deben verse las tarjetas que coincidan
//  con el estado seleccionado. El botón activo debe marcarse visualmente.
//
//  IDs relevantes del HTML:
//    · #grupo-filtros  → contenedor de los botones de filtro
//
//  Atributo en los botones de filtro: data-filter
//  Valores posibles: "todos" · "pendiente" · "lanzado" · "cancelado"
//
//  Clase CSS del botón activo: atom-btn--filter-active
// ─────────────────────────────────────────────────────────────────────────────

grupoFiltros.addEventListener('click', function (e) {
    if (e.target.hasAttribute('data-filter')) {
        // se quita la clase activa a todos los botones del grupo
        const botones = grupoFiltros.querySelectorAll('[data-filter]');
        botones.forEach(btn => btn.classList.remove('atom-btn--filter-active'));
        // se pone la clase activa al btón que tocaron
        e.target.classList.add('atom-btn--filter-active');
        filtro = e.target.getAttribute('data-filter');
        renderizarTarjetas();
    }
});

// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 8 — RELOJ Y MONITOREO AUTOMÁTICO
//
//  Un intervalo de tiempo que se ejecuta cada segundo y realiza dos tareas:
//
//    Tarea A: Reloj en tiempo real
//      Obtener la hora actual en UTC y mostrarla en el elemento del reloj
//      usando el formato HH:MM:SSZ (horas, minutos, segundos + letra Z).
//
//    Tarea B: Detección automática de lanzamientos
//      Recorrer el almacén y buscar registros con estado "pendiente"
//      cuya fecha programada ya se haya alcanzado o superado.
//      Cuando se detecte uno, cambiar su estado a "lanzado" y
//      actualizar la vista para reflejar el cambio.
//
//  ID relevante del HTML:
//    · #reloj-principal → elemento donde se despliega la hora
// ─────────────────────────────────────────────────────────────────────────────

function actualizarReloj() {
    const ahora = new Date();
    const horas = ahora.getUTCHours().toString().padStart(2, '0');
    const minutos = ahora.getUTCMinutes().toString().padStart(2, '0');
    const segundos = ahora.getUTCSeconds().toString().padStart(2, '0');
    let reloj = horas + ':' +  minutos + ':' + segundos + 'Z';
    document.getElementById('reloj-principal').textContent = reloj;
}

setInterval(function() {
    actualizarReloj();
    monitorearLanzamiento();
}, 1000);

// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 9 — ESTADÍSTICAS
//
//  Función que recorre el almacén, cuenta los registros por estado
//  y actualiza los elementos del panel de estadísticas con los totales.
//
//  IDs relevantes del HTML:
//    · #stat-pendientes  → contador de lanzamientos pendientes
//    · #stat-lanzados    → contador de lanzamientos ejecutados
//    · #stat-cancelados  → contador de lanzamientos cancelados
//    · #stat-total       → total de registros en el sistema
// ─────────────────────────────────────────────────────────────────────────────

function estadisticas() {
    const pendientes = lanzamientos.filter(function (vuelo) {
        return vuelo.estado.toLowerCase() === "pendiente";
    }).length;

    const lanzados = lanzamientos.filter(function (vuelo) {
        return vuelo.estado.toLowerCase() === "lanzado";
    }).length;

    const cancelados = lanzamientos.filter(function (vuelo) {
        return vuelo.estado.toLowerCase() === "cancelado";
    }).length;

    const total = lanzamientos.length;

    document.getElementById('stat-pendientes').textContent = pendientes;
    document.getElementById('stat-lanzados').textContent = lanzados;
    document.getElementById('stat-cancelados').textContent = cancelados;
    document.getElementById('stat-total').textContent = total;
}

// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 10 — INICIALIZACIÓN
//
//  Punto de arranque de la aplicación. Todo el código que necesita
//  interactuar con elementos del DOM debe ejecutarse aquí, dentro de
//  un mecanismo que garantice que la página ya terminó de cargar.
//
//  Desde aquí debes:
//    · Conectar los eventos del formulario y los botones
//    · Iniciar el intervalo del reloj y el monitor automático
//    · Hacer el primer renderizado y actualizar las estadísticas
// ─────────────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {
    actualizarReloj();
    renderizarTarjetas();
});