import React from 'react'
import { connect } from 'react-redux'
import * as A from 'action'

class GameOverPage extends React.Component {
  render() {
    const { score } = this.props
    return (
      <div style={{ width: '500px', height: '500px' }}>
        <span style={{marginRight: '10px'}}>Your score: {score}</span>
        <button onClick={() => this.props.dispatch({ type: A.RESTART })}>Restart</button>
      </div>
    )
  }
}

export default connect((state, ownProps) => state.toObject())(GameOverPage)