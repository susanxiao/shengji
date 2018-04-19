const React = require('react');

export default class Auth extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      error: null,
      login: this.props.login
    };

    this._handleSwitch = this._handleSwitch.bind(this);
  }

  _handleSwitch() {
    this.setState({login: !this.state.login});
  }

  render() {
    if (this.state.login) {
      return (
        <Login
          error={ this.state.error }
          loginHandler = { this.props.loginHandler }
          stateHandler={ this._handleSwitch }
          popupHandler={ this.props.popupHandler }
        />
      );
    } else {
      return (
        <Register
          error={ this.state.error }
          loginHandler={ this.props.loginHandler }
          stateHandler={ this._handleSwitch }
          popupHandler={ this.props.popupHandler }
        />
      );
    }
  }
};

class Login extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      password: '',
      error: null
    };

    this._handleUsername = this._handleUsername.bind(this);
    this._handlePassword = this._handlePassword.bind(this);
    this._login = this._login.bind(this);
  }

  _handleUsername(evt) {
    this.setState({username: evt.target.value});
  }

  _handlePassword(evt) {
    this.setState({password: evt.target.value});
  }

  _login() {
    if (!this.state.username) {
      this.setState({error: 'Please enter a username.'});
    } else if (!this.state.password) {
      this.setState({error: 'Please enter a password'});
    } else {
      const data = 'username='+this.state.username+'&password='+this.state.password;
      fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        credentials: 'same-origin',
        body: data
      }).then(response => response.json()).then(data => {
        if (data.message) {
          this.setState({error: data.message});
        } else {
          this.props.loginHandler(data.username);
          this.props.popupHandler({type: 'close'});
        }
      });
    }

  }

  render() {
    return (
      <div id="login-form">
        <i className="fas fa-times close-button" onClick={() => this.props.popupHandler({type: 'close'})}></i>
        <form className='auth'>
          <h1>Login</h1>
          { this.state.error ? <div id='error'>{ this.state.error }</div> : null }
          <div id='username'>
              <label>Username:</label>
              <input type='text' name='username' value={ this.state.username } onChange={ this._handleUsername } />
          </div>
          <div id='password'>
              <label>Password:</label>
              <input type='password' name='password' value={ this.state.password } onChange={ this._handlePassword } />
          </div>
          <div id='submit'>
              <div id='login' className='button' onClick={ this._login }>Login</div>
          </div>
          <div id='register-link'>Or&nbsp;<a onClick={ this.props.stateHandler }>Register</a></div>
        </form>
      </div>
    );
  }
}

class Register extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      password: '',
      error: null
    };

    this._handleUsername = this._handleUsername.bind(this);
    this._handlePassword = this._handlePassword.bind(this);
    this._register = this._register.bind(this);
  }

  _handleUsername(evt) {
    this.setState({username: evt.target.value});
  }

  _handlePassword(evt) {
    this.setState({password: evt.target.value});
  }

  _register() {
    if (!this.state.username) {
      this.setState({error: 'Please enter a username.'});
    } else if (!this.state.password) {
      this.setState({error: 'Please enter a password'});
    } else {
      const data = 'username='+this.state.username+'&password='+this.state.password;
      fetch('/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        credentials: 'same-origin',
        body: data
      }).then(response => response.json()).then(data => {
        if (data.message) {
          this.setState({error: data.message});
        } else {
          this.props.loginHandler(data.username);
          this.props.popupHandler({type: 'close'});
        }
      });
    }
  }

  render() {
    return (
      <div id="register-form">
        <i className="fas fa-times close-button" onClick={() => this.props.popupHandler({type: 'close'})}></i>
        <form className='auth'>
          <h1>Register</h1>
          { this.state.error ? <div id='error'>{ this.state.error }</div> : null }
          <div id='username'>
              <label>Username:</label>
              <input type='text' name='username' value={ this.state.username } onChange={ this._handleUsername } />
          </div>
          <div id='password'>
              <label>Password:</label>
              <input type='password' name='password' value={ this.state.password } onChange={ this._handlePassword } />
          </div>
          <div id='submit'>
              <div id='login' className='button' onClick={ this._register }>Register</div>
          </div>
          <div id='login-link'>Or&nbsp;<a onClick={ this.props.stateHandler }>Login</a></div>
        </form>
      </div>
    );
  }
}
