import { describe, expect, it } from "vitest";
import { createInitialAudioState } from "./audioState";
import { createCardViewModel } from "./cardViewModel";
import { birthdayCardData } from "../data/birthdayCard";

describe("createCardViewModel", () => {
  it("keeps page copy, track data, and audio controls in one serializable model", () => {
    const viewModel = createCardViewModel(birthdayCardData, createInitialAudioState());

    expect(viewModel.hero.title).toBe("Happy Birthday");
    expect(viewModel.hero.kicker).toContain("Disco Snails");
    expect(viewModel.track.audioSrc).toBe("/audio/disco-snails.mp3");
    expect(viewModel.audioControl.label).toBe("Start the disco");
  });
});
