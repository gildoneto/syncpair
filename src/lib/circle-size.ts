const MIN_PX = 56;
const MAX_PX = 112;

/**
 * Diameter scales with the square root of the value (area proportional to
 * duration), not the raw value — linear diameter scaling exaggerates the gap
 * between a 5-minute and a 45-minute circle far past what's useful at a
 * glance.
 */
export function circleSize(minutes: number, allMinutes: number[]): number {
  const roots = allMinutes.map(Math.sqrt);
  const min = Math.min(...roots);
  const max = Math.max(...roots);
  if (max === min) return Math.round((MIN_PX + MAX_PX) / 2);
  const t = (Math.sqrt(minutes) - min) / (max - min);
  return Math.round(MIN_PX + t * (MAX_PX - MIN_PX));
}
