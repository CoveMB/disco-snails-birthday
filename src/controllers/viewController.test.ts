import { describe, expect, it } from "vitest";
import type { CardRefs } from "./viewController";
import { markEntered } from "./viewController";

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
});
