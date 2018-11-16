import { createElement } from 'react';
import { render } from 'react-dom';

function MyApplication() {
  return createElement('div', {}, 'Hello world');
}

const rootElement = document.querySelector('.app');
render(createElement(MyApplication), rootElement);
