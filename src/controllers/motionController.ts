import { gsap } from "gsap";

export type MotionController = {
  playIntro: () => void;
  destroy: () => void;
};

type MiniSnailAnimationPlan = {
  entryDelay: number;
  pileRotation: number;
  pileScale: number;
  pileX: number;
  pileY: number;
  restRotation: number;
  restScale: number;
  restX: number;
  restY: number;
  startRotation: number;
  startX: number;
  startY: number;
};

const entranceOrigins = [
  { x: -78, y: 12, rotation: -46 },
  { x: 76, y: -18, rotation: 42 },
  { x: -44, y: -62, rotation: 30 },
  { x: 54, y: -58, rotation: -34 },
  { x: -90, y: 58, rotation: 52 },
  { x: 88, y: 62, rotation: -48 },
];

const pileSlots = [
  { x: -9, y: 30, rotation: -18, scale: 0.92 },
  { x: -4, y: 31, rotation: 16, scale: 0.96 },
  { x: 1, y: 30, rotation: -10, scale: 0.94 },
  { x: 6, y: 32, rotation: 22, scale: 0.9 },
  { x: -12, y: 38, rotation: 12, scale: 0.84 },
  { x: -6, y: 39, rotation: -26, scale: 0.9 },
  { x: 0, y: 39, rotation: 28, scale: 0.88 },
  { x: 7, y: 40, rotation: -20, scale: 0.84 },
  { x: -9, y: 46, rotation: 26, scale: 0.8 },
  { x: -3, y: 47, rotation: -14, scale: 0.86 },
  { x: 3, y: 46, rotation: 18, scale: 0.82 },
  { x: 10, y: 46, rotation: -24, scale: 0.78 },
];

function readPercentProperty(element: HTMLElement, propertyName: string): number {
  return Number.parseFloat(element.style.getPropertyValue(propertyName)) || 0;
}

function readScaleProperty(element: HTMLElement): number {
  return Number.parseFloat(element.style.getPropertyValue("--mini-rest-scale")) || 0.7;
}

function getMiniSnailEntryDelay(element: HTMLElement, index: number): number {
  if (element.dataset.miniSnailWave === "opening") {
    return 0.78 + index * 0.12;
  }

  if (element.dataset.miniSnailWave === "rush") {
    return 1.55 + (index - 6) * 0.08;
  }

  return 2.7 + (index - 18) * 0.06;
}

