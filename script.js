var baseUrl = "https://cinexunidos-production.up.railway.app/";
var asientosSeleccionados = [];
async function obtenerCines() {
    try {
        const response = await fetch(baseUrl + 'theatres');
        if (!response.ok) {
            throw new Error('Error al obtener cines');
        }
        const data = await response.json();
        console.log(data);
        return data; 
    } catch (error) {
        console.error('Error en obtenerCines:', error);
        return []; 
    }
}

function obtenerInfoCineDeterminado(id){
    fetch(baseUrl + 'theatres/' + id)
    .then(response => {
        if (!response.ok) {
          throw new Error('Error al obtener información del cine');
        }
        return response.json();
    })
    .then(data => console.log(data))
    .catch(error => console.error('Error en obtenerInfoCineDeterminado:', error));
}

function obtenerSalasCine(id){
    fetch(baseUrl + 'theatres/' + id + '/auditoriums')
    .then(response => {
        if (!response.ok) {
          throw new Error('Error al obtener salas del cine');
        }
        return response.json();
    })
    .then(data => console.log(data))
    .catch(error => console.error('Error en obtenerSalasCine:', error));
}

function obtenerInfoSalaCine(idCine, idSala){
    fetch(baseUrl + 'theatres/' + idCine + '/auditoriums/' + idSala)
    .then(response => {
        if (!response.ok) {
          throw new Error('Error al obtener información de la sala');
        }
        return response.json();
    })
    .then(data => console.log(data))
    .catch(error => console.error('Error en obtenerInfoSalaCine:', error));
}

async function obtenerInfoFuncionSalaCine(idCine, idSala, idFuncion) {
    try {
        const response = await fetch(baseUrl + 'theatres/' + idCine + '/auditoriums/' + idSala + '/showtimes/' + idFuncion);
        if (!response.ok) {
            throw new Error('Error al obtener información de la función');
        }
        const data = await response.json();
        console.log("si");
        console.log(data);
        
        return data; 
    } catch (error) {
        console.error('Error en obtenerInfoFuncionSalaCine:', error);
        return []; 
    }
}

async function reservarAsiento(parametrosSala, seatId) {
  try {
      const response = await fetch(baseUrl + 'theatres/' + parametrosSala.idCine + '/auditoriums/' + parametrosSala.idSala + '/showtimes/' + parametrosSala.idFuncion + '/reserve', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              seat: seatId
          })
      });

      if (!response.ok) {
          throw new Error('Error al reservar asiento');
      }
      asientosSeleccionados.push(seatId)
      console.log(asientosSeleccionados)
      await delay(600);
      recargarAsientos(seatId, 'reservado', parametrosSala);
      const data = await response.json();
      console.log(data);
  } catch (error) {
      console.error('Error en reservarAsiento:', error);
  }
}


function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function delayedFunction(milliseconds) {
  await new Promise(resolve => setTimeout(resolve, milliseconds));
  
  console.log("¡Después del retardo!");
}

function cancelarReserva(parametrosSala,seatId){
    fetch(baseUrl + 'theatres/' + parametrosSala.idCine + '/auditoriums/' + parametrosSala.idSala + '/showtimes/' + parametrosSala.idFuncion + '/reserve', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          seat: seatId
        })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Error al cancelar reserva');
        }
        asientosSeleccionados.pop(seatId)
        return response.json();
      })
      .then(data => console.log(data))
      .catch(error => console.error('Error en cancelarReserva:', error));
}
function infoAsiento(parametrosSala) {

  const evtSource = new EventSource(baseUrl + 'theatres/' + parametrosSala.idCine + '/auditoriums/' + parametrosSala.idSala + '/showtimes/' + parametrosSala.idFuncion +'/reservation-updates');
  evtSource.onmessage = (event) => { 
  const data = JSON.parse(event.data); 
  console.log(data);
   if (data.result === "SEAT_RESERVED") {
      
    recargarAsientos(data.seat,'reservado2',parametrosSala);      
    } else if (data.result === "SEAT_RELEASED") {
       
      recargarAsientos(data.seat,'disponible',parametrosSala); 
    }      
  };
}

