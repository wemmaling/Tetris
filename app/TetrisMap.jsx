import React from 'react'
import { connect } from 'react-redux'
import Cell from 'Cell'
import { indexToCoordinate } from 'utils'
import * as A from 'action'
import { colorMap, directionMapDelta } from 'resource'


function mapStateToProps(state, ownProps) {
  return state.toObject()
}

// todo 6、下一物块掉落预览
// todo 2、判断游戏是否结束时好像还存在一些小bug
// todo 4、游戏的重新开始与暂停
// todo 5、功能键的设置与设计

class TetrisMap extends React.Component {
  // 为了长按旋转键时不连续触发旋转事件的变量
  rorateKeyDown = false
  dropDirectly = false

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown)
    document.addEventListener('keyup', this.onKeyUp)
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown)
    document.removeEventListener('keyup', this.onKeyUp)
  }

  onKeyUp = (event) => {
    if (event.key === 'a' || event.key === 'd') {
      this.props.dispatch({ type: A.LR_KEY_UP, keyName: event.key })
    } else if (event.key === 's') {
      this.props.dispatch({ type: A.DROP_KEY_UP, keyName: event.key })
    } else if (event.key === 'w') {
      this.rorateKeyDown = false
    } else if (event.keyCode === 32) {
      this.dropDirectly = false
    }
  }


  onKeyDown = (event) => {
    if (event.key === 'a') {
      this.props.dispatch({ type: A.LR_KEY_DOWN, dRow: 0, dCol: -1 })
    } else if (event.key === 'd') {
      this.props.dispatch({ type: A.LR_KEY_DOWN, dRow: 0, dCol: 1 })
    } else if (event.key === 's') {
      this.props.dispatch({ type: A.DROP_KEY_DOWN, dRow: 1, dCol: 0 })
    } else if (event.key === 'w' && !this.rorateKeyDown) {
      this.props.dispatch({ type: A.RORATE })
      this.rorateKeyDown = true
    } else if (event.keyCode === 32 && !this.dropDirectly) {
      console.log('space')
      this.props.dispatch({ type: A.DROP_DIRECTLY })
      this.dropDirectly = true
    }
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
