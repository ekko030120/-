import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Coordinate, Direction, GameStatus, Theme } from './types';
import { GRID_SIZE, INITIAL_SPEED, MIN_SPEED, SPEED_DECREMENT, DEFAULT_THEME } from './constants';
import Controls from './components/Controls';
import { Trophy, Zap } from 'lucide-react';

const App: React.FC = () => {
  // Game State
  const [snake, setSnake] = useState<Coordinate[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Coordinate>({ x: 15, y: 5 });
  const [direction, setDirection] = useState<Direction>(Direction.RIGHT);
  const [status, setStatus] = useState<GameStatus>(GameStatus.IDLE);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  
  // Theme State
  const [theme] = useState<Theme>(DEFAULT_THEME);

  // Refs for mutable state in event listeners/intervals to avoid closures
  const directionRef = useRef<Direction>(Direction.RIGHT);
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- Game Logic Helpers ---

  const generateFood = useCallback((currentSnake: Coordinate[]): Coordinate => {
    let newFood: Coordinate;
    let isOnSnake = true;
    while (isOnSnake) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // eslint-disable-next-line no-loop-func
      isOnSnake = currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
      if (!isOnSnake) return newFood;
    }
    return { x: 0, y: 0 }; // Fallback (should theoretically not happen often)
  }, []);

  const resetGame = useCallback(() => {
    setSnake([{ x: 10, y: 10 }]);
    setFood({ x: 15, y: 5 });
    setDirection(Direction.RIGHT);
    directionRef.current = Direction.RIGHT;
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setStatus(GameStatus.PLAYING);
  }, []);

  const gameOver = useCallback(() => {
    setStatus(GameStatus.GAME_OVER);
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('snakeHighScore', score.toString());
    }
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
  }, [score, highScore]);

  const moveSnake = useCallback(() => {
    setSnake(prevSnake => {
      const head = prevSnake[0];
      const newHead = { ...head };

      switch (directionRef.current) {
        case Direction.UP: newHead.y -= 1; break;
        case Direction.DOWN: newHead.y += 1; break;
        case Direction.LEFT: newHead.x -= 1; break;
        case Direction.RIGHT: newHead.x += 1; break;
      }

      // Check Wall Collision
      if (
        newHead.x < 0 || 
        newHead.x >= GRID_SIZE || 
        newHead.y < 0 || 
        newHead.y >= GRID_SIZE
      ) {
        gameOver();
        return prevSnake;
      }

      // Check Self Collision
      if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        gameOver();
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check Food Collision
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => s + 10);
        setSpeed(s => Math.max(MIN_SPEED, s - SPEED_DECREMENT));
        setFood(generateFood(newSnake));
        // Don't pop tail, so it grows
      } else {
        newSnake.pop(); // Remove tail
      }

      return newSnake;
    });
  }, [food, generateFood, gameOver]);

  // --- Effects ---

  // Initialize High Score
  useEffect(() => {
    const saved = localStorage.getItem('snakeHighScore');
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  // Game Loop
  useEffect(() => {
    if (status === GameStatus.PLAYING) {
      gameLoopRef.current = setInterval(moveSnake, speed);
    } else {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [status, moveSnake, speed]);

  // Keyboard Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status !== GameStatus.PLAYING && status !== GameStatus.IDLE) {
          if (e.code === 'Space' && status === GameStatus.PAUSED) {
              setStatus(GameStatus.PLAYING);
          }
          return;
      }
      
      const key = e.code;
      
      // Prevent scrolling with arrows/space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(key)) {
        e.preventDefault();
      }

      if (key === 'Space') {
          setStatus(prev => prev === GameStatus.PLAYING ? GameStatus.PAUSED : GameStatus.PLAYING);
          return;
      }

      const currentDir = directionRef.current;
      
      switch (key) {
        case 'ArrowUp':
        case 'KeyW':
          if (currentDir !== Direction.DOWN) directionRef.current = Direction.UP;
          break;
        case 'ArrowDown':
        case 'KeyS':
          if (currentDir !== Direction.UP) directionRef.current = Direction.DOWN;
          break;
        case 'ArrowLeft':
        case 'KeyA':
          if (currentDir !== Direction.RIGHT) directionRef.current = Direction.LEFT;
          break;
        case 'ArrowRight':
        case 'KeyD':
          if (currentDir !== Direction.LEFT) directionRef.current = Direction.RIGHT;
          break;
      }
      setDirection(directionRef.current); // Force re-render for UI updates if needed
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status]);

  // --- Handlers ---

  const handleManualMove = (dir: Direction) => {
    if (status !== GameStatus.PLAYING) return;
    const currentDir = directionRef.current;
    if (dir === Direction.UP && currentDir !== Direction.DOWN) directionRef.current = Direction.UP;
    if (dir === Direction.DOWN && currentDir !== Direction.UP) directionRef.current = Direction.DOWN;
    if (dir === Direction.LEFT && currentDir !== Direction.RIGHT) directionRef.current = Direction.LEFT;
    if (dir === Direction.RIGHT && currentDir !== Direction.LEFT) directionRef.current = Direction.RIGHT;
    setDirection(directionRef.current);
  };

  // --- Rendering ---

  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center justify-center p-4 transition-colors duration-500 ease-in-out"
      style={{ backgroundColor: theme.backgroundColor }}
    >
      <div className="max-w-md w-full relative">
        
        {/* Header / Scoreboard */}
        <div className="flex justify-between items-end mb-6" style={{ color: theme.textColor }}>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">贪吃蛇</h1>
            <p className="text-sm opacity-80 mt-1">按空格键暂停/继续</p>
          </div>
          <div className="text-right">
             <div className="flex items-center justify-end gap-1 text-xs uppercase tracking-widest opacity-70">
                <Trophy size={12} /> 最高分
             </div>
             <div className="text-xl font-bold">{highScore}</div>
             <div className="flex items-center justify-end gap-1 text-xs uppercase tracking-widest opacity-70 mt-2">
                <Zap size={12} /> 得分
             </div>
             <div className="text-3xl font-black leading-none" style={{ color: theme.snakeHeadColor }}>{score}</div>
          </div>
        </div>

        {/* Game Board Container */}
        <div 
            className="relative rounded-xl shadow-2xl overflow-hidden aspect-square border-4 transition-all duration-300"
            style={{ 
                backgroundColor: theme.boardColor, 
                borderColor: theme.borderColor,
                boxShadow: `0 20px 25px -5px ${theme.boardColor}40`
            }}
        >
            {/* Grid Lines (Optional visual flair) */}
            <div 
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(${theme.gridColor} 1px, transparent 1px), linear-gradient(90deg, ${theme.gridColor} 1px, transparent 1px)`,
                    backgroundSize: `${100/GRID_SIZE}% ${100/GRID_SIZE}%`
                }}
            />

            {/* Game Grid */}
            <div 
                className="w-full h-full grid"
                style={{ 
                    gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                    gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`
                }}
            >
                {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
                    const x = index % GRID_SIZE;
                    const y = Math.floor(index / GRID_SIZE);
                    
                    const isSnakeHead = snake[0].x === x && snake[0].y === y;
                    const isSnakeBody = snake.some((s, i) => i !== 0 && s.x === x && s.y === y);
                    const isFood = food.x === x && food.y === y;

                    return (
                        <div key={index} className="relative">
                            {isSnakeHead && (
                                <div 
                                    className="absolute inset-0 m-[1px] rounded-sm transition-all duration-100 z-10"
                                    style={{ backgroundColor: theme.snakeHeadColor, boxShadow: `0 0 10px ${theme.snakeHeadColor}` }}
                                >
                                    {/* Eyes based on direction */}
                                    <div className="absolute w-full h-full flex justify-between px-[15%] py-[15%]">
                                        <div className="w-[20%] h-[20%] bg-black rounded-full opacity-50" />
                                        <div className="w-[20%] h-[20%] bg-black rounded-full opacity-50" />
                                    </div>
                                </div>
                            )}
                            {isSnakeBody && (
                                <div 
                                    className="absolute inset-0 m-[1px] rounded-sm transition-all duration-100"
                                    style={{ backgroundColor: theme.snakeColor, opacity: 0.8 }}
                                />
                            )}
                            {isFood && (
                                <div 
                                    className="absolute inset-0 m-[2px] rounded-full animate-pulse"
                                    style={{ backgroundColor: theme.foodColor, boxShadow: `0 0 15px ${theme.foodColor}` }}
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Overlays */}
            {status === GameStatus.GAME_OVER && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white p-6 text-center z-20">
                    <h2 className="text-4xl font-black mb-2 text-red-500">游戏结束</h2>
                    <p className="text-lg mb-6">你的得分是 {score} 分！</p>
                </div>
            )}
            
            {status === GameStatus.PAUSED && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-20">
                    <h2 className="text-2xl font-bold text-white tracking-widest uppercase">已暂停</h2>
                </div>
            )}
        </div>

        {/* Controls */}
        <Controls 
            onMove={handleManualMove} 
            onRestart={resetGame}
            onTogglePause={() => setStatus(s => s === GameStatus.PLAYING ? GameStatus.PAUSED : GameStatus.PLAYING)}
            status={status}
            theme={theme}
        />
        
      </div>
    </div>
  );
};

export default App;