async function cargarYMostrarCines() {
    try {
        const cines = await obtenerCines(); 
        if (Array.isArray(cines)) {
            mostrarCines(cines);
        } else {
            console.error('obtenerCines no devolvió un arreglo');
        }
    } catch (error) {
        console.error('Error al obtener cines:', error);
    }
}

function mostrarCines(cines) {
    const cinesContenedor = document.getElementById('cines-contenedor');

    cines.forEach(cine => {
        const cineCard = document.createElement('div');
        cineCard.className = 'cine-card';
        const cineImagen = document.createElement('img');
        cineImagen.src =baseUrl+cine.images[0]; 
        cineImagen.alt = `Imagen de ${cine.name}`;
        cineCard.appendChild(cineImagen);
        const cineFooter = document.createElement('div');
        cineFooter.className = 'cine-footer';
        const cineNombre = document.createElement('h2');
        cineNombre.textContent = cine.name;
        cineFooter.appendChild(cineNombre);
        const cineUbicacion = document.createElement('p');
        cineUbicacion.textContent = cine.location;
        cineFooter.appendChild(cineUbicacion);
        cineCard.appendChild(cineFooter);
        cineCard.addEventListener('click', () => {
            document.getElementById('seleccionar-cine').style.display = 'none';
            document.getElementById('seleccionar-horario').style.display = 'block';
            document.getElementById('nombreCine').textContent = cine.name;
            colocarHorariosPorPelicula(cine);
        });
        cinesContenedor.appendChild(cineCard);

    });
}
function colocarHorariosPorPelicula(cine) {
    const horariosContenedor = document.getElementById('horarios-contenedor');
    horariosContenedor.innerHTML = '';
  console.log(cine);
const peliculas = {};
cine.auditoriums.forEach(sala => {
    sala.showtimes.forEach(funcion => {
        const peliculaId = funcion.movie.id;
        if (!peliculas[peliculaId]) {
            peliculas[peliculaId] = {
                nombre: funcion.movie.name,
                horarios: [],
                poster: funcion.movie.poster,
                salaId: sala.id,  
            };
        }
        peliculas[peliculaId].horarios.push({
            sala: sala.name,
            idSala: sala.id,
            startTime: funcion.startTime,
            funcionId: funcion.id,
             
        });
    });
});
Object.values(peliculas).forEach(pelicula => {
  
    const peliculaContenedor = document.createElement('div');
    peliculaContenedor.className = 'pelicula-contenedor';
    const posterPelicula = document.createElement('img');
    posterPelicula.src = baseUrl+pelicula.poster; 
    posterPelicula.alt = `Póster de ${pelicula.nombre}`;
    posterPelicula.className = 'poster-pelicula';
    peliculaContenedor.appendChild(posterPelicula);
    const tituloPelicula = document.createElement('h3');
    tituloPelicula.textContent = pelicula.nombre;
    peliculaContenedor.appendChild(tituloPelicula);

    pelicula.horarios.forEach(horario => {
        const horarioCard = document.createElement('div');
        
        horarioCard.className = 'horario-card';
        horarioCard.textContent = `${horario.sala} - ${horario.startTime}`;
        horarioCard.addEventListener('click', () => {
           
            console.log(`Clic en horario de ${horario.sala} a las ${horario.startTime}`);
            document.getElementById('seleccionar-horario').style.display = 'none';
            document.getElementById('contenedor-asientos').style.display = 'block';
            console.log(cine.id);
            console.log(horario.idSala);
            console.log(horario.funcionId);
            obtenerInformacionSala(cine.id,horario.idSala,horario.funcionId);
        });
        peliculaContenedor.appendChild(horarioCard);
    });
    horariosContenedor.appendChild(peliculaContenedor);
});
}
async function obtenerInformacionSala(idCine,idSala,idFuncion){
    try {
        const InfoSala = await obtenerInfoFuncionSalaCine(idCine,idSala,idFuncion);
        console.log(InfoSala);
        const parametrosSala = {
          idCine: idCine,
          idSala: idSala,
          idFuncion: idFuncion
      };
        crearLayoutAsientos(InfoSala,idSala,parametrosSala);
        colocarDatospelicula(InfoSala,idSala);
    } catch (error) {
        console.error('Error al obtener la información de la sala:', error);
    }
}

