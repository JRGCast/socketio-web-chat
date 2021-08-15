// Faça seu código aqui
const express = require('express');

const app = express();
const http = require('http').createServer(app);
require('dotenv').config();
const path = require('path'); // linter não está permitindo o uso do path.resolve

const PORT = process.env.PORT || 3000;

const io = require('socket.io')(http, {
  cors: {
    origin: process.env.DB_URL,
    methods: ['GET', 'POST'],
  },
});

app.use(express.static(path.join(__dirname, '/public')));

require('./public/js/sockets/chat')(io); 

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages/chat.html')); // estranho que lá no chat.html não pega a pasta /public se botar aqui direto
});

http.listen(PORT, () => {
  console.log(`Ouvindo porta ${PORT}`);
});
