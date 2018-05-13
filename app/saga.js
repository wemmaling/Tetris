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
import { canTetrominoMove, dropRandom, forecastPosition, convert } from './utils'
import { COL } from './constants'

export default function* rootSaga() {
  yield fork(watchGameStatus)
  yield takeEvery(A.MOVE_TETROMINO, move)
  yield takeEvery(A.MERGE_MAP, mergeMap)
  yield takeEvery(A.DROP_NEW_TETROMINO, dropNewOne)
  yield takeEvery(A.CLEAR_LINES, clearLines)
  yield takeEvery(A.RORATE, rorate)
  yield takeEvery(A.DROP_DIRECTLY, dropDirectly)
  yield takeEvery(A.GAME_OVER, gameOver)
  yield takeEvery(A.CHANGE_TETROMINO, changeTetromino)
  yield takeEvery(A.CHANGE_SPEED, changeSpeed)
  yield takeEvery(A.HOLD_TETROMINO, hold)
}

function* watchGameStatus() {
  while (true) {
    yield take([A.CONTINUE, A.RESTART])
    yield race([
      // 物块自动下落
      call(dropLoop),
      // 监听下键的按下与释放
      call(dropKeyUpAndDown),
      // 监听左右按键的按下与释放
      call(lrKeyUpAndDown),
      take([A.PAUSE, A.GAME_OVER]),
    ])
  }
}

// 监听下键的按下与释放
function* dropKeyUpAndDown() {
  while (true) {
    yield take(A.DROP_KEY_DOWN)
    const state = yield select()
    const speed = state.get('speed')
    yield put({
      type: A.UPDATE_SPEED,
      speed: 20 * speed,
    })
    yield race([
      call(dropLoop),
      take([A.DROP_KEY_UP, A.GAME_OVER]),
    ])
    yield put({
      type: A.UPDATE_SPEED,
      speed: speed,
    })
  }
}

// 监听左右按键的按下与释放
function* lrKeyUpAndDown() {
  while (true) {
    const state = yield select()
    if (state.get('isGameOver')) {
      break
    }
    const action = yield take(A.LR_KEY_DOWN)
    const { dRow, dCol } = action
    yield race([
      call(moveLeftOrRight, dRow, dCol),
      take([A.LR_KEY_UP, A.GAME_OVER]),
    ])
  }
}

// 加速左右移动
function* moveLeftOrRight(dRow, dCol) {
  while (true) {
    yield put({
      type: A.MOVE_TETROMINO,
      dRow,
      dCol,
    })
    yield delay(130)
  }
}

// tetromino的自动下落
function* dropLoop() {
  while (true) {
    const state = yield select()
    const { speed, level } = state.toObject()
    if (!state.get('isGameOver')) {
      yield put({
        type: A.MOVE_TETROMINO,
        dRow: 1,
        dCol: 0,
      })
      if (speed > (level + 1) * 0.5) {
        yield put({
          type: A.UPDATE_SCORE,
          getScore: 1,
        })
      }
    }
    yield delay(1000 / state.get('speed'))
  }
}

// 通过键盘控制tetromino的移动
function* move({ dRow, dCol }) {
  // console.log('move-tetromino')
  const state = yield select()
  const { tetrisMap, curTetromino, isGameOver } = state.toObject()
  const { row, col } = curTetromino.toObject()
  const nextPosition = curTetromino.update('row', v => v + dRow).update('col', v => v + dCol)
  const canMove = canTetrominoMove(tetrisMap, nextPosition)
  // 如果物块刚出来就发现不能继续移动，Game Over!
  // todo 还存在一些问题
  if (!canMove && row < 0 && dRow === 1) {
    yield put({ type: A.GAME_OVER })
  } else {
    // 如果物块不能继续移动且游戏并没有结束，并且动作为向下移动，就合并背景
    if (!canMove && !isGameOver && dRow === 1) {
      yield put({
        type: A.MERGE_MAP
      })
    } else if (canMove) { // 保证物体在下个位置不会碰到墙壁或与其他物块碰撞
      yield put({
        type: A.CHANGE_TETROMINO,
        next: nextPosition,
      })
    }
  }
}

function* changeTetromino({ next }) {
  const state = yield select()
  const { tetrisMap, helpSchemaOn } = state.toObject()
  yield put({
    type: A.UPDATE_TETROMINO,
    next,
  })
  if (helpSchemaOn) {
    yield put({
      type: A.UPDATE_FORECAST,
      forecast: forecastPosition(tetrisMap, next)
    })
  }
}

// 控制物块的直接下落
function* dropDirectly() {
  // console.log('drop-directly')
  const state = yield select()
  const { tetrisMap, curTetromino, isGameOver } = state.toObject()
  if (!isGameOver) {
    yield put({
      type: A.CHANGE_TETROMINO,
      next: forecastPosition(tetrisMap, curTetromino)
    })
    yield put({
      type: A.UPDATE_SCORE,
      getScore: 2 * (19 - curTetromino.get('row')),
    })
    yield put({ type: A.MERGE_MAP })
  }
}

// 当物块落下到背景边缘或者碰到其他物体时，动态物块融入背景板
function* mergeMap() {
  // console.log('merge-map')
  const state = yield select()
  const { tetrisMap, curTetromino, isGameOver } = state.toObject()
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
  // 如果游戏结束，则不继续掉落新的物块
  if (!isGameOver) {
    yield put({
      type: A.UPDATE_MAP,
      newMap,
    })

    yield put({
      type: A.DROP_NEW_TETROMINO,
    })
    yield put({
      type: A.CLEAR_LINES,
    })
  }
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
    yield put({
      type: A.CHANGE_SPEED,
    })
  }
}

function* changeSpeed() {
  const state = yield select()
  const { score, level } = state.toObject()
  if (score >= 1000 + level * (level - 1) * 500) {
    yield put({
      type: A.UPDATE_SPEED,
      speed: (level + 1) * 0.5,
    })
    yield put({
      type: A.UPDATE_LEVEL,
    })
  }
}

// 掉落新的tetromino
function* dropNewOne() {
  // console.log('drop-new-tetromino')
  const state = yield select()
  const { isGameOver, nextTetromino } = state.toObject()
  if (!isGameOver) {
    yield put({
      type: A.CHANGE_TETROMINO,
      next: nextTetromino,
    })
    yield put({
      type: A.UPDATE_NEXT_TETROMINO,
      next: dropRandom(),
    })
  }
}

// 旋转
function* rorate() {
  // console.log('rorate-tetromino')
  const state = yield select()
  const { tetrisMap, curTetromino, rorateDir } = state.toObject()
  const nextPosition = curTetromino.update('direction', v => (v + rorateDir) % 4)
  const canMove = canTetrominoMove(tetrisMap, nextPosition)
  if (canMove && curTetromino.get('type') !== 'O') {
    yield put({
      type: A.CHANGE_TETROMINO,
      next: nextPosition,
    })
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

function* hold() {
  const state = yield select()
  const { curTetromino, hold } = state.toObject()
  if (curTetromino.get('canBeHold')) {
    yield put({
      type: A.UPDATE_HOLD,
      hold: curTetromino.get('type'),
    })
    if (hold == null) {
      yield put({
        type: A.DROP_NEW_TETROMINO,
      })
    } else {
      const { row, col } = convert(hold)
      yield put({
        type: A.CHANGE_TETROMINO,
        next: Map({ type: hold, row, col, direction: 0, canBeHold: false }),
      })
    }
  }
}
