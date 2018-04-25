const React = require('react');
const Fragment = React.Fragment;
import Hand from './Hand.js';
import ChatBox from './ChatBox.js';

export default class Platform extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      cards: [],
      cut: false,
    };

    this._clickCut = this._clickCut.bind(this);
    this._closeCut = this._closeCut.bind(this);

    this.props.socket.on('cut-deck', _ => {
      this.setState({cut: true});
    });

    this.props.socket.on('close-cut-deck', data => {
      this._closeCut();
    });

    this.props.socket.on('print-hand', data => {
      const hand = JSON.parse(data);
      this.setState({cards: hand});
    });
  }

  componentDidMount() {
    this.props.socket.emit('loaded');
  }

  _clickCut() {
    this.props.socket.emit('cut-deck', this.props.username);
  }

  _closeCut() {
    this.setState({cut: false});
  }

  _renderCutButton() {
    if (this.state.cut) {
      return (
        <Fragment>
          <div id='overlay' className={ this.state.cut ? '' : 'hidden' }></div>
          <div id='cut-popup' className={ this.state.cut ? '' : 'hidden' }>
            <div>{ 'Cut the deck to see who goes first.' }</div>
            <div className='button-wrapper'>
              <div className='button' id='cut-button' onClick={ this._clickCut }>Cut</div>
            </div>
          </div>
        </Fragment>
      );
    }
  }

  render() {
    return (
      <Fragment>
        <div id='platform'>
          <div id='game-platform'>
            <div id='own-hand'>
              <Hand cards={ this.state.cards } />
            </div>
          </div>
          <ChatBox socket={ this.props.socket } />
        </div>
        { this._renderCutButton() }
      </Fragment>
    );
  }
}
