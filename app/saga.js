import { put, fork, takeEvery, select } from 'redux-saga/effects'
import { delay } from 'redux-saga'
import { Map, List } from 'immutable'
import * as A from './action'
import { colorMap } from './resource'
import { canMove } from './utils'

export default function* rootSaga() {
  yield takeEvery(A.MOVE_TETROMINO, moveTetromino)
  yield takeEvery(A.MERGE_MAP, updateMap)
  yield takeEvery(A.DROP_NEW_TETROMINO, dropNewTetromino)
  yield fork(dropTetrominoLoop)
}

// tetromino的自动下落
function* dropTetrominoLoop() {
  while (true) {
    yield delay(1000)
    yield put({
      type: A.MOVE_TETROMINO,
      dRow: 1,
      dCol: 0,
    })
  }
}

// 掉落新的tetromino
function* dropNewTetromino() {
  const newTetromino = Map({ type: 'S', row: 0, col: 4 })
  yield put({
    type: A.RESET_TETROMINO,
    newTetromino,
  })
}

// 当物块落下到背景边缘或者碰到其他物体时，动态物块融入背景板
function* updateMap() {
  const state = yield select()
  const { tetrisMap, curTetromino } = state.toObject()
  const { type, row, col } = curTetromino.toObject()
  const { delta } = colorMap.get(type)
  let newMap = tetrisMap
  for (let i = 0; i < 4; i++) {
    const dRow = delta[i][0]
    const dCol = delta[i][1]
    newMap = newMap.update(row + dRow, value => value.update(col + dCol, () => type))
  }
  yield put({
    type: A.DROP_NEW_TETROMINO,
  })
  yield put({
    type: A.UPDATE_MAP,
    newMap,
  })
}

// 通过键盘控制tetromino的移动
function* moveTetromino({ dRow, dCol }) {
  const state = yield select()
  const { tetrisMap, curTetromino } = state.toObject()
  const { row, col, type } = curTetromino.toObject()
  const nextPosition = Map({ type, row: row + dRow, col: col + dCol })
  const result = canMove(tetrisMap, nextPosition)
  console.log(result)
  // 如果物块不能继续移动，并且动作为向下移动，就合并背景
  if (!result && dRow === 1) {
    yield put({
      type: A.MERGE_MAP
    })
  } else if (canMove(tetrisMap, nextPosition)) { // 保证物体在下个位置不会碰到墙壁或与其他物块碰撞
    yield put({
      type: A.UPDATE_TETROMINO,
      curTetromino: nextPosition,
    })
  }
}