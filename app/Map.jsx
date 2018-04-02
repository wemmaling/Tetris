import React from 'react'
import Cell from 'Cell'
import { indexToCoordinate } from 'utils'

export default class Map extends React.Component {
  constructor() {
    super()
    this.state = {
      map: [
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
    }
  }

  updateMap = (map) => {

  }

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
      "XXXXXXRRRX",
      "XXXXXXXRXX",
      "XXXXXXXXXX",
      "XXXXXXXXXX",
      "XXBBXXXXXX",
      "XXXBBXXXXX",
      "XXXXXXXXXX",
      "XXXXXXXXXX",
      "XRBGYOPTXX",
      "XXXXXXXXXX",
      "XXXXXXXXXX",
      "XXXXXXXXXX",
    ]

    const colorMap = {
      'X': { fill: 'white', shape: [[0, 0], [1, 0], [1, 1], [1, 2]] },
      'R': { fill: '#FF0000', },
      'B': { fill: '#0000FF', },
      'G': { fill: '#00FF00', },
      'Y': { fill: '#FFFF00', },
      'O': { fill: '#FF9900', },
      'P': { fill: '#9900FF', },
      'T': { fill: '#00FFFF', },
    }


    return (
      <svg width="100%"
           height="1100px"> /* 1、为什么在这里不设置width和height的话，内部元素无法直接撑起父元素的高度 2、设置height="100%"为什么不起作用 */
        {map.map((s, row) =>
          <g key={row}>
            {Array.from(s).map((c, col) => {
              const { x, y } = indexToCoordinate(row, col)
              return (
                <Cell key={col} x={x} y={y} fill={colorMap[map[row][col]].fill} />
              )
            })}
          </g>
        )}
      </svg>
    )
  }
}