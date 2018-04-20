const React = require('react');
import { Link } from 'react-router-dom';

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
            username: this.props.username,
            password: this.props.password
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
  }

  _renderPassword() {
    if (this.props.password) {
      return (
        <div id="password">
          <label>Password</label>
          <input type="text" name="password" />
        </div>
      );
    }
  }

  _joinGame(slug) {

  }

  render() {
    return (
      <div id="join-form">
        <i className="fas fa-times close-button" onClick={() => this.props.popupHandler({type: 'close'})}></i>
        <form>
          <h3>{ this.props.name }</h3>
          <div>
            { this._renderPassword() }
            <div className="details">
              <div>
                <div className="mode">{ this.props.mode }</div>
                <div className="decks">{ this.props.numDecks } decks</div>
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
            <div className="button-wrapper">
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
