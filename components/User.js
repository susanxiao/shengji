const React = require('react');
const Fragment = React.Fragment;

export default class User extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      error: '',
      roundWins: 0,
      gameWins: 0,
      playedWith: 0,
      description: '',
      self: false,
      prevDescription: '',
    };

    this._handleBio = this._handleBio.bind(this);
    this._save = this._save.bind(this);

    this.props.socket.on('get-user', data => {
      const details = JSON.parse(data);
      if (details.error) {
        this.setState({error: details.error});
      } else {
        details.error = '';
        details.prevDescription = details.description;
        this.setState(details);
      }
    });
  }

  componentDidMount() {
    this._getDetails();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.username !== this.props.username) {
      this._getDetails();
    }
  }

  _handleBio(evt) {
    this.setState({description: evt.target.value});
  }

  _getDetails() {
    const visitor = this.props.username;
    const visitee = this.props.match.params.username;
    this.setState({self: visitor === visitee});
    this.props.socket.emit('get-user', JSON.stringify({
      visitor: visitor,
      visitee: visitee
    }));
  }

  _save() {
    if (this.state.description !== this.state.prevDescription) {
      fetch('/user/'+this.props.username, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        credentials: 'same-origin',
        body: 'description=' + this.state.description
      }).then(response => {
        if (response.status === 200) {
          this.setState({prevDescription: this.state.description});
        }
      });
    }
  }

  _renderBio() {
    if (this.state.self) {
      return (
        <Fragment>
          <textarea
            id='edit'
            className={ 'bio ' + (this.state.description === this.state.prevDescription ? ' disable' : '') }
            value={ this.state.description }
            onChange={ this._handleBio }
          >
          </textarea>
          <div className='button-wrapper'>
            <div id='save-button'
              className={ this.state.description === this.state.prevDescription ? 'disable' : 'button' }
              onClick={ this._save }
            >
              Save
            </div>
          </div>
        </Fragment>
      );
    } else {
      return (
        <Fragment>
          <div>
            {'You have played with ' }
            <span className='user'>{ this.props.match.params.username }</span>
            { ' ' + this.state.playedWith + ' times.' }
          </div>
          <div className='bio'>
            { this.state.description }
          </div>
        </Fragment>
      );
    }
  }

  render() {
    if (this.state.error) {
      return <h1>{ this.state.error }</h1>
    } else {
      return (
        <div id='user-details'>
          <h1 className='user'>{ this.props.match.params.username }</h1>
          <div>
            <h3>Round Wins</h3>
            { this.state.roundWins }
            <h3>Game Wins</h3>
            { this.state.gameWins }
          </div>
          { this._renderBio() }
        </div>
      )
    }
  }
};
