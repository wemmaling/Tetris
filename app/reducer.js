import { List, Map } from 'immutable'
import * as A from 'action'

const initialState = Map({
  tetrisMap: List([
    List(["X", "X", "X", "X", "X", "X", "X", "X", "X", "X"]),
    List(["X", "X", "X", "X", "X", "X", "X", "X", "X", "X"]),
    List(["X", "X", "X", "X", "X", "X", "X", "X", "X", "X"]),
    List(["X", "X", "X", "X", "X", "X", "X", "X", "X", "X"]),
    List(["X", "X", "X", "X", "X", "X", "X", "X", "X", "X"]),
    List(["X", "X", "X", "X", "X", "X", "X", "X", "X", "X"]),
    List(["X", "X", "X", "X", "X", "X", "X", "X", "X", "X"]),
    List(["X", "X", "X", "X", "X", "X", "X", "X", "X", "X"]),
    List(["X", "X", "X", "X", "X", "X", "X", "X", "X", "X"]),
    List(["X", "X", "X", "X", "X", "X", "X", "X", "X", "X"]),
    List(["X", "X", "X", "X", "X", "X", "X", "X", "X", "X"]),
    List(["X", "X", "X", "X", "X", "X", "X", "X", "X", "X"]),
    List(["X", "X", "X", "X", "X", "X", "X", "X", "X", "X"]),
    List(["X", "X", "X", "X", "X", "X", "X", "X", "X", "X"]),
    List(["X", "X", "X", "X", "X", "X", "X", "X", "X", "X"]),
    List(["X", "X", "X", "X", "X", "X", "X", "X", "X", "X"]),
    List(["X", "X", "X", "X", "X", "X", "X", "X", "X", "X"]),
    List(["X", "X", "X", "X", "X", "X", "X", "X", "X", "X"]),
    List(["X", "X", "X", "X", "X", "X", "X", "X", "X", "X"]),
    List(["X", "X", "X", "X", "X", "X", "X", "X", "X", "X"]),
  ]),
})

export default function updateMap(state = initialState, action) {
  if (action.type === A.UPDATE_MAP) {
    const { newMap } = action
    return state.set('tetrisMap', newMap)
    // todo 更新地图
  } else {
    return state
  }
}