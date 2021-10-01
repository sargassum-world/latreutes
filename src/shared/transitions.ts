import { cubicOut } from 'svelte/easing';
import { TransitionConfig, EasingFunction } from 'svelte/transition';

export interface SlideParams {
  delay?: number;
  duration?: number;
  topRatio?: number;
  easing?: EasingFunction;
}

export function slide(
  node: Element,
  {
    delay = 0,
    duration = 200,
    topRatio = 0.2,
    easing = cubicOut,
  }: SlideParams = {},
): TransitionConfig {
  const style = getComputedStyle(node);
  const height = parseFloat(style.height);
  const padding_top = parseFloat(style.paddingTop);
  const padding_bottom = parseFloat(style.paddingBottom);
  const margin_top = parseFloat(style.marginTop);
  const margin_bottom = parseFloat(style.marginBottom);

  return {
    delay,
    duration,
    easing,
    css: (t) =>
      'overflow: hidden;' +
      `height: ${(Math.max(0, t - topRatio) / (1 - topRatio)) * height}px;` +
      `padding-top: ${Math.min(1, t / topRatio) * padding_top}px;` +
      `padding-bottom: ${
        (Math.max(0, t - topRatio) / (1 - topRatio)) * padding_bottom
      }px;` +
      `margin-top: ${Math.min(1, t / topRatio) * margin_top}px;` +
      `margin-bottom: ${
        (Math.max(0, t - topRatio) / (1 - topRatio)) * margin_bottom
      }px;`,
  };
}
