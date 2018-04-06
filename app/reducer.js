import { List, Map, Repeat } from 'immutable'
import * as A from 'action'

const initialState = Map({
  // 当前存储的背景数据结构
  tetrisMap: Repeat(Repeat("X", 10).toList(), 20).toList(),
  // 正在下落的tetromino类型以及当前坐标
  curTetromino: Map({ type: 'O', row: 0, col: 4 }),
  // 计算得分，每下落一个物块得10分，一次性消1行100分，2行200，3行400，4行800
  score: 0,
  // 游戏是否结束
  isGameOver: false,
})

export default function updateMap(state = initialState, action) {
  if (action.type === A.UPDATE_MAP) {
    const { newMap } = action
    return state.set('tetrisMap', newMap)
  } else if (action.type === A.UPDATE_TETROMINO) {
    const { curTetromino } = action
    return state.set('curTetromino', curTetromino)
  } else if (action.type === A.RESET_TETROMINO) {
    const { newTetromino } = action
    return state.set('curTetromino', newTetromino)
  } else if (action.type === A.UPDATE_SCORE) {
    const { getScore } = action
    console.log(getScore)
    return state.update('score', v => v + getScore)
  } else if (action.type === A.GAME_OVER) {
    return state.set('isGameOver', true)
  }else {
    return state
  }
}