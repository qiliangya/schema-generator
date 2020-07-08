import React from 'react';
import ReactDOM from 'react-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import App from './App';
import './index.css';

const Root = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <App />
    </DndProvider>
  );
};

ReactDOM.render(<Root />, document.getElementById('root'));
