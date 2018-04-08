import React from 'react'
import { connect } from 'react-redux'
import Cell from 'Cell'
import { indexToCoordinate } from 'utils'
import * as A from 'action'
import { colorMap, directionMapDelta } from 'resource'


function mapStateToProps(state, ownProps) {
  return state.toObject()
}

// todo 1、解决旋转加速问题
// todo 2、判断游戏是否结束时好像还存在一些小bug
// todo 3、物块的直接下落
// todo 4、游戏的重新开始
// todo 5、功能键的设置与设计

class TetrisMap extends React.Component {
  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown)
    document.addEventListener('keyup', this.onKeyUp)
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown)
  }

  onKeyUp = (event) => {
    if (event.key === 'a' || event.key === 'd') {
      this.props.dispatch({ type: A.LR_KEY_UP, keyName: event.key })
    } else if (event.key === 's') {
      this.props.dispatch({ type: A.DROP_KEY_UP, keyName: event.key })
    }
  }

  onKeyDown = (event) => {
    let dRow = 0, dCol = 0
    if (event.key === 'a') {
      // this.props.dispatch(type:)
      dRow = 0
      dCol = -1
      this.props.dispatch({ type: A.LR_KEY_DOWN, dRow, dCol })
    } else if (event.key === 'd') {
      dRow = 0
      dCol = 1
      this.props.dispatch({ type: A.LR_KEY_DOWN, dRow, dCol })
    } else if (event.key === 's') {
      dRow = 1
      dCol = 0
      this.props.dispatch({ type: A.DROP_KEY_DOWN, dRow, dCol })
    } else if (event.key === 'w') {
      this.props.dispatch({ type: A.RORATE })
    }

    // this.props.dispatch({ type: A.MOVE_TETROMINO, dRow, dCol })
  }

  render() {
    const { tetrisMap, curTetromino, score, isGameOver } = this.props
    if (isGameOver) {
      console.log('Game Over!')
    }
    const { type, row: tRow, col: tCol, direction } = curTetromino.toObject()
    const { color } = colorMap.get(type)

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
            {directionMapDelta.get(type).get(direction).map((every, index) => {
              const { x, y } = indexToCoordinate(tRow + every[0], tCol + every[1])
              return (
                <Cell key={index} x={x} y={y} fill={color} />
              )
            })}
          </g>
        </svg>
        {score}
      </div>
    )
  }
}

export default connect(mapStateToProps)(TetrisMap)
