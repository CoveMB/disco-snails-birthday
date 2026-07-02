import type { AudioControlView } from "../domain/audioState";

export type CardRefs = {
  root: HTMLElement;
  audio: HTMLAudioElement;
  audioToggle: HTMLButtonElement;
  exitDisco: HTMLButtonElement;
  audioLabel: HTMLElement;
  audioStatus: HTMLElement;
  confettiCanvas: HTMLCanvasElement;
};

type TimeoutScheduler = (callback: () => void, delay: number) => number;

export const birthdayCardRevealDelayMs = 20_000;

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
    exitDisco: queryRequired<HTMLButtonElement>(root, "[data-exit-disco]"),
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

export function markEntered(refs: CardRefs): void {
  refs.root.dataset.entryState = "entered";
}

export function markExited(refs: CardRefs): void {
  refs.root.dataset.entryState = "exited";
  refs.root.dataset.messageState = "intro";
}

export function markBirthdayCardReady(refs: CardRefs): void {
  refs.root.dataset.messageState = "card";
}

export function scheduleBirthdayCardReveal(
  refs: CardRefs,
  setTimeoutFn: TimeoutScheduler = window.setTimeout.bind(window),
): void {
  setTimeoutFn(() => markBirthdayCardReady(refs), birthdayCardRevealDelayMs);
}
