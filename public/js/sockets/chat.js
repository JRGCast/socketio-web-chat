const faker = require('faker');
const chatModel = require('../../../models/chatModel');

let allUsers = [];

const minNickLength = 16;

const nickNameSixteen = () => {
  const randomName = faker.fake('{{name.suffix}} {{name.firstName}}');
  const randomChar = () => Math.random().toString(36).substr(2, 1);
  let randomStr = '';
  const missingLength = minNickLength - randomName.length;
  for (let i = 1; i < missingLength; i += 1) {
    randomStr = randomStr.concat(randomChar());
  }
  const nickName = `${randomName}-${randomStr}`.replace(/[^a-zA-Z0-9]/g, '_');
  return nickName;
};

const setDate = () => {
  const [date, time] = new Date().toLocaleString().split(',');
  const [month, day, year] = date.split('/');
  const fixDay = day.length === 1 ? `0${day}` : day;
  const fixMonth = month.length === 1 ? `0${month}` : month;
  const crummyFormat = `${fixDay}-${fixMonth}-${year}, ${time}`;
  return crummyFormat;
};

const messaging = (chatMessage, timestamp = setDate(), nickname = 'SERVER') => (
  { chatMessage, timestamp, nickname });

const stringMessage = (({ chatMessage, timestamp = setDate(), nickname = 'SERVER' }) =>
  `${timestamp} - ${nickname}: ${chatMessage}`);

const saveNewMsg = async ({ chatMessage, timestamp = setDate(), nickname = 'SERVER' }) => {
  chatModel.insertMessage({ chatMessage, timestamp, nickname });
};

const pullFromDB = async (socket) => {
  const getAllMsgs = await chatModel.getAllMessages();
  const mapAllMsgs = getAllMsgs.map(
    ({ timestamp, nickname, chatMessage }) => `${timestamp} - ${nickname}: ${chatMessage}`,
  );
  socket.emit('retrieveAll', mapAllMsgs);
};

const newChatter = async (currSocket, io) => {
  await pullFromDB(currSocket);
  const generatedNick = nickNameSixteen();
  const userInfo = { id: currSocket.id, nickname: generatedNick };
  allUsers.push(userInfo);
  currSocket.emit('newConnection', userInfo.nickname);
  io.emit('setAllUsers', allUsers);
  io.emit('message', stringMessage(messaging(`${userInfo.nickname} se conectou`))); // pareceser desnecessário aos reqs
  await saveNewMsg(messaging(`${userInfo.nickname} se conectou`)); // gambiarrinha
};

const updateNick = (newNickname, currSocket, io) => {
  const currUser = allUsers.find((theUsr) => theUsr.id === currSocket.id);
  const currUserIndex = allUsers.findIndex((theUsr) => theUsr.id === currSocket.id);
  io.emit('message',
    stringMessage(messaging(`${currUser.nickname} alterou o apelido para ${newNickname}`)));
  allUsers[currUserIndex].nickname = newNickname;
  console.log(allUsers);
  io.emit('setAllUsers', allUsers);
};

const disconnect = async (currSocket, io) => {
  const currUser = allUsers.find((theUsr) => theUsr.id === currSocket.id);
  allUsers = allUsers.filter((othersUsers) => othersUsers.id !== currSocket.id);
  io.emit('setAllUsers', allUsers);
  await saveNewMsg(messaging(`${currUser.nickname} se desconectou`)); // parece ser desnecessário aos reqs
  io.emit('message', stringMessage(messaging(`${currUser.nickname} se desconectou`)));
};

const deleteEvry = (socket) => {
  chatModel.deleteAll();
  pullFromDB(socket);
};
module.exports = (io) => {
  io.on('connection', async (socket) => {
    console.log('houve uma conexão nova', socket.id);
    await newChatter(socket, io);
    socket.on('message', async (messageObj) => {
      await saveNewMsg(messageObj);
      io.emit('message', stringMessage(messageObj));
    });
    socket.on('typing', (whoIsTyping, bool) => {
      socket.broadcast.emit('typing', whoIsTyping, bool);
    });
    socket.on('changeNick', (newNickname) => {
      updateNick(newNickname, socket, io);
    });
    socket.on('disconnect', async () => {
      await disconnect(socket, io);
    });
    socket.on('deleteAll', () => deleteEvry(socket));
  });
};