addEventListener('DOMContentLoaded', () => {
    cargarYMostrarCines();
  });

  function encontrarNumeroMaximoAsientos(datosSala) {
    if (!datosSala || !datosSala.seats) {
        console.error('datosSala o datosSala.seats no están definidos');
        return 0; 
    }

    let numeroMaximoAsientos = 0;

    for (const fila in datosSala.seats) {
        const numeroAsientosFila = datosSala.seats[fila].length;

        if (numeroAsientosFila > numeroMaximoAsientos) {
            numeroMaximoAsientos = numeroAsientosFila;
        }
    }

    return numeroMaximoAsientos;
}
  function crearLayoutAsientos(datosSala,idSala,parametrosSala ) {
    const salaCine = document.getElementById('sala-cine');
    salaCine.innerHTML = '';
    const numeroMaximoAsientos = encontrarNumeroMaximoAsientos(datosSala);
    console.log(numeroMaximoAsientos);
    for (const fila in datosSala.seats) {
        const filaContenedor = document.createElement('div');
        filaContenedor.classList.add('fila');
        filaContenedor.id = `fila-${fila}`;
  
        const letraFila = document.createElement('span');
        letraFila.classList.add('letra-fila');
        letraFila.textContent = fila;
  
        filaContenedor.appendChild(letraFila);
  
        const asientosFila = datosSala.seats[fila];
        for (let asientoIndex = 0; asientoIndex < asientosFila.length; asientoIndex++) {
            const asiento = asientosFila[asientoIndex];
            const asientoHTML = crearAsiento(fila,asientoIndex,asiento,parametrosSala);
            filaContenedor.appendChild(asientoHTML);
        }
        
        salaCine.appendChild(filaContenedor);
    }
    const filaNumeros = document.createElement('div');
    filaNumeros.classList.add('fila');
    const numeros = document.createElement('span');
    numeros.classList.add('letra-fila');
    numeros.textContent = '';
    filaNumeros.appendChild(numeros);
  
    for (let numeroAsiento = 0; numeroAsiento < numeroMaximoAsientos; numeroAsiento++) {
        const numeroElemento = document.createElement('div');
        numeroElemento.classList.add('numero-asiento');
        numeroElemento.textContent = numeroAsiento ; 
        filaNumeros.appendChild(numeroElemento);
    }
  
    salaCine.appendChild(filaNumeros);
  
    infoAsiento(parametrosSala);
}
  function crearAsiento(fila, numeroAsiento, estadoAsiento,parametrosSala) {
    const asientoHTML = document.createElement('div');
    asientoHTML.classList.add('asiento');
    asientoHTML.dataset.asiento = `${fila}${numeroAsiento}`; 
    asientoHTML.id = `${fila}${numeroAsiento}`; 
    switch (estadoAsiento) {
      case -1:
        asientoHTML.classList.add('no-disponible');
        break;
      case 0:
        asientoHTML.classList.add('disponible');
        asientoHTML.onclick = () => {
          reservarAsiento(parametrosSala,`${fila}${numeroAsiento}`);      
        };
        break;
      case 1:
        asientoHTML.classList.add('ocupado');
        break;
      case 2:
        asientoHTML.classList.add('reservado3ro');
        
        break;
      default:
        console.warn(`Unknown seat value: ${estadoAsiento}`);
        break;
    }
  
    return asientoHTML;
  }
  
