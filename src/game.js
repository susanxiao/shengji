require('./db.js');
const mongoose = require('mongoose');
const Game = mongoose.model('Game');
const Player = mongoose.model('Player');

class Server {
  constructor(io, game) {
    io.on('connection', (socket) => {
      console.log('hi');
      socket.on('disconnect', _ => {
        console.log('bye!');
      });

      socket.on('test', _ => {
        console.log('test');
      })
    });
  }
}

module.exports = Server;
