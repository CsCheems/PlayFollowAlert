//PARAMETERS//
const querystring = window.location.search;
const urlParameters = new URLSearchParams(querystring);
const StreamerbotPort = urlParameters.get('port') || '8080';
const StreamerbotAddress = urlParameters.get('address') || '127.0.0.1';

const notificationQueue = [];
let showNotification = false;

var audioNotification = document.createElement('audio');
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

//EVENTS

client.on('Twitch.Follow', async (response) => {
    const username = response.data.user_name;
    const avatarUrl = await getAvatar(username);
    onQueueNotification(username, avatarUrl, 0);
})

client.on('YouTube.NewSubscriber', (response) => {
    console.log(response);
    onQueueNotification(response.data.username, response.data.avatar, 0);
})

client.on('Twitch.Raid', async (response) =>{
    const username = response.data.from_broadcaster_user_name;
    const avatarUrl = await getAvatar(username);
    const viewers = response.data.viewers;
    console.log(response);
    onQueueNotification(username, avatarUrl, viewers);
})

async function Follow(username, avatarUrl, done) {
    const notification = document.getElementById("notification");
    gsap.killTweensOf(notification);
    audioNotification.play();     

    const avatar = document.getElementById("avatar"); 
    avatar.src = avatarUrl;

    const userNameText = document.getElementById("UserNameText");
    userNameText.innerText = username;

    const eventText = document.getElementById("Event");
    eventText.innerText = "Ha dado follow al canal";

    const tl = gsap.timeline({
        onStart: () => {
            notification.style.visibility = 'visible';
        },
        onComplete: () => {
            notification.style.visibility = 'hidden';
            notification.style.transform = "translateX(0)";
            if (done) done();
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

async function Raid(username, avatarUrl, viewers, done) {
    const notification = document.getElementById("notification");
    gsap.killTweensOf(notification);
    audioNotification.play();     

    const avatar = document.getElementById("avatar"); 
    avatar.src = avatarUrl;

    const userNameText = document.getElementById("UserNameText");
    userNameText.innerText = username;

    const eventText = document.getElementById("Event");
    eventText.innerText = `Esta raideando con ${viewers} espectadores!`;

    const tl = gsap.timeline({
        onStart: () => {
            notification.style.visibility = 'visible';
        },
        onComplete: () => {
            notification.style.visibility = 'hidden';
            notification.style.transform = "translateX(0)";
            if (done) done();
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

//HELPERS

function onQueueNotification(username, avatarUrl, viewers){
    notificationQueue.push({username, avatarUrl});
    if(!showNotification){
        showNextNotification(viewers);
    }
}

function showNextNotification(viewers){
    if(notificationQueue.length === 0){
        showNotification = false;
        return;
    }

    showNotification = true;
    const {username, avatarUrl} = notificationQueue.shift();

    if(viewers === 0){
        Follow(username, avatarUrl, () => {
            showNextNotification();
        });
    }else{
        Raid(username, avatarUrl, viewers, () => {
            showNextNotification();
        });
    }
    
}

async function getAvatar(username){
    let response = await fetch('https://decapi.me/twitch/avatar/'+username);
    let data = await response.text();
    return data;
}

//STREAMERBOT STATUS FUNCTION//

function setConnectionStatus(connected){
    let statusContainer = document.getElementById('status-container');
    if(connected){
        statusContainer.style.background = "#2FB774";
        statusContainer.innerText = "ONLINE!";
        statusContainer.style.opacity = 1;
        setTimeout(() => {
            statusContainer.style.transition = "all 2s ease";
            statusContainer.style.opacity = 0;
        }, 10);
    }else{
        statusContainer.style.background = "FF0000";
        statusContainer.innerText = "STREAMERBOT OFFLINE...";
        statusContainer.style.transition = "";
        statusContainer.style.opacity = 1;
    }
}



