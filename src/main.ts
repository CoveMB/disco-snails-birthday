import "./styles.css";
import { createAudioController } from "./controllers/audioController";
import { createConfettiController } from "./controllers/confettiController";
import { createMotionController } from "./controllers/motionController";
import { getCardRefs, updateAudioControl } from "./controllers/viewController";
import { birthdayCardData } from "./data/birthdayCard";
import { audioReducer, createInitialAudioState, type AudioEvent } from "./domain/audioState";
import { createCardViewModel } from "./domain/cardViewModel";
import { renderBirthdayCard } from "./ui/cardView";

const appRoot = document.querySelector<HTMLElement>("#app");

if (!appRoot) {
  throw new Error("Missing #app root element.");
}

let audioState = createInitialAudioState();

function getViewModel() {
  return createCardViewModel(birthdayCardData, audioState);
}

appRoot.innerHTML = renderBirthdayCard(getViewModel());

const refs = getCardRefs(appRoot);
const motionController = createMotionController(refs.root);
const confettiController = createConfettiController(refs.confettiCanvas);

function dispatchAudio(event: AudioEvent): void {
  audioState = audioReducer(audioState, event);
  updateAudioControl(refs, getViewModel().audioControl);
}

const audioController = createAudioController(refs.audio, dispatchAudio);

refs.audioToggle.addEventListener("click", () => {
  audioController.toggle(audioState);
  confettiController.burst();
});

motionController.playIntro();
window.setTimeout(() => confettiController.burst(), 550);
