import React from 'react'
import { connect } from 'react-redux'
import * as A from 'action'
import Button from 'Button'
import './style/GameOver.styl'

class GameOverPage extends React.Component {
  render() {
    const { score } = this.props
    return (
      <div className="game-over">
        <h4>Your score</h4>
        <div className="score">{score}</div>
        <Button onClick={() => this.props.dispatch({ type: A.RESTART })} disabled={false} text="重新开始" />
      </div>
    )
  }
}

export default connect((state, ownProps) => state.toObject())(GameOverPage)