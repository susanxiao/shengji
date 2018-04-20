const React = require('react');
import { Redirect, Link } from 'react-router-dom';

export class JoinButton extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className='button-wrapper'>
        <div
          className='join-button button'
          onClick={() => this.props.popupHandler({
            type: 'join',
            name: this.props.name,
            password: this.props.password,
            slug: this.props.slug,
            mode: this.props.mode,
            numDecks: this.props.numDecks,
            players: this.props.players,
            maxPlayers: this.props.maxPlayers
          })}
        >
          Join
        </div>
      </div>
    );
  }
};

export class JoinPopup extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      error: '',
      password: '',
      redirect: false
    };

    this._handlePassword = this._handlePassword.bind(this);
    this._joinGame = this._joinGame.bind(this);
  }

  _renderPassword() {
    if (this.props.password) {
      return (
        <div id='password'>
          <label>Password</label>
          <input type='text' value={ this.state.password } onChange={ this._handlePassword } />
        </div>
      );
    }
  }

  _handlePassword(evt) {
    this.setState({password: evt.target.value});
  }

  _joinGame(slug) {
    if (this.props.password && !this.state.password) {
      this.setState({error: 'Please enter the password.'});
    } else {
      const data = 'slug='+slug+(this.props.password ? '&password=' + this.state.password : '');
      fetch('/game/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        credentials: 'same-origin',
        body: data
      }).then(response => {
        if (response.status === 200) {
          this.setState({error: ''});
          this.setState({redirect: true});
          this.props.popupHandler({type: 'close'});
        } else {
          return response.json().then(data => {
            if (data.message) {
              this.setState({error: data.message});
            }
          });
        }
      });
    }
  }

  render() {
    if (this.state.redirect) {
      return (
        <Redirect
          to={{
            pathname: '/game/'+this.state.slug
          }}
        />
      );
    } else {
      return (
         this._renderPopup()
      );
    }
  }

  _renderPopup() {
    return (
      <div id='join-form'>
        <i className='fas fa-times close-button' onClick={() => this.props.popupHandler({type: 'close'})}></i>
        <form>
          <h3>{ this.props.name }</h3>
          { this.state.error ? <div id='error'><div>{ this.state.error }</div></div> : null }
          <div>
            { this._renderPassword() }
            <div className='details'>
              <div>
                <div className='mode'>{ this.props.mode }</div>
                <div className='decks'>{ this.props.numDecks } decks</div>
              </div>
              <div className='users'>
                <div className='count'>Users ({ this.props.players.length }/{ this.props.maxPlayers }):</div>
                {
                  this.props.players.map(player =>
                    <div><Link to={ '/user/'+player } className='user'>{ player }</Link></div>
                  )
                }
              </div>
          </div>
          </div>
            <div className='button-wrapper'>
              <div
                className='button'
                id='join-game'
                onClick={ () => this._joinGame(this.props.slug) }
              >
                Join
              </div>
            </div>
        </form>
      </div>
    );
  }
};
