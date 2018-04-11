import { Map, List } from "immutable"
import { rorate } from 'utils'

export const colorMap = Map({
  'X': { color: 'white' },
  'Z': { color: '#FF0000' },
  'J': { color: '#0000FF' },
  'S': { color: '#00FF00' },
  'O': { color: '#FFFF00' },
  'L': { color: '#FF9900' },
  'T': { color: '#9900FF' },
  'I': { color: '#00FFFF' },
})

// direction为0时的形状方向
let zDelta = List([[[0, -1], [0, 0], [1, 0], [1, 1]]])
let jDelta = List([[[0, -1], [1, -1], [1, 0], [1, 1]]])
let sDelta = List([[[0, 0], [0, 1], [1, -1], [1, 0]]])
let oDelta = List([[[0, 0], [0, 1], [1, 0], [1, 1]]])
let lDelta = List([[[0, 1], [1, -1], [1, 0], [1, 1]]])
let tDelta = List([[[-1, 0], [0, -1], [0, 0], [0, 1]]])
let iDelta = List([[[0, -2], [0, -1], [0, 0], [0, 1]]])

for (let index = 0; index < 3; index += 1) {
  zDelta = zDelta.insert(zDelta.size, rorate(zDelta.get(zDelta.size - 1)))
  jDelta = jDelta.insert(jDelta.size, rorate(jDelta.get(jDelta.size - 1)))
  sDelta = sDelta.insert(sDelta.size, rorate(sDelta.get(sDelta.size - 1)))
  oDelta = oDelta.insert(oDelta.size, oDelta.get(oDelta.size - 1))
  lDelta = lDelta.insert(lDelta.size, rorate(lDelta.get(lDelta.size - 1)))
  tDelta = tDelta.insert(tDelta.size, rorate(tDelta.get(tDelta.size - 1)))
  iDelta = iDelta.insert(iDelta.size, rorate(iDelta.get(iDelta.size - 1)))
}

// 计算得分，每下落一个物块得10分，一次性消1行100分，2行200，3行400，4行800
export const scoreRule = List([100, 200, 400, 800])

export const directionMapDelta = Map({
  'Z': zDelta,
  'J': jDelta,
  'S': sDelta,
  'O': oDelta,
  'L': lDelta,
  'T': tDelta,
  'I': iDelta,
})