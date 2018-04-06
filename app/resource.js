import { Map, List } from "immutable"

export const colorMap = Map({
  'X': { color: 'white', delta: [] },
  'Z': { color: '#FF0000', delta: [[0, 0], [0, 1], [1, 1], [1, 2]] },
  'J': { color: '#0000FF', delta: [[0, 0], [1, 0], [1, 1], [1, 2]] },
  'S': { color: '#00FF00', delta: [[0, 0], [0, 1], [1, -1], [1, 0]] },
  'O': { color: '#FFFF00', delta: [[0, 0], [0, 1], [1, 0], [1, 1]] },
  'L': { color: '#FF9900', delta: [[0, 0], [1, -2], [1, -1], [1, 0]] },
  'T': { color: '#9900FF', delta: [[0, 0], [1, -1], [1, 0], [1, 1]] },
  'I': { color: '#00FFFF', delta: [[0, 0], [0, 1], [0, 2], [0, 3]] },
})

// 计算得分，每下落一个物块得10分，一次性消1行100分，2行200，3行400，4行800
export const scoreRule = List([100, 200, 400, 800])