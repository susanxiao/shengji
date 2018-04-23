const React = require('react');
const io = require('socket.io-client');

import ChatBox from './ChatBox.js';

export default class Platform extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      waiting: true
    }
  }

  render() {
    return null;
  }
}
