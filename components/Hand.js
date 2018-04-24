const React = require('react');

const CARD = require('../utils/enums/card.js');
const SUIT = require('../utils/enums/suit.js');
const JOKER = require('../utils/enums/joker.js');

import Card from './Card.js';

export default class Hand extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className='hand'>
        <Card card={ CARD.TWO } suit={ SUIT.DIAMONDS } />
        <Card card={ CARD.THREE } suit={ SUIT.CLUBS } />
      </div>
    );
  }
}
