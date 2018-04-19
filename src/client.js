const React = require('react');
const ReactDOM = require('react-dom');
import App from '../components/App.js';

import { BrowserRouter } from 'react-router-dom';

ReactDOM.render(
  (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  ),
  document.getElementById('root')
);
