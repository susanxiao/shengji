const React = require('react');

export class CreateButton extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className='button-wrapper'>
        <div id='create-button' className='button' onClick={() => this.props.popupHandler({type: 'create'})} >
          Start a new game
        </div>
      </div>
    );
  }
};

export class CreatePopup extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      name: '',
      password: '',
      mode: 'shengji',
      numDecks: '2',
      maxPlayers: '9',
      error: ''
    };

    this._createGame = this._createGame.bind(this);
    this._handleName = this._handleName.bind(this);
    this._handlePassword = this._handlePassword.bind(this);
    this._handleMode = this._handleMode.bind(this);
    this._handleNumDecks = this._handleNumDecks.bind(this);
    this._handleMaxPlayers = this._handleMaxPlayers.bind(this);
  }

  _createGame() {
    if (this.state.name === '') {
      this.setState({error: 'Name cannot be empty.'});
    } else if (this.state.numDecks < 2 || this.state.numDecks > 4) {
      this.setState({error: 'Number of decks must be between 2 and 4.'});
    } else if (this.state.maxPlayers < 4 || this.state.maxPlayers > 9) {
      this.setState({error: 'Max players must be between 4 and 9'});
    } else if (this.state.mode !== 'shengji' && this.state.mode !== 'zhaopengyou') {
      this.setState({error: 'Choose a mode.'});
    } else {
      let data = 'name='+this.state.name;
      if (password !== '') {
        data += '&password='+this.state.password;
      }
      data += '&mode='+this.state.mode+'&numDecks='+this.state.numDecks+'&maxPlayers='+this.state.maxPlayers;

      fetch('/game/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        credentials: 'same-origin',
        body: data
      }).then(response => {
        if (response.status === 200) {
          // TODO: redirect to game/slug
          this.setState({error: ''});
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

  _handleName(evt) {
    this.setState({name: evt.target.value});
  }

  _handlePassword(evt) {
    this.setState({password: evt.target.value});
  }

  _handleMode(mode) {
    this.setState({mode: mode});
  }

  _handleNumDecks(evt) {
    this.setState({numDecks: evt.target.value});
  }

  _handleMaxPlayers(evt) {
    this.setState({maxPlayers: evt.target.value});
  }

  render() {
    return (
      <div id='create-form'>
        <i className='fas fa-times close-button' onClick={() => this.props.popupHandler({type: 'close'})}></i>
        <form>
          <h3>Create a New Game</h3>
          { this.state.error ? <div id='error'><div>{ this.state.error }</div></div> : null }
          <div id='name' className='input'>
            <label>Name</label>
            <input type='text' required value={ this.state.name } onChange={ this._handleName } />
          </div>
          <div id='password' className='input'>
            <label>Password</label><input type='text' value={ this.state.password } onChange={ this._handlePassword } />
          </div>
          <div id='mode' className='input'>
            <div>
              <input
                type='radio'
                checked={ this.state.mode === 'shengji' }
                onClick={ () => this._handleMode('shengji') }
              />
              <label>Shengji</label>
            </div>
            <div>
              <input
                type='radio'
                checked={ this.state.mode === 'zhaopengyou' }
                onClick={ () => this._handleMode('zhaopengyou') }
              />
              <label>Zhaopengyou</label>
            </div>
          </div>
          <div id='details' className='input'>
            <label># decks</label>
            <input
              type='number'
              value={ this.state.numDecks }
              onChange={ this._handleNumDecks }
              min='2'
              max='4'
            />
            <label>Max # Players</label>
            <input
              type='number'
              value={ this.state.maxPlayers }
              onChange={ this._handleMaxPlayers }
              min='4'
              max='9'
            />
          </div>
          <div className='button-wrapper'>
            <div
              className='button'
              id='create-game'
              onClick={ this._createGame }
            >
              Create
            </div>
          </div>
        </form>
      </div>
    );
  }
};
