import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import store from 'store'
import TetrisMap from './TetrisMap'

ReactDOM.render(
  <Provider store={store}>
    <TetrisMap />
  </Provider>,
  document.getElementById('container')
)