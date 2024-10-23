import React, { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"

// ぷよの色を定義
type PuyoColor = 'red' | 'blue' | 'green' | 'yellow' | 'empty'

// ゲームボードの型を定義
type GameBoard = PuyoColor[][]

// ぷよペアの型を定義
type PuyoPair = [PuyoColor, PuyoColor]

// ゲームの状態を定義
interface GameState {
  board: GameBoard
  currentPuyo: PuyoPair
  nextPuyo: PuyoPair
  score: number
  gameOver: boolean
}

const BOARD_WIDTH = 6
const BOARD_HEIGHT = 12

const initialBoard: GameBoard = Array(BOARD_HEIGHT).fill(null).map(() => 
  Array(BOARD_WIDTH).fill('empty')
)

const getRandomColor = (): PuyoColor => {
  const colors: PuyoColor[] = ['red', 'blue', 'green', 'yellow']
  return colors[Math.floor(Math.random() * colors.length)]
}

const createPuyoPair = (): PuyoPair => [getRandomColor(), getRandomColor()]

export default function PuyoPuyo() {
  const [gameState, setGameState] = useState<GameState>({
    board: initialBoard,
    currentPuyo: createPuyoPair(),
    nextPuyo: createPuyoPair(),
    score: 0,
    gameOver: false
  })

  const [puyoPosition, setPuyoPosition] = useState({ x: 2, y: 0, rotation: 0 })

  const resetGame = () => {
    setGameState({
      board: initialBoard,
      currentPuyo: createPuyoPair(),
      nextPuyo: createPuyoPair(),
      score: 0,
      gameOver: false
    })
    setPuyoPosition({ x: 2, y: 0, rotation: 0 })
  }

  const movePuyo = useCallback((direction: 'left' | 'right' | 'down') => {
    if (gameState.gameOver) return

    setPuyoPosition(prev => {
      let newX = prev.x
      let newY = prev.y

      switch (direction) {
        case 'left':
          newX = Math.max(0, prev.x - 1)
          break
        case 'right':
          newX = Math.min(BOARD_WIDTH - 1, prev.x + 1)
          break
        case 'down':
          newY = prev.y + 1
          break
      }

      // 移動が有効かチェック
      if (isValidMove(newX, newY, prev.rotation)) {
        return { ...prev, x: newX, y: newY }
      }
      return prev
    })
  }, [gameState.gameOver])

  const rotatePuyo = useCallback((direction: 'left' | 'right') => {
    if (gameState.gameOver) return

    setPuyoPosition(prev => {
      const newRotation = (prev.rotation + (direction === 'right' ? 1 : 3)) % 4
      if (isValidMove(prev.x, prev.y, newRotation)) {
        return { ...prev, rotation: newRotation }
      }
      return prev
    })
  }, [gameState.gameOver])

  const isValidMove = (x: number, y: number, rotation: number): boolean => {
    const secondPuyoPosition = getSecondPuyoPosition(x, y, rotation)
    return (
      x >= 0 && x < BOARD_WIDTH &&
      y >= 0 && y < BOARD_HEIGHT &&
      secondPuyoPosition.x >= 0 && secondPuyoPosition.x < BOARD_WIDTH &&
      secondPuyoPosition.y >= 0 && secondPuyoPosition.y < BOARD_HEIGHT &&
      gameState.board[y][x] === 'empty' &&
      gameState.board[secondPuyoPosition.y][secondPuyoPosition.x] === 'empty'
    )
  }

  const getSecondPuyoPosition = (x: number, y: number, rotation: number) => {
    switch (rotation) {
      case 0: return { x, y: y - 1 }
      case 1: return { x: x + 1, y }
      case 2: return { x, y: y + 1 }
      case 3: return { x: x - 1, y }
      default: return { x, y }
    }
  }

  const placePuyo = useCallback(() => {
    const { x, y, rotation } = puyoPosition
    const secondPos = getSecondPuyoPosition(x, y, rotation)

    setGameState(prev => {
      const newBoard = [...prev.board]
      newBoard[y][x] = prev.currentPuyo[0]
      newBoard[secondPos.y][secondPos.x] = prev.currentPuyo[1]

      // ここで消去と落下のロジックを呼び出す
      const { updatedBoard, score } = clearAndDropPuyos(newBoard)

      return {
        ...prev,
        board: updatedBoard,
        currentPuyo: prev.nextPuyo,
        nextPuyo: createPuyoPair(),
        score: prev.score + score,
        gameOver: updatedBoard[0][2] !== 'empty' || updatedBoard[0][3] !== 'empty'
      }
    })

    setPuyoPosition({ x: 2, y: 0, rotation: 0 })
  }, [puyoPosition])

  const clearAndDropPuyos = (board: GameBoard): { updatedBoard: GameBoard, score: number } => {
    let updatedBoard = [...board]
    let totalScore = 0
    let chainsCount = 0
    let hasCleared

    do {
      hasCleared = false
      chainsCount++

      // 消去処理
      for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
          if (updatedBoard[y][x] !== 'empty') {
            const color = updatedBoard[y][x]
            const connectedPuyos = findConnectedPuyos(updatedBoard, x, y, color)
            if (connectedPuyos.length >= 4) {
              hasCleared = true
              connectedPuyos.forEach(({ x, y }) => {
                updatedBoard[y][x] = 'empty'
              })
              totalScore += connectedPuyos.length * 10 * chainsCount
            }
          }
        }
      }

      // 落下処理
      for (let x = 0; x < BOARD_WIDTH; x++) {
        let emptyY = BOARD_HEIGHT - 1
        for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
          if (updatedBoard[y][x] !== 'empty') {
            if (y !== emptyY) {
              updatedBoard[emptyY][x] = updatedBoard[y][x]
              updatedBoard[y][x] = 'empty'
            }
            emptyY--
          }
        }
      }
    } while (hasCleared)

    return { updatedBoard, score: totalScore }
  }

  const findConnectedPuyos = (board: GameBoard, startX: number, startY: number, color: PuyoColor): { x: number, y: number }[] => {
    const connected: { x: number, y: number }[] = []
    const stack: { x: number, y: number }[] = [{ x: startX, y: startY }]

    while (stack.length > 0) {
      const { x, y } = stack.pop()!
      if (x < 0 || x >= BOARD_WIDTH || y < 0 || y >= BOARD_HEIGHT || board[y][x] !== color) continue
      if (connected.some(pos => pos.x === x && pos.y === y)) continue

      connected.push({ x, y })
      stack.push({ x: x + 1, y }, { x: x - 1, y }, { x, y: y + 1 }, { x, y: y - 1 })
    }

    return connected
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'a': movePuyo('left'); break
        case 'd': movePuyo('right'); break
        case 's': movePuyo('down'); break
        case 'o': rotatePuyo('left'); break
        case 'p': rotatePuyo('right'); break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [movePuyo, rotatePuyo])

  useEffect(() => {
    if (gameState.gameOver) return

    const gameLoop = setInterval(() => {
      setPuyoPosition(prev => {
        if (isValidMove(prev.x, prev.y + 1, prev.rotation)) {
          return { ...prev, y: prev.y + 1 }
        } else {
          placePuyo()
          return prev
        }
      })
    }, 1000)

    return () => clearInterval(gameLoop)
  }, [gameState.gameOver, placePuyo])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">ぷよぷよ</h1>
      <div className="flex gap-8">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">次のぷよ</h2>
          <div className="flex justify-center items-center h-16">
            <div className={`w-8 h-8 rounded-full mr-2 bg-${gameState.nextPuyo[0]}-500`}></div>
            <div className={`w-8 h-8 rounded-full bg-${gameState.nextPuyo[1]}-500`}></div>
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">スコア</h2>
          <p className="text-2xl font-bold">{gameState.score}</p>
        </div>
      </div>
      <div className="mt-4 bg-white p-4 rounded shadow">
        {gameState.board.map((row, y) => (
          <div key={y} className="flex">
            {row.map((color, x) => (
              <div
                key={`${x}-${y}`}
                className={`w-8 h-8 border border-gray-200 ${color !== 'empty' ? `bg-${color}-500` : ''}`}
              >
                {(puyoPosition.x === x && puyoPosition.y === y) && (
                  <div className={`w-full h-full rounded-full bg-${gameState.currentPuyo[0]}-500`}></div>
                )}
                {(getSecondPuyoPosition(puyoPosition.x, puyoPosition.y, puyoPosition.rotation).x === x &&
                  getSecondPuyoPosition(puyoPosition.x, puyoPosition.y, puyoPosition.rotation).y === y) && (
                  <div className={`w-full h-full rounded-full bg-${gameState.currentPuyo[1]}-500`}></div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      {gameState.gameOver && (
        <div className="mt-4">
          <p className="text-2xl font-bold mb-2">ゲームオーバー</p>
          <Button onClick={resetGame}>リスタート</Button>
        </div>
      )}
      <div className="mt-4">
        <p className="text-sm text-gray-600">
          操作方法: A (左移動), D (右移動), S (下移動), O (左回転), P (右回転)
        </p>
      </div>
    </div>
  )
}