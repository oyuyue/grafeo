import React from 'react';
import ReactDOM from 'react-dom';
import { exportApp } from 'grafeo'
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

export default exportApp(function (opts = {}, isRoot) {
  let container;

  const mount = function (el) {
    if (container) return
    container = el || opts.el
    if (typeof container === 'string') container = document.querySelector(container)
    ReactDOM.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
      container
    );
  }

  if (isRoot) return mount('#root')

  return {
    mount,
    destroy() {
      if (container) {
        ReactDOM.unmountComponentAtNode(container)
        container = undefined;
      }
    }
  }
})
