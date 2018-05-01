import React from 'react'
import { connect } from 'react-redux'
import GameOverPage from 'GameOverPage'
import StartPage from './StartPage'
import PausedPage from './PausedPage'
import Button from 'Button'
import Cell from 'Cell'
import { indexToCoordinate } from 'utils'
import * as A from 'action'
import { colorMap, directionMapDelta } from 'resource'
import { CELL_WIDTH, CELL_HEIGHT, COL, ROW } from './constants'
import './style/TetrisMap.styl'
import { List } from "immutable"


function mapStateToProps(state, ownProps) {
  return state.toObject()
}

// todo 初始状态并没有随机
// todo 样式的重复使用
// todo 2、判断游戏是否结束时好像还存在一些小bug(抓狂)
// todo 自动增加难度
// todo 游戏得分的设计与实现

React.createElement()

class TetrisMap extends React.Component {
  // 为了长按旋转键时不连续触发旋转事件的变量
  rorateKeyDown = false
  dropDirectly = false
  pauseKeyDown = false
  changeRorateDir = false

  componentDidMount() {
    // this.props.dispatch({ type: A.CONTINUE })
    document.addEventListener('keydown', this.onKeyDown)
    document.addEventListener('keyup', this.onKeyUp)
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown)
    document.removeEventListener('keyup', this.onKeyUp)
  }

  onKeyUp = (event) => {
    const key = event.key.toLowerCase()
    const keyCode = event.keyCode
    if (key === 'a' || key === 'd' || keyCode === 37 || keyCode === 39) {
      this.props.dispatch({ type: A.LR_KEY_UP, keyName: key })
    } else if (key === 's' || keyCode === 40) {
      this.props.dispatch({ type: A.DROP_KEY_UP, keyName: key })
    } else if (key === 'w' || keyCode === 38) {
      this.rorateKeyDown = false
    } else if (keyCode === 32) {
      this.dropDirectly = false
    } else if (keyCode === 27) {
      this.pauseKeyDown = false
    } else if (key === 'z') {
      this.changeRorateDir = false
    }
  }

  onKeyDown = (event) => {
    if (event.preventDefault) {
      event.preventDefault()
    }
    const { isPaused } = this.props
    const key = event.key.toLowerCase()
    const keyCode = event.keyCode
    if (isPaused && event.keyCode === 27) {
      this.props.dispatch({ type: A.CONTINUE })
      this.pauseKeyDown = true
      return null
    }
    if (!isPaused) {
      if (key === 'a' || keyCode === 37) {
        this.props.dispatch({ type: A.LR_KEY_DOWN, dRow: 0, dCol: -1 })
      } else if (key === 'd' || keyCode === 39) {
        this.props.dispatch({ type: A.LR_KEY_DOWN, dRow: 0, dCol: 1 })
      } else if (key === 's' || keyCode === 40) {
        this.props.dispatch({ type: A.DROP_KEY_DOWN, dRow: 1, dCol: 0 })
      } else if ((key === 'w' || keyCode === 38) && !this.rorateKeyDown) {
        this.props.dispatch({ type: A.RORATE })
        this.rorateKeyDown = true
      } else if(key === 'z' && !this.changeRorateDir){
        this.props.dispatch({type: A.CHANGE_RORATE_DIR})
        this.changeRorateDir = true
      }else if (keyCode === 32 && !this.dropDirectly) {
        this.props.dispatch({ type: A.DROP_DIRECTLY })
        this.dropDirectly = true
      } else if (keyCode === 27 && !this.pauseKeyDown) {
        // todo 长按esc存在问题
        this.props.dispatch({ type: A.PAUSE })
        this.pauseKeyDown = true
      }
    }
  }

  render() {
    const { tetrisMap, curTetromino, score, isGameOver, nextTetromino, isPaused, level, forecast, helpSchemaOn, isGoing } = this.props
    const { type, row: tRow, col: tCol, direction } = curTetromino.toObject()
    const { type: nextType, direction: nextDir } = nextTetromino.toObject()
    const { color } = colorMap.get(type)
    const { color: nextColor } = colorMap.get(nextType)

    const delta = directionMapDelta.get(nextType).get(nextDir)
    const colDeltaList = List(delta.map(every => every[1]))
    const rowDeltaList = List(delta.map(every => every[0]))
    const maxRow = rowDeltaList.max()
    const minRow = rowDeltaList.min()
    const minCol = colDeltaList.min()
    const maxCol = colDeltaList.max()

    const pauseButton = <Button
      onClick={() => {
        this.props.dispatch({ type: A.PAUSE })
      }}
      text="暂停"
      disabled={isGameOver}
    />
    const startButton = <Button
      disabled={isGameOver}
      onClick={() => {
        this.props.dispatch({ type: A.CONTINUE })
      }}
      text="继续"
    />

    const helpOn = <Button
      onClick={() => {
        this.props.dispatch({ type: A.HELP_ON })
      }}
      text="简易模式"
      disabled={isGameOver}
    />
    const helpDown = <Button
      disabled={isGameOver}
      onClick={() => {
        this.props.dispatch({ type: A.HELP_DOWN })
      }}
      text="正常模式"
    />

    let forecastRender = null
    if (forecast !== null) {
      const { type: fType, row: fRow, col: fCol, direction: fDirection } = forecast.toObject()
      forecastRender = (isGoing && !isPaused) ? <g>
        {directionMapDelta.get(fType).get(fDirection).map((every, index) => {
          const { x, y } = indexToCoordinate(fRow + every[0], fCol + every[1])
          return (
            <Cell key={index} x={x} y={y} fill={color} real={false} />
          )
        })}
      </g> : null
    }

    return (
      <div className="all-content">
        <div className="text-content">
          <span className="header-content">操作说明</span>
          <img
            className="image"
            src="control.png"
            alt="control"
          />
          {/*<span className="header-content" style={{ marginTop: '300px' }} />*/}
        </div>
        <div
          style={{
            height: `${window.outerHeight - 200}px`,
          }}
          className="wrap-content"
        >
          <div style={{
            height: `${window.outerHeight - 300}px`, filter: isGameOver ? 'blur(3px)' : 'none'
          }} className="cell-content">
            <svg width={`${window.outerHeight / 30 * COL}px`}
                 height={`${window.outerHeight / 30 * ROW}px`}
                 style={{ border: 'solid #7A8382 1px' }}
            >
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
              {(isGoing && !isPaused) ? <g>
                {directionMapDelta.get(type).get(direction).map((every, index) => {
                  const { x, y } = indexToCoordinate(tRow + every[0], tCol + every[1])
                  return (
                    <Cell key={index} x={x} y={y} fill={color} real={true} />
                  )
                })}
              </g> :null}
              {helpSchemaOn ? forecastRender : null}
            </svg>
          </div>
          <div className="right-content" style={{
            height: `${window.outerHeight / 30 * ROW}px`,
            filter: isGameOver ? 'blur(3px)' : 'none'
          }}>
            <div className="score-content">
              {/*<h2>Level: {speed}</h2>*/}
              <div className="part">
                <span>Score</span>
                <div className="score">{score}</div>
              </div>
              <div className="part">
                <span>Level</span>
                <div className="score">{level}</div>
              </div>
            </div>
            <div className="next-content">
              <span>Next</span>
              <div style={{ padding: '16px' }}>
                {(isGoing && !isPaused) ? <svg
                  width={`${CELL_WIDTH * (maxCol - minCol + 1)}px`}
                  height={`${CELL_HEIGHT * (maxRow - minRow + 1 === 1 ? 2 : maxRow - minRow + 1)}px`}>
                  <g>
                    {delta.map((every, index) => {
                      const { x, y } = indexToCoordinate(every[0] - minRow, every[1] - minCol)
                      return (
                        <Cell key={index} x={x} y={y} fill={nextColor} real={true} />
                      )
                    })}
                  </g>
                </svg> : null}
              </div>
            </div>
            <div className="button-content">
              {isPaused ? startButton : pauseButton}
              {helpSchemaOn ? helpDown : helpOn}
            </div>
          </div>
          {!isGoing ?  <div className="pop-wrapper"><StartPage /></div> : null}
          {isGameOver || isPaused ?
            <div className="pop-wrapper">
              {isGameOver ? <GameOverPage /> : null}
              {/*{isPaused ? <PausedPage /> : null}*/}
              {isPaused ? <PausedPage /> : null}
            </div> : null}

        </div>
      </div>
    )
  }
}

export default connect(mapStateToProps)(TetrisMap)
