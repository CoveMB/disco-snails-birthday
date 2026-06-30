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

export type FloorSnailSegment = {
  danceEvents: DanceEvent[];
  duration: number;
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
  const distance = Math.abs(targetX - currentX);
  const pixelsPerSecond = randomBetween(rng, minimumPixelsPerSecond, maximumPixelsPerSecond);
  const duration = Math.max(4.5, distance / pixelsPerSecond);

  return {
    danceEvents: createDanceEvents(duration, rng),
    duration,
    movementDirection: createFloorSnailMovementDirection(currentX, targetX, direction),
    nextDirection: direction === 1 ? -1 : 1,
    pixelsPerSecond,
    targetX,
  };
}
