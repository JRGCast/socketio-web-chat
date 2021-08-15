const connection = require('./connection');

const insertMessage = async (messageObj) => {
  await connection()
    .then((db) => db.collection('messages').insertOne(messageObj))
    .then((result) => result.ops[0]);
};

const getAllMessages = async () => connection()
  .then((db) => db.collection('messages').find().toArray());

const deleteAll = async () => connection().then((db) => db.collection('messages').deleteMany({}));

module.exports = { insertMessage, getAllMessages, deleteAll };
