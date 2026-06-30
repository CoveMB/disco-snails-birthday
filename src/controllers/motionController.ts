import { gsap } from "gsap";
import {
  createFloorSnailSegment,
  createFloorSnailStart,
  type DanceEvent,
  type FloorSnailDirection,
} from "./floorSnailMotion";

export type MotionController = {
  playIntro: () => void;
  destroy: () => void;
};

function readPercentProperty(element: HTMLElement, propertyName: string): number {
  return Number.parseFloat(element.style.getPropertyValue(propertyName)) || 0;
}

function readScaleProperty(element: HTMLElement): number {
  return Number.parseFloat(element.style.getPropertyValue("--floor-rest-scale")) || 0.8;
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
  const mirrorBall = root.querySelector<HTMLElement>("[data-mirror-ball]");
  const floorSnailParty = root.querySelector<HTMLElement>("[data-floor-snail-party]");
  const beams = Array.from(root.querySelectorAll<HTMLElement>(".beam"));
  const floorSnails = Array.from(root.querySelectorAll<HTMLElement>("[data-floor-snail]"));
  const floorSnailFacing = Array.from(root.querySelectorAll<HTMLElement>("[data-floor-snail-facing]"));
  const floorSnailSpin = Array.from(root.querySelectorAll<HTMLElement>("[data-floor-snail-spin]"));
  const floorSnailSvgs = Array.from(root.querySelectorAll<SVGElement>("[data-floor-dancing-snail]"));
  const floorSnailBodies = Array.from(root.querySelectorAll<SVGElement>("[data-floor-snail-body]"));
  const floorSnailShells = Array.from(root.querySelectorAll<SVGElement>("[data-floor-snail-shell]"));
  const floorSnailAntennae = Array.from(root.querySelectorAll<SVGElement>("[data-floor-snail-antennae]"));
  const danceTiles = Array.from(root.querySelectorAll<HTMLElement>(".dance-floor span"));

  if (
    !heroCopy ||
    !mirrorBall ||
    !floorSnailParty ||
    floorSnails.length === 0 ||
    floorSnailSvgs.length !== floorSnails.length ||
    floorSnailFacing.length !== floorSnails.length ||
    floorSnailSpin.length !== floorSnails.length ||
    floorSnailShells.length === 0
  ) {
    throw new Error("Missing animation targets.");
  }

  const floorSnailPartyElement = floorSnailParty;
  const floorTraffic = new Set<gsap.core.Timeline>();
  let floorTrafficStarted = false;

  function stopFloorTraffic(): void {
    floorTraffic.forEach((trafficTimeline) => trafficTimeline.kill());
    floorTraffic.clear();
    floorTrafficStarted = false;
  }

  function isPauseDanceEvent(event: DanceEvent): boolean {
    return event.kind === "pause" || event.kind === "pause-spin" || event.kind === "pause-jump";
  }

  function getSegmentXAtTime(startX: number, targetX: number, time: number, duration: number): number {
    const progress = duration <= 0 ? 1 : Math.min(1, Math.max(0, time / duration));

    return startX + (targetX - startX) * progress;
  }

  function addMovementChunk(
    trafficTimeline: gsap.core.Timeline,
    floorSnail: HTMLElement,
    startAt: number,
    duration: number,
    targetX: number,
    direction: FloorSnailDirection,
    laneY: number,
    restScale: number,
  ): void {
    if (duration <= 0) {
      return;
    }

    trafficTimeline.to(
      floorSnail,
      {
        duration,
        ease: "none",
        rotation: direction === 1 ? 2 : -2,
        scale: restScale,
        x: targetX,
        y: laneY,
      },
      startAt,
    );
  }

  function addDanceEvent(
    trafficTimeline: gsap.core.Timeline,
    facingElement: HTMLElement,
    spinElement: HTMLElement,
    snailSvg: SVGElement,
    event: DanceEvent,
    startAt: number,
    direction: FloorSnailDirection,
  ): void {
    if (event.kind === "spin" || event.kind === "pause-spin") {
      const spinDuration = event.kind === "spin" ? event.duration : Math.min(event.duration, 0.32);
      const spinStart = event.kind === "spin" ? startAt : startAt + Math.max(0, (event.duration - spinDuration) / 2);

      trafficTimeline.to(
        spinElement,
        {
          duration: spinDuration,
          ease: "power2.inOut",
          rotation: `+=${event.rotation ?? 360}`,
        },
        spinStart,
      );
    }

    if (event.kind === "flip") {
      const halfDuration = event.duration / 2;

      trafficTimeline
        .to(facingElement, { duration: halfDuration, ease: "power2.inOut", scaleX: -direction }, startAt)
        .to(facingElement, { duration: halfDuration, ease: "power2.inOut", scaleX: direction }, startAt + halfDuration);
    }

    if (event.kind === "giggle") {
      const wiggleDistance = event.wiggleDistance ?? 6;
      const quarterDuration = event.duration / 4;

      trafficTimeline
        .to(
          spinElement,
          { duration: quarterDuration, ease: "sine.inOut", rotation: 7, x: wiggleDistance },
          startAt,
        )
        .to(
          spinElement,
          { duration: event.duration / 2, ease: "sine.inOut", rotation: -7, x: -wiggleDistance },
          startAt + quarterDuration,
        )
        .to(
          spinElement,
          { duration: quarterDuration, ease: "sine.inOut", rotation: 0, x: 0 },
          startAt + quarterDuration * 3,
        );
    }

    if (event.kind === "jump" || event.kind === "pause-jump") {
      const jumpDuration = event.kind === "jump" ? event.duration : Math.min(event.duration, 0.58);
      const jumpStart = event.kind === "jump" ? startAt : startAt + Math.max(0, (event.duration - jumpDuration) / 2);
      const jumpHeight = event.jumpHeight ?? 16;

      trafficTimeline
        .to(snailSvg, { duration: jumpDuration / 2, ease: "power2.out", y: -jumpHeight }, jumpStart)
        .to(snailSvg, { duration: jumpDuration / 2, ease: "bounce.out", y: 0 }, jumpStart + jumpDuration / 2);
    }
  }

  function scheduleFloorSnailSegment(
    floorSnail: HTMLElement,
    facingElement: HTMLElement,
    spinElement: HTMLElement,
    snailSvg: SVGElement,
    currentX: number,
    direction: FloorSnailDirection,
    floorWidth: number,
    laneY: number,
    restScale: number,
    delay = 0,
  ): void {
    const segment = createFloorSnailSegment(currentX, direction, floorWidth);
    const trafficTimeline = gsap.timeline({
      delay,
      onComplete: () => {
        floorTraffic.delete(trafficTimeline);
        scheduleFloorSnailSegment(
          floorSnail,
          facingElement,
          spinElement,
          snailSvg,
          segment.targetX,
          segment.nextDirection,
          floorWidth,
          laneY,
          restScale,
        );
      },
    });

    floorTraffic.add(trafficTimeline);

    trafficTimeline.set(facingElement, { scaleX: segment.movementDirection }, 0);

    let movementCursor = 0;
    let timelineCursor = 0;

    segment.danceEvents.forEach((event) => {
      const eventMovementTime = Math.max(movementCursor, Math.min(event.at, segment.duration));
      const eventX = getSegmentXAtTime(currentX, segment.targetX, eventMovementTime, segment.duration);

      addMovementChunk(
        trafficTimeline,
        floorSnail,
        timelineCursor,
        eventMovementTime - movementCursor,
        eventX,
        segment.movementDirection,
        laneY,
        restScale,
      );

      timelineCursor += eventMovementTime - movementCursor;
      movementCursor = eventMovementTime;

      addDanceEvent(trafficTimeline, facingElement, spinElement, snailSvg, event, timelineCursor, segment.movementDirection);

      if (isPauseDanceEvent(event)) {
        timelineCursor += event.duration;
      }
    });

    addMovementChunk(
      trafficTimeline,
      floorSnail,
      timelineCursor,
      segment.duration - movementCursor,
      segment.targetX,
      segment.movementDirection,
      laneY,
      restScale,
    );
  }

  function startFloorTraffic(): void {
    if (floorTrafficStarted) {
      return;
    }

    floorTrafficStarted = true;

    const floorBounds = floorSnailPartyElement.getBoundingClientRect();
    const floorWidth = floorBounds.width || 760;
    const floorHeight = floorBounds.height || 220;

    floorSnails.forEach((floorSnail, index) => {
      const facingElement = floorSnailFacing[index];
      const spinElement = floorSnailSpin[index];
      const snailSvg = floorSnailSvgs[index];
      const side = floorSnail.dataset.floorSnailSide === "right" ? "right" : "left";
      const laneY = (readPercentProperty(floorSnail, "--floor-lane-y") * floorHeight) / 100;
      const restScale = readScaleProperty(floorSnail);
      const start = createFloorSnailStart(side, floorWidth, index);

      gsap.set(floorSnail, {
        opacity: start.isInitiallyActive ? 0.96 : 0,
        rotation: start.direction === 1 ? 2 : -2,
        scale: restScale,
        x: start.x,
        xPercent: -50,
        y: laneY,
        yPercent: -50,
      });
      gsap.set(facingElement, { scaleX: start.direction, transformOrigin: "50% 86%" });
      gsap.set(spinElement, { rotation: 0, transformOrigin: "50% 86%", x: 0 });
      gsap.set(snailSvg, { x: 0, y: 0 });

      if (!start.isInitiallyActive) {
        gsap.to(floorSnail, { delay: start.delay, duration: 0.45, opacity: 0.96, ease: "power1.out" });
      }

      scheduleFloorSnailSegment(
        floorSnail,
        facingElement,
        spinElement,
        snailSvg,
        start.x,
        start.direction,
        floorWidth,
        laneY,
        restScale,
        start.delay,
      );
    });
  }

  const timeline = gsap.timeline({
    paused: true,
    defaults: {
      duration: 0.75,
      ease: "power3.out",
    },
  });

  timeline
    .set([heroCopy, mirrorBall, floorSnailParty], {
      opacity: 0,
    })
    .set(heroCopy, { y: 26 })
    .set(mirrorBall, { y: -34, rotation: -24 })
    .set(beams, { opacity: 0, scaleY: 0.6 })
    .set(floorSnails, { opacity: 0, scale: 0.35, x: 0, xPercent: -50, y: 0, yPercent: -50 })
    .set(floorSnailSpin, { rotation: 0, transformOrigin: "50% 86%", x: 0 })
    .set(floorSnailSvgs, { rotation: 0, x: 0, y: 0, transformOrigin: "50% 88%" })
    .set(floorSnailShells, { rotation: -18, transformOrigin: "50% 50%" })
    .set(floorSnailAntennae, { rotation: -8, transformOrigin: "62% 100%" })
    .addLabel("open")
    .to(heroCopy, { opacity: 1, y: 0 }, "open")
    .to(mirrorBall, { opacity: 1, y: 0, rotation: 0 }, "open+=0.18")
    .to(beams, { opacity: 0.64, scaleY: 1, stagger: 0.1 }, "open+=0.32")
    .to(danceTiles, { opacity: 1, y: 0, stagger: 0.04 }, "open+=0.44")
    .to(floorSnailParty, { opacity: 1, duration: 0.3 }, "open+=0.62")
    .to(mirrorBall, { rotation: 360, duration: 6, repeat: -1, ease: "none" }, "open+=0.9")
    .to(beams, { opacity: 0.28, repeat: -1, yoyo: true, stagger: 0.14 }, "open+=0.9")
    .call(startFloorTraffic, [], "open+=0.9")
    .to(floorSnailSvgs, { x: 5, rotation: 5, duration: 1.45, repeat: -1, yoyo: true, stagger: 0.16, ease: "sine.inOut" }, "open+=1")
    .to(floorSnailBodies, { x: 3, scaleX: 0.97, duration: 1.25, repeat: -1, yoyo: true, stagger: 0.12, transformOrigin: "50% 100%", ease: "sine.inOut" }, "open+=1")
    .to(floorSnailShells, { rotation: "+=34", duration: 1.9, repeat: -1, yoyo: true, stagger: 0.11, ease: "sine.inOut" }, "open+=1.04")
    .to(floorSnailAntennae, { rotation: 8, duration: 0.95, repeat: -1, yoyo: true, stagger: 0.08, ease: "sine.inOut" }, "open+=1.08")
    .to(danceTiles, { opacity: 0.44, duration: 0.5, repeat: -1, yoyo: true, stagger: 0.06 }, "open+=1");

  return {
    playIntro: () => {
      stopFloorTraffic();
      timeline.play(0);
    },
    destroy: () => {
      stopFloorTraffic();
      timeline.kill();
    },
  };
}
