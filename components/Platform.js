const React = require('react');
const Fragment = React.Fragment;
import Hand from './Hand.js';
import ChatBox from './ChatBox.js';

export default class Platform extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      cards: {},
      cut: false,
      selected: [],
      trumpSuitKey: '',
      trumpCardKey: '',
      status: 'call',
      error: ''
    };

    this.hand = React.createRef();

    this._clickCut = this._clickCut.bind(this);
    this._closeCut = this._closeCut.bind(this);
    this._toggleSelect = this._toggleSelect.bind(this);
    this._callSuit = this._callSuit.bind(this);
    this._clearSelect = this._clearSelect.bind(this);

    this.props.socket.on('cut-deck', _ => {
      this.setState({cut: true});
    });

    this.props.socket.on('close-cut-deck', data => {
      this._closeCut();
    });

    this.props.socket.on('update-hand', data => {
      const hand = JSON.parse(data);
      this.setState({cards: hand});
    });

    this.props.socket.on('update-trump-card', data => {
      this.setState({trumpCardKey: data});
    });

    this.props.socket.on('update-trump-suit', data => {
      this.setState({trumpSuitKey: data});
    })
  }

  componentDidMount() {
    this.props.socket.emit('loaded');
  }

  _callSuit() {
    const selected = this.state.selected;
    if (selected.length === 0) {
      this.setState({error: 'Select a card to call a suit.'});
    } else if (selected.length > 1) { // TODO: change so you can replace someone's call
      this.setState({error: 'Choose one card.'});
    } else if (selected[0].props.card.card.code !== this.state.trumpCardKey) {
      this.setState({error: 'You must select a ' + this.state.trumpCardKey + ' to call a suit.'});
    } else {
      this.setState({error: ''});
      const data = {username: this.props.username, suit: this.state.selected[0].props.card.suitKey};
      this.props.socket.emit('update-trump-suit', JSON.stringify(data));
      this._clearSelect();
    }
  }

  _clearSelect() {
    this.hand.current.clearCards(this.state.selected);
    this.setState({selected: []});
  }

  _toggleSelect(cardComp, select) {
    const selected = this.state.selected;
    if (select) {
      selected.push(cardComp);
    } else {
      selected.splice(selected.indexOf(cardComp), 1);
    }
    this.setState({selected: selected});
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

  _renderError() {
    if (this.state.error) {
      return (
        <div id='error'>
          <div>{ this.state.error }</div>
        </div>
      );
    }
  }

  _renderButton() {
    if (this.state.status === 'call') {
      return (
        <div className='button' id='call-button' onClick={ this._callSuit }>
          Call
        </div>
      );
    } else {
      return (
        <div className='button' id='play-button'>
          Play
        </div>
      );
    }
  }

  render() {
    return (
      <Fragment>
        <div id='platform'>
          <div id='game-platform'>
            <div id='information'>
              <div id='trump-information'>
                <div id='trump-suit'>
                  { this.state.trumpSuitKey ? 'The trump suit is: ' + this.state.trumpSuitKey : 'There is no trump suit yet.' }
                </div>
                <div id='trump-card'>
                  { this.state.trumpCardKey ? 'The trump card is: ' + this.state.trumpCardKey + '.' : '' }
                </div>
              </div>
              <div id='interact-information'>
                { this._renderError() }
                { this._renderButton() }
                <div className='button' id='clear-button' onClick={ this._clearSelect }>
                  Clear
                </div>
              </div>
            </div>
            <div id='own-hand'>
              <Hand cards={ this.state.cards } selectHandler={ this._toggleSelect } ref={ this.hand } />
            </div>
          </div>
          <ChatBox socket={ this.props.socket } />
        </div>
        { this._renderCutButton() }
      </Fragment>
    );
  }
}
