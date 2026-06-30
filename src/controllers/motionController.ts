import { gsap } from "gsap";

export type MotionController = {
  playIntro: () => void;
  destroy: () => void;
};

export function createMotionController(root: HTMLElement): MotionController {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion) {
    root.dataset.motion = "reduced";
    return {
      playIntro: () => undefined,
      destroy: () => undefined,
    };
  }

  root.dataset.motion = "full";

  const heroCopy = root.querySelector<HTMLElement>("[data-hero-copy]");
  const snailStage = root.querySelector<HTMLElement>("[data-snail-stage]");
  const mirrorBall = root.querySelector<HTMLElement>("[data-mirror-ball]");
  const beams = Array.from(root.querySelectorAll<HTMLElement>(".beam"));
  const snails = Array.from(root.querySelectorAll<SVGElement>("[data-dancing-snail]"));
  const snailBodies = Array.from(root.querySelectorAll<SVGElement>("[data-snail-body]"));
  const snailShells = Array.from(root.querySelectorAll<SVGElement>("[data-snail-shell]"));
  const snailAntennae = Array.from(root.querySelectorAll<SVGElement>("[data-snail-antennae]"));
  const danceTiles = Array.from(root.querySelectorAll<HTMLElement>(".dance-floor span"));

  if (!heroCopy || !snailStage || !mirrorBall || snails.length === 0 || snailShells.length === 0) {
    throw new Error("Missing animation targets.");
  }

  const timeline = gsap.timeline({
    paused: true,
    defaults: {
      duration: 0.75,
      ease: "power3.out",
    },
  });

  timeline
    .set([heroCopy, snailStage, mirrorBall], {
      opacity: 0,
    })
    .set(heroCopy, { y: 26 })
    .set(snailStage, { y: 18, scale: 0.96 })
    .set(mirrorBall, { y: -34, rotation: -24 })
    .set(beams, { opacity: 0, scaleY: 0.6 })
    .set(snails, { y: 18, rotation: -2, transformOrigin: "50% 90%" })
    .set(snailShells, { rotation: -18, transformOrigin: "50% 50%" })
    .set(snailAntennae, { rotation: -4, transformOrigin: "60% 100%" })
    .addLabel("open")
    .to(heroCopy, { opacity: 1, y: 0 }, "open")
    .to(snailStage, { opacity: 1, y: 0, scale: 1, duration: 1.1 }, "open+=0.12")
    .to(mirrorBall, { opacity: 1, y: 0, rotation: 0 }, "open+=0.18")
    .to(beams, { opacity: 0.64, scaleY: 1, stagger: 0.1 }, "open+=0.32")
    .to(snails, { y: 0, rotation: 0, stagger: 0.12 }, "open+=0.34")
    .to(snailShells, { rotation: 360, duration: 1.2, stagger: 0.12, ease: "back.out(1.7)" }, "open+=0.4")
    .to(danceTiles, { opacity: 1, y: 0, stagger: 0.04 }, "open+=0.44")
    .to(mirrorBall, { rotation: 360, duration: 6, repeat: -1, ease: "none" }, "open+=0.9")
    .to(beams, { opacity: 0.28, repeat: -1, yoyo: true, stagger: 0.14 }, "open+=0.9")
    .to(snails, { y: -13, rotation: 2.4, duration: 0.42, repeat: -1, yoyo: true, stagger: 0.18, ease: "sine.inOut" }, "open+=0.95")
    .to(snailBodies, { scaleY: 0.92, duration: 0.42, repeat: -1, yoyo: true, stagger: 0.18, transformOrigin: "50% 100%", ease: "sine.inOut" }, "open+=0.95")
    .to(snailShells, { rotation: "+=18", duration: 0.84, repeat: -1, yoyo: true, stagger: 0.18, ease: "sine.inOut" }, "open+=0.95")
    .to(snailAntennae, { rotation: 7, duration: 0.38, repeat: -1, yoyo: true, stagger: 0.12, ease: "sine.inOut" }, "open+=0.98")
    .to(danceTiles, { opacity: 0.44, duration: 0.5, repeat: -1, yoyo: true, stagger: 0.06 }, "open+=1");

  return {
    playIntro: () => timeline.play(0),
    destroy: () => timeline.kill(),
  };
}
