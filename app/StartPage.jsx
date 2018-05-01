import React from 'react'
import Button from './Button'
import './style/pausePage.styl'
import * as A from './action'
import { connect } from 'react-redux'

class StartPage extends React.Component {
  render() {
    const startButton = <Button
      disabled={false}
      onClick={() => {
        this.props.dispatch({ type: A.RESTART })
      }}
      text="开始游戏"
    />
    return (
      <div className="line">
        <span>Emma's Tetris!</span>
        <div className="each-button">{startButton}</div>
        <div className="each-button"><Button disabled={false} text="..." onClick={() => console.log('click')} /></div>
      </div>
    )
  }
}

export default connect((state, ownProps) => state.toObject())(StartPage)