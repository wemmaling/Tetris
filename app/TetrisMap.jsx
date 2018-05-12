import React from 'react'
import { connect } from 'react-redux'
import GameOverPage from 'GameOverPage'
import StartPage from './StartPage'
import PausedPage from './PausedPage'
import Button from 'Button'
import Cell from 'Cell'
import { indexToCoordinate, deltaMinAndMax } from 'utils'
import * as A from 'action'
import { colorMap, directionMapDelta } from 'resource'
import { CELL_WIDTH, CELL_HEIGHT, COL, ROW } from './constants'
import './style/TetrisMap.styl'

function mapStateToProps(state, ownProps) {
  return state.toObject()
}

// todo 样式的重复使用

class TetrisMap extends React.Component {
  // 为了长按旋转键时不连续触发旋转事件的变量
  rorateKeyDown = false
  dropDirectly = false
  pauseKeyDown = false
  changeRorateDir = false
  hold = false

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
    } else if (key === 'c') {
      this.hold = false
    }
  }

  onKeyDown = (event) => {
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
        if (event.preventDefault) {
          event.preventDefault()
        }
        this.props.dispatch({ type: A.DROP_KEY_DOWN })
      } else if ((key === 'w' || keyCode === 38) && !this.rorateKeyDown) {
        this.props.dispatch({ type: A.RORATE })
        this.rorateKeyDown = true
      } else if (key === 'z' && !this.changeRorateDir) {
        this.props.dispatch({ type: A.CHANGE_RORATE_DIR })
        this.changeRorateDir = true
      } else if (key === 'c' && !this.hold) {
        this.props.dispatch({ type: A.HOLD_TETROMINO })
        this.hold = true
      } else if (keyCode === 32 && !this.dropDirectly) {
        if (event.preventDefault) {
          event.preventDefault()
        }
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
    const {
      tetrisMap,
      curTetromino,
      score,
      isGameOver,
      nextTetromino,
      isPaused,
      level,
      forecast,
      helpSchemaOn,
      isGoing,
      hold: holdType,
    } = this.props

    const { type, row: tRow, col: tCol, direction } = curTetromino.toObject()
    const { color } = colorMap.get(type)

    const { type: nextType, direction: nextDir } = nextTetromino.toObject()
    const { color: nextColor } = colorMap.get(nextType)
    const delta = directionMapDelta.get(nextType).get(nextDir)
    const { maxR: nextMaxRow, maxC: nextMaxCol, minC: nextMinCol, minR: nextMinRow } = deltaMinAndMax(delta)

    let holdSvg = null

    if (holdType != null) {
      const holdDir = 0
      const { color: holdColor } = colorMap.get(holdType)
      const holdDelta = directionMapDelta.get(holdType).get(holdDir)
      const { maxR: holdMaxRow, maxC: holdMaxCol, minC: holdMinCol, minR: holdMinRow } = deltaMinAndMax(holdDelta)

      holdSvg = <svg
        width={`${CELL_WIDTH * (holdMaxCol - holdMinCol + 1)}px`}
        height={`${CELL_HEIGHT * (holdMaxRow - holdMinRow + 1 === 1 ? 2 : holdMaxRow - holdMinRow + 1)}px`}>
        <g>
          {holdDelta.map((every, index) => {
            const { x, y } = indexToCoordinate(every[0] - holdMinRow, every[1] - holdMinCol)
            return (
              <Cell key={index} x={x} y={y} fill={holdColor} real={true} />
            )
          })}
        </g>
      </svg>
    }

    const pauseButton = <Button clickAction={A.PAUSE} text="暂停" disabled={isGameOver} />
    const startButton = <Button clickAction={A.CONTINUE} text="继续" disabled={isGameOver} />

    const helpOn = <Button clickAction={A.HELP_ON} text="简易模式" disabled={isGameOver} />
    const helpDown = <Button clickAction={A.HELP_DOWN} text="正常模式" disabled={isGameOver} />

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
            height: `${window.outerHeight - 300}px`
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
              </g> : null}
              {helpSchemaOn ? forecastRender : null}
            </svg>
          </div>
          <div className="right-content" style={{
            height: `${window.outerHeight / 30 * ROW}px`
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
                  width={`${CELL_WIDTH * (nextMaxCol - nextMinCol + 1)}px`}
                  height={`${CELL_HEIGHT * (nextMaxRow - nextMinRow + 1 === 1 ? 2 : nextMaxRow - nextMinRow + 1)}px`}>
                  <g>
                    {delta.map((every, index) => {
                      const { x, y } = indexToCoordinate(every[0] - nextMinRow, every[1] - nextMinCol)
                      return (
                        <Cell key={index} x={x} y={y} fill={nextColor} real={true} />
                      )
                    })}
                  </g>
                </svg> : null}
              </div>
            </div>
            <div className="next-content">
              <span>Hold</span>
              <div style={{ padding: '16px' }}>
                {(isGoing && !isPaused) ? holdSvg : null}
              </div>
            </div>
            <div className="button-content">
              {isPaused ? startButton : pauseButton}
              {helpSchemaOn ? helpDown : helpOn}
            </div>
          </div>
          {!isGoing ? <div className="pop-wrapper"><StartPage /></div> : null}
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
