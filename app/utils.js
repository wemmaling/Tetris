import { CELL_HEIGHT, CELL_WIDTH } from './constants.js'

export function indexToCoordinate(row, col) {
  const x = CELL_WIDTH * col
  const y = CELL_HEIGHT * row
  return { x, y }
}