import { Map } from "immutable"

export const colorMap = Map({
  'X': { color: 'white', delta: [] },
  'R': { color: '#FF0000', delta: [[0, 0], [0, 1], [1, 1], [1, 2]] },
  'B': { color: '#0000FF', delta: [[0, 0], [1, 0], [1, 1], [1, 2]] },
  'G': { color: '#00FF00', delta: [[0, 0], [0, 1], [1, -1], [1, 0]] },
  'Y': { color: '#FFFF00', delta: [[0, 0], [0, 1], [1, 0], [1, 1]] },
  'O': { color: '#FF9900', delta: [[0, 0], [1, -2], [1, -1], [1, 0]] },
  'P': { color: '#9900FF', delta: [[0, 0], [1, -1], [1, 0], [1, 1]] },
  'T': { color: '#00FFFF', delta: [[0, 0], [0, 1], [0, 2], [0, 3]] },
})