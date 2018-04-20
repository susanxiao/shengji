require('./db.js');
const mongoose = require('mongoose');
const Game = mongoose.model('Game');
const Player = mongoose.model('Player');

class Server {
  constructor(io, game) {
    io.on('connection', (socket) => {
      socket.on('get-message-all', _ => {
        socket.emit('receive-message-all', JSON.stringify(game.messages));
      });

      socket.on('add-message', message => {
        game.messages.push(message);
        game.save().then(_ => {
          io.emit('receive-message', message);
        });
      });

      socket.on('disconnect', _ => {
        console.log('bye!');
      });
    });
  }
}

module.exports = Server;
