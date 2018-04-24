import React from 'react'
import { connect } from 'react-redux'
import GameOverPage from 'GameOverPage'
import Button from 'Button'
import Cell from 'Cell'
import { indexToCoordinate } from 'utils'
import * as A from 'action'
import { colorMap, directionMapDelta } from 'resource'
import { CELL_WIDTH, CELL_HEIGHT, COL, ROW } from './constants'
import './style/TetrisMap.styl'


function mapStateToProps(state, ownProps) {
  return state.toObject()
}

// todo 设置按钮（提示的出现和旋转的选择）
// todo 旋转问题以及显示下一物块的问题
// todo 样式的重复使用
// todo 暂停时候还可以旋转的问题
// todo 2、判断游戏是否结束时好像还存在一些小bug(抓狂)
// todo 5、功能键的设置与设计
// todo 游戏样式
// todo 掉落预览
// todo 自动增加难度
// todo 游戏设置，如旋转方向等

React.createElement()

class TetrisMap extends React.Component {
  // 为了长按旋转键时不连续触发旋转事件的变量
  rorateKeyDown = false
  dropDirectly = false

  componentDidMount() {
    this.props.dispatch({ type: A.START })
    document.addEventListener('keydown', this.onKeyDown)
    document.addEventListener('keyup', this.onKeyUp)
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown)
    document.removeEventListener('keyup', this.onKeyUp)
  }

  onKeyUp = (event) => {
    const key = event.key.toLowerCase()
    if (key === 'a' || key === 'd') {
      this.props.dispatch({ type: A.LR_KEY_UP, keyName: key })
    } else if (key === 's') {
      this.props.dispatch({ type: A.DROP_KEY_UP, keyName: key })
    } else if (key === 'w') {
      this.rorateKeyDown = false
    } else if (event.keyCode === 32) {
      this.dropDirectly = false
    }
  }

  onKeyDown = (event) => {
    const { isPaused } = this.props
    if (isPaused) {
      return null
    }
    const key = event.key.toLowerCase()
    if (key === 'a') {
      this.props.dispatch({ type: A.LR_KEY_DOWN, dRow: 0, dCol: -1 })
    } else if (key === 'd') {
      this.props.dispatch({ type: A.LR_KEY_DOWN, dRow: 0, dCol: 1 })
    } else if (key === 's') {
      this.props.dispatch({ type: A.DROP_KEY_DOWN, dRow: 1, dCol: 0 })
    } else if (key === 'w' && !this.rorateKeyDown) {
      this.props.dispatch({ type: A.RORATE })
      this.rorateKeyDown = true
    } else if (event.keyCode === 32 && !this.dropDirectly) {
      this.props.dispatch({ type: A.DROP_DIRECTLY })
      this.dropDirectly = true
    }
  }

  render() {
    const { tetrisMap, curTetromino, score, isGameOver, nextTetromino, isPaused, level, forecast, helpSchemaOn } = this.props
    const { type, row: tRow, col: tCol, direction } = curTetromino.toObject()
    const { type: nextType, direction: nextDir } = nextTetromino.toObject()
    const { color } = colorMap.get(type)
    const { color: nextColor } = colorMap.get(nextType)
    const pauseButton = <Button onClick={() => {
      this.props.dispatch({ type: A.PAUSE })
    }} text="暂停" />
    const startButton = <Button disabled={isGameOver} onClick={() => {
      this.props.dispatch({ type: A.START })
    }} text="继续" />

    const helpOn = <Button onClick={() => {
      this.props.dispatch({ type: A.HELP_ON })
    }} text="简易模式" />
    const helpDown = <Button disabled={isGameOver} onClick={() => {
      this.props.dispatch({ type: A.HELP_DOWN })
    }} text="正常模式" />

    let forecastRender = null
    if (forecast !== null) {
      const { type: fType, row: fRow, col: fCol, direction: fDirection } = forecast.toObject()
      forecastRender = <g>
        {directionMapDelta.get(fType).get(fDirection).map((every, index) => {
          const { x, y } = indexToCoordinate(fRow + every[0], fCol + every[1])
          return (
            <Cell key={index} x={x} y={y} fill={color} real={false} />
          )
        })}
      </g>
    }

    return (
      <div className="wrap-content">
        <div className="cell-content">
          <svg width={`${CELL_WIDTH * COL}px`}
               height={`${CELL_HEIGHT * ROW}px`}
               style={{ border: 'solid #7A8382 1px', filter: isGameOver ? 'blur(3px)' : 'none' }}
          > /* 1、为什么在这里不设置width和height的话，内部元素无法直接撑起父元素的高度 2、设置height="100%"为什么不起作用 */
            {tetrisMap.map((s, row) =>
              <g key={row}>
                {s.map((c, col) => {
                  const { x, y } = indexToCoordinate(row, col)
                  const t = tetrisMap.get(row).get(col)
                  return (
                    <Cell key={col} x={x} y={y}
                          fill={colorMap.get(t).color} real={true} />
                  )
                })}
              </g>
            )}
            <g>
              {directionMapDelta.get(type).get(direction).map((every, index) => {
                const { x, y } = indexToCoordinate(tRow + every[0], tCol + every[1])
                return (
                  <Cell key={index} x={x} y={y} fill={color} real={true} />
                )
              })}
            </g>
            {helpSchemaOn ? forecastRender : null}
          </svg>
          {isGameOver ? <div className="game-over-wrapper">
            <GameOverPage />
          </div> : null}

        </div>
        <div className="right-content">
          <div className="score-content">
            {/*<h2>Level: {speed}</h2>*/}
            <h3>Score</h3>
            <div className="score">{score}</div>
            <h3>Level</h3>
            <div className="score">{level}</div>
          </div>
          <div className="next-content">
            <h3>Next</h3>
            <svg
              width="280px"
              height="280px">
              <g>
                {directionMapDelta.get(nextType).get(nextDir).map((every, index) => {
                  const { x, y } = indexToCoordinate(3 + every[0], 3 + every[1])
                  return (
                    <Cell key={index} x={x} y={y} fill={nextColor} real={true} />
                  )
                })}
              </g>
            </svg>
          </div>
          <div style={{ display: 'flex', marginLeft: '40px', alignItems: 'center' }}>
            {isPaused ? startButton : pauseButton}
            {helpSchemaOn ? helpDown : helpOn}
          </div>
        </div>
      </div>
    )
  }
}

export default connect(mapStateToProps)(TetrisMap)
