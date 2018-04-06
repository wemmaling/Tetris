import { CELL_HEIGHT, CELL_WIDTH } from './constants.js'
import { colorMap } from './resource'
import { List } from "immutable"

export function indexToCoordinate(row, col) {
  const x = CELL_WIDTH * col
  const y = CELL_HEIGHT * row
  return { x, y }
}

export function canMove(TerisMap, nextState) {
  const { type, row, col } = nextState.toObject()
  const { delta } = colorMap.get(type)
  const colDeltaList = List(delta.map(every => every[1]))
  const rowDeltaList = List(delta.map(every => every[0]))
  const maxRow = rowDeltaList.max()
  const minCol = colDeltaList.min()
  const maxCol = colDeltaList.max()
  if (col + minCol < 0 || col + maxCol > 9 || row + maxRow > 19) {
    return false
  }
  return !delta.some(([dRow, dCol]) => TerisMap.get(row + dRow).get(col + dCol) !== 'X')
}

// // todo 考虑物块从哪里开始掉
// export function isGameOver(TerisMap, nextState) {
//   return canMove(TerisMap, nextState)
//   // return TerisMap.get(0).some(v => v !== 'X')
// }