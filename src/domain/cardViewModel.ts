import type { BirthdayCardData } from "../data/birthdayCard";
import type { AudioControlView, AudioState } from "./audioState";
import { getAudioControlView } from "./audioState";

export type CardViewModel = {
  hero: BirthdayCardData["hero"];
  track: BirthdayCardData["track"];
  art: BirthdayCardData["art"];
  musicCredit: string;
  audioControl: AudioControlView;
};

function formatMusicCredit(track: BirthdayCardData["track"]): string {
  return `${track.artist} - ${track.title}`;
}

export function createCardViewModel(data: BirthdayCardData, audioState: AudioState): CardViewModel {
  return {
    hero: data.hero,
    track: data.track,
    art: data.art,
    musicCredit: formatMusicCredit(data.track),
    audioControl: getAudioControlView(audioState),
  };
}
