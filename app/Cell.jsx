import React from 'react'

export default class Cell extends React.Component {
  render() {
    const { x, y, fill } = this.props
    return (
        <rect
          x={x}
          y={y}
          width="50"
          height="50"
          fill={fill}
          stroke="#000000"
        />
    )
  }
}