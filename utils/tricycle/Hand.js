const Element = require('./Element.js');

class Hand {
  constructor() {
    this.totalCards = 0;
    this.cards = {
      CLUBS: {}, // key = card key, value = Elem()
      DIAMONDS: {},
      HEARTS: {},
      SPADES: {},
      trumpCards: {
        JOKERS: {}, // key = BIG/SMALL, value = Elem()
        CARDS: {} // key = card suit, value = Elem()
      }
    };
  }

  add(card, trumpCardKey) {
    const [location, key] = this.getLocation(card, trumpCardKey);
    if (typeof location[key] === 'undefined') {
      location[key] = new Element(card);
    } else {
      location[key].add();
    }

    this.totalCards++;
  }

  validate(elems, trumpCardKey) { // check cards are from the hand
    return elems.every(elem => {
      const [location, key] = this.getLocation(elem.card, trumpCardKey);
      return location[key].size >= elem.size;
    });
  }

  getLocation(card, trumpCardKey) {
    let location;
    let key;

    if (typeof card.cardKey === 'undefined') { // joker
      location = this.cards.trumpCards.JOKERS;
      key = card.suitKey;
    } else if (card.card.rank === trumpCardKey - 2) {
      location = this.cards.trumpCards.CARDS;
      key = card.suitKey;
    } else {
      location = this.cards[card.suitKey];
      key = card.cardKey;
    }
    return [location, key];
  }

  cardsToElems(cards) {
    cards.sort((c1, c2) => {
      const rank1 = c1.card.rank * 10 + c1.suit.rank;
      const rank2 = c2.card.rank * 10 + c2.suit.rank;
      return rank1 - rank2;
    });

    return cards.reduce((acc, curr) => {
      const prevCard = acc.length > 0 ? acc[acc.length - 1].card : undefined;
      if (acc.length > 0 && prevCard.card === curr.card && prevCard.suit === curr.suit) {
        acc[acc.length - 1].add();
      } else {
        acc.push(new Element(curr));
      }
      return acc;
    }, []);
  }

  remove(card, trumpCardKey) {
    const [location, key] = this.getLocation(card, trumpCardKey);
    if (typeof location[key] === 'undefined') {
      throw 'Cannot play that card';
    } else {
      const playedAll = location[key].play();
      if (playedAll) {
        delete location[key];
      }
    }
    this.totalCards--;
  }

  play(trumpCardKey, ...cards) {
    cards.forEach(card => this.remove(card, trumpCardKey));
  }
}

module.exports = Hand;
