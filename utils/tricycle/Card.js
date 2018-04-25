const CARD = require('../enums/card.js');
const SUIT = require('../enums/suit.js');
const JOKER = require('../enums/joker.js');

class Card {
  constructor(suit, card) {
    if (typeof card === 'undefined') {
      this.card = JOKER.CARD;
      this.suitKey = suit;
      this.suit = JOKER.SUIT[suit];
    } else {
      this.cardKey = card;
      this.card = CARD[card];
      this.suitKey = suit;
      this.suit = SUIT[suit];
    }
  }

  toString() {
    if (this.card === JOKER.CARD) {
      return this.suit.string + ' ' + this.card.string;
    } else {
      return this.card.string + ' of ' + this.suit.string;
    }
  }
}

module.exports = Card;
