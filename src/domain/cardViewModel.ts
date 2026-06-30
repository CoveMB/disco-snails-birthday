import type { BirthdayCardData } from "../data/birthdayCard";
import type { AudioControlView, AudioState } from "./audioState";
import { getAudioControlView } from "./audioState";

export type CardViewModel = {
  hero: BirthdayCardData["hero"];
  track: BirthdayCardData["track"];
  art: BirthdayCardData["art"];
  audioControl: AudioControlView;
};

export function createCardViewModel(data: BirthdayCardData, audioState: AudioState): CardViewModel {
  return {
    hero: data.hero,
    track: data.track,
    art: data.art,
    audioControl: getAudioControlView(audioState),
  };
}
