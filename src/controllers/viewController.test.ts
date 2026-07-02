import { describe, expect, it } from "vitest";
import type { CardRefs } from "./viewController";
import {
  birthdayCardRevealDelayMs,
  markBirthdayCardReady,
  markEntered,
  markExited,
  scheduleBirthdayCardReveal,
} from "./viewController";

describe("view controller", () => {
  it("marks the card root as entered", () => {
    const refs = {
      root: {
        dataset: {
          entryState: "waiting",
        },
      },
    } as unknown as CardRefs;

    markEntered(refs);

    expect(refs.root.dataset.entryState).toBe("entered");
  });

  it("marks the card root as ready to show the birthday card", () => {
    const refs = {
      root: {
        dataset: {
          messageState: "intro",
        },
      },
    } as unknown as CardRefs;

    markBirthdayCardReady(refs);

    expect(refs.root.dataset.messageState).toBe("card");
  });

  it("marks the card root as exited and resets the birthday card panel", () => {
    const refs = {
      root: {
        dataset: {
          entryState: "entered",
          messageState: "card",
        },
      },
    } as unknown as CardRefs;

    markExited(refs);

    expect(refs.root.dataset.entryState).toBe("exited");
    expect(refs.root.dataset.messageState).toBe("intro");
  });

  it("schedules the birthday card reveal 20 seconds after entry", () => {
    const refs = {
      root: {
        dataset: {
          messageState: "intro",
        },
      },
    } as unknown as CardRefs;
    const scheduledCallbacks: Array<() => void> = [];
    const setTimeout = (callback: () => void, delay: number): number => {
      expect(delay).toBe(20_000);
      scheduledCallbacks.push(callback);
      return 1;
    };

    expect(birthdayCardRevealDelayMs).toBe(20_000);

    scheduleBirthdayCardReveal(refs, setTimeout);

    expect(refs.root.dataset.messageState).toBe("intro");

    scheduledCallbacks[0]();

    expect(refs.root.dataset.messageState).toBe("card");
  });
});
