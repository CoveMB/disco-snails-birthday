export type FloorSnailDirection = -1 | 1;

export type DanceMoveKind = "spin" | "jump" | "flip" | "giggle" | "pause" | "pause-spin" | "pause-jump";

export type DanceEvent = {
  at: number;
  duration: number;
  jumpHeight?: number;
  kind: DanceMoveKind;
  rotation?: number;
  wiggleDistance?: number;
};

export type FloorSnailMovementStep = {
  duration: number;
  pixelsPerSecond: number;
  startAt: number;
  startX: number;
  targetX: number;
};

export type FloorSnailSegment = {
  danceEvents: DanceEvent[];
  duration: number;
  movementSteps: FloorSnailMovementStep[];
  movementDirection: FloorSnailDirection;
  nextDirection: FloorSnailDirection;
  pixelsPerSecond: number;
  targetX: number;
};

export type FloorSnailStart = {
  delay: number;
  direction: FloorSnailDirection;
  isInitiallyActive: boolean;
  x: number;
};

const outsideMarginRatio = 0.14;
const initiallyActiveSnailCount = 6;
const initialMinimumXRatio = 0.24;
const initialMaximumXRatio = 0.76;
const minimumEarlyTurnRatio = 0.24;
const maximumEarlyTurnRatio = 0.58;
const fullCrossChance = 0.62;
const delayedEntryBaseDelay = 2.8;
const delayedEntryStagger = 1.05;
const delayedEntryRandomness = 4.6;
const minimumPixelsPerSecond = 8;
const maximumPixelsPerSecond = 36;
const speedChangeChance = 0.62;
const minimumSpeedMultiplier = 0.78;
const maximumSpeedMultiplier = 1.22;
const minimumMovementStepDuration = 0.2;
const minimumSegmentDuration = 4.5;

