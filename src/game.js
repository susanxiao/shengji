require('./db.js');
const mongoose = require('mongoose');
const Game = mongoose.model('Game');
const Player = mongoose.model('Player');
const all = [];

class Server {
  constructor(io, game) {
    this.checkPlayers = this.checkPlayers.bind(this);

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

      socket.on('start-bar', _ => {
        this.players = [];
        io.emit('start-bar');
      });

      socket.on('end-queue', this.checkPlayers);

      socket.on('start-queue', username => {
        this.players.push(username);
        if (this.players.length === this.game.players.length) {
          this.checkPlayers();
        }
      });

      socket.on('disconnect', _ => {
        if (Object.keys(io.connected).length === 0) {
          // reference: https://stackoverflow.com/questions/26400595/socket-io-how-do-i-remove-a-namespace
          // namespace gets deleted from server when someone actually deletes the game
          io.removeAllListeners();
          remove(game._id);
        }
      });
    });
    this.io = io;
    this.game = game;
    all.push(this);
    return this;
  }

  checkPlayers() {
    for (let socket in this.io.sockets) {
      this.io.sockets[socket].removeListener('end-queue', this.checkPlayers);
    }

    let canStart = true;
    this.game.players.forEach(player => {
      if (!this.players.includes(player)) {
        const message = player + ' failed to start.';
        this.io.emit('receive-message', message);
        canStart = false;
      }
    });

    if (canStart) { // TODO: this
      console.log('start game!');
    }
  }

  remove(username) {
    const message = username + ' has left the game.';
    this.game.messages.push(message);
    this.game.save().then(_ => {
      this.io.emit('receive-message', message);
      this.io.emit('receive-leave', username);
    });
  }

  add(username) {
    const message = username + ' has joined the game.';
    this.game.messages.push(message);
    this.game.save().then(_ => {
      this.io.emit('receive-message', message);
      this.io.emit('receive-join', username);
    });
  }
}

function find(id) {
  return all.find(serve => serve.game._id.equals(id));
}

function remove(id) {
  all.splice(all.indexOf(id), 1);
}

module.exports = {
  Server: Server,
  find: find,
  remove: remove
};
