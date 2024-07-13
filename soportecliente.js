
const username = 'Jose';
const $onlineStatus = document.querySelector('#status-online');
const $offlineStatus = document.querySelector('#status-offline');
const $usersList = document.querySelector('#users-list');
const $chatForm = document.querySelector('form');
const $messageInput = document.querySelector('input');
const $chatElement = document.querySelector('#chat');
const $username = document.querySelector('#username');
const $lastSeen = document.querySelector('#last-seen');
const $usernamePic = document.querySelector('#username-pic');
const $disconnectBtn = document.querySelector('#disconnect-btn');


const renderMessage = (payload) => {
    const { id, message, name } = payload;
    if (name=='30370861_Soporte'||id == socket.id){
  
    const divElement = document.createElement('div');
    divElement.classList.add('message');
  
    if (id !== socket.id) {
      divElement.classList.add('incoming');
    }
  
    divElement.innerHTML = `<small>${'Soporte'}</small><p>${message}</p>`;
    const chat = document.getElementById('chat');
    chat.appendChild(divElement);
  
    // Scroll al final de los mensajes...
    chat.scrollTop = chat.scrollHeight;
  };
};



// ------------------------------------------------------------------------------------------------
function getLastSeen() {
    // Obtener la fecha actual
    const now = new Date();

    // Convertir a huso horario de Venezuela (GMT-4)
    const venezuelaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Caracas' }));

    // Formatear la fecha
    const options = { hour: 'numeric', minute: 'numeric', hour12: true };
    const formattedTime = venezuelaTime.toLocaleTimeString('es-VE', options);

    return `<small>Hoy a las ${formattedTime}</small>`;
}

var socket=io("https://cinexunidos-production.up.railway.app/",{auth: {
    name: '30370861_'+username,
  },});


  


socket.on('connect', () => {   

   
    $lastSeen.innerHTML = getLastSeen();

    $usernamePic.innerHTML = `<img src="https://api.dicebear.com/9.x/initials/svg?seed=${username}" alt="${username}" />`;
    console.log('Connected');
});

socket.on('disconnect', () => {
   
    console.log('Disconnected');
});



socket.on('new-message', renderMessage);





$chatForm.addEventListener('submit', (evt) => {
    evt.preventDefault();

    const message = $messageInput.value;
    $messageInput.value = '';

    socket.emit('send-message', message);
});
      
      
      

    
