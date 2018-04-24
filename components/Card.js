const React = require('react');
const Fragment = React.Fragment;

const SUIT = require('../utils/enums/suit.js');
const JOKER = require('../utils/enums/joker.js');

export default class Card extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      card: this.props.card,
      suit: this.props.suit
    };

    if (this.props.suit === SUIT.DIAMONDS || this.props.suit === SUIT.HEARTS || this.props.suit === JOKER.SUIT.BIG) {
      this.state.color = 'red';
    } else {
      this.state.color = 'black';
    }

  }

  _renderCorner() {
    return (
      <Fragment>
        <div className='code'>
        { this.state.card.code }
        </div>
        <div className='code'>
        { this.state.suit.code }
        </div>
      </Fragment>
    );
  }

  render() {
    return (
      <div className={ 'card ' + this.state.color }>
        <div className='topLeft'>
          { this._renderCorner() }
        </div>
        <div className='middle'></div>
        <div className='bottomRight'>
          { this._renderCorner() }
        </div>
      </div>
    );
  }
}
