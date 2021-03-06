const React = require('react');
const Fragment = React.Fragment;
import { Link } from 'react-router-dom';
import { CreateButton, CreatePopup } from './Create.js';
import { JoinButton, JoinPopup } from './Join.js';
import Auth from './Auth.js';

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = props;
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      this.setState(this.props);
    }
  }

  render() {
    return (
      <div
        id={ this.state.slug }
        className={ 'game' + (this.state.password ? ' password' : '') }
      >
        <div>
          <span className='title'>{ this.state.name }</span>
          { (this.state.password) ? <i className='fas fa-lock fa-sm'></i> : null }
        </div>
        <div className='details'>
          <div>
            <div className='mode'>{ this.state.mode }</div>
            <div className='decks'>{ this.state.numDecks } decks</div>
          </div>
          <div className='users'>
            <div className='count'>Users ({ this.state.players.length }/{ this.state.maxPlayers }):</div>
            {
              this.state.players.map(player =>
                <div><Link to={ '/user/'+player } className='user'>{ player }</Link></div>
              )
            }
          </div>
        </div>
        <JoinButton
          name={ this.state.name }
          password={ !!this.state.password }
          slug={ this.state.slug }
          mode={ this.state.mode }
          numDecks={ this.state.numDecks }
          players={ this.state.players }
          maxPlayers={ this.state.maxPlayers }
          popupHandler={ this.props.popupHandler }
        />
      </div>
    );
  }
}

export default class Games extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      games: [],
      username: this.props.username,
      popup: null
    };

    this.props.socket.on('receive-game-all', (data) => {
      const games = JSON.parse(data);
      this.setState({games: games});
    });

    this.props.socket.on('receive-game', (data) => {
      const game = JSON.parse(data);
      const games = this.state.games;
      games.push(game);
      this.setState({games: games});
    });

    this.props.socket.on('receive-removal', (data) => {
      const game = JSON.parse(data);
      console.log(game);
      const games = this.state.games;
      games.some((g, index) => {
        if (g._id === game._id) {
          games.splice(index, 1);
          return true;
        }
        return false;
      });
      this.setState({games: games});
    });

    this.props.socket.on('receive-update', (data) => {
      const game = JSON.parse(data);
      const games = this.state.games;
      games.some((g, index) => {
        if (g._id === game._id) {
          games.splice(index, 1, game);
          return true;
        }
        return false;
      });
      this.setState({games: games});
    });

    this._handlePopup = this._handlePopup.bind(this);
  }

  componentDidMount() {
    this.props.socket.emit('get-game-all');
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      this.setState({username: this.props.username});
    }
  }

  _handlePopup(popup) {
    if (popup.type === 'close') {
      this.setState({popup: null});
    } else {
      this.setState({popup: popup});
    }
  }

  _renderPopup() {
    if (this.state.popup && this.props.username) {
      if (this.state.popup.type === 'create') {
        return (
          <Fragment>
            <div id='overlay'></div>
            <CreatePopup popupHandler={ this._handlePopup } />
          </Fragment>
        );
      } else if (this.state.popup.type === 'join') {
        return (
          <Fragment>
            <div id='overlay'></div>
            <JoinPopup
              username={ this.state.username }
              slug={ this.state.popup.slug }
              password={ this.state.popup.password }
              name={ this.state.popup.name }
              mode={ this.state.popup.mode }
              numDecks={ this.state.popup.numDecks }
              players={ this.state.popup.players }
              maxPlayers={ this.state.popup.maxPlayers }
              popupHandler={ this._handlePopup }
            />
          </Fragment>
        );
      }
    } else if (this.state.popup) {
      return (
        <Fragment>
          <div id='overlay'></div>
          <Auth
            socket={ this.props.socket }
            loginHandler={ this.props.loginHandler }
            popupHandler={ this._handlePopup }
            login={ true }
          />
        </Fragment>
      )
    }
  }

  _renderGames() {
    return (
      <div id='games'>
        <div>
        {
          this.state.games.map(game =>
            <Game
              slug={ game.slug }
              password={ !!game.password }
              name={ game.name }
              mode={ game.mode }
              numDecks={ game.numDecks }
              players={ game.players }
              maxPlayers={ game.maxPlayers }
              popupHandler={ this._handlePopup }
            />
          )
        }
        </div>
      </div>
    );
  }

  render() {
    return (
      <Fragment>
        <h1>Shengji</h1>
        <CreateButton popupHandler={ this._handlePopup } />
        { this._renderGames() }
        { this._renderPopup() }
      </Fragment>
    );
  }
};
