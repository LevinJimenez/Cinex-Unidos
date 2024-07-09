var baseUrl = "https://cinexunidos-production.up.railway.app/";

async function obtenerCines() {
    try {
        const response = await fetch(baseUrl + 'theatres');
        if (!response.ok) {
            throw new Error('Error al obtener cines');
        }
        const data = await response.json();
        console.log(data);
        return data; // Asegura que los datos se devuelvan
    } catch (error) {
        console.error('Error en obtenerCines:', error);
        return []; // Devuelve un arreglo vacío en caso de error para mantener la consistencia del tipo de retorno
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
        
        return data; // Asegura que los datos se devuelvan
    } catch (error) {
        console.error('Error en obtenerInfoFuncionSalaCine:', error);
        return []; // Devuelve un arreglo vacío en caso de error para mantener la consistencia del tipo de retorno
    }
}

function reservarAsiento(idCine, idSala, idFuncion,seatId){

    fetch(baseUrl + 'theatres/' + idCine + '/auditoriums/' + idSala + '/showtimes/' + idFuncion + '/reserve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          seat: seatId
        })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Error al reservar asiento');
        }
        return response.json();
      })
      .then(data => console.log(data))
      .catch(error => console.error('Error en reservarAsiento:', error));


}
function cancelarReserva(idCine, idSala,idFuncion,seatId){
    fetch(baseUrl + 'theatres/' + idCine + '/auditoriums/' + idSala + '/showtimes/' + idFuncion + '/reserve', {
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
        return response.json();
      })
      .then(data => console.log(data))
      .catch(error => console.error('Error en cancelarReserva:', error));
}
function infoAsiento(idCine,idSala,idFuncion){
    fetch(baseUrl + 'theatres/' + idCine + '/auditoriums/' + idSala + '/showtimes/' + idFuncion +'reservation-updates',{
    method : 'GET',
   
    })
    .then(response => {
        if (!response.ok) {
          throw new Error('Error al obtener información del asiento');
        }
        return response.json();
    })


}

// Suponiendo que obtenerCines es una función asíncrona que devuelve la lista de cines
// Marcar la función como async para usar await
async function cargarYMostrarCines() {
    try {
        // Usar await para esperar el resultado de obtenerCines
        const cines = await obtenerCines(); 
        
        // Asegúrate de que cines es un arreglo antes de intentar mostrarlos
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
        // Crea el card del cine
        const cineCard = document.createElement('div');
        cineCard.className = 'cine-card';

        // Añade la imagen del cine
        const cineImagen = document.createElement('img');
        cineImagen.src =baseUrl+cine.images[0]; 
       
        cineImagen.alt = `Imagen de ${cine.name}`;
        cineCard.appendChild(cineImagen);

        // Crea el footer del card
        const cineFooter = document.createElement('div');
        cineFooter.className = 'cine-footer';

        // Añade el nombre del cine al footer
        const cineNombre = document.createElement('h2');
        cineNombre.textContent = cine.name;
        cineFooter.appendChild(cineNombre);

        // Añade la ubicación del cine al footer
        const cineUbicacion = document.createElement('p');
        cineUbicacion.textContent = cine.location;
        cineFooter.appendChild(cineUbicacion);

        // Añade el footer al card
        cineCard.appendChild(cineFooter);
        cineCard.addEventListener('click', () => {
            document.getElementById('seleccionar-cine').style.display = 'none';
            document.getElementById('seleccionar-horario').style.display = 'block';
            document.getElementById('nombreCine').textContent = cine.name;
            colocarHorariosPorPelicula(cine);
        });
        
        // Añade el card al contenedor de cines
        cinesContenedor.appendChild(cineCard);

    });
}
function colocarHorariosPorPelicula(cine) {
    const horariosContenedor = document.getElementById('horarios-contenedor');
    horariosContenedor.innerHTML = '';
  console.log(cine);
// Paso 1: Crear estructura para almacenar películas y sus horarios por sala
const peliculas = {};

// Paso 2: Iterar sobre auditoriums y showtimes
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

// Paso 5: Mostrar películas, sus horarios, salas y póster
Object.values(peliculas).forEach(pelicula => {
  
    const peliculaContenedor = document.createElement('div');
    peliculaContenedor.className = 'pelicula-contenedor';

    // Crear y añadir el elemento img para el póster de la película
    const posterPelicula = document.createElement('img');
    posterPelicula.src = baseUrl+pelicula.poster; // Usar la URL del póster
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
            //crearLayoutAsientos(InfoSala);
            //encontrarFilaConMayorNumeroAsientos(InfoSala);
        });
        peliculaContenedor.appendChild(horarioCard);
    });
    horariosContenedor.appendChild(peliculaContenedor);
});
}
async function obtenerInformacionSala(idCine,idSala,idFuncion){
    try {
        // Usar await para esperar el resultado de obtenerInfoSalaCine
        const InfoSala = await obtenerInfoFuncionSalaCine(idCine,idSala,idFuncion);
        console.log(InfoSala);
        crearLayoutAsientos(InfoSala,idSala);
        colocarDatospelicula(InfoSala,idSala);
    } catch (error) {
        // Manejar cualquier error que pueda ocurrir durante la llamada
        console.error('Error al obtener la información de la sala:', error);
    }
}

