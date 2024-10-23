'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button"

// ぷよの色を定義
type PuyoColor = 'red' | 'blue' | 'green' | 'yellow' | 'gray' | null;

// フィールドの型を定義
type Field = PuyoColor[][];

// プレイヤーの状態を定義
interface PlayerState {
  field: Field;
  score: number;
  chainCount: number;
  garbagePuyoCount: number;
}

// ゲームの状態を定義
interface GameState {
  players: [PlayerState, PlayerState];
  currentPuyo: [PuyoColor, PuyoColor];
  nextPuyo: [PuyoColor, PuyoColor];
  gameOver: boolean;
  currentPlayer: 0 | 1;
  elapsedTime: number;
}

const FIELD_WIDTH = 6;
const FIELD_HEIGHT = 12;

const initialPlayerState: PlayerState = {
  field: Array(FIELD_HEIGHT).fill(null).map(() => Array(FIELD_WIDTH).fill(null)),
  score: 0,
  chainCount: 0,
  garbagePuyoCount: 0,
};

const initialGameState: GameState = {
  players: [{ ...initialPlayerState }, { ...initialPlayerState }],
  currentPuyo: [getRandomPuyoColor(), getRandomPuyoColor()],
  nextPuyo: [getRandomPuyoColor(), getRandomPuyoColor()],
  gameOver: false,
  currentPlayer: 0,
  elapsedTime: 0,
};

function getRandomPuyoColor(): PuyoColor {
  const colors: PuyoColor[] = ['red', 'blue', 'green', 'yellow'];
  return colors[Math.floor(Math.random() * colors.length)];
}

export function PuyoPuyoGameComponent() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (gameState.gameOver) return;

    switch (event.key) {
      case 'a':
      case 'A':
        // 左移動
        break;
      case 'd':
      case 'D':
        // 右移動
        break;
      case 's':
      case 'S':
        // 急降下
        break;
      case 'o':
      case 'O':
        // 左回転
        break;
      case 'p':
      case 'P':
        // 右回転
        break;
    }
  }, [gameState]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!gameState.gameOver) {
        setGameState(prevState => ({
          ...prevState,
          elapsedTime: prevState.elapsedTime + 1
        }));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.gameOver]);

  const renderField = (field: Field) => {
    return (
      <div className="grid grid-cols-6 gap-1 bg-gray-800 p-2">
        {field.map((row, rowIndex) =>
          row.map((cell, cellIndex) => (
            <div
              key={`${rowIndex}-${cellIndex}`}
              className={`w-8 h-8 rounded-full ${getPuyoColorClass(cell)}`}
            />
          ))
        )}
      </div>
    );
  };

  const getPuyoColorClass = (color: PuyoColor): string => {
    switch (color) {
      case 'red': return 'bg-red-500';
      case 'blue': return 'bg-blue-500';
      case 'green': return 'bg-green-500';
      case 'yellow': return 'bg-yellow-500';
      case 'gray': return 'bg-gray-500';
      default: return 'bg-gray-200';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">ぷよぷよ</h1>
      <div className="flex space-x-8">
        {gameState.players.map((player, index) => (
          <div key={index} className="flex flex-col items-center">
            <h2 className="text-2xl font-semibold mb-4">Player {index + 1}</h2>
            {renderField(player.field)}
            <div className="mt-4">
              <p>Score: {player.score}</p>
              <p>Chain: {player.chainCount}</p>
              <p>Garbage: {player.garbagePuyoCount}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8">
        <p>Time: {gameState.elapsedTime}s</p>
        <p>Next Puyo: {gameState.nextPuyo.join(', ')}</p>
      </div>
      {gameState.gameOver && (
        <div className="mt-8">
          <h2 className="text-3xl font-bold mb-4">Game Over!</h2>
          <Button onClick={() => setGameState(initialGameState)}>
            Restart Game
          </Button>
        </div>
      )}
    </div>
  );
}