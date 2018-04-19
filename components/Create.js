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
  }

  render() {
    return (
      <div id="create-form" className="">
        <i className="fas fa-times close-button" onClick={() => this.props.popupHandler({type: 'close'})}></i>
        <form>
          <h3>Create a New Game</h3>
          <div id="name">
            <label>Name</label><input type="text" name="name" required="" />
          </div>
          <div id="password">
            <label>Password</label><input type="text" name="password" />
          </div>
          <div id="mode">
            <div>
              <input type="radio" name="mode" value="shengji" checked="" /><label>Shengji</label>
            </div>
            <div>
              <input type="radio" name="mode" value="zhaopengyou" /><label>Zhaopengyou</label>
            </div>
          </div>
          <div id="details">
            <label># decks</label><input type="number" name="numDecks" value="2" min="2" max="4" />
            <label>Max # Players</label><input type="number" name="maxPlayers" value="9" min="4" max="9" />
          </div>
          <div className="button-wrapper">
            <div
              className='button'
              id='create-game'
              onClick={ this._createGame() }
            >
              Create
            </div>
          </div>
        </form>
      </div>
    );
  }
};
