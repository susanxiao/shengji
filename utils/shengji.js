const TEAM = require('./enums/team.js');
const MODE = require('./enums/mode.js');
const Players = require('./tricycle/Players.js');
const Player = require('./tricycle/Player.js');
const Deck = require('./tricycle/Deck.js');

class Shengji {
  constructor(players, nsp, game) {
    this.nsp = nsp;
    this.game = game; // DB model
    this.players = new Players();
    players.forEach(player => this.players.add(new Player(player.username, player.socket))); // NOT DB model
    this.host = this.players.head; // first player is host
  }

  write(message) {
    return new Promise(resolve => {
      this.game.messages.push(message);
      this.game.save()
      .then(_ => {
        this.nsp.emit('receive-message', message);
        resolve();
      });
    });
  }

  rotateHost() {
    this.host = this.host.next;
  }

  setup() {
    // TODO: split players into teams
    this.deck = new Deck(this.game.numDecks).shuffle();
    this.pointThreshold = this.game.numDecks * 40;
    this.levelThreshold = this.game.numDecks * 20;

    const cutDeck = [];
    this.players.iterateWith(player => {
      cutDeck.push(new Promise(resolve => player.socket.on('cut-deck', username => {
        this.nsp.emit('close-cut-deck');
        resolve(username);
      })));
    });

    new Promise(resolve => setTimeout(resolve, 1000))
      .then(_ => this.nsp.emit('cut-deck'))
      .then(_ => Promise.race(cutDeck))
      .then(username => {
        return this.write(username + ' has cut the deck.').then(_ => username);
      })
      .then(username => {
        let index = -1;
        this.players.iterateWith((player, i) => {
          if (player.username === username) {
            index = i;
          }
        });
        return index;
      })
      .then(index => {
        let randomCard = this.deck.cards[Math.floor(Math.random() * this.deck.cards.length)];
        while (randomCard.card.value === 0) { // can't be joker
          randomCard = this.deck.cards[Math.floor(Math.random() * this.deck.cards.length)];
        }
        return this.write('It is a ' + randomCard.toString() + '.')
          .then(_ => (index + randomCard.value) % this.players.size);
      })
      .then(startingPlayerIndex => {
        for (let i = 0; i < startingPlayerIndex; i++) { // rotate so starting player = index 0
          this.rotateHost();
        }
        return this.host.player.username;
      })
      .then(username => this.write(username + ' is the host.'))
      .then(_ => this.startRound())
      .catch(console.log);
  }

  startRound() {
    console.log('start round');
    return new Promise(resolve => {
      this.current = this.host; // host starts the first turn
      this.points = 0;
      this.multiplier = 0;
      this.trumpCardKey = this.host.player.level; //  TODO: emit this information
      this.deck.shuffle();
      resolve();
    }).then(_ => { // TODO: if user chooses a trump card
      return this.deck.deal(this.players, this.trumpCardKey);
    });
  }

}

module.exports = Shengji;
