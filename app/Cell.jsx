import React from 'react'
import { CELL_HEIGHT, CELL_WIDTH } from './constants'

export default class Cell extends React.Component {
  render() {
    const { x, y, fill, real } = this.props
    const r = fill === 'black' ? 0 : 5
    const p = real ? 0 : 1
    return (
      <rect
        x={x + p}
        y={y + p}
        rx={r}
        ry={r}
        width={CELL_WIDTH - 2 * p}
        height={CELL_HEIGHT - 2 * p}
        fill={real ? fill : 'none'}
        stroke={real ? '#3e4041' : fill}
        strokeWidth={real ? '0.5' : '1'}
      />
    )
  }
}