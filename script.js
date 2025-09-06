//PARAMETROS//
const querystring = window.location.search;
const urlParameters = new URLSearchParams(querystring);
const StreamerbotPort = urlParameters.get('port') || '8080';
const StreamerbotAddress = urlParameters.get('address') || '127.0.0.1';
const minRole = 3;
const maxMessages = 10;
let totalMessages = 0;
let ultimoUsuario = '';
const avatarHashMap = new Map();

var audioNotification = document.createElement('audio');
document.createElement('audioNotification');
audioNotification.setAttribute('src', './sfx/PS4TrophySound.mp3');
audioNotification.volume = 0.50;


const client = new StreamerbotClient({
    host: StreamerbotAddress,
    port: StreamerbotPort,
    onConnect: (data) =>{
        console.log(data);
        setConnectionStatus(true);
    },
    onDisconnect: () =>{
        setConnectionStatus(false);
    }
});

//EVENTOS

client.on('Twitch.Follow', (response) => {
    NotificacionFollow(response.data);
})

async function NotificacionFollow(data) {
    const notification = document.getElementById("notification");
    gsap.killTweensOf(notification);
    audioNotification.play(); 

    console.log(data);
    const username = data.user_name;
    const avatarUrl = await obtenerAvatar(username);

    const avatar = document.getElementById("avatar"); 
    avatar.src = avatarUrl;

    const userNameText = document.getElementById("UserNameText");
    userNameText.innerText = username;

    const tl = gsap.timeline({
        onStart: () => {
            notification.style.visibility = 'visible';
        }
    });

    tl.to(notification, { 
        x: -20, 
        opacity: 1, 
        duration: .7, 
        ease: "power3.out", 
        delay: 1.5
    });

    tl.to(notification, { 
        opacity: 0, 
        duration: 1, 
        delay: 6, 
        ease: "power2.inOut",
        onComplete: () => {
            notification.style.visibility = 'hidden';
        }
    });

    tl.to(notification, { 
        x: -1000,
        duration: 1,
        ease: "power2.inOut",
    });
}


//Helpers

async function obtenerAvatar(username){
    let response = await fetch('https://decapi.me/twitch/avatar/'+username);
    let data = await response.text();
    return data;
}

//STREAMERBOT STATUS FUNCTION//

function setConnectionStatus(connected){
    let statusContainer = document.getElementById('status-container');
    if(connected){
        statusContainer.style.background = "#2FB774";
        statusContainer.innerText = "CONECTADO!";
        statusContainer.style.opacity = 1;
        setTimeout(() => {
            statusContainer.style.transition = "all 2s ease";
            statusContainer.style.opacity = 0;
        }, 10);
    }else{
        statusContainer.style.background = "FF0000";
        statusContainer.innerText = "CONECTANDO...";
        statusContainer.style.transition = "";
        statusContainer.style.opacity = 1;
    }
}



