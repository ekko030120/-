export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export interface Coordinate {
  x: number;
  y: number;
}

export enum GameStatus {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
}

export interface Theme {
  name: string;
  backgroundColor: string; // Hex code for app background
  boardColor: string; // Hex code for game board background
  snakeColor: string; // Hex code for snake body
  snakeHeadColor: string; // Hex code for snake head
  foodColor: string; // Hex code for food
  gridColor: string; // Hex code for grid lines
  textColor: string; // Hex code for UI text
  borderColor: string; // Hex code for borders
}

export interface ThemeGenerationResponse {
  theme: Theme;
  commentary: string;
}