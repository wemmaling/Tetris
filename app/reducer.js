import { List, Map, Repeat } from 'immutable'
import * as A from 'action'
import { dropRandom } from './utils'

const initialState = Map({
  // 当前存储的背景数据结构
  tetrisMap: Repeat(Repeat("X", 10).toList(), 20).toList(),
  // 正在下落的tetromino类型以及当前坐标
  curTetromino: dropRandom(),
  nextTetromino: dropRandom(),
  forecast: null,
  // 临时存储块
  hold: null,
  // 计算得分，每下落一个物块得10分，一次性消1行100分，2行300，3行500，4行800
  score: 0,
  // 关卡
  level: 1,
  // 下落速度
  speed: 1,
  // 游戏是否结束
  isGameOver: false,
  isGoing: false,
  // 游戏是否暂停
  isPaused: false,
  // 帮助模式
  helpSchemaOn: false,
  rorateDir: -1,
})

export default function updateMap(state = initialState, action) {
  if (action.type === A.UPDATE_MAP) {
    const { newMap } = action
    return state.set('tetrisMap', newMap)
  } else if (action.type === A.UPDATE_TETROMINO) {
    const { next } = action
    return state.set('curTetromino', next)
  } else if (action.type === A.UPDATE_SCORE) {
    const { getScore } = action
    return state.update('score', v => v + getScore)
  } else if (action.type === A.UPDATE_GAME_STATUS) {
    return state.set('isGameOver', true)
  } else if (action.type === A.UPDATE_SPEED) {
    return state.set('speed', action.speed)
  } else if (action.type === A.UPDATE_NEXT_TETROMINO) {
    return state.set('nextTetromino', action.next)
  } else if (action.type === A.PAUSE) {
    return state.set('isPaused', true)
  } else if (action.type === A.CONTINUE) {
    return state.set('isPaused', false)
  } else if (action.type === A.RESTART) {
    return initialState.set('curTetromino', dropRandom()).set('nextTetromino', dropRandom()).set('isGoing', true)
  } else if (action.type === A.UPDATE_FORECAST) {
    return state.set('forecast', action.forecast)
  } else if (action.type === A.UPDATE_HOLD) {
    return state.set('hold', action.hold).update('curTetromino', v => v.set('canBeHold', false))
  } else if (action.type === A.HELP_ON) {
    return state.set('helpSchemaOn', true)
  } else if (action.type === A.HELP_DOWN) {
    return state.set('helpSchemaOn', false)
  } else if (action.type === A.UPDATE_LEVEL) {
    return state.update('level', v => v + 1)
  } else if (action.type === A.CHANGE_RORATE_DIR) {
    return state.update('rorateDir', v => -v)
  } else {
    return state
  }
}