const React = require('react');
import Hand from './Hand.js';
import ChatBox from './ChatBox.js';

export default class Platform extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div id='platform'>
        <div id='game-platform'>
          <Hand />
        </div>
        <ChatBox socket={ this.props.socket } />
      </div>
    );
  }
}
