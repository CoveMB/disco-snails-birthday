import { describe, expect, it } from "vitest";
import { birthdayCardData } from "../data/birthdayCard";
import { createInitialAudioState } from "./audioState";
import { createCardViewModel } from "./cardViewModel";

describe("createCardViewModel", () => {
  it("keeps page copy, track data, and audio controls in one serializable model", () => {
    const viewModel = createCardViewModel(
      birthdayCardData,
      createInitialAudioState(),
    );

    expect(viewModel.hero.title).toBe("Happy Birthday");
    expect(viewModel.hero.kicker).toContain("Disco Snails");
    expect(viewModel.track.audioSrc).toBe("/audio/disco-snails.mp3");
    expect(viewModel.audioControl.label).toBe(
      "Show your snail ID to enter the disco",
    );
  });

  it("includes the delayed snail birthday card message", () => {
    const viewModel = createCardViewModel(
      birthdayCardData,
      createInitialAudioState(),
    );

    expect(viewModel.birthdayMessage.lines).toEqual([
      "Thanks for your disco moves little snail 🪩",
      "You are such a wonderful little being bringing care and creativity all around you ✨",
      "Get all you're wishing for, you deserve it 🙌",
      "Love 💖",
    ]);
  });
});
