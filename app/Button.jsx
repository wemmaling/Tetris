import React from 'react'
import './style/Button.styl'

export default class Button extends React.Component {
  render() {
    const {text, color, onClick} = this.props
    return (
      <div className="button" onClick={onClick}>
        {text}
      </div>
    )
  }
}