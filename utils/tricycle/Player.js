const TEAM = require('../enums/team.js');
const SUIT = require('../enums/suit.js');
const Hand = require('./Hand.js');

class Player {
  constructor(username, socket) {
    this.hand = new Hand();
    this.username = username;
    this.socket = socket;
    this.level = '2';
    this.points = 0; // for Zhaopengyou
  }

  updateHand(card, trumpSuit) {
    const toSend = {};
    Object.getOwnPropertyNames(this.hand.cards).forEach(type => {
      const arr = [];
      this.hand.cards[type].forEach(element => {
        arr.push(element);
      });
      toSend[type] = arr;
    });

    this.socket.emit('update-hand', JSON.stringify(toSend));
  }

  emit(evt, data) {
    this.socket.emit(evt, data);
  }

  changeTeams() { // for Shengji
    if (this.team === TEAM.HOST) {
      this.team = TEAM.OTHER;
    } else if (this.team === TEAM.OTHER){
      this.team = TEAM.HOST;
    } else {
      throw "Cannot change teams if undefined";
    }
  }

  reset() { // for Zhaopengyou
    delete this.team;
    this.points = 0;
  }
}

module.exports = Player;
