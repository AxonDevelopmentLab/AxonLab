// Criar uma instância do WebSocket
const socket = new WebSocket("wss://axonlab.glitch.me/");
const statusElement = document.getElementById('status');

const audio = document.getElementById("notificationSound");
let unread_messages = 0;
let afk = false;

let loop_unread_messages = false;
function unreadMessageAlert() {
  if (loop_unread_messages === false) {
    loop_unread_messages = setInterval(() => {
      document.title = `(+${unread_messages}) Suporte | AxonLab`;
      setTimeout(() => {
        if (loop_unread_messages !== false) document.title = `${unread_messages} Mensagens não lidas!`
      }, 2000)
    }, 4000);
  }
}

window.addEventListener('blur', () => { afk = true; });
window.addEventListener('focus', () => { if (loop_unread_messages) { clearInterval(loop_unread_messages); loop_unread_messages = false; }; unread_messages = 0; afk = false; document.title = 'Suporte | AxonLab'; });

function message(Text, Tags) {
    const Chatbox = document.getElementById('chatbox');
    const MessageBox = document.createElement('p');
    MessageBox.style.marginTop = '0px';
    MessageBox.style.marginBottom = '0px';

    for (const tag of Tags) {
        const createTag = `<b style="color:${tag[1]} !important;">${tag[0]}</b> `;
        MessageBox.innerHTML = MessageBox.innerHTML + createTag;
    }

    MessageBox.innerHTML = MessageBox.innerHTML + Text;
    Chatbox.appendChild(MessageBox);

    Chatbox.scrollTop = Chatbox.scrollHeight;
}

socket.onmessage = function(event) {
    const data = JSON.parse(event.data);
    if (data.status) {
        if (data.status === 'false') {
            statusElement.style = 'color:red !important;'
            statusElement.innerHTML = 'Suporte Offline'
        } else {
            statusElement.style = 'color:yellow-green !important;'
            statusElement.innerHTML = 'Suporte Online'
        }
    };
  
    if (data.heartbeat) {
      console.log('Websocket received heartbeat "' + data.heartbeat + '"');
      socket.send(JSON.stringify({ heartbeat: data.heartbeat }));
    }

    if (data.message) {
      if (data.notification) {
        audio.play();   
        if (afk) {
          unread_messages++;
          document.title = `(+${unread_messages}) Suporte | AxonLab`
          unreadMessageAlert();
        };
      } else {
        if (afk) {
          unreadMessageAlert();
          unread_messages++;
          audio.play();   
          document.title = `(+${unread_messages}) Suporte | AxonLab`
        }
      };
      
      message(data.message, data.tags);
    }
};

socket.onopen = () => {
    document.getElementById('message.send').addEventListener('click', () => { sendMessage(); });
    document.getElementById('message.content').addEventListener('keypress', (event) => { if (event.key === 'Enter') { event.preventDefault(); sendMessage(); } })
}

function sendMessage() {
    if (document.getElementById('message.content').value === '') return;
    socket.send(JSON.stringify({ message: document.getElementById('message.content').value }));
    message(document.getElementById('message.content').value, [['VOCÊ', 'white']]);
    document.getElementById('message.content').value = '';
};