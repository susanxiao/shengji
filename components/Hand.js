const React = require('react');
import Card from './Card.js';

export default class Hand extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      cards: {}
    }

    this._getCards();

    this._getCards = this._getCards.bind(this);
    this.clearCards = this.clearCards.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (prevProps != this.props) {
      this._getCards();
    }
  }

  clearCards(cardComps) {
    // reference: https://reactjs.org/docs/refs-and-the-dom.html
    cardComps.forEach(cardComp => {
      this.refs[cardComp.props.id].toggleSelect();
    });
  }

  _getCards() {
    if (this.props.cards.length === 0) {
      return;
    }

    const oldCards = this.state.cards;
    const newCards = {};

    let shiftCount = 0;
    let found = false;
    Object.getOwnPropertyNames(this.props.cards).sort((t1, t2) => {
      switch(t1){
        case (t2): return 0;
        case ('TRUMP'): return -1;
        case ('JOKER'): return t2 === 'TRUMP' ? 1 : -1;
        default: return t2 - t1;
      }
    }).forEach(type => {
      newCards[type] = oldCards[type] ? oldCards[type].slice() : [];
      if (!found) {
        this.props.cards[type].some(element => {
          const id = (element.card.cardKey || 'JOKER') + element.card.suitKey + element.size;
          let index = 0;
          if (oldCards[type] && oldCards[type].every(cardComp => cardComp.props.id !== id)) {
            index = oldCards[type].indexOf((cardComp, i) => cardComp.props.card !== this.props.cards[type][i].card);
            newCards[type].splice(index, 0, <Card
              key={ id }
              id={ id }
              ref={ inst => { this.refs[id] = inst } }
              card={ element.card }
              shift={ 0 }
              selectHandler={ this.props.selectHandler }
            />);
            found = true;
            return true;
          }
          return false;
        });
      }

      newCards[type].forEach(cardComp => {
        cardComp.props.shift = 0; // TODO: why isn't shift working -140*shiftCount;
        shiftCount++;
      });
    });
    this.setState({cards: newCards});
  }

  render() {
    return (
      <div className='hand'>
        { Object.getOwnPropertyNames(this.state.cards).sort((t1, t2) => {
          switch(t1){
            case (t2): return 0;
            case ('TRUMP'): return -1;
            case ('JOKER'): return t2 === 'TRUMP' ? 1 : -1;
            default: return t2 - t1;
          }
        })
        .map(type => this.state.cards[type])
        .reduce((acc, a) => {
          acc.push(...a);
          return acc;
        }, []) }
      </div>
    );
  }
}
