const React = require('react');
import Games from './Games.js';
import Scoreboard from './Scoreboard.js';
import User from './User.js';
import Game from './Game.js';

import { AppContext } from './App.js';
import { Switch, Route } from 'react-router-dom';

export default class Main extends React.Component {
  // https://stackoverflow.com/questions/35835670/react-router-and-this-props-children-how-to-pass-state-to-this-props-children
  render() {
    return (
      <div id='body'>
        <Switch>
          <Route exact path='/'
            render={ _ => (
                <Games {...this.props} />
            )}
          />
          <Route exact path='/scoreboard' component={Scoreboard} />
          <Route path='/user/:username' component={User} />
          <Route path='/game/:game' component={Game} />
        </Switch>
      </div>
    );
  }
};