function randomBetween(rng: () => number, minimum: number, maximum: number): number {
  return minimum + (maximum - minimum) * rng();
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

export function createFloorSnailMovementDirection(
  currentX: number,
  targetX: number,
  fallbackDirection: FloorSnailDirection,
): FloorSnailDirection {
  if (targetX > currentX) {
    return 1;
  }

  if (targetX < currentX) {
    return -1;
  }

  return fallbackDirection;
}

export function createFloorSnailStart(
  side: "left" | "right",
  floorWidth: number,
  index: number,
  rng: () => number = Math.random,
): FloorSnailStart {
  if (index < initiallyActiveSnailCount) {
    const x = randomBetween(rng, floorWidth * initialMinimumXRatio, floorWidth * initialMaximumXRatio);

    return {
      delay: 0,
      direction: rng() < 0.5 ? -1 : 1,
      isInitiallyActive: true,
      x,
    };
  }

  const direction = side === "left" ? 1 : -1;
  const outsideMargin = floorWidth * outsideMarginRatio;
  const outsideX = side === "left" ? -outsideMargin : floorWidth + outsideMargin;

  return {
    delay:
      delayedEntryBaseDelay +
      (index - initiallyActiveSnailCount) * delayedEntryStagger +
      randomBetween(rng, 0, delayedEntryRandomness),
    direction,
    isInitiallyActive: false,
    x: outsideX,
  };
}

function createDanceEvent(segmentDuration: number, rng: () => number = Math.random): DanceEvent {
  const kindRoll = rng();
  const at = randomBetween(rng, segmentDuration * 0.12, segmentDuration * 0.82);

  if (kindRoll < 0.18) {
    return {
      at,
      duration: randomBetween(rng, 0.16, 0.32),
      kind: "spin",
      rotation: rng() < 0.5 ? 360 : -360,
    };
  }

  if (kindRoll < 0.32) {
    return {
      at,
      duration: randomBetween(rng, 0.34, 0.58),
      jumpHeight: randomBetween(rng, 10, 24),
      kind: "jump",
    };
  }

  if (kindRoll < 0.46) {
    return {
      at,
      duration: randomBetween(rng, 0.38, 0.72),
      kind: "flip",
    };
  }

  if (kindRoll < 0.6) {
    return {
      at,
      duration: randomBetween(rng, 0.42, 0.9),
      kind: "giggle",
      wiggleDistance: randomBetween(rng, 4, 9),
    };
  }

  if (kindRoll < 0.76) {
    return {
      at,
      duration: randomBetween(rng, 1.2, 3.2),
      kind: "pause",
    };
  }

  if (kindRoll < 0.9) {
    return {
      at,
      duration: randomBetween(rng, 1.15, 2.8),
      kind: "pause-spin",
      rotation: rng() < 0.5 ? 360 : -360,
    };
  }

  return {
    at,
    duration: randomBetween(rng, 1.15, 2.8),
    jumpHeight: randomBetween(rng, 10, 24),
    kind: "pause-jump",
  };
}

export function createDanceEvents(segmentDuration: number, rng: () => number = Math.random): DanceEvent[] {
  const quietRoll = rng();

  if (quietRoll < 0.08) {
    return [];
  }

  const eventCountRoll = rng();
  const eventCount = eventCountRoll < 0.45 ? 1 : eventCountRoll < 0.82 ? 2 : 3;
  const events: DanceEvent[] = [];

  for (let eventIndex = 0; eventIndex < eventCount; eventIndex += 1) {
    events.push(createDanceEvent(segmentDuration, rng));
  }

  return events.sort((first, second) => first.at - second.at);
}

function createMovementStepCount(rng: () => number): number {
  if (rng() > speedChangeChance) {
    return 1;
  }

  return 2 + Math.floor(rng() * 3);
}

function createMovementSteps(
  currentX: number,
  targetX: number,
  basePixelsPerSecond: number,
  rng: () => number = Math.random,
): FloorSnailMovementStep[] {
  const distance = Math.abs(targetX - currentX);
  const direction = createFloorSnailMovementDirection(currentX, targetX, 1);
  const stepCount = distance <= 0 ? 1 : createMovementStepCount(rng);
  const stepDistance = stepCount <= 0 ? 0 : distance / stepCount;
  let startAt = 0;

  const movementSteps = Array.from({ length: stepCount }, (_, index) => {
    const startX = currentX + direction * stepDistance * index;
    const stepTargetX = index === stepCount - 1 ? targetX : currentX + direction * stepDistance * (index + 1);
    const speedMultiplier =
      stepCount === 1 ? 1 : randomBetween(rng, minimumSpeedMultiplier, maximumSpeedMultiplier);
    const pixelsPerSecond = Math.max(1, basePixelsPerSecond * speedMultiplier);
    const duration = Math.max(minimumMovementStepDuration, Math.abs(stepTargetX - startX) / pixelsPerSecond);
    const step: FloorSnailMovementStep = {
      duration,
      pixelsPerSecond,
      startAt,
      startX,
      targetX: stepTargetX,
    };

    startAt += duration;

    return step;
  });

  const finalMovementStep = movementSteps.at(-1);
  const totalDuration = (finalMovementStep?.startAt ?? 0) + (finalMovementStep?.duration ?? 0);

  if (totalDuration >= minimumSegmentDuration) {
    return movementSteps;
  }

  const durationScale = totalDuration <= 0 ? 1 : minimumSegmentDuration / totalDuration;
  let scaledStartAt = 0;

  return movementSteps.map((movementStep) => {
    const duration = movementStep.duration * durationScale;
    const distance = Math.abs(movementStep.targetX - movementStep.startX);
    const scaledMovementStep = {
      ...movementStep,
      duration,
      pixelsPerSecond: duration <= 0 ? movementStep.pixelsPerSecond : distance / duration,
      startAt: scaledStartAt,
    };

    scaledStartAt += duration;

    return scaledMovementStep;
  });
}

export function createFloorSnailSegment(
  currentX: number,
  direction: FloorSnailDirection,
  floorWidth: number,
  rng: () => number = Math.random,
): FloorSnailSegment {
  const crossesFloor = rng() < fullCrossChance;
  const outsideMargin = floorWidth * outsideMarginRatio;
  const farTarget = direction === 1 ? floorWidth + outsideMargin : -outsideMargin;
  const earlyDistance = randomBetween(rng, floorWidth * minimumEarlyTurnRatio, floorWidth * maximumEarlyTurnRatio);
  const earlyTarget = currentX + direction * earlyDistance;
  const targetX = crossesFloor ? farTarget : clamp(earlyTarget, -floorWidth * 0.04, floorWidth * 1.04);
  const pixelsPerSecond = randomBetween(rng, minimumPixelsPerSecond, maximumPixelsPerSecond);
  const movementSteps = createMovementSteps(currentX, targetX, pixelsPerSecond, rng);
  const finalMovementStep = movementSteps.at(-1);
  const duration = (finalMovementStep?.startAt ?? 0) + (finalMovementStep?.duration ?? 0);

  return {
    danceEvents: createDanceEvents(duration, rng),
    duration,
    movementSteps,
    movementDirection: createFloorSnailMovementDirection(currentX, targetX, direction),
    nextDirection: direction === 1 ? -1 : 1,
    pixelsPerSecond,
    targetX,
  };
}
