const CARD = require('../enums/card.js');
const SUIT = require('../enums/suit.js');
const JOKER = require('../enums/joker.js');

const Card = require('./Card.js');

class Deck { // large deck, contains all cards for the game
  constructor(numDecks) {
    this.cards = [];

    for (let i = 0; i < numDecks; i++) {
      Object.getOwnPropertyNames(SUIT).forEach((suit) => {
        Object.getOwnPropertyNames(CARD).forEach((card) => {
          this.cards.push(new Card(suit, card));
        });
      });

      Object.getOwnPropertyNames(JOKER.SUIT).forEach((jokersuit) => {
        this.cards.push(new Card(jokersuit));
      });
    }
  }

  shuffle() {
    // reference: https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm
    for (let i = this.cards.length - 1; i >= 1; i--) {
      const j = Math.floor(Math.random() * i);
      const temp = this.cards[j];
      this.cards[j] = this.cards[i];
      this.cards[i] = temp;
    }
    return this;
  }

  deal(players, trumpCardKey) {
    return new Promise(
      resolve => {
        const numPlayers = players.size;
        const numCards = this.cards.length;
        let numBottom = numCards % numPlayers;
        while (numBottom < 5) {
          numBottom += numPlayers;
        }

        let current = players.head;

        return this.cards.reduce((promise, card, index) => {
          return promise
            .then(bottom => {
              if (numCards - index > numBottom) {
                current.player.hand.add(card, trumpCardKey);
                return new Promise(resolve => setTimeout(resolve, 1000)) // pause for 1 second
                  .then(_ => current.player.printHand())
                  .then(_ => {
                    current = current.next;
                    return bottom;
                  });
              } else {
                bottom.push(card);
                return bottom;
              }
            }).catch(console.log);
        }, Promise.resolve([]));
    });

  }
}

module.exports = Deck;