function createMiniSnailAnimationPlan(
  element: HTMLElement,
  index: number,
  partyBounds: DOMRect,
): MiniSnailAnimationPlan {
  const widthUnit = (partyBounds.width || 560) / 100;
  const heightUnit = (partyBounds.height || 360) / 100;
  const origin = entranceOrigins[index % entranceOrigins.length];
  const pileSlot = pileSlots[index % pileSlots.length];
  const restScale = readScaleProperty(element);

  return {
    entryDelay: getMiniSnailEntryDelay(element, index),
    pileRotation: pileSlot.rotation + (index > 17 ? 12 : 0),
    pileScale: pileSlot.scale * (index > 17 ? 1.04 : 0.9),
    pileX: pileSlot.x * widthUnit,
    pileY: pileSlot.y * heightUnit,
    restRotation: readPercentProperty(element, "--mini-rest-rotation"),
    restScale,
    restX: readPercentProperty(element, "--mini-rest-x") * widthUnit,
    restY: readPercentProperty(element, "--mini-rest-y") * heightUnit,
    startRotation: origin.rotation,
    startX: origin.x * widthUnit,
    startY: origin.y * heightUnit,
  };
}

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
  const miniSnailParty = root.querySelector<HTMLElement>("[data-mini-snail-party]");
  const beams = Array.from(root.querySelectorAll<HTMLElement>(".beam"));
  const snails = Array.from(root.querySelectorAll<SVGElement>("[data-dancing-snail]"));
  const snailBodies = Array.from(root.querySelectorAll<SVGElement>("[data-snail-body]"));
  const snailShells = Array.from(root.querySelectorAll<SVGElement>("[data-snail-shell]"));
  const snailAntennae = Array.from(root.querySelectorAll<SVGElement>("[data-snail-antennae]"));
  const miniSnails = Array.from(root.querySelectorAll<HTMLElement>("[data-mini-snail]"));
  const miniSnailSvgs = Array.from(root.querySelectorAll<SVGElement>("[data-mini-dancing-snail]"));
  const miniSnailBodies = Array.from(root.querySelectorAll<SVGElement>("[data-mini-snail-body]"));
  const miniSnailShells = Array.from(root.querySelectorAll<SVGElement>("[data-mini-snail-shell]"));
  const miniSnailAntennae = Array.from(root.querySelectorAll<SVGElement>("[data-mini-snail-antennae]"));
  const danceTiles = Array.from(root.querySelectorAll<HTMLElement>(".dance-floor span"));

  if (
    !heroCopy ||
    !snailStage ||
    !mirrorBall ||
    !miniSnailParty ||
    snails.length === 0 ||
    snailShells.length === 0 ||
    miniSnails.length === 0 ||
    miniSnailShells.length === 0
  ) {
    throw new Error("Missing animation targets.");
  }

  const miniSnailPartyBounds = miniSnailParty.getBoundingClientRect();
  const miniSnailPlans = miniSnails.map((element, index) =>
    createMiniSnailAnimationPlan(element, index, miniSnailPartyBounds),
  );

  const timeline = gsap.timeline({
    paused: true,
    defaults: {
      duration: 0.75,
      ease: "power3.out",
    },
  });

  timeline
    .set([heroCopy, snailStage, mirrorBall, miniSnailParty], {
      opacity: 0,
    })
    .set(heroCopy, { y: 26 })
    .set(snailStage, { y: 18, scale: 0.96 })
    .set(mirrorBall, { y: -34, rotation: -24 })
    .set(beams, { opacity: 0, scaleY: 0.6 })
    .set(snails, { y: 18, rotation: -2, transformOrigin: "50% 90%" })
    .set(snailShells, { rotation: -18, transformOrigin: "50% 50%" })
    .set(snailAntennae, { rotation: -4, transformOrigin: "60% 100%" })
    .set(miniSnails, { opacity: 0, scale: 0.3, x: 0, xPercent: -50, y: 0, yPercent: -50 })
    .set(miniSnailSvgs, { rotation: 0, transformOrigin: "50% 88%" })
    .set(miniSnailShells, { rotation: -30, transformOrigin: "50% 50%" })
    .set(miniSnailAntennae, { rotation: -10, transformOrigin: "62% 100%" })
    .addLabel("open")
    .to(heroCopy, { opacity: 1, y: 0 }, "open")
    .to(snailStage, { opacity: 1, y: 0, scale: 1, duration: 1.1 }, "open+=0.12")
    .to(mirrorBall, { opacity: 1, y: 0, rotation: 0 }, "open+=0.18")
    .to(beams, { opacity: 0.64, scaleY: 1, stagger: 0.1 }, "open+=0.32")
    .to(snails, { y: 0, rotation: 0, stagger: 0.12 }, "open+=0.34")
    .to(snailShells, { rotation: 360, duration: 1.2, stagger: 0.12, ease: "back.out(1.7)" }, "open+=0.4")
    .to(danceTiles, { opacity: 1, y: 0, stagger: 0.04 }, "open+=0.44")
    .to(miniSnailParty, { opacity: 1, duration: 0.22 }, "open+=0.62")
    .to(mirrorBall, { rotation: 360, duration: 6, repeat: -1, ease: "none" }, "open+=0.9")
    .to(beams, { opacity: 0.28, repeat: -1, yoyo: true, stagger: 0.14 }, "open+=0.9")
    .to(snails, { y: -13, rotation: 2.4, duration: 0.42, repeat: -1, yoyo: true, stagger: 0.18, ease: "sine.inOut" }, "open+=0.95")
    .to(snailBodies, { scaleY: 0.92, duration: 0.42, repeat: -1, yoyo: true, stagger: 0.18, transformOrigin: "50% 100%", ease: "sine.inOut" }, "open+=0.95")
    .to(snailShells, { rotation: "+=18", duration: 0.84, repeat: -1, yoyo: true, stagger: 0.18, ease: "sine.inOut" }, "open+=0.95")
    .to(snailAntennae, { rotation: 7, duration: 0.38, repeat: -1, yoyo: true, stagger: 0.12, ease: "sine.inOut" }, "open+=0.98")
    .to(miniSnailSvgs, { y: -8, rotation: 7, duration: 0.32, repeat: -1, yoyo: true, stagger: 0.045, ease: "sine.inOut" }, "open+=1")
    .to(miniSnailBodies, { scaleY: 0.9, duration: 0.34, repeat: -1, yoyo: true, stagger: 0.04, transformOrigin: "50% 100%", ease: "sine.inOut" }, "open+=1")
    .to(miniSnailShells, { rotation: "+=720", duration: 1.35, repeat: -1, stagger: 0.035, ease: "none" }, "open+=1.02")
    .to(miniSnailAntennae, { rotation: 10, duration: 0.28, repeat: -1, yoyo: true, stagger: 0.035, ease: "sine.inOut" }, "open+=1.04")
    .to(danceTiles, { opacity: 0.44, duration: 0.5, repeat: -1, yoyo: true, stagger: 0.06 }, "open+=1");

  miniSnails.forEach((miniSnail, index) => {
    const plan = miniSnailPlans[index];

    timeline
      .fromTo(
        miniSnail,
        {
          opacity: 0,
          rotation: plan.startRotation,
          scale: 0.2,
          x: plan.startX,
          y: plan.startY,
        },
        {
          duration: 0.86,
          ease: "back.out(1.6)",
          opacity: 0.95,
          rotation: plan.restRotation,
          scale: plan.restScale,
          x: plan.restX,
          y: plan.restY,
        },
        `open+=${plan.entryDelay}`,
      )
      .to(
        miniSnail,
        {
          duration: 1.75,
          ease: "elastic.out(1, 0.74)",
          opacity: 0.98,
          rotation: plan.pileRotation,
          scale: plan.pileScale,
          x: plan.pileX,
          y: plan.pileY,
        },
        `open+=${4.35 + index * 0.025}`,
      );
  });

  return {
    playIntro: () => timeline.play(0),
    destroy: () => timeline.kill(),
  };
}
