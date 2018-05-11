import React from 'react'
import {connect} from 'react-redux'
import './style/Button.styl'

class Button extends React.Component {
  render() {
    const { text, disabled, clickAction } = this.props
    return (
      <div
        style={{
          cursor: disabled ? 'default' : 'pointer',
          color: disabled ? 'darkgray' : 'white'
          // background: disabled ? '#888888' : '#2a2b2c'
        }}
        className="button"
        onClick={disabled ? null : () => this.props.dispatch({type: clickAction})}
      >
        <span>{text}</span>
      </div>
    )
  }
}

export default connect((state, ownProps) => state.toObject())(Button)