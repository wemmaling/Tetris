import React from 'react'
import { connect } from 'react-redux'
import Cell from 'Cell'
import { indexToCoordinate } from 'utils'
import * as A from 'action'
import { colorMap } from 'resource'


function mapStateToProps(state, ownProps) {
  return state.toObject()
}

class TetrisMap extends React.Component {
  moveTetromino = (dx, dy) => {
    this.props.dispatch({ type: A.MOVE_TETROMINO, dx, dy })
  }

  render() {
    const { tetrisMap, curTetromino } = this.props
    const { color, delta } = colorMap.get(curTetromino.get('type'))
    const tRow = curTetromino.get('x')
    const tCol = curTetromino.get('y')

    return (
      <div>
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
          <g>
            {delta.map((every, index) => {
              const { x, y } = indexToCoordinate(tRow + every[0], tCol + every[1])
              return (
                <Cell key={index} x={x} y={y} fill={color} />
              )
            })}
          </g>
        </svg>
        {/*todo 按钮变成键盘控制*/}
        <button onClick={() => this.moveTetromino(0, -1)}>左</button>
        <button onClick={() => this.moveTetromino(1, 0)}>下</button>
        <button onClick={() => this.moveTetromino(0, 1)}>右</button>
      </div>
    )
  }
}

export default connect(mapStateToProps)(TetrisMap)
