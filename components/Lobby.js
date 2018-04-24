const React = require('react');
const Fragment = React.Fragment;
const io = require('socket.io-client');

import { Link, Redirect } from 'react-router-dom';
import ChatBox from './ChatBox.js';
import Platform from './Platform.js';

export default class Lobby extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      started: false,
      gameSocket: null,
      slug: this.props.match.params.game,
      auth: false,
      redirect: false,
      loading: true,
      bar: false,
      game: null,
      timeout: null,
    };

    this.props.socket.on('receive-game-details', data => {
      if (data !== '') {
        const details = JSON.parse(data);
        this.setState({game: details});
        if (!this.state.gameSocket) {
          const socket = io('/'+details._id);

          socket.on('receive-leave', data => {
            const players = this.state.game.players;
            players.splice(players.indexOf(data), 1);
            const game = this.state.game;
            game.players = players;
            this.setState({game: game});
          });

          socket.on('receive-join', data => {
            const players = this.state.game.players;
            players.push(data);
            const game = this.state.game;
            game.players = players;
            this.setState({game: game});
          });

          socket.on('start-bar', _ => {
            this.setState({bar: true});
            const timeout = window.setTimeout(this._endBar, 10000);
            this.setState({timeout: timeout});
          });

          socket.on('start-game', _ => {
            this.setState({started: true});
          });

          this.setState({gameSocket: socket});
          this.setState({auth: true});
        }
      } else {
        this.setState({auth: false});
      }
      this.setState({loading: false});
    });

    this._getDetails = this._getDetails.bind(this);
    this._leaveGame = this._leaveGame.bind(this);
    this._startBar = this._startBar.bind(this);
    this._endBar = this._endBar.bind(this);
    this._clickStart = this._clickStart.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      this._getDetails();
    }
  }

  componentDidMount() {
    this._getDetails();
  }

  _startBar() {
    // TODO: put this check back in; took it out for testing
    // if (this.state.game.players.length >= 4) {
    if (!this.state.timeout) {
      this.state.gameSocket.emit('start-bar');
      this.setState({bar: true});
      const timeout = window.setTimeout(this._endBar, 10000);
      this.setState({timeout: timeout});
    }
  }

  _clickStart() {
    this.setState({bar: false});
    this.state.gameSocket.emit('start-queue', this.props.username);
  }

  _endBar() {
    this.setState({bar: false});
    this.state.gameSocket.emit('end-queue');
    clearTimeout(this.state.timeout);
    this.setState({timeout: null});
  }

  _getDetails() {
    if (!this.props.username) {
      this.setState({auth: false});
    } else if (!this.state.gameSocket) {
      this.props.socket.emit('get-game-details', JSON.stringify({
        slug: this.state.slug,
        username: this.props.username
      }));
    }
  }

  _leaveGame(deleteGame) {
    const data = 'slug='+this.state.slug+(deleteGame ? '&delete='+deleteGame : '');
    fetch('/game/leave', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      credentials: 'same-origin',
      body: data
    }).then(response => {
      if (response.status === 200) {
        if (this.state.gameSocket) {
          this.state.gameSocket.disconnect();
          this.setState({gameSocket: null});
        }
        this.setState({redirect: true});
      }
    });
  }

  _renderBar() {
    return (
      <Fragment>
        <div id='overlay' className={ this.state.bar ? '' : 'hidden' }></div>
        <div id='start-popup' className={ this.state.bar ? '' : 'hidden' }>
          <div className={ this.state.bar ? 'waiting-bar' : '' }></div>
          <div className='button-wrapper'>
            <div className='button' id='start-button' onClick={ this._clickStart }>Start</div>
          </div>
        </div>
      </Fragment>
    );
  }

  _renderLeave() {
    if (this.state.game.password && this.state.game.players.length === 1) {
      return (
        <div className='button-wrapper'>
          <div className='button' onClick={ () => this._leaveGame(true) }>{ 'Leave and delete game' }</div>
        </div>
      );
    } else if (this.state.game.players.length === 1) {
      return (
        <div className='button-wrapper'>
          <div className='button' onClick={ () => this._leaveGame(false) }>{ 'Leave game' }</div>
          <div className='button' onClick={ () => this._leaveGame(true) }>{ 'Leave and delete game' }</div>
        </div>
      );
    } else {
      return (
        <div className='button-wrapper'>
          <div className='button' onClick={ () => this._leaveGame(false) }>{ 'Leave game' }</div>
        </div>
      );
    }
  }

  render() {
    if (this.state.redirect) {
      return (
        <Redirect
          to={{
            pathname: '/'
          }}
        />
      );
    } else if (!this.state.auth) {
      return (
        <div id='game-lobby'>
          <h1>Oops!</h1>
          <div>
          { 'You aren\'t supposed to be here.' }
          </div>
          <div>
            <Link to='/'>Find a game.</Link>
          </div>
        </div>
      );
    } else if (!this.state.started) {
      return (
        <div id='game-lobby'>
          <h1>{ this.state.game.name }</h1>
          <div className='details'>
            <div>
              <div className='mode'>{ this.state.game.mode }</div>
              <div className='decks'>{ this.state.game.numDecks } decks</div>
            </div>
            <div className='users'>
              <div className='count'>Users ({ this.state.game.players.length }/{ this.state.game.maxPlayers }):</div>
              {
                this.state.game.players.map(player =>
                  <div><Link to={ '/user/'+player } className='user'>{ player }</Link></div>
                )
              }
            </div>
          </div>
          { this._renderLeave() }
          <ChatBox socket={ this.state.gameSocket } username={ this.props.username } />
          <div className='button-wrapper'>
            <div
              id='bar-button'
              className={ this.state.game.players.length < 4 ? 'disable' : 'button'}
              onClick={ this._startBar }
            >
              Start
            </div>
          </div>
          { this._renderBar() }
        </div>
      );
    } else {
      return (
        <Platform socket={ this.state.gameSocket } />
      );
    }
  }
};
