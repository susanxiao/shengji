const React = require('react');
const Fragment = React.Fragment;

const SUIT = require('../utils/enums/suit.js');
const JOKER = require('../utils/enums/joker.js');

export default class Card extends React.Component {
  constructor(props) {
    super(props);

    this.state = this.props;
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      this.setState(this.props);
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
      <div className={ 'card ' + this.state.suit.color } style={{transform: 'translateX('+this.state.shift+'px)'}}>
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
