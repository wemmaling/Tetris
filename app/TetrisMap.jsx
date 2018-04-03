import React from 'react'
import { connect } from 'react-redux'
import Cell from 'Cell'
import { indexToCoordinate } from 'utils'
import * as A from 'action'
import { colorMap } from 'resource'


function mapStateToProps(state, ownProps) {
  console.log(state.toJS())
  return state.toObject()
}

class TetrisMap extends React.Component {
  componentDidMount() {
    this.props.dispatch({ type: A.COMPUTE_MAP, tetrisMap: this.props.tetrisMap, row: 2, col: 2, colorName: 'R' })
  }

  // todo 在(row, col)=(2,2)的位置画某个颜色的图形，怎样更新地图


  render() {
    const { tetrisMap } = this.props
    console.log(colorMap)

    return (
      <svg width="100%"
           height="1100px"> /* 1、为什么在这里不设置width和height的话，内部元素无法直接撑起父元素的高度 2、设置height="100%"为什么不起作用 */
        {tetrisMap.map((s, row) =>
          <g key={row}>
            {s.map((c, col) => {
              const { x, y } = indexToCoordinate(row, col)
              return (
                <Cell key={col} x={x} y={y}
                      fill={colorMap.get(tetrisMap.get(row).get(col)).color} />
              )
            })}
          </g>
        )}
      </svg>
    )
  }
}

export default connect(mapStateToProps)(TetrisMap)
