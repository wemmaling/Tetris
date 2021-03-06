import {
  put,
  fork,
  takeEvery,
  select,
  take,
  race,
  call
} from 'redux-saga/effects'
import { delay } from 'redux-saga'
import { Map, Repeat } from 'immutable'
import * as A from './action'
import { scoreRule, directionMapDelta } from './resource'
import {
  canTetrominoMove,
  dropRandom,
  forecastPosition,
  convert,
  getSpeedByLevel,
  shouldUpdateLevel
} from './utils'
import { COL } from './constants'

let isFastDropping = false
let rorateKeyDown = false
let dropDown = false
let changeRorateDir = false
let hold = false

export default function* rootSaga() {
  while (true) {
    yield take([A.CONTINUE, A.RESTART]) // 阻塞监听“游戏继续”和“游戏重新开始”Actions
    yield takeEvery(A.GAME_OVER, gameOver)
    yield race([
      // 监听游戏中一些Actions(RORATE/DROP_DIRECTLY/HOLD_TETROMINO/KEY_DOWN/KEY_ON)的dispatch，并执行对应saga函数
      gameActions(),
      // 物块自动下落
      call(moveLoop, 1, 0),
      // 监听下键的按下与释放
      call(dropKeyUpAndDown),
      // 监听左右按键的按下与释放
      call(lrKeyUpAndDown),
      // 阻塞监听“游戏暂停”和“游戏结束”
      take([A.PAUSE, A.UPDATE_GAME_STATUS]),
    ])
  }
}

function* gameActions() {
  yield takeEvery(A.RORATE, rorate)
  yield takeEvery(A.DROP_DIRECTLY, dropDirectly)
  yield takeEvery(A.HOLD_TETROMINO, handleHold)
  yield takeEvery(A.KEY_DOWN, keyDown)
  yield takeEvery(A.KEY_UP, keyUp)
}

// 监听下键的按下与释放
function* dropKeyUpAndDown() {
  while (true) {
    yield take(A.DROP_KEY_DOWN)
    isFastDropping = true
    yield race([
      call(moveLoop, 1, 0),
      take([A.DROP_KEY_UP, A.UPDATE_GAME_STATUS]),
    ])
    isFastDropping = false
  }
}

// 监听左右按键的按下与释放
function* lrKeyUpAndDown() {
  while (true) {
    const action = yield take(A.LR_KEY_DOWN)
    const { dRow, dCol } = action
    yield race([
      call(moveLoop, dRow, dCol),
      take([A.LR_KEY_UP, A.UPDATE_GAME_STATUS]),
    ])
  }
}

// tetromino的自动下落
function* moveLoop(dRow, dCol) {
  while (true) {
    const state = yield select()
    const { level } = state.toObject()
    const speed = getSpeedByLevel(level, isFastDropping)
    yield move(dRow, dCol)
    if (dRow === 1) {
      if (speed > (level + 1) * 0.5) {
        yield put({
          type: A.UPDATE_SCORE,
          getScore: 1,
        })
        yield updateLevelJudge()
      }
      yield delay(1000 / speed)
    } else {
      yield delay(130)
    }
  }
}

function* keyDown({ event }) {
  const state = yield select()
  const { isPaused } = state.toObject()
  const key = event.key.toLowerCase()
  const keyCode = event.keyCode
  if (!isPaused) {
    if (key === 'a' || keyCode === 37) {
      yield put({ type: A.LR_KEY_DOWN, dRow: 0, dCol: -1 })
    } else if (key === 'd' || keyCode === 39) {
      yield put({ type: A.LR_KEY_DOWN, dRow: 0, dCol: 1 })
    } else if (key === 's' || keyCode === 40) {
      if (event.preventDefault) {
        event.preventDefault()
      }
      yield put({ type: A.DROP_KEY_DOWN })
    } else if ((key === 'w' || keyCode === 38) && !rorateKeyDown) {
      yield put({ type: A.RORATE })
      rorateKeyDown = true
    } else if (key === 'z' && !changeRorateDir) {
      yield put({ type: A.CHANGE_RORATE_DIR })
      changeRorateDir = true
    } else if (key === 'c' && !hold) {
      yield put({ type: A.HOLD_TETROMINO })
      hold = true
    } else if (keyCode === 32 && !dropDown) {
      if (event.preventDefault) {
        event.preventDefault()
      }
      yield put({ type: A.DROP_DIRECTLY })
      dropDown = true
    }
  }
}

function* keyUp({ event }) {
  const key = event.key.toLowerCase()
  const keyCode = event.keyCode
  if (key === 'a' || key === 'd' || keyCode === 37 || keyCode === 39) {
    yield put({ type: A.LR_KEY_UP, keyName: key })
  } else if (key === 's' || keyCode === 40) {
    yield put({ type: A.DROP_KEY_UP, keyName: key })
  } else if (key === 'w' || keyCode === 38) {
    rorateKeyDown = false
  } else if (keyCode === 32) {
    dropDown = false
  } else if (key === 'z') {
    changeRorateDir = false
  } else if (key === 'c') {
    hold = false
  }
}

