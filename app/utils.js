import { List, Map } from "immutable"
import { CELL_HEIGHT, CELL_WIDTH, ROW, COL } from './constants.js'
import { colorMap, directionMapDelta } from './resource'

export function indexToCoordinate(row, col) {
  const x = CELL_WIDTH * col
  const y = CELL_HEIGHT * row
  return { x, y }
}

export function canTetrominoMove(TerisMap, nextState) {
  const { type, row, col, direction } = nextState.toObject()
  const delta = directionMapDelta.get(type).get(direction)
  const colDeltaList = List(delta.map(every => every[1]))
  const rowDeltaList = List(delta.map(every => every[0]))
  const maxRow = rowDeltaList.max()
  const minCol = colDeltaList.min()
  const maxCol = colDeltaList.max()
  if (col + minCol < 0 || col + maxCol > COL - 1 || row + maxRow > ROW - 1) {
    console.log('到边界了，无法移动')
    return false
  }
  return !delta.some(([dRow, dCol]) => row + dRow >= 0 && TerisMap.get(row + dRow).get(col + dCol) !== 'X')
}

const keysArray = colorMap.keySeq().toList().delete(0).toArray()

export function dropRandom() {
  const index = Math.floor(Math.random() * 7)
  const type = keysArray[index]
  const direction = Math.floor(Math.random() * 4)
  const delta = directionMapDelta.get(type).get(direction)
  const rowDeltaList = List(delta.map(every => every[0]))
  const maxRow = rowDeltaList.max()

  return Map({ type, row: -maxRow, col: 4, direction })
}

export function rorate(delta) {
  return delta.map(([dRow, dCol]) => [dCol, -dRow])
}