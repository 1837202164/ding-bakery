import type { ProductId } from './sim/Types';

const ICONS: Record<ProductId, string> = {
  croissant: '🥐',
  cookie: '🍪',
  cupcake: '🧁',
  cocoa: '☕',
};

export function productIcon(id: ProductId): string {
  return ICONS[id] ?? '🥖';
}
