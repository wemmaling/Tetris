import React from 'react'

export default class Cell extends React.Component {
  render() {
    const { x, y } = this.props
    return (
      <svg>
        <rect
          x={x}
          y={y}
          width="50"
          height="50"
          fill="#FFFFFF"
          stroke="#000000"
        />
      </svg>
    )
  }
}