const React = require('react');
import Card from './Card.js';

export default class Hand extends React.Component {
  constructor(props) {
    super(props);

    this.state = this.props
  }

  componentDidUpdate(prevProps) {
    if (prevProps != this.props) {
      this.setState(this.props);
    }
  }

  render() {
    return (
      <div className='hand'>
        {
          this.state.cards.map((card, index) => (
            <Card card={ card.card } suit={ card.suit } shift={ -140*index } />
          ))
        }
      </div>
    );
  }
}
