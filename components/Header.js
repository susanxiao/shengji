const React = require('react');
const Fragment = React.Fragment;
import { Link } from 'react-router-dom';
import { AppContext } from './App.js';
import Auth from './Auth.js';

export default class Header extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      popup: null
    };

    this._handlePopup = this._handlePopup.bind(this);
    this._handleLogout = this._handleLogout.bind(this);
  }

  _handleLogout() {
    const data = 'username='+this.props.username;
    fetch('/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      credentials: 'same-origin',
      body: data
    }).then(response => {
      if (response.status === 200) {
          this.props.loginHandler(null);
      }
    });
  }

  _handlePopup(popup) {
    if (popup.type === 'close') {
      this.setState({popup: null});
    } else {
      this.setState({popup: popup});
    }
  }

  _renderPopup() {
    if (this.state.popup) {
      return (
        <Fragment>
          <div id='overlay'></div>
          <Auth
            socket={ this.props.socket }
            loginHandler={ this.props.loginHandler }
            popupHandler={ this._handlePopup }
            login={ this.state.popup.type === 'login' }
          />
        </Fragment>
      )
    }
  }

  _renderUserInfo() {
    if (this.props.username) {
      return (
        <div>
          <Link
            to={{ pathname: '/user/' + this.props.username }}
            className='user'
          >
            { this.props.username }
          </Link>&nbsp;|&nbsp;
          <a onClick={ this._handleLogout }>Logout</a>
        </div>
      );
    } else {
      return (
        <div>
          <a onClick={() => this._handlePopup({type: 'login'})}>Login</a>&nbsp;|&nbsp;
          <a onClick={() => this._handlePopup({type: 'register'})}>Register</a>
        </div>
      );
    }
  }

  render() { // TODO: lock the links when game is in play, all urls redirect to game page
    return (
      <Fragment>
        <div id='header'>
          <div>
            <Link to='/scoreboard'>Scoreboard</Link>&nbsp;|&nbsp;
            <Link to='/'>Games</Link>
          </div>
          { this._renderUserInfo() }
        </div>
        { this._renderPopup() }
      </Fragment>
    );
  }
};