// 通过键盘控制tetromino的移动
function* move(dRow, dCol) {
  // console.log('move-tetromino')
  const state = yield select()
  const { tetrisMap, curTetromino, helpSchemaOn } = state.toObject()
  const { row } = curTetromino.toObject()

  const nextPosition = curTetromino.update('row', v => v + dRow).update('col', v => v + dCol)
  const canMove = canTetrominoMove(tetrisMap, nextPosition)
  // 如果物块刚出来就发现不能继续移动，Game Over!
  // todo 还存在一些问题
  if (!canMove && row < 0 && dRow === 1) {
    yield gameOver()
  } else {
    // 如果物块不能继续移动且游戏并没有结束，并且动作为向下移动，就合并背景
    if (!canMove && dRow === 1) {
      yield mergeMapAndDrop()
    } else if (canMove) { // 保证物体在下个位置不会碰到墙壁或与其他物块碰撞
      if (helpSchemaOn) {
        yield put({
          type: A.UPDATE_FORECAST,
          forecast: forecastPosition(tetrisMap, nextPosition)
        })
      }
      yield changeCurTetromino(nextPosition)
    }
  }
}

function* changeCurTetromino(next) {
  const state = yield select()
  const { tetrisMap } = state.toObject()
  yield put({
    type: A.UPDATE_TETROMINO,
    next,
  })
  yield put({
    type: A.UPDATE_FORECAST,
    forecast: forecastPosition(tetrisMap, next)
  })
}

// 控制物块的直接下落
function* dropDirectly() {
  // console.log('drop-directly')
  const state = yield select()
  const { tetrisMap, curTetromino } = state.toObject()
  yield changeCurTetromino(forecastPosition(tetrisMap, curTetromino))
  yield put({
    type: A.UPDATE_SCORE,
    getScore: 2 * (19 - curTetromino.get('row')),
  })
  yield updateLevelJudge()
  yield mergeMapAndDrop()
}

// 当物块落下到背景边缘或者碰到其他物体时，动态物块融入背景板
function* mergeMapAndDrop() {
  // console.log('merge-map')
  const state = yield select()
  const { tetrisMap, curTetromino } = state.toObject()
  const { type, row, col, direction } = curTetromino.toObject()
  const delta = directionMapDelta.get(type).get(direction)
  let newMap = tetrisMap
  for (let i = 0; i < 4; i++) {
    const dRow = delta[i][0]
    const dCol = delta[i][1]
    if (row + dRow >= 0) {
      newMap = newMap.update(row + dRow, value => value.update(col + dCol, () => type))
    }
  }
  yield put({
    type: A.UPDATE_MAP,
    newMap,
  })
  yield dropNewOne()
  yield clearLines()
}

// 与背景板融合后判断是否有行满足消除的要求并更新Map
function* clearLines() {
  const state = yield select()
  const { tetrisMap } = state.toObject()
  let result = 0
  let newMap = tetrisMap
  tetrisMap.map((s, row) => {
    if (!s.includes('X')) {
      newMap = newMap.delete(row).insert(0, Repeat('X', COL).toList())
      result += 1
    }
  })
  if (result !== 0) {
    yield put({
      type: A.UPDATE_MAP,
      newMap
    })
    yield put({
      type: A.UPDATE_SCORE,
      getScore: scoreRule.get(result - 1),
    })
    yield updateLevelJudge()
  }
}

function* updateLevelJudge() {
  const newState = yield select()
  const { score, level } = newState.toObject()
  if (shouldUpdateLevel(score, level)) {
    yield put({
      type: A.UPDATE_LEVEL,
    })
  }
}

// 掉落新的tetromino
function* dropNewOne() {
  // console.log('drop-new-tetromino')
  const state = yield select()
  const { nextTetromino } = state.toObject()
  yield changeCurTetromino(nextTetromino)
  yield put({
    type: A.UPDATE_NEXT_TETROMINO,
    next: dropRandom(),
  })
}

// 旋转
function* rorate() {
  // console.log('rorate-tetromino')
  const state = yield select()
  const { tetrisMap, curTetromino, rorateDir } = state.toObject()
  const nextPosition = curTetromino.update('direction', v => (v + rorateDir) % 4)
  const canMove = canTetrominoMove(tetrisMap, nextPosition)
  if (canMove && curTetromino.get('type') !== 'O') {
    yield changeCurTetromino(nextPosition)
  }
}

function* gameOver() {
  const state = yield select()
  const oldScore = localStorage.getItem('highest-score')
  if (oldScore == null) {
    localStorage.setItem('highest-score', state.get('score'))
  } else if (state.get('score') > oldScore) {
    localStorage.setItem('highest-score', state.get('score'))
  }
  yield put({ type: A.UPDATE_GAME_STATUS })
}

function* handleHold() {
  const state = yield select()
  const { curTetromino, hold } = state.toObject()
  if (curTetromino.get('canBeHold')) {
    yield put({
      type: A.UPDATE_HOLD,
      hold: curTetromino.get('type'),
    })
    if (hold == null) {
      yield dropNewOne()
    } else {
      const { row, col } = convert(hold)
      yield changeCurTetromino(Map({ type: hold, row, col, direction: 0, canBeHold: false }))
    }
  }
}
