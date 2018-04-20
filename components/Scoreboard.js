const React = require('react');
const Fragment = React.Fragment;

export default class Scoreboard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      roundWins: [],
      gameWins: []
    };

    this.props.socket.on('receive-wins-round', (data) => {
      const players = JSON.parse(data);
      this.setState({roundWins: players});
    });

    this.props.socket.on('receive-wins-game', (data) => {
      const players = JSON.parse(data);
      this.setState({gameWins: players});
    });
  }

  componentDidMount() {
    this.props.socket.emit('get-wins');
  }

  _getTrophy(index) {
    if (index === 0) {
      return 'gold';
    } else if (index === 1) {
      return 'silver';
    } else {
      return 'bronze';
    }
  }

  _renderRoundWins() {
    return (
      <div id='round-wins'>
        { this.state.roundWins.map((round, index) =>
          (
            <div>
              <i className={ 'fas fa-trophy fa-2x ' + this._getTrophy(index) }></i>
              <a className='user' href={ '/user/' + round.username }>{ round.username }</a>
              <span>{ round.wins }</span>
            </div>
          )
        ) }
      </div>
    );
  }

  _renderGameWins() {
    return (
      <div id='game-wins'>
        { this.state.gameWins.map((game, index) =>
          (
            <div>
              <i className={ 'fas fa-trophy fa-2x ' + this._getTrophy(index) }></i>
              <a className='user' href={ '/user/' + game.username }>{ game.username }</a>
              <span>{ game.wins }</span>
            </div>
          )
        ) }
      </div>
    );
  }

  render() {
    return (
      <Fragment>
        <h1>Scoreboard</h1>
        <div id='scoreboard'>
          <h3>Round Wins</h3>
          { this._renderRoundWins() }
          <h3>Game Wins</h3>
          { this._renderGameWins() }
        </div>
      </Fragment>
    );
  }
};
