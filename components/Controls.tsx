import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Play, Pause, RefreshCw } from 'lucide-react';
import { Direction, GameStatus, Theme } from '../types';

interface ControlsProps {
  onMove: (dir: Direction) => void;
  onTogglePause: () => void;
  onRestart: () => void;
  status: GameStatus;
  theme: Theme;
}

const Controls: React.FC<ControlsProps> = ({ onMove, onTogglePause, onRestart, status, theme }) => {
  const btnStyle = {
    backgroundColor: theme.boardColor,
    borderColor: theme.borderColor,
    color: theme.textColor,
  };

  const activeBtnStyle = {
    backgroundColor: theme.snakeColor,
    color: theme.backgroundColor, // Invert for active/primary actions
    borderColor: theme.snakeColor
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-[300px] mx-auto mt-4">
      {/* Game State Controls */}
      <div className="flex justify-center gap-4">
        {status === GameStatus.GAME_OVER ? (
           <button
           onClick={onRestart}
           className="flex items-center gap-2 px-6 py-3 rounded-full font-bold shadow-lg transition-transform active:scale-95 border-2"
           style={activeBtnStyle}
         >
           <RefreshCw size={20} /> 再玩一次
         </button>
        ) : (
          <button
            onClick={status === GameStatus.IDLE ? onRestart : onTogglePause}
            className="flex items-center gap-2 px-6 py-3 rounded-full font-bold shadow-lg transition-transform active:scale-95 border-2"
            style={status === GameStatus.IDLE ? activeBtnStyle : btnStyle}
          >
            {status === GameStatus.IDLE ? (
              <><Play size={20} /> 开始游戏</>
            ) : status === GameStatus.PAUSED ? (
              <><Play size={20} /> 继续游戏</>
            ) : (
              <><Pause size={20} /> 暂停</>
            )}
          </button>
        )}
      </div>

      {/* D-Pad for Mobile/Touch */}
      <div className="grid grid-cols-3 gap-2 mt-2 md:hidden">
        <div />
        <button
          onClick={() => onMove(Direction.UP)}
          className="p-4 rounded-xl flex items-center justify-center shadow-md active:bg-opacity-80 transition-colors border"
          style={btnStyle}
          aria-label="Up"
        >
          <ArrowUp size={24} />
        </button>
        <div />
        
        <button
          onClick={() => onMove(Direction.LEFT)}
          className="p-4 rounded-xl flex items-center justify-center shadow-md active:bg-opacity-80 transition-colors border"
          style={btnStyle}
          aria-label="Left"
        >
          <ArrowLeft size={24} />
        </button>
        <button
          onClick={() => onMove(Direction.DOWN)}
          className="p-4 rounded-xl flex items-center justify-center shadow-md active:bg-opacity-80 transition-colors border"
          style={btnStyle}
          aria-label="Down"
        >
          <ArrowDown size={24} />
        </button>
        <button
          onClick={() => onMove(Direction.RIGHT)}
          className="p-4 rounded-xl flex items-center justify-center shadow-md active:bg-opacity-80 transition-colors border"
          style={btnStyle}
          aria-label="Right"
        >
          <ArrowRight size={24} />
        </button>
      </div>
      
      <div className="hidden md:block text-center text-xs opacity-60 mt-2" style={{ color: theme.textColor }}>
        使用方向键或 WASD 移动 • 空格键暂停
      </div>
    </div>
  );
};

export default Controls;