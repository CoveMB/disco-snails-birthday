import type { AudioControlView } from "../domain/audioState";

export type CardRefs = {
  root: HTMLElement;
  audio: HTMLAudioElement;
  audioToggle: HTMLButtonElement;
  audioLabel: HTMLElement;
  audioStatus: HTMLElement;
  confettiCanvas: HTMLCanvasElement;
};

function queryRequired<T extends Element>(root: ParentNode, selector: string): T {
  const element = root.querySelector<T>(selector);

  if (!element) {
    throw new Error(`Missing required element: ${selector}`);
  }

  return element;
}

export function getCardRefs(root: HTMLElement): CardRefs {
  return {
    root: queryRequired<HTMLElement>(root, "[data-card-root]"),
    audio: queryRequired<HTMLAudioElement>(root, "[data-disco-audio]"),
    audioToggle: queryRequired<HTMLButtonElement>(root, "[data-audio-toggle]"),
    audioLabel: queryRequired<HTMLElement>(root, "[data-audio-label]"),
    audioStatus: queryRequired<HTMLElement>(root, "[data-audio-status]"),
    confettiCanvas: queryRequired<HTMLCanvasElement>(root, "[data-confetti-canvas]"),
  };
}

export function updateAudioControl(refs: CardRefs, control: AudioControlView): void {
  refs.audioToggle.disabled = control.disabled;
  refs.audioToggle.setAttribute("aria-pressed", control.ariaPressed);
  refs.audioLabel.textContent = control.label;
  refs.audioStatus.textContent = control.statusText;
}
