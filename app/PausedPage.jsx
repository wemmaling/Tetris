import React from 'react'
import { connect } from 'react-redux'
import Button from './Button'
import './style/pausePage.styl'
import * as A from './action'

class PausedPage extends React.Component {
  render() {
    const startButton = <Button disabled={false} clickAction={A.CONTINUE} text="继续" />
    const reStartButton = <Button clickAction={A.RESTART} disabled={false} text="重新开始" />


    return (
      <div className="line">
        <span>PAUSED</span>
        <div className="each-button">{startButton}</div>
        <div className="each-button"><Button disabled={false} text="···"
                                             onClick={() => console.log('click')} /></div>
        <div className="each-button">{reStartButton}</div>
      </div>
    )
  }
}

export default connect((state, ownProps) => state.toObject())(PausedPage)