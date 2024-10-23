'use client'

import React from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const PuyoColors = {
  Red: 'bg-red-500',
  Blue: 'bg-blue-500',
  Green: 'bg-green-500',
  Yellow: 'bg-yellow-500',
  Gray: 'bg-gray-500', // For obstacle Puyos
}

type PuyoType = keyof typeof PuyoColors | null

const GameField: React.FC = () => {
  const field: PuyoType[][] = Array(12).fill(null).map(() => Array(6).fill(null))
  
  // Add some Puyos for visualization
  field[11] = ['Red', 'Blue', 'Green', 'Yellow', 'Red', 'Blue']
  field[10] = ['Blue', 'Green', null, 'Red', 'Yellow', 'Green']
  field[9] = ['Green', 'Yellow', null, null, 'Blue', 'Red']

  return (
    <div className="grid grid-cols-6 gap-1 w-48">
      {field.map((row, i) => (
        row.map((puyo, j) => (
          <div key={`${i}-${j}`} className={`w-8 h-8 border ${puyo ? PuyoColors[puyo] : 'bg-gray-200'}`}></div>
        ))
      ))}
    </div>
  )
}

const Controls: React.FC = () => {
  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="grid grid-cols-3 gap-2">
        <Button className="col-start-2">O</Button>
        <Button>P</Button>
        <Button>A</Button>
        <Button>S</Button>
        <Button>D</Button>
      </div>
      <div className="text-sm text-center">
        <p>A: Move Left | D: Move Right</p>
        <p>S: Fast Drop | O: Rotate Left | P: Rotate Right</p>
      </div>
    </div>
  )
}

const NextPuyo: React.FC = () => {
  return (
    <div className="flex flex-col items-center">
      <h3 className="text-lg font-bold mb-2">Next</h3>
      <div className="flex flex-col">
        <div className={`w-8 h-8 ${PuyoColors.Red}`}></div>
        <div className={`w-8 h-8 ${PuyoColors.Blue}`}></div>
      </div>
    </div>
  )
}

export function PuyoPuyoSpec() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-6">Puyo Puyo Game Specification</h1>
      <div className="flex space-x-8">
        <Card className="p-4">
          <h2 className="text-xl font-bold mb-4">Player 1</h2>
          <div className="flex space-x-4">
            <GameField />
            <NextPuyo />
          </div>
          <div className="mt-4">
            <Controls />
          </div>
        </Card>
        <Card className="p-4">
          <h2 className="text-xl font-bold mb-4">Game Info</h2>
          <div className="space-y-2">
            <p><strong>Score:</strong> 1000</p>
            <p><strong>Time:</strong> 02:30</p>
            <p><strong>Chain:</strong> 3</p>
            <p><strong>Obstacle Puyos:</strong> 6</p>
          </div>
        </Card>
      </div>
    </div>
  )
}