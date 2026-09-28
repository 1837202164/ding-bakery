export type DayPhase = 'prepare' | 'open' | 'settle';

export type WaveId = 'morning' | 'lunch' | 'afternoon';

export type ProductId = 'croissant' | 'cookie' | 'cupcake' | 'cocoa';

export interface SeatSlot {
  readonly id: string;
  occupied: boolean;
  placed: boolean;
}

export interface OrderTicket {
  readonly id: string;
  readonly customerId: string;
  readonly productId: ProductId;
  status: 'pending' | 'baking' | 'ready' | 'served';
}

export interface CustomerState {
  readonly id: string;
  seatId: string | null;
  patience: number;
  mood: 'waiting' | 'happy' | 'disappointed';
  orderId: string | null;
  desiredProductId: ProductId;
}

export interface DayStats {
  happyLeaves: number;
  sadLeaves: number;
  stars: number;
  bestStars: number;
  dayIndex: number;
  tipsToday: number;
  tipsTotal: number;
  happyGoal: number;
  goalMet: boolean;
}

export type FeedbackKind = 'serve' | 'tip' | 'sad' | 'goal' | 'buy';

export interface FeedbackCue {
  kind: FeedbackKind;
  text: string;
  amount?: number;
}

export type UnlockId = 'flowers' | 'rug' | 'lamp';

export interface UnlockDef {
  readonly id: UnlockId;
  readonly label: string;
  readonly cost: number;
  readonly blurb: string;
}

export const UNLOCKS: ReadonlyArray<UnlockDef> = [
  { id: 'flowers', label: '窗台花', cost: 12, blurb: '客人更有耐心' },
  { id: 'rug', label: '暖色地毯', cost: 18, blurb: '上餐小费 +1' },
  { id: 'lamp', label: '暖黄灯笼', cost: 25, blurb: '客流稍密一点' },
];

export type SfxCue =
  | 'open'
  | 'seat'
  | 'order'
  | 'bake-step'
  | 'ding'
  | 'serve'
  | 'sad'
  | 'settle'
  | 'cancel'
  | 'wave'
  | 'tip'
  | 'goal'
  | 'buy';


export const PRODUCTS: ReadonlyArray<{ id: ProductId; label: string; steps: ReadonlyArray<string> }> = [
  { id: 'croissant', label: '可颂', steps: ['取面团', '烤一下', '装盘'] },
  { id: 'cookie', label: '曲奇', steps: ['取饼', '装袋'] },
  { id: 'cupcake', label: '杯子蛋糕', steps: ['取胚', '挤奶油', '装盘'] },
  { id: 'cocoa', label: '热可可', steps: ['接杯', '倒热饮'] },
];

export interface BakeSession {
  readonly orderId: string;
  readonly productId: ProductId;
  readonly label: string;
  readonly steps: ReadonlyArray<string>;
  readonly stepIndex: number;
  readonly currentStep: string;
  readonly totalSteps: number;
}