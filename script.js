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
    const event = "follow";
    onQueueNotification(response.data, event);
})

client.on('YouTube.NewSubscriber', (response) => {
    onQueueNotification(response.data);
})

client.on('Twitch.Raid', async (response) =>{
    const event = "raid";
    onQueueNotification(response.data, event);
})

async function Follow(data, done) {
    console.log("Follow: ", data);
    const notification = document.getElementById("notification");
    gsap.killTweensOf(notification);
    audioNotification.play();     

    const avatar = document.getElementById("avatar"); 
    const avatarUrl = await getAvatar(data.user_name);
    avatar.src = avatarUrl;

    const userNameText = document.getElementById("UserNameText");
    userNameText.innerText = data.user_name;

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

async function Raid(data, done) {
  console.log("Raid:", data);

  const notification = document.getElementById("notification");
  gsap.killTweensOf(notification);

  try { await audioNotification.play(); } catch (e) { console.warn("Audio blocked:", e); }

  const username = data?.from_broadcaster_user_name || data?.username || "Alguien";
  const viewers = data?.viewers || data?.viewer_count || data?.raid_viewer_count || 0;

  const avatar = document.getElementById("avatar");
  avatar.src = await getAvatar(username);

  document.getElementById("UserNameText").innerText = username;
  document.getElementById("Event").innerText = `Esta raideando con ${viewers} espectadores!`;

  const tl = gsap.timeline({
    onStart: () => { notification.style.visibility = "visible"; },
    onComplete: () => {
      notification.style.visibility = "hidden";
      notification.style.transform = "translateX(0)";
      done?.();
    },
  });

  tl.to(notification, { x: -20, opacity: 1, duration: 0.7, ease: "power3.out", delay: 1.5 });
  tl.to(notification, { opacity: 0, duration: 1, delay: 6, ease: "power2.inOut" });
  tl.to(notification, { x: -1000, duration: 1, ease: "power2.inOut" });
}

//HELPERS

function onQueueNotification(data, event){
    notificationQueue.push({event, data});
    if(!showNotification){
        showNextNotification();
    }
}

function showNextNotification(){
    if(notificationQueue.length === 0){
        showNotification = false;
        return;
    }

    showNotification = true;
    const {event, data} = notificationQueue.shift();
    switch(event){
        case "follow":
            Follow(data, () => {
                showNextNotification();
            });
            break;
        case "raid":
            Raid(data, () => {
                showNextNotification();
            });
            break;
        default:
            showNextNotification();
            break;
        
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



