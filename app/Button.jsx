import React from 'react'
import './style/Button.styl'

export default class Button extends React.Component {
  render() {
    const { text, disabled, onClick } = this.props
    return (
      <div
        style={{
          cursor: disabled ? 'default' : 'pointer',
          color: disabled ? 'darkgray' : 'white'
          // background: disabled ? '#888888' : '#2a2b2c'
        }}
        className="button"
        onClick={disabled ? null : onClick}
      >
        {text}
      </div>
    )
  }
}