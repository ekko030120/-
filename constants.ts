import { Theme } from './types';

export const GRID_SIZE = 20;
export const INITIAL_SPEED = 150; // ms
export const MIN_SPEED = 50;
export const SPEED_DECREMENT = 2; // How much speed increases per food

export const DEFAULT_THEME: Theme = {
  name: "经典模式",
  backgroundColor: "#0f172a", // slate-900
  boardColor: "#1e293b", // slate-800
  snakeColor: "#22c55e", // green-500
  snakeHeadColor: "#4ade80", // green-400
  foodColor: "#ef4444", // red-500
  gridColor: "#334155", // slate-700
  textColor: "#f8fafc", // slate-50
  borderColor: "#475569", // slate-600
};