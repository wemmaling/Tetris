import { put, fork, takeEvery, select } from 'redux-saga/effects'
import { delay } from 'redux-saga'
import { Map, List } from 'immutable'
import * as A from './action'
import { colorMap } from './resource'

export default function* rootSaga() {
  yield takeEvery(A.MOVE_TETROMINO, moveTetromino)
  // yield takeEvery(A.UPDATE_MAP, updateMap)
  yield fork(dropTetrominoLoop)
}

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

// todo 当物块落下到背景边缘或者碰到其他物体时，动态物块融入背景板
// function* updateMap() {
//   const state = yield select()
//   const
//
// }

function* moveTetromino({ dRow, dCol }) {
  const state = yield select()
  const curTetromino = state.get('curTetromino')
  const { row, col, type } = curTetromino.toObject()
  const { delta } = colorMap.get(type)
  const colDeltaList = List(delta.map(every => every[1]))
  const minCol = colDeltaList.min()
  const maxCol = colDeltaList.max()

  const nextRow = row + dRow, nextCol = col + dCol
  if (nextCol + minCol >= 0 && nextCol + maxCol <= 9) {
    yield put({
      type: A.UPDATE_TETROMINO,
      curTetromino: Map({ type, row: nextRow, col: nextCol }),
    })
  }
}