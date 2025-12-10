export type ViewState = 'HOME' | 'GENERATING' | 'COLORING';

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
}

export interface DrawingTool {
  color: string;
  size: number;
  type: 'brush' | 'eraser' | 'bucket';
}

export const PRESET_COLORS = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#facc15', // Yellow
  '#4ade80', // Green
  '#22d3ee', // Cyan
  '#3b82f6', // Blue
  '#a855f7', // Purple
  '#ec4899', // Pink
  '#78350f', // Brown
  '#000000', // Black
  '#ffffff', // White
];

export const PRESET_PROMPTS = [
  "A cute baby dragon eating ice cream",
  "A happy astronaut cat in space",
  "A magical castle on a cloud",
  "A friendly robot gardening",
  "Under the sea party with fish"
];