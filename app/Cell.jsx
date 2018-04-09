import React from 'react'
import {CELL_HEIGHT, CELL_WIDTH} from './constants'

export default class Cell extends React.Component {
  render() {
    const { x, y, fill } = this.props
    return (
        <rect
          x={x}
          y={y}
          width={CELL_WIDTH}
          height={CELL_HEIGHT}
          fill={fill}
          stroke="#000000"
        />
    )
  }
}