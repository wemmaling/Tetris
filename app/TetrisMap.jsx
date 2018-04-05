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
  componentDidMount() {
    document.addEventListener('keypress', this.onKeyPress)
  }

  componentWillUnmount() {
    document.removeEventListener('keypress', this.onKeyPress)
  }

  onKeyPress = (event) => {
    let dRow = 0, dCol = 0
    if (event.key === 'a') {
      dRow = 0
      dCol = -1
    } else if (event.key === 'd') {
      dRow = 0
      dCol = 1
    } else if (event.key === 's') {
      dRow = 1
      dCol = 0
    } else if (event.key === 'w') {
      // todo 旋转
    }
    this.props.dispatch({ type: A.MOVE_TETROMINO, dRow, dCol })
  }

  render() {
    const { tetrisMap, curTetromino } = this.props
    const { color, delta } = colorMap.get(curTetromino.get('type'))
    const tRow = curTetromino.get('row')
    const tCol = curTetromino.get('col')

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
        <g>
          {delta.map((every, index) => {
            const { x, y } = indexToCoordinate(tRow + every[0], tCol + every[1])
            return (
              <Cell key={index} x={x} y={y} fill={color} />
            )
          })}
        </g>
      </svg>
    )
  }
}

export default connect(mapStateToProps)(TetrisMap)
