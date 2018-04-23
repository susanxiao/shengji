require('./db.js');
const mongoose = require('mongoose');
const Game = mongoose.model('Game');
const Player = mongoose.model('Player');
const all = [];

class Server {
  constructor(io, nsp, game) {
    this.checkPlayers = this.checkPlayers.bind(this);

    nsp.on('connection', (socket) => {
      socket.on('get-message-all', _ => {
        socket.emit('receive-message-all', JSON.stringify(game.messages));
      });

      socket.on('add-message', message => {
        game.messages.push(message);
        game.save().then(_ => {
          nsp.emit('receive-message', message);
        });
      });

      socket.on('start-bar', _ => {
        this.players = [];
        nsp.emit('start-bar');
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
          nsp.removeAllListeners();
          remove(game._id);
        }
      });
    });
    this.io = io;
    this.nsp = nsp;
    this.game = game;
    all.push(this);
    return this;
  }

  checkPlayers() {
    for (let socket in this.nsp.sockets) {
      this.nsp.sockets[socket].removeListener('end-queue', this.checkPlayers);
    }

    let canStart = true;
    const messages = [];
    this.game.players.forEach(player => {
      if (!this.players.includes(player)) {
        const message = player + ' failed to start.';
        messages.push(message);
        canStart = false;
      }
    });

    if (canStart) {
      this.game.started = true;
      this.game.save().then(_ => {
        this.io.emit('receive-removal', JSON.stringify(this.game));
      });
    } else {
      this.game.messages.push(...messages);
      this.game.save().then(_ => {
        messages.forEach(message => this.nsp.emit('receive-message', message));
      });
    }
  }

  remove(username) {
    const message = username + ' has left the game.';
    this.game.messages.push(message);
    this.game.save().then(_ => {
      this.nsp.emit('receive-message', message);
      this.nsp.emit('receive-leave', username);
    });
  }

  add(username) {
    const message = username + ' has joined the game.';
    this.game.messages.push(message);
    this.game.save().then(_ => {
      this.nsp.emit('receive-message', message);
      this.nsp.emit('receive-join', username);
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
