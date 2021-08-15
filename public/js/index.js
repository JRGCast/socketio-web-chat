const socket = window.io();

// querySelector
const testBtn = document.querySelector('#ping-button');
const dltBtn = document.querySelector('#reset-button');
const clientMessage = document.querySelector('#message-input');
const clientNickName = document.querySelector('#nickname');
const changeNickNameBtn = document.querySelector('#nickname-button');
const onlineUsers = document.querySelector('#online-users');
const messagesUl = document.querySelector('#messages');
const sendButton = document.querySelector('#send-button');
const typing = document.querySelector('#typing-message');

const dataTestId = 'data-testid';

// arrow functions
const setNickname = async (nickName) => {
  clientNickName.value = nickName;
};

const generateUserList = (theNewUsr) => {
  const newUserLi = document.createElement('li');
  newUserLi.appendChild(document.createTextNode(theNewUsr));
  newUserLi.setAttribute(dataTestId, 'online-user');
  onlineUsers.appendChild(newUserLi);
};

const createMessage = (message) => {
  const li = document.createElement('li');
  li.innerText = message;
  li.setAttribute(dataTestId, 'message');
  messagesUl.appendChild(li);
};

// eventListeners
testBtn.addEventListener('click', () => {
  const date = new Date().toLocaleString('pt-BR');
  console.log('clicou em PING às', date);
});

testBtn.addEventListener('mouseover', () => {
  testBtn.innerText = 'Veja no Console';
});

testBtn.addEventListener('mouseout', () => {
  testBtn.innerText = 'PING HORÁRIO';
});

dltBtn.addEventListener('click', () => {
  messagesUl.innerHTML = '';
  socket.emit('deleteAll');
  console.log('deleteAll');
});

clientMessage.addEventListener('keydown', (e) => {
  const nickname = clientNickName.value;
  const chatMessage = clientMessage.value;
  socket.emit('typing', clientNickName.value, true);
  console.log(e.which);
  if (e.which === 13) {
    e.preventDefault();
    socket.emit('message', { chatMessage, nickname });
    socket.emit('typing', '', false);
    typing.innerHTML = '';
    clientMessage.value = '';
  }
});

sendButton.addEventListener('click', async () => {
  const nickname = clientNickName.value;
  const chatMessage = clientMessage.value;
  socket.emit('message', { chatMessage, nickname });
  socket.emit('typing', '', false);
  typing.innerHTML = '';
  clientMessage.value = '';
  return false;
});

// nickname related
clientNickName.addEventListener('focus', () => {
  clientNickName.value = '';
});
clientNickName.addEventListener('keydown', (e) => {
  if (e.which === 13) {
    e.preventDefault();
    socket.emit('changeNick', clientNickName.value);
  }
});
changeNickNameBtn.addEventListener('click', async () => {
  socket.emit('changeNick', clientNickName.value);
});

// socket listeners
socket.on('retrieveAll', (messagesArr) => {
  messagesArr.forEach((element) => createMessage(element));
});
socket.on('message', (message) => {
  createMessage(message);
});
socket.on('newConnection', (nickName) => setNickname(nickName));
socket.on('setAllUsers', (allUsers) => {
  onlineUsers.innerHTML = '';
  generateUserList(`${clientNickName.value} (Você)`);
  allUsers.forEach((user) => {
    if (user.nickname !== clientNickName.value) generateUserList(user.nickname);
  });
});
socket.on('changeNick', (changed) => setNickname(changed));
socket.on('typing', (whoIsTyping, bool) => {
  typing.innerHTML = (!bool) ? ''
    : `<p><em><strong>${whoIsTyping}</strong> está escrevendo uma mensagem...</em></p>`;
});