addEventListener('DOMContentLoaded', () => {
    cargarYMostrarCines();
    //crearLayoutAsientos(datosSala);
    //colocarDatospelicula(datosSala);
    //obtenerInfoSalaCine("sambil-chacao","sala-1");
    //obtenerFuncionesSalaCine("sambil-chacao","sala-1");
    //obtenerInfoFuncionSalaCine("sambil-chacao","sala-1","17_45");
    //obtenerCines();
    //reservarAsiento("sambil-chacao","sala-1","17_45","O3");
    //cancelarReserva("sambil-chacao","sala-1","17_45","O3");
    

  });




  function encontrarFilaConMayorNumeroAsientos(datosSala) {
    // Verificar si datosSala o datosSala.seats no están definidos
    if (!datosSala || !datosSala.seats) {
        console.error('datosSala o datosSala.seats no están definidos');
        return ''; // O manejar el error de manera adecuada
    }

    let filaConMayorNumeroAsientos = '';
    let numeroMaximoAsientos = 0;

    for (const fila in datosSala.seats) {
        const numeroAsientosFila = datosSala.seats[fila].length;

        if (numeroAsientosFila > numeroMaximoAsientos) {
            numeroMaximoAsientos = numeroAsientosFila;
            filaConMayorNumeroAsientos = fila;
        }
    }

    return filaConMayorNumeroAsientos;
}
  function crearLayoutAsientos(datosSala,idSala) {
    const salaCine = document.getElementById('sala-cine');
    salaCine.innerHTML = '';
  
    // Asegúrate de que esta función maneje la nueva estructura de datosSala
    const numeroMaximoAsientos = encontrarFilaConMayorNumeroAsientos(datosSala);
    console.log(numeroMaximoAsientos);
  
    // Si la estructura de datosSala.seats ha cambiado, modifica este bucle
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
            // Asegúrate de que crearAsiento maneje cualquier cambio en la estructura de asiento
            const asientoHTML = crearAsiento(fila, asientoIndex+1, asiento);
            filaContenedor.appendChild(asientoHTML);
        }
  
        salaCine.appendChild(filaContenedor);
    }
  
    // Esta sección probablemente no necesite cambios a menos que la forma de calcular
    // el número máximo de asientos haya cambiado
    const filaNumeros = document.createElement('div');
    filaNumeros.classList.add('fila');
    const numeros = document.createElement('span');
    numeros.classList.add('letra-fila');
    numeros.textContent = '';
    filaNumeros.appendChild(numeros);
  
    for (let numeroAsiento = 0; numeroAsiento < numeroMaximoAsientos; numeroAsiento++) {
        const numeroElemento = document.createElement('div');
        numeroElemento.classList.add('numero-asiento');
        numeroElemento.textContent = numeroAsiento + 1; // Asegúrate de que esto refleje la nueva estructura
        filaNumeros.appendChild(numeroElemento);
    }
  
    salaCine.appendChild(filaNumeros);
}
  
  // Function to create an individual seat element
  function crearAsiento(fila, numeroAsiento, estadoAsiento) {
    const asientoHTML = document.createElement('div');
    asientoHTML.classList.add('asiento');
    asientoHTML.dataset.asiento = `${fila}${numeroAsiento}`; // Store seat ID
  
    // Apply styling based on seat availability
    switch (estadoAsiento) {
      case -1:
        asientoHTML.classList.add('no-disponible');
        break;
      case 0:
        asientoHTML.classList.add('disponible');
        break;
      case 1:
        asientoHTML.classList.add('ocupado');
        break;
      case 2:
        asientoHTML.classList.add('reservado');
        break;
      default:
        console.warn(`Unknown seat value: ${estadoAsiento}`);
        break;
    }
  
    return asientoHTML;
  }
  
  function colocarDatospelicula(datosSala,idSala) {
    // Verificar que datosSala y datosSala.movie existan
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
    document.getElementById('nombreCine').textContent = cine.name;
    colocarHorariosPorPelicula(cine);
  });

  const home = document.getElementById('home');
  home.addEventListener('click', () => {
    document.getElementById('seleccionar-cine').style.display = 'block';
    document.getElementById('seleccionar-horario').style.display = 'none';
    document.getElementById('contenedor-asientos').style.display = 'none';
    document.getElementById('nombreCine').textContent = cine.name;
    colocarHorariosPorPelicula(cine);
  });

  const atras = document.getElementById('atras');
  atras.addEventListener('click', () => {
    document.getElementById('seleccionar-cine').style.display = 'none';
    document.getElementById('seleccionar-horario').style.display = 'block';
    document.getElementById('contenedor-asientos').style.display = 'none';
    document.getElementById('nombreCine').textContent = cine.name;
    colocarHorariosPorPelicula(cine);
  });