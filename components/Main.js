const React = require('react');
import Games from './Games.js';
import Scoreboard from './Scoreboard.js';
import User from './User.js';
import Lobby from './Lobby.js';

import { Switch, Route } from 'react-router-dom';

export default class Main extends React.Component {
  constructor(props) {
    super(props);

    this.state = props;
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      this.setState(this.props);
    }
  }

  // https://stackoverflow.com/questions/35835670/react-router-and-this-props-children-how-to-pass-state-to-this-props-children
  render() {
    return (
      <div id='body'>
        <Switch>
          <Route exact path='/'
            render={ _ => (
              <Games {...this.state} />
            ) }
          />
          <Route exact path='/scoreboard'
            render={ _ => (
              <Scoreboard socket={this.state.socket} />
            )}
          />
          <Route path='/user/:username'
            render={ ({match}) => (
              <User {...this.state} match={ match } />
            ) }
          />
          <Route path='/game/:game'
            render={ ({match}) => (
              <Lobby {...this.state} match={ match } />
            ) }
          />
        </Switch>
      </div>
    );
  }
};
