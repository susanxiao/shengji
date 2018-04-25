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

  printHand(trumpSuit) {
    return new Promise(resolve => {
      const cards = [];
      const trumpCards = [];

      const clubs = [];
      Object.getOwnPropertyNames(this.hand.cards.CLUBS).forEach(card => {
        clubs.push(...this.hand.cards.CLUBS[card].toArray());
      });
      clubs.sort((c1, c2) => c1.card.rank - c2.card.rank);
      (trumpSuit === SUIT.CLUBS) ? trumpCards.push(...clubs) : cards.push(...clubs);
      resolve({cards: cards, trumpCards: trumpCards});
    }).then(({cards, trumpCards}) => {
      const diamonds = [];
      Object.getOwnPropertyNames(this.hand.cards.DIAMONDS).forEach(card => {
        diamonds.push(...this.hand.cards.DIAMONDS[card].toArray());
      });
      diamonds.sort((c1, c2) => c1.card.rank - c2.card.rank);
      (trumpSuit === SUIT.DIAMONDS) ? trumpCards.push(...diamonds) : cards.push(...diamonds);
      return {cards: cards, trumpCards: trumpCards};
    }).then(({cards, trumpCards}) => {
      const hearts = [];
      Object.getOwnPropertyNames(this.hand.cards.HEARTS).forEach(card => {
        hearts.push(...this.hand.cards.HEARTS[card].toArray());
      });
      hearts.sort((c1, c2) => c1.card.rank - c2.card.rank);
      (trumpSuit === SUIT.HEARTS) ? trumpCards.push(...hearts) : cards.push(...hearts);
      return {cards: cards, trumpCards: trumpCards};
    }).then(({cards, trumpCards}) => {
      const spades = [];
      Object.getOwnPropertyNames(this.hand.cards.SPADES).forEach(card => {
        spades.push(...this.hand.cards.SPADES[card].toArray());
      });
      spades.sort((c1, c2) => c1.card.rank - c2.card.rank);
      (trumpSuit === SUIT.SPADES) ? trumpCards.push(...spades) : cards.push(...spades);
      return {cards: cards, trumpCards: trumpCards};
    }).then(({cards, trumpCards}) => {
      const trumps = [];
      Object.getOwnPropertyNames(this.hand.cards.trumpCards.CARDS).forEach(card => {
        trumps.push(...this.hand.cards.trumpCards.CARDS[card].toArray());
      });
      trumps.sort((c1, c2) => {
        if (c1.suit === trumpSuit) {
          return 1;
        } else if (c2.suit === trumpSuit) {
          return -1;
        } else {
          return c1.suit.rank - c2.suit.rank;
        }
      });
      trumpCards.push(...trumps);
      return {cards: cards, trumpCards: trumpCards};
    }).then(({cards, trumpCards}) => {
      const jokers = [];
      Object.getOwnPropertyNames(this.hand.cards.trumpCards.JOKERS).forEach(card => {
        jokers.push(...this.hand.cards.trumpCards.JOKERS[card].toArray());
      });
      jokers.sort((c1, c2) => c1.suit.rank - c2.suit.rank);
      trumpCards.push(...jokers);
      return {cards: cards, trumpCards: trumpCards};
    }).then(({cards, trumpCards}) => {
      trumpCards.push(...cards);
      return this.socket.emit('print-hand', JSON.stringify(trumpCards));
    }).catch(console.log);
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
