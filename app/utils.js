import { List, Map } from "immutable"
import { CELL_HEIGHT, CELL_WIDTH, ROW, COL } from './constants.js'
import { colorMap, directionMapDelta } from './resource'
import { put } from 'redux-saga/effects'
import * as A from './action'

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

// 随机生成落下的物块（随机包括类型和方向）
export function dropRandom() {
  const index = Math.floor(Math.random() * 7)
  const type = keysArray[index]
  const direction = 0
  const delta = directionMapDelta.get(type).get(direction)
  const rowDeltaList = List(delta.map(every => every[0]))
  const maxRow = rowDeltaList.max()

  return Map({ type, row: -maxRow, col: 4, direction })
}

// 旋转坐标的变化
export function rorate(delta) {
  return delta.map(([dRow, dCol]) => [dCol, -dRow])
}

// 预测最终的位置
export function forecastPosition(tetrisMap, curTetromino) {
  let nextPosition = curTetromino
  while (canTetrominoMove(tetrisMap, nextPosition)) {
    nextPosition = nextPosition.update('row', v => v + 1)
  }
  return nextPosition.update('row', v => v - 1)
}