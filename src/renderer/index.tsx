import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import './index.css';
import './DataSchema';
import './UIDefinition';

ReactDOM.render(
  <App />,
  document.getElementById('app') as HTMLElement
);
registerServiceWorker();
