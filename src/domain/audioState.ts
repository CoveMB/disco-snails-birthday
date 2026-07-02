export type AudioStatus = "paused" | "loading" | "playing" | "error";

export type AudioState = {
  status: AudioStatus;
  errorMessage: string | null;
  hasEnteredDisco: boolean;
};

export type AudioEvent =
  | { type: "playback-requested" }
  | { type: "playback-started" }
  | { type: "playback-paused" }
  | { type: "playback-ended" }
  | { type: "playback-failed"; message: string };

export type AudioControlView = {
  label: string;
  statusText: string;
  ariaPressed: "true" | "false";
  disabled: boolean;
};

export function createInitialAudioState(): AudioState {
  return {
    status: "paused",
    errorMessage: null,
    hasEnteredDisco: false,
  };
}

export function audioReducer(state: AudioState, event: AudioEvent): AudioState {
  switch (event.type) {
    case "playback-requested":
      return {
        status: "loading",
        errorMessage: null,
        hasEnteredDisco: true,
      };
    case "playback-started":
      return {
        status: "playing",
        errorMessage: null,
        hasEnteredDisco: true,
      };
    case "playback-paused":
    case "playback-ended":
      return {
        status: "paused",
        errorMessage: null,
        hasEnteredDisco: state.hasEnteredDisco,
      };
    case "playback-failed":
      return {
        status: "error",
        errorMessage: event.message,
        hasEnteredDisco: state.hasEnteredDisco,
      };
    default:
      return state;
  }
}

export function getAudioControlView(state: AudioState): AudioControlView {
  if (state.status === "playing") {
    return {
      label: "Pause the disco",
      statusText: "Disco mode is live.",
      ariaPressed: "true",
      disabled: false,
    };
  }

  if (state.status === "loading") {
    return {
      label: "Cueing snails",
      statusText: "The snails are finding the beat.",
      ariaPressed: "false",
      disabled: true,
    };
  }

  if (state.status === "error") {
    return {
      label: "Try the disco again",
      statusText: state.errorMessage ?? "Audio could not start.",
      ariaPressed: "false",
      disabled: false,
    };
  }

  return {
    label: state.hasEnteredDisco ? "Start disco again" : "Show your snail ID to enter the disco",
    statusText: "Music starts after you show your snail ID.",
    ariaPressed: "false",
    disabled: false,
  };
}
