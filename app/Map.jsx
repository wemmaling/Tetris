import React from 'react'
import Cell from 'Cell'
import { indexToCoordinate } from 'utils'

export default class Map extends React.Component {
  render() {
    const map = [
      "XXXXXXXXXX",
      "XXXXXXXXXX",
      "XXXXXXXXXX",
      "XXXXXXXXXX",
      "XXXXXXXXXX",
      "XXXXXXXXXX",
      "XXXXXXXXXX",
      "XXXXXXXXXX",
      "XXXXXXXXXX",
      "XXXXXXXXXX",
      "XXXXXXXXXX",
      "XXXXXXXXXX",
      "XXXXXXXXXX",
      "XXXXXXXXXX",
      "XXXXXXXXXX",
      "XXXXXXXXXX",
      "XXXXXXXXXX",
      "XXXXXXXXXX",
      "XXXXXXXXXX",
      "XXXXXXXXXX",
    ]


    return (
      <div>
        {map.map((s, row) =>
          <g key={row}>
            {Array.from(s).map((c, col) => {
              console.log(row, col)
              const { x, y } = indexToCoordinate(row, col)
              console.log()
              return (
                <Cell key={col} x={x} y={y} />
              )
            })}
          </g>
        )}
      </div>
    )
  }
}