import React from 'react'
import { CELL_HEIGHT, CELL_WIDTH } from './constants'

export default class Cell extends React.Component {
  render() {
    const { x, y, fill } = this.props
    const r = fill === 'black' ? 0 : 5
    return (
      <rect
        x={x}
        y={y}
        rx={r}
        ry={r}
        width={CELL_WIDTH}
        height={CELL_HEIGHT}
        fill={fill}
        stroke="#3e4041"
        strokeWidth="0.5"
      />
    )
  }
}