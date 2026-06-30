import { describe, expect, it } from "vitest";
import { audioReducer, createInitialAudioState, getAudioControlView } from "./audioState";

describe("audio state", () => {
  it("starts paused with a clear call to action", () => {
    const state = createInitialAudioState();
    const view = getAudioControlView(state);

    expect(state.status).toBe("paused");
    expect(view.label).toBe("Start the disco");
    expect(view.ariaPressed).toBe("false");
  });

  it("switches to playing after playback starts", () => {
    const state = audioReducer(createInitialAudioState(), { type: "playback-started" });
    const view = getAudioControlView(state);

    expect(state.status).toBe("playing");
    expect(view.label).toBe("Pause the disco");
    expect(view.ariaPressed).toBe("true");
  });

  it("keeps browser playback failures explicit", () => {
    const state = audioReducer(createInitialAudioState(), {
      type: "playback-failed",
      message: "Browser blocked playback",
    });
    const view = getAudioControlView(state);

    expect(state.status).toBe("error");
    expect(view.label).toBe("Try the disco again");
    expect(view.statusText).toBe("Browser blocked playback");
  });
});