function recargarAsientos(idAsiento,accion,parametrosSala) {
  console.log(idAsiento);
  const asientoElement = document.getElementById(idAsiento);
  const classList = asientoElement.classList;

  switch (accion) {
   case 'reservado2':     
   classList.remove('disponible'); 
   classList.add('reservado3ro');   
   
     break;
    case 'disponible':
      classList.remove('reservado'); 
      classList.remove('reservado3ro');
      classList.add('disponible'); 
      
      asientoElement.onclick = () => {
        reservarAsiento(parametrosSala,idAsiento);      
      };
      break;
    case 'ocupado':
      classList.add('ocupado');
      break;
    case 'reservado':
      classList.remove('disponible'); 
      classList.add('reservado'); 
      
      asientoElement.onclick = () => {
        cancelarReserva(parametrosSala,idAsiento);      
      };
        break;
    default:
      
      console.warn('Clase de asiento no reconocida:', classList.value);
  }
  }
  function colocarDatospelicula(datosSala,idSala) {
    
    if (!datosSala || !datosSala.movie) {
      console.error('Datos de la sala o película no proporcionados o incompletos');
      return;
    }
    const imagenPelicula = document.getElementById('imagenPelicula');
    const nombrePelicula = document.getElementById('nombrePelicula');
    const clasificacionPelicula = document.getElementById('clasificacionPelicula');
    const duracionPelicula = document.getElementById('duracionPelicula');
    const horaFuncion = document.getElementById('horaFuncion');
    const salaFuncion = document.getElementById('salaFuncion');
  
    if (!imagenPelicula || !nombrePelicula || !clasificacionPelicula || !duracionPelicula || !horaFuncion || !salaFuncion) {
      console.error('Uno o más elementos del DOM no se encontraron');
      return;
    }
  
    const { movie, startTime, id } = datosSala;
    const { name, rating, runningTime, poster } = movie;
  

    imagenPelicula.src = baseUrl+poster;
    imagenPelicula.alt = `Imagen de la película ${name}`;
    nombrePelicula.textContent = name;
    clasificacionPelicula.textContent = `Clasificación: ${rating}`;
    duracionPelicula.textContent = `Duración: ${runningTime} minutos`; 
    horaFuncion.textContent = `Hora de la función: ${startTime}`;
    salaFuncion.textContent = `Sala: ${idSala}`;
  }

  const logo = document.getElementById('logo');
  logo.addEventListener('click', () => {
    document.getElementById('seleccionar-cine').style.display = 'block';
    document.getElementById('seleccionar-horario').style.display = 'none';
    document.getElementById('contenedor-asientos').style.display = 'none';
  });

  const home = document.getElementById('home');
  home.addEventListener('click', () => {
    document.getElementById('seleccionar-cine').style.display = 'block';
    document.getElementById('seleccionar-horario').style.display = 'none';
    document.getElementById('contenedor-asientos').style.display = 'none';
  });

  const atras = document.getElementById('atras');
  atras.addEventListener('click', () => {
    document.getElementById('seleccionar-cine').style.display = 'none';
    document.getElementById('seleccionar-horario').style.display = 'block';
    document.getElementById('contenedor-asientos').style.display = 'none';
  });

  const resumen = document.getElementById('pagar');
  resumen.addEventListener('click', () => {
  alert('Compra realizada con éxito. Asientos seleccionados: ' + asientosSeleccionados);
    document.getElementById('seleccionar-cine').style.display = 'block';
    document.getElementById('seleccionar-horario').style.display = 'none';
    document.getElementById('contenedor-asientos').style.display = 'none';
  });

  const help = document.getElementById('help');
  help.addEventListener('click', () => {
    document.getElementById('modal-help').style.display = 'block';
  });
  
  const cerrar = document.getElementById('cerrar-chat');
  cerrar.addEventListener('click', () => {
    document.getElementById('modal-help').style.display = 'none';
  });


  