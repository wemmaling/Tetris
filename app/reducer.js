import { List, Map, Repeat } from 'immutable'
import * as A from 'action'

const initialState = Map({
  // 当前存储的背景数据结构
  tetrisMap: Repeat(Repeat("X", 10), 20),
  // 正在下落的tetromino类型以及当前坐标
  curTetromino: Map({ type: 'S', row: 0, col: 4 }),
  // curCoordinate: Map({ x: 0, y: 0 }),
})

export default function updateMap(state = initialState, action) {
  if (action.type === A.UPDATE_MAP) {
    const { newMap } = action
    return state.set('tetrisMap', newMap)
  } else if (action.type === A.UPDATE_TETROMINO) {
    const { curTetromino } = action
    return state.set('curTetromino', curTetromino)
  }
  else {
    return state
  }
}