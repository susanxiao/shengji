const React = require('react');
const io = require('socket.io-client');

import { Link, Redirect } from 'react-router-dom';

export default class Game extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      name: '',
      inGame: false,
      gameSocket: null,
      slug: this.props.match.params.game,
      username: this.props.username,
      auth: false,
      redirect: false
    };

    this.props.socket.on('receive-game-details', data => {
      if (data === '') {
        this.setState({redirect: true});
      } else if (this.props.username !== '') {
        const details = JSON.parse(data);
        if (details.players.includes(this.props.username) && !this.state.gameSocket) {
          const socket = io('/'+details._id);
          socket.emit('test');
          this.setState({gameSocket: socket});
          this.setState({auth: true});
        }
      }
    });

    this._getDetails = this._getDetails.bind(this);
    this._leaveGame = this._leaveGame.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      this._getDetails();
    }
  }

  componentDidMount() {
    this._getDetails();
  }

  _getDetails() {
    this.props.socket.emit('get-game-details', this.state.slug);
  }

  _leaveGame() {
    const data = 'slug='+this.state.slug;
    fetch('/game/leave', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      credentials: 'same-origin',
      body: data
    }).then(response => {
      if (response.status === 200) {
        this.setState({redirect: true});
      }
    });
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
            <Link to='/'>Take me home.</Link>
          </div>
        </div>
      );
    } else {
      return (
        <div id='game-lobby'>
          <h1>{ this.state.slug }</h1>
          <div className='button-wrapper'>
            <div className='button' onClick={ this._leaveGame } >Leave game</div>
          </div>
        </div>
      );
    }
  }
};
