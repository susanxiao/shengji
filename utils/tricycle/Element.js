class Element {
  constructor(card) {
    this.size = 1;
    this.card = card; // this is a Card object
  }

  add() {
    this.size++;
  }

  play() { // returns true if all cards are played
    if (this.size === 0) {
      throw "Cannot play that card";
    } else {
      this.size--;
      return (this.size === 0);
    }
  }

  toArray() {
    const cards = [];
    for (let i = 0; i < this.size; i++) {
      cards.push(this.card);
    }
    return cards;
  }
}

module.exports = Element;
