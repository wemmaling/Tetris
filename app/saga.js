import { put, fork, takeEvery, select } from 'redux-saga/effects'
import { delay } from 'redux-saga'
import { Map } from 'immutable'
import * as A from './action'

export default function* rootSaga() {
  yield takeEvery(A.MOVE_TETROMINO, moveTetromino)
  yield fork(dropTetrominoLoop)
}

function* dropTetrominoLoop() {
  while (true) {
    yield delay(1000)
    const state = yield select()

    yield put({
      type: A.MOVE_TETROMINO,
      dx: 1,
      dy: 0,
    })
  }
}

function* moveTetromino({ dx, dy }) {
  const state = yield select()
  const curTetromino = state.get('curTetromino')
  const { x, y, type } = curTetromino.toObject()
  yield put({
    type: A.UPDATE_TETROMINO,
    curTetromino: Map({ type, x: x + dx, y: y + dy }),
  })
}