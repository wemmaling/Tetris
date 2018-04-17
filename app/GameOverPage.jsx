import React from 'react'
import { connect } from 'react-redux'
import * as A from 'action'
import Button from 'Button'

class GameOverPage extends React.Component {
  render() {
    const { score } = this.props
    return (
      <div className="game-over">
        <span style={{ marginRight: '10px' }}>Your score: {score}</span>
        <Button onClick={() => this.props.dispatch({ type: A.RESTART })} text="重新开始" />
      </div>
    )
  }
}

export default connect((state, ownProps) => state.toObject())(GameOverPage)