const React = require('react');
import { animateScroll } from "react-scroll";

export default class ChatBox extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      message: '',
      messages: []
    }

    this.props.socket.on('receive-message-all', data => {
      const messages = JSON.parse(data);
      this.setState({messages: messages}, this._scrollToBottom);
    });

    this.props.socket.on('receive-message', data => {
      const messages = this.state.messages;
      messages.push(data);
      this.setState({messages: messages}, this._scrollToBottom);
    });

    this._handleMessage = this._handleMessage.bind(this);
    this._handleKeyPress = this._handleKeyPress.bind(this);
  }

  componentDidMount() {
    this.props.socket.emit('get-message-all');
  }

  _handleMessage(evt) {
    this.setState({message: evt.target.value});
  }

  _handleKeyPress(evt) {
    if (evt.key === 'Enter') {
      this.props.socket.emit('add-message', this.props.username + ': ' + this.state.message);
      this.setState({message: ''});
    }
  }

  _scrollToBottom() {
    animateScroll.scrollToBottom({
      containerId: 'messages'
    });
  }

  render() {
    return (
      <div id='chatbox'>
        <ul id='messages'>
        {
          this.state.messages.map(message =>
            (
              <li>{ message }</li>
          ))
        }
        </ul>
        <input
          type='text'
          value={ this.state.message }
          onChange={ this._handleMessage }
          onKeyPress={ this._handleKeyPress }
        />
      </div>
    );
  }
};
