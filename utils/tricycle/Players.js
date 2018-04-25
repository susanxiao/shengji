
class Node {
  constructor(player, next, prev) {
    this.player = player;
    this.next = next;
    this.prev = prev;
  }
}

class Players { // a circular, doubly linked list
  constructor() {
    this.size = 0;
  }

  add(player) {
    if (typeof this.head === 'undefined') {
      this.head = new Node(player);
      this.head.next = this.head;
      this.head.prev = this.head;
    } else {
      const tail = this.head.prev;
      const current = new Node(player, this.head, tail);
      tail.next = current;
      this.head.prev = current;
    }
    this.size++;
  }

  iterateWith(callback, start) {
    start = start || this.head;
    let current = start;
    let index = 0;
    do {
      callback(current.player, index);
      current = current.next;
      index++;
    } while (current !== start);
  }
}

module.exports = Players;
