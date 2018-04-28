const React = require('react');
const Fragment = React.Fragment;

const SUIT = require('../utils/enums/suit.js');
const JOKER = require('../utils/enums/joker.js');

export default class Card extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      card: this.props.card,
      selected: false,
      shift: this.props.shift
    };

    this._onClick = this._onClick.bind(this);
    this.toggleSelect = this.toggleSelect.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      this.setState({card: this.props.card});
      this.setState({shift: this.props.shift});
    }
  }

  _onClick() {
    this.props.selectHandler(this, !this.state.selected);
    this.toggleSelect();
  }

  toggleSelect() {
    this.setState({selected: !this.state.selected});
  }

  _renderCorner() {
    return (
      <Fragment>
        <div className='code'>
        { this.state.card.card.code }
        </div>
        <div className='code'>
        { this.state.card.suit.code }
        </div>
      </Fragment>
    );
  }

  render() {
    return (
      <div
        className={ 'card ' + this.state.card.suit.color + (this.state.selected ? ' selected' : '') }
        style={{transform: 'translateX('+this.state.shift+'px)'}}
        onClick={ this._onClick }
      >
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
