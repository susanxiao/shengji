const React = require('react');
const Fragment = React.Fragment;
const io = require('socket.io-client');

import Header from './Header.js';
import Main from './Main.js';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    const socket = io();

    this.state = {
      username: '',
      socket: socket
    };

    this._handleLogin = this._handleLogin.bind(this);
  }

  _handleLogin(username) {
    this.setState({username: username});
  }

  render() {
    return (
      <Fragment>
        <Header {...this.state} loginHandler={ this._handleLogin } />
        <Main {...this.state} loginHandler={ this._handleLogin } />
      </Fragment>
    );
  }
};
