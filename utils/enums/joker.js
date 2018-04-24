const CARD = {value: 0, rank: 13, points: 0, code: 'j', string: 'Joker'};

const SUIT = {
  BIG: {rank: 4, code:'\u265B', string: 'Big'},
  SMALL: {rank: 5, code: '\u2655', string: 'Small'}
}

module.exports = {
  CARD: CARD,
  SUIT: SUIT
}
