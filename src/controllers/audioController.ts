import type { AudioEvent, AudioState } from "../domain/audioState";

export type AudioController = {
  toggle: (state: AudioState) => void;
  stop: () => void;
  destroy: () => void;
};

type DispatchAudioEvent = (event: AudioEvent) => void;

function getPlaybackErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return "The browser refused to start the disco.";
}

export function createAudioController(
  audio: HTMLAudioElement,
  dispatch: DispatchAudioEvent,
): AudioController {
  audio.loop = true;
  audio.volume = 0.84;

  const handleEnded = (): void => dispatch({ type: "playback-ended" });
  const handlePause = (): void => {
    if (!audio.ended) {
      dispatch({ type: "playback-paused" });
    }
  };
  const handleError = (): void => {
    dispatch({
      type: "playback-failed",
      message: "Audio failed to load. The snails are blaming the aux cable.",
    });
  };

  audio.addEventListener("ended", handleEnded);
  audio.addEventListener("pause", handlePause);
  audio.addEventListener("error", handleError);

  return {
    toggle: (state) => {
      if (state.status === "playing") {
        audio.pause();
        dispatch({ type: "playback-paused" });
        return;
      }

      dispatch({ type: "playback-requested" });

      void audio
        .play()
        .then(() => dispatch({ type: "playback-started" }))
        .catch((error: unknown) => {
          dispatch({
            type: "playback-failed",
            message: getPlaybackErrorMessage(error),
          });
        });
    },
    stop: () => {
      audio.pause();
      audio.currentTime = 0;
      dispatch({ type: "playback-paused" });
    },
    destroy: () => {
      audio.pause();
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("error", handleError);
    },
  };
}
