import { describe, expect, it, vi } from "vitest";
import type { AudioEvent } from "../domain/audioState";
import { createAudioController } from "./audioController";

function createAudioStub(): HTMLAudioElement {
  return {
    currentTime: 42,
    ended: false,
    loop: false,
    volume: 1,
    addEventListener: vi.fn(),
    pause: vi.fn(),
    play: vi.fn(() => Promise.resolve()),
    removeEventListener: vi.fn(),
  } as unknown as HTMLAudioElement;
}

describe("createAudioController", () => {
  it("stops playback, resets the track, and dispatches paused audio state", () => {
    const audio = createAudioStub();
    const dispatchedEvents: AudioEvent[] = [];
    const controller = createAudioController(audio, (event) => dispatchedEvents.push(event));

    controller.stop();

    expect(audio.pause).toHaveBeenCalledTimes(1);
    expect(audio.currentTime).toBe(0);
    expect(dispatchedEvents).toContainEqual({ type: "playback-paused" });
  });
});
