const React = require('react');

export default class User extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      username: this.props.match.params.username
    }
  }

  render() {
    return (
      <div>
      { this.state.username }
      </div>
    );
  }
};
