import {
  cancel,
  put,
  fork,
  takeEvery,
  select,
  take
} from 'redux-saga/effects'
import { delay } from 'redux-saga'
import { Map, Repeat } from 'immutable'
import * as A from './action'
import { scoreRule, directionMapDelta } from './resource'
import { canTetrominoMove, dropRandom, forecastPosition } from './utils'
import { COL } from './constants'

export default function* rootSaga() {
  yield fork(watchGameStatus)
  yield take(A.RESTART)
  yield fork(startGame)
}

function* startGame() {
  yield takeEvery(A.MOVE_TETROMINO, moveTetromino)
  yield takeEvery(A.MERGE_MAP, mergeMap)
  yield takeEvery(A.DROP_NEW_TETROMINO, dropNewTetromino)
  yield takeEvery(A.CLEAR_LINES, clearLines)
  yield takeEvery(A.RORATE, rorateTetromino)
  yield takeEvery(A.DROP_DIRECTLY, dropDirectly)
  // yield takeEvery(A.RESTART, restart)
  yield takeEvery(A.GAME_OVER, gameOver)
  yield takeEvery(A.CHANGE_TETROMINO, changeTetromino)
  yield takeEvery(A.CHANGE_SPEED, changeSpeed)
}


function* watchGameStatus() {
  while (true) {
    yield take([A.CONTINUE, A.RESTART])
    const dropTask = yield fork(dropTetrominoLoop)
    const dropListenTask = yield fork(dropKeyUpAndDown)
    const lrListenTask = yield fork(lrKeyUpAndDown)
    yield take(A.PAUSE)
    yield cancel(dropTask)
    yield cancel(dropListenTask)
    yield cancel(lrListenTask)
    // yield cancel(updateLevel)
  }
}

// 监听下键的按下与释放
function* dropKeyUpAndDown() {
  while (true) {
    const state = yield select()
    const { isGameOver } = state.toObject()
    if (isGameOver) {
      break
    }
    yield take(A.DROP_KEY_DOWN)
    const newState = yield select()
    const speed = newState.get('speed')
    yield put({
      type: A.UPDATE_SPEED,
      speed: 20 * speed,
    })
    const task = yield fork(dropTetrominoLoop)
    yield take(A.DROP_KEY_UP)
    yield cancel(task)
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
    const task = yield fork(quickMoveLeftOrRight, dRow, dCol)
    yield take(A.LR_KEY_UP)
    yield cancel(task)
  }
}

// 加速左右移动
function* quickMoveLeftOrRight(dRow, dCol) {
  while (true) {
    yield put({
      type: A.MOVE_TETROMINO,
      dRow,
      dCol,
    })
    yield delay(100)
  }
}

// tetromino的自动下落
function* dropTetrominoLoop() {
  while (true) {
    const state = yield select()
    // todo 对游戏结束的判定有点延迟，如果break的话重新开始就不会自动下落了
    // if (state.get('isGameOver')) {
    //   break
    // }
    if (!state.get('isGameOver')) {
      yield put({
        type: A.MOVE_TETROMINO,
        dRow: 1,
        dCol: 0,
      })
    }
    yield delay(1000 / state.get('speed'))
  }
}

// 通过键盘控制tetromino的移动
function* moveTetromino({ dRow, dCol }) {
  // console.log('move-tetromino')
  const state = yield select()
  const { tetrisMap, curTetromino, isGameOver } = state.toObject()
  const { row, col } = curTetromino.toObject()
  const nextPosition = curTetromino.update('row', v => v + dRow).update('col', v => v + dCol)
  const canMove = canTetrominoMove(tetrisMap, nextPosition)
  // 如果物块刚出来就发现不能继续移动，Game Over!
  // todo 还存在一些问题
  if (!canMove && row < 0 && dRow === 1) {
    // console.log('canMove:', canMove)
    // console.log('row', row)
    // debugger
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
    // let nextPosition = curTetromino
    // while (canTetrominoMove(tetrisMap, nextPosition)) {
    //   nextPosition = nextPosition.update('row', v => v + 1)
    // }
    yield put({
      type: A.CHANGE_TETROMINO,
      next: forecastPosition(tetrisMap, curTetromino)
    })
    yield put({ type: A.MERGE_MAP })
  }
}

// 当物块落下到背景边缘或者碰到其他物体时，动态物块融入背景板
function* mergeMap() {
  // console.log('merge-map')
  const state = yield select()
  const { tetrisMap, curTetromino, isGameOver, score, level } = state.toObject()
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
  // console.log(newMap.toJS())
  // debugger
  // 如果游戏结束，则不继续掉落新的物块
  if (!isGameOver) {
    yield put({
      type: A.UPDATE_MAP,
      newMap,
    })

    yield put({
      type: A.DROP_NEW_TETROMINO,
    })

    // yield delay(1000)
    yield put({
      type: A.CLEAR_LINES,
    })
  }
}

// 与背景板融合后判断是否有行满足消除的要求并更新Map
function* clearLines() {
  const state = yield select()
  const { tetrisMap, score, level, speed } = state.toObject()
  let result = 0
  let newMap = tetrisMap
  tetrisMap.map((s, row) => {
    if (!s.includes('X')) {
      newMap = newMap.delete(row).insert(0, Repeat('X', COL).toList())
      result += 1
    }
  })
  if (result !== 0) {
    // console.log('clear-lines')
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
  const { score, level, speed } = state.toObject()
  if (level < Math.floor(score / 1000) + 1) {
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
function* dropNewTetromino() {
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

  // todo 掉落暂不计分
  // yield put({
  //   type: A.UPDATE_SCORE,
  //   getScore: 10,
  // })
}

// 旋转
function* rorateTetromino() {
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
  // yield put({ type: A.PAUSE })
}

// function* watchUpdateLevel() {
//   while (true) {
//     const state = yield select()
//     const { score, level } = state.toObject()
//     if (level < (score / 100) + 1) {
//       yield put({
//         type: A.UPDATE_LEVEL,
//       })
//       yield put({
//         type: A.UPDATE_SPEED,
//         speed: level + 1,
//       })
//     }
//     yield delay()
//   }
// }