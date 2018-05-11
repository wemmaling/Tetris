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
        <div className="highest-score">
          <span>HIGHEST SCORE</span>
          <div className="score-board">{localStorage.getItem('highest-score')}</div>
        </div>
        <span>Your score</span>
        <div className="score">{score}</div>
        <Button clickAction={A.RESTART} disabled={false} text="重新开始" />
      </div>
    )
  }
}

export default connect((state, ownProps) => state.toObject())(GameOverPage)