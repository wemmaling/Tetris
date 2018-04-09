import { cancel, join, put, fork, takeEvery, select, race, take } from 'redux-saga/effects'
import { delay } from 'redux-saga'
import { Map, Repeat } from 'immutable'
import * as A from './action'
import { scoreRule, directionMapDelta } from './resource'
import { canTetrominoMove, dropRandom } from './utils'

export default function* rootSaga() {
  yield takeEvery(A.MOVE_TETROMINO, moveTetromino)
  yield takeEvery(A.MERGE_MAP, updateMap)
  yield takeEvery(A.DROP_NEW_TETROMINO, dropNewTetromino)
  yield takeEvery(A.CLEAR_LINES, clearLines)
  yield takeEvery(A.RORATE, rorateTetromino)
  yield takeEvery(A.DROP_DIRECTLY, dropDirectly)
  yield fork(dropTetrominoLoop)
  yield fork(dropKeyUpAndDown)
  yield fork(lrKeyUpAndDown)
}

function* quickMoveLeftOrRight(dRow, dCol) {
  const state = yield select()
  const { isGameOver } = state.toObject()
  while (!isGameOver) {
    yield put({ type: A.MOVE_TETROMINO, dRow, dCol })
    yield delay(150)
  }
}

// 监听按键的按下与释放
function* dropKeyUpAndDown() {
  const state = yield select()
  const { speed, isGameOver } = state.toObject()
  while (!isGameOver) {
    yield take(A.DROP_KEY_DOWN)
    yield put({
      type: A.CHANGE_SPEED,
      speed: 20 * speed,
    })
    const task = yield fork(dropTetrominoLoop)
    yield take(A.DROP_KEY_UP)
    yield cancel(task)
    yield put({
      type: A.CHANGE_SPEED,
      speed: speed,
    })
  }
}

function* lrKeyUpAndDown() {
  console.log('lr-key-and-down')
  const state = yield select()
  const { speed, isGameOver } = state.toObject()
  while (!isGameOver) {
    const action = yield take(A.LR_KEY_DOWN)
    const { dRow, dCol } = action
    // yield put({
    //   type: A.CHANGE_SPEED,
    //   speed: 10 * speed,
    // })
    const task = yield fork(quickMoveLeftOrRight, dRow, dCol)
    yield take(A.LR_KEY_UP)
    yield cancel(task)
    // yield put({
    //   type: A.CHANGE_SPEED,
    //   speed: speed,
    // })
  }
}

// tetromino的自动下落
function* dropTetrominoLoop() {
  const state = yield select()
  const { isGameOver, speed } = state.toObject()
  while (!isGameOver) {
    yield delay(1000 / speed)
    yield put({
      type: A.MOVE_TETROMINO,
      dRow: 1,
      dCol: 0,
    })
  }
}

// 控制物块的直接下落
function* dropDirectly() {
  const state = yield select()
  const { tetrisMap, curTetromino } = state.toObject()
  let nextPosition = curTetromino
  while (canTetrominoMove(tetrisMap, nextPosition)) {
    nextPosition = nextPosition.update('row', v => v + 1)
  }
  yield put({
    type: A.UPDATE_TETROMINO,
    curTetromino: nextPosition.update('row', v => v - 1)
  })
  yield put({ type: A.MERGE_MAP })
  console.log(nextPosition.toJS())

}

// 掉落新的tetromino
function* dropNewTetromino() {
  const state = yield select()
  const { isGameOver } = state.toObject()
  if (!isGameOver) {
    const nextType = dropRandom()
    // console.log(nextType)
    const newTetromino = Map({
      type: nextType,
      row: 0,
      col: 4,
      direction: Math.floor(Math.random() * 4),
    })
    yield put({
      type: A.RESET_TETROMINO,
      newTetromino,
    })
  }

  // todo 掉落暂不计分
  // yield put({
  //   type: A.UPDATE_SCORE,
  //   getScore: 10,
  // })
}

// 当物块落下到背景边缘或者碰到其他物体时，动态物块融入背景板
function* updateMap() {
  const state = yield select()
  const { tetrisMap, curTetromino, isGameOver } = state.toObject()
  const { type, row, col, direction } = curTetromino.toObject()
  const delta = directionMapDelta.get(type).get(direction)
  let newMap = tetrisMap
  for (let i = 0; i < 4; i++) {
    const dRow = delta[i][0]
    const dCol = delta[i][1]
    newMap = newMap.update(row + dRow, value => value.update(col + dCol, () => type))
  }
  // 如果游戏结束，则不继续掉落新的物块
  if (!isGameOver) {
    yield put({
      type: A.DROP_NEW_TETROMINO,
    })
  }
  yield put({
    type: A.UPDATE_MAP,
    newMap,
  })
  yield put({
    type: A.CLEAR_LINES,
  })
}

// 与背景板融合后判断是否有行满足消除的要求并更新Map
function* clearLines() {
  const state = yield select()
  const { tetrisMap } = state.toObject()
  let result = 0
  let newMap = tetrisMap
  tetrisMap.map((s, row) => {
    if (!s.includes('X')) {
      newMap = newMap.delete(row).insert(0, Repeat('X', 10).toList())
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
  }
}

// 通过键盘控制tetromino的移动
function* moveTetromino({ dRow, dCol }) {
  const state = yield select()
  const { tetrisMap, curTetromino } = state.toObject()
  const { row, col } = curTetromino.toObject()
  const nextPosition = curTetromino.update('row', v => v + dRow).update('col', v => v + dCol)
  const canMove = canTetrominoMove(tetrisMap, nextPosition)
  // 如果物块刚出来就发现不能继续移动，Game Over!
  if (!canMove && row === 0 && dRow === 1) {
    debugger
    yield put({ type: A.GAME_OVER })
  } else {
    // 如果物块不能继续移动且游戏并没有结束，并且动作为向下移动，就合并背景
    if (!canMove && dRow === 1) {
      yield put({
        type: A.MERGE_MAP
      })
    } else if (canMove) { // 保证物体在下个位置不会碰到墙壁或与其他物块碰撞
      yield put({
        type: A.UPDATE_TETROMINO,
        curTetromino: nextPosition,
      })
    }
  }
}

// 旋转
function* rorateTetromino() {
  const state = yield select()
  const { tetrisMap, curTetromino } = state.toObject()
  const nextPosition = curTetromino.update('direction', v => (v + 1) % 4)
  const canMove = canTetrominoMove(tetrisMap, nextPosition)
  if (canMove && curTetromino.get('type') !== 'O') {
    yield put({
      type: A.UPDATE_TETROMINO,
      curTetromino: nextPosition,
    })
  }
}