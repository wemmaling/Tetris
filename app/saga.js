import { put, takeEvery, } from 'redux-saga/effects'
import * as A from 'app/action'
import { colorMap } from './resource'

export default function* rootSaga() {
  //todo 添加saga
  yield takeEvery(A.COMPUTE_MAP, updateMap)

}

function* updateMap({ tetrisMap, row, col, colorName }) {
  const { delta } = colorMap.get(colorName)
  let newMap = tetrisMap
  for (let i = 0; i < 4; i++) {
    const dx = delta[i][0]
    const dy = delta[i][1]
    newMap = newMap.update(row + dx, value => value.update(col + dy, () => colorName))
  }
  yield put({
    type: A.UPDATE_MAP,
    newMap
  })
}