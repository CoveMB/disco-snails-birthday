# Random Floor Snail Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current one-way floor-snail convergence with larger snails that wander across the existing dance floor indefinitely, with different random movement on every page load.

**Architecture:** Keep the current Vite, TypeScript, SVG, CSS, and GSAP setup. Render a stable set of floor-snail SVGs from `src/ui/cardView.ts`, then create load-time random GSAP movement plans in controller code. Separate facing direction, fast spins, and jump/pause dance moves with nested DOM wrappers so flips, spins, and hops do not fight over the same transform.

**Tech Stack:** Vite, TypeScript, GSAP, Vitest, Playwright-compatible browser checks, CSS custom properties.

---

## Context And Constraints

- Current workspace: `/Users/CoveMB/Code/CoveMB/birthday-card`.
- Current branch: `main`.
- Current worktree is already dirty from the previous floor-snail animation work and rebuilt `dist` assets. Do not run `git reset`, do not remove those changes, and do not commit unless the user explicitly asks.
- The user wants randomness to be different on every page load.
- Preserve the birthday card controls, audio behavior, confetti behavior, disco ball, light beams, dance floor, and reduced-motion support.
- Preserve the existing local SVG snail drawing. Do not add image assets.
- The current two big snails should stay removed.
- The snails should be a little bigger than the current small floor snails.
- The snails should not end up gathered in the middle. Some should cross the whole floor, turn at the far side, and keep going. Some should reverse before reaching the far side.
- Fast random spins should happen intermittently while snails are moving or briefly paused.
- Some snails should occasionally jump, pause, pause-then-spin, or pause-then-jump before moving again.
- Pause moves should affect individual snails only. The floor should never look like every snail stopped at the same time.
- Browser checks should include desktop and mobile because the floor layer sits close to the fixed music credit.

## File Map

- Modify `src/ui/cardView.ts`: floor-snail data and nested wrappers for facing and spin.
- Modify `src/ui/cardView.test.ts`: render-contract tests for 30 floor snails, side split, wrappers, and removal of old big/mini snail markup.
- Create `src/controllers/floorSnailMotion.ts`: pure random movement helpers with injectable RNG for unit tests.
- Create `src/controllers/floorSnailMotion.test.ts`: unit tests for movement targets, early reversals, full crossings, dance-event bounds, and randomness variability.
- Modify `src/controllers/motionController.ts`: replace final-center movement with indefinite random floor traffic.
- Modify `src/styles.css`: make floor snails larger, update wrapper styles, and preserve reduced-motion layout.
- Rebuild `dist/` only after source tests pass.

## Acceptance Criteria

- On every page load, the floor-snail traffic differs because production uses `Math.random`.
- There are still 30 rendered floor snails.
- Exactly 15 start from the left and 15 start from the right.
- At least some snails can cross the full floor before turning around.
- At least some snails can reverse before crossing the full floor.
- Snails continue moving indefinitely after the intro.
- Snails are visibly larger than the current implementation.
- Fast spin bursts are intermittent, quick, and affect the whole snail drawing rather than only the shell.
- Some snails occasionally jump while staying in the floor band.
- Some snails pause briefly, then resume moving.
- Some snails pause, perform a fast spin or jump, then resume moving.
- Jump and pause events are randomized per snail and per segment, so the crowd feels chaotic without synchronized stops.
- The group does not permanently cluster in the middle.
- Reduced-motion users see static snails distributed on the floor.

## Task 0: Preflight

**Files:**
- No file changes.

- [ ] **Step 1: Verify branch and dirty state**

Run:

```bash
git fetch --all --prune
git status -sb
git branch --show-current
```

Expected:

```text
main
```

`git status -sb` should show the current dirty source files and `dist` assets from the previous animation work. Work with those files. Do not reset them.

- [ ] **Step 2: Inspect current animation files**

Run:

```bash
sed -n '1,260p' src/ui/cardView.ts
sed -n '1,320p' src/controllers/motionController.ts
sed -n '1,620p' src/styles.css
sed -n '1,180p' src/ui/cardView.test.ts
```

Expected: current code already has `data-floor-snail-party`, `data-floor-snail`, and no `snail-lead` or `snail-hype` render output.

## Task 1: Lock The Render Contract

**Files:**
- Modify `src/ui/cardView.test.ts`

- [ ] **Step 1: Update the floor-snail render tests first**

Replace the two floor-snail tests in `src/ui/cardView.test.ts` with tests that require the new wrapper structure and reject old markup:

```ts
  it("renders floor-level code-native snails instead of the static hero image or oversized snails", () => {
    const html = renderBirthdayCard(createCardViewModel(birthdayCardData, createInitialAudioState()));

    expect(html).toContain('data-snail-stage');
    expect(html).toContain('data-floor-snail-party');
    expect(html).toContain('data-floor-dancing-snail');
    expect(html).toContain('data-floor-snail-shell');
    expect(html).toContain('data-floor-snail-facing');
    expect(html).toContain('data-floor-snail-spin');
    expect(html).not.toContain('class="snail-stage"');
    expect(html).not.toContain('snail-lead');
    expect(html).not.toContain('snail-hype');
    expect(html).not.toContain('data-mini-snail');
    expect(html).not.toContain('data-hero-art');
    expect(html).not.toContain("<img");
  });

  it("renders a decorative floor-snail crowd that can start from both sides", () => {
    const html = renderBirthdayCard(createCardViewModel(birthdayCardData, createInitialAudioState()));

    expect(html.match(/data-floor-snail="/g)).toHaveLength(30);
    expect(html.match(/data-floor-snail-side="left"/g)).toHaveLength(15);
    expect(html.match(/data-floor-snail-side="right"/g)).toHaveLength(15);
    expect(html.match(/data-floor-snail-wave="opening"/g)).toHaveLength(6);
    expect(html.match(/data-floor-snail-wave="late"/g)).toHaveLength(14);
    expect(html.match(/data-floor-snail-facing/g)).toHaveLength(30);
    expect(html.match(/data-floor-snail-spin/g)).toHaveLength(30);
  });
```

- [ ] **Step 2: Run the focused test and confirm it fails**

Run:

```bash
npm test -- src/ui/cardView.test.ts
```

Expected: fails because `data-floor-snail-facing` and `data-floor-snail-spin` do not exist yet.

## Task 2: Add Facing And Spin Wrappers

**Files:**
- Modify `src/ui/cardView.ts`
- Test `src/ui/cardView.test.ts`

- [ ] **Step 1: Simplify floor-snail metadata**

In `src/ui/cardView.ts`, replace the current `FloorSnail` type with this shape:

```ts
type FloorSnailSide = "left" | "right";
type FloorSnailWave = "opening" | "middle" | "late";

type FloorSnail = {
  hue: number;
  id: number;
  laneY: number;
  restScale: number;
  side: FloorSnailSide;
  wave: FloorSnailWave;
};
```

Use this exact 30-snail list. It removes fixed center targets while keeping lane, size, hue, side, and wave data:

```ts
const floorSnails: FloorSnail[] = [
  { id: 1, side: "left", wave: "opening", laneY: 38, restScale: 0.76, hue: 0 },
  { id: 2, side: "right", wave: "opening", laneY: 48, restScale: 0.78, hue: 70 },
  { id: 3, side: "left", wave: "opening", laneY: 60, restScale: 0.88, hue: 135 },
  { id: 4, side: "right", wave: "opening", laneY: 70, restScale: 0.96, hue: 205 },
  { id: 5, side: "left", wave: "opening", laneY: 82, restScale: 1.06, hue: 285 },
  { id: 6, side: "right", wave: "opening", laneY: 30, restScale: 0.7, hue: 330 },
  { id: 7, side: "left", wave: "middle", laneY: 44, restScale: 0.72, hue: 35 },
  { id: 8, side: "right", wave: "middle", laneY: 54, restScale: 0.82, hue: 100 },
  { id: 9, side: "left", wave: "middle", laneY: 68, restScale: 0.92, hue: 160 },
  { id: 10, side: "right", wave: "middle", laneY: 78, restScale: 1.02, hue: 230 },
  { id: 11, side: "left", wave: "middle", laneY: 24, restScale: 0.64, hue: 300 },
  { id: 12, side: "right", wave: "middle", laneY: 36, restScale: 0.74, hue: 15 },
  { id: 13, side: "left", wave: "middle", laneY: 52, restScale: 0.84, hue: 80 },
  { id: 14, side: "right", wave: "middle", laneY: 62, restScale: 0.9, hue: 145 },
  { id: 15, side: "left", wave: "middle", laneY: 74, restScale: 0.98, hue: 215 },
  { id: 16, side: "right", wave: "middle", laneY: 86, restScale: 1.08, hue: 275 },
  { id: 17, side: "left", wave: "late", laneY: 34, restScale: 0.68, hue: 340 },
  { id: 18, side: "right", wave: "late", laneY: 42, restScale: 0.76, hue: 55 },
  { id: 19, side: "left", wave: "late", laneY: 50, restScale: 0.8, hue: 120 },
  { id: 20, side: "right", wave: "late", laneY: 58, restScale: 0.86, hue: 185 },
  { id: 21, side: "left", wave: "late", laneY: 66, restScale: 0.94, hue: 255 },
  { id: 22, side: "right", wave: "late", laneY: 72, restScale: 1, hue: 315 },
  { id: 23, side: "left", wave: "late", laneY: 80, restScale: 1.06, hue: 25 },
  { id: 24, side: "right", wave: "late", laneY: 88, restScale: 1.1, hue: 95 },
  { id: 25, side: "left", wave: "late", laneY: 28, restScale: 0.66, hue: 155 },
  { id: 26, side: "right", wave: "late", laneY: 32, restScale: 0.7, hue: 225 },
  { id: 27, side: "left", wave: "late", laneY: 56, restScale: 0.84, hue: 290 },
  { id: 28, side: "right", wave: "late", laneY: 64, restScale: 0.92, hue: 350 },
  { id: 29, side: "left", wave: "late", laneY: 76, restScale: 1, hue: 60 },
  { id: 30, side: "right", wave: "late", laneY: 84, restScale: 1.06, hue: 170 },
];
```

- [ ] **Step 2: Update `renderFloorSnail`**

Replace the current `style` string and wrapper markup in `renderFloorSnail` with this structure:

```ts
      style="--floor-lane-y: ${snail.laneY}%; --floor-rest-scale: ${snail.restScale}; --floor-hue: ${snail.hue}deg;"
    >
      <span class="floor-snail-facing" data-floor-snail-facing>
        <span class="floor-snail-spin" data-floor-snail-spin>
          ${renderDancingSnail(`floor-dancing-snail floor-dancing-snail-${snailNumber}`, "floor-shell", {
            antennaeDataAttribute: "data-floor-snail-antennae",
            ariaLabel: "A tiny disco snail dancing",
            bodyDataAttribute: "data-floor-snail-body",
            gradientId: `floor-snail-${snailNumber}`,
            shellDataAttribute: "data-floor-snail-shell",
            snailDataAttribute: "data-floor-dancing-snail",
          })}
        </span>
      </span>
```

Keep the outer `span` attributes:

```ts
      class="floor-snail"
      data-floor-snail="${snailNumber}"
      data-floor-snail-side="${snail.side}"
      data-floor-snail-wave="${snail.wave}"
```

- [ ] **Step 3: Run the focused test**

Run:

```bash
npm test -- src/ui/cardView.test.ts
```

Expected: passes.

## Task 3: Add Testable Random Motion Helpers

**Files:**
- Create `src/controllers/floorSnailMotion.ts`
- Create `src/controllers/floorSnailMotion.test.ts`

- [ ] **Step 1: Create `src/controllers/floorSnailMotion.ts`**

Create this helper module:

```ts
export type FloorSnailDirection = -1 | 1;

export type DanceMoveKind = "spin" | "jump" | "pause" | "pause-spin" | "pause-jump";

export type DanceEvent = {
  at: number;
  duration: number;
  jumpHeight?: number;
  kind: DanceMoveKind;
  rotation?: number;
};

export type FloorSnailSegment = {
  danceEvents: DanceEvent[];
  duration: number;
  nextDirection: FloorSnailDirection;
  targetX: number;
};

export type FloorSnailStart = {
  delay: number;
  direction: FloorSnailDirection;
  x: number;
};

const outsideMarginRatio = 0.14;
const minimumEarlyTurnRatio = 0.24;
const maximumEarlyTurnRatio = 0.58;
const fullCrossChance = 0.62;
const minimumPixelsPerSecond = 18;
const maximumPixelsPerSecond = 38;

function randomBetween(rng: () => number, minimum: number, maximum: number): number {
  return minimum + (maximum - minimum) * rng();
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

export function createFloorSnailStart(
  side: "left" | "right",
  floorWidth: number,
  index: number,
  rng: () => number = Math.random,
): FloorSnailStart {
  const direction = side === "left" ? 1 : -1;
  const outsideX = side === "left" ? -floorWidth * outsideMarginRatio : floorWidth * (1 + outsideMarginRatio);

  return {
    delay: index * 0.28 + randomBetween(rng, 0.1, 2.4),
    direction,
    x: outsideX,
  };
}

function createDanceEvent(
  segmentDuration: number,
  rng: () => number = Math.random,
): DanceEvent {
  const kindRoll = rng();
  const at = randomBetween(rng, segmentDuration * 0.12, segmentDuration * 0.82);

  if (kindRoll < 0.26) {
    return {
      at,
      duration: randomBetween(rng, 0.16, 0.32),
      kind: "spin",
      rotation: rng() < 0.5 ? 360 : -360,
    };
  }

  if (kindRoll < 0.48) {
    return {
      at,
      duration: randomBetween(rng, 0.34, 0.58),
      jumpHeight: randomBetween(rng, 10, 24),
      kind: "jump",
    };
  }

  if (kindRoll < 0.68) {
    return {
      at,
      duration: randomBetween(rng, 0.8, 2.4),
      kind: "pause",
    };
  }

  if (kindRoll < 0.84) {
    return {
      at,
      duration: randomBetween(rng, 0.85, 2),
      kind: "pause-spin",
      rotation: rng() < 0.5 ? 360 : -360,
    };
  }

  return {
    at,
    duration: randomBetween(rng, 0.85, 2),
    jumpHeight: randomBetween(rng, 10, 24),
    kind: "pause-jump",
  };
}

export function createDanceEvents(
  segmentDuration: number,
  rng: () => number = Math.random,
): DanceEvent[] {
  const eventCount = rng() < 0.35 ? 0 : rng() < 0.74 ? 1 : 2;
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
  const farTarget = direction === 1 ? floorWidth * (1 + outsideMarginRatio) : -floorWidth * outsideMarginRatio;
  const earlyDistance = randomBetween(rng, floorWidth * minimumEarlyTurnRatio, floorWidth * maximumEarlyTurnRatio);
  const earlyTarget = currentX + direction * earlyDistance;
  const targetX = crossesFloor ? farTarget : clamp(earlyTarget, -floorWidth * 0.04, floorWidth * 1.04);
  const distance = Math.abs(targetX - currentX);
  const pixelsPerSecond = randomBetween(rng, minimumPixelsPerSecond, maximumPixelsPerSecond);
  const duration = Math.max(4.5, distance / pixelsPerSecond);

  return {
    danceEvents: createDanceEvents(duration, rng),
    duration,
    nextDirection: direction === 1 ? -1 : 1,
    targetX,
  };
}
```

- [ ] **Step 2: Create `src/controllers/floorSnailMotion.test.ts`**

Create tests with deterministic RNG sequences:

```ts
import { describe, expect, it } from "vitest";
import { createDanceEvents, createFloorSnailSegment, createFloorSnailStart } from "./floorSnailMotion";

function sequenceRng(values: number[]): () => number {
  let index = 0;
  return () => {
    const value = values[index] ?? values[values.length - 1] ?? 0.5;
    index += 1;
    return value;
  };
}

describe("floor snail motion helpers", () => {
  it("starts left snails outside the left edge and right snails outside the right edge", () => {
    expect(createFloorSnailStart("left", 1000, 0, sequenceRng([0.5]))).toMatchObject({
      direction: 1,
      x: -140,
    });
    expect(createFloorSnailStart("right", 1000, 0, sequenceRng([0.5]))).toMatchObject({
      direction: -1,
      x: 1140,
    });
  });

  it("can create a full crossing segment that targets the far side", () => {
    const segment = createFloorSnailSegment(0, 1, 1000, sequenceRng([0.1, 0.5, 0.5, 0.5, 0.9]));

    expect(segment.targetX).toBe(1140);
    expect(segment.nextDirection).toBe(-1);
    expect(segment.duration).toBeGreaterThan(25);
  });

  it("can reverse before reaching the far side", () => {
    const segment = createFloorSnailSegment(500, 1, 1000, sequenceRng([0.9, 0.1, 0.5, 0.8]));

    expect(segment.targetX).toBeGreaterThan(500);
    expect(segment.targetX).toBeLessThan(1140);
    expect(segment.nextDirection).toBe(-1);
  });

  it("creates fast spin dance events within the active segment", () => {
    const events = createDanceEvents(20, sequenceRng([0.8, 0.2, 0.1, 0.5, 0.4, 0.2]));

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ kind: "spin" });
    expect(events[0].at).toBeGreaterThan(2);
    expect(events[0].at).toBeLessThan(18);
    expect(events[0].duration).toBeGreaterThanOrEqual(0.16);
    expect(Math.abs(events[0].rotation ?? 0)).toBe(360);
  });

  it("creates jump dance events with positive jump height", () => {
    const events = createDanceEvents(20, sequenceRng([0.8, 0.2, 0.3, 0.5, 0.4, 0.5]));

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ kind: "jump" });
    expect(events[0].jumpHeight).toBeGreaterThan(0);
    expect(events[0].duration).toBeGreaterThanOrEqual(0.34);
  });

  it("creates pause dance events that are long enough to read as stopped", () => {
    const events = createDanceEvents(20, sequenceRng([0.8, 0.2, 0.6, 0.5, 0.4]));

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ kind: "pause" });
    expect(events[0].duration).toBeGreaterThanOrEqual(0.8);
  });

  it("can create pause-then-spin and pause-then-jump events", () => {
    const pauseSpin = createDanceEvents(20, sequenceRng([0.8, 0.2, 0.75, 0.5, 0.4, 0.2]));
    const pauseJump = createDanceEvents(20, sequenceRng([0.8, 0.2, 0.9, 0.5, 0.4, 0.5]));

    expect(pauseSpin[0]).toMatchObject({ kind: "pause-spin" });
    expect(Math.abs(pauseSpin[0].rotation ?? 0)).toBe(360);
    expect(pauseJump[0]).toMatchObject({ kind: "pause-jump" });
    expect(pauseJump[0].jumpHeight).toBeGreaterThan(0);
  });

  it("uses RNG values so production calls can differ on each page load", () => {
    const first = createFloorSnailSegment(300, -1, 1000, sequenceRng([0.1, 0.2, 0.2, 0.2]));
    const second = createFloorSnailSegment(300, -1, 1000, sequenceRng([0.95, 0.95, 0.95, 0.95]));

    expect(first.targetX).not.toBe(second.targetX);
    expect(first.duration).not.toBe(second.duration);
  });
});
```

- [ ] **Step 3: Run helper tests before controller integration**

Run:

```bash
npm test -- src/controllers/floorSnailMotion.test.ts
```

Expected: passes once the helper file exists. If it fails, fix the helper before touching `motionController.ts`.

## Task 4: Rewrite The GSAP Floor Traffic

**Files:**
- Modify `src/controllers/motionController.ts`
- Use `src/controllers/floorSnailMotion.ts`

- [ ] **Step 1: Import the helpers**

At the top of `src/controllers/motionController.ts`, add:

```ts
import {
  createFloorSnailSegment,
  createFloorSnailStart,
  type DanceEvent,
  type FloorSnailDirection,
} from "./floorSnailMotion";
```

- [ ] **Step 2: Replace final-target planning**

Remove `FloorSnailAnimationPlan`, `readPercentProperty`, `readScaleProperty`, `getFloorSnailEntryDelay`, and `createFloorSnailAnimationPlan`.

Add these local helpers instead:

```ts
function readPercentProperty(element: HTMLElement, propertyName: string): number {
  return Number.parseFloat(element.style.getPropertyValue(propertyName)) || 0;
}

function readScaleProperty(element: HTMLElement): number {
  return Number.parseFloat(element.style.getPropertyValue("--floor-rest-scale")) || 0.8;
}
```

- [ ] **Step 3: Update DOM target selectors**

Keep the current selectors for:

```ts
const floorSnailParty = root.querySelector<HTMLElement>("[data-floor-snail-party]");
const floorSnails = Array.from(root.querySelectorAll<HTMLElement>("[data-floor-snail]"));
const floorSnailSvgs = Array.from(root.querySelectorAll<SVGElement>("[data-floor-dancing-snail]"));
const floorSnailBodies = Array.from(root.querySelectorAll<SVGElement>("[data-floor-snail-body]"));
const floorSnailShells = Array.from(root.querySelectorAll<SVGElement>("[data-floor-snail-shell]"));
const floorSnailAntennae = Array.from(root.querySelectorAll<SVGElement>("[data-floor-snail-antennae]"));
```

Add these selectors:

```ts
const floorSnailFacing = Array.from(root.querySelectorAll<HTMLElement>("[data-floor-snail-facing]"));
const floorSnailSpin = Array.from(root.querySelectorAll<HTMLElement>("[data-floor-snail-spin]"));
```

Update the missing-target guard so it keeps the existing `floorSnailSvgs.length === floorSnails.length` check and also requires `floorSnailFacing.length === floorSnails.length` and `floorSnailSpin.length === floorSnails.length`.

- [ ] **Step 4: Add tracked random traffic timelines**

Inside `createMotionController`, before the master `timeline`, add:

```ts
const floorTraffic = new Set<gsap.core.Timeline>();
let floorTrafficStarted = false;

function stopFloorTraffic(): void {
  floorTraffic.forEach((trafficTimeline) => trafficTimeline.kill());
  floorTraffic.clear();
  floorTrafficStarted = false;
}
```

- [ ] **Step 5: Add recursive segment scheduling**

Still inside `createMotionController`, add these functions after `stopFloorTraffic`. The segment timeline must be split into movement chunks so pause events visibly stop only the affected snail before it resumes crossing the floor.

```ts
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
  spinElement: HTMLElement,
  snailSvg: SVGElement,
  event: DanceEvent,
  startAt: number,
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

  trafficTimeline.to(facingElement, { duration: 0.18, ease: "power1.out", scaleX: direction }, 0);

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
      direction,
      laneY,
      restScale,
    );

    timelineCursor += eventMovementTime - movementCursor;
    movementCursor = eventMovementTime;

    addDanceEvent(trafficTimeline, spinElement, snailSvg, event, timelineCursor);

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
    direction,
    laneY,
    restScale,
  );
}
```

- [ ] **Step 6: Start traffic after the intro**

Add this function near the segment scheduler:

```ts
function startFloorTraffic(): void {
  if (floorTrafficStarted) {
    return;
  }

  floorTrafficStarted = true;

  const floorBounds = floorSnailParty.getBoundingClientRect();
  const floorWidth = floorBounds.width || 760;
  const floorHeight = floorBounds.height || 220;

  floorSnails.forEach((floorSnail, index) => {
    const facingElement = floorSnailFacing[index];
    const spinElement = floorSnailSpin[index];
    const snailSvg = floorSnailSvgs[index];
    const side = floorSnail.dataset.floorSnailSide === "right" ? "right" : "left";
    const laneY = readPercentProperty(floorSnail, "--floor-lane-y") * floorHeight / 100;
    const restScale = readScaleProperty(floorSnail);
    const start = createFloorSnailStart(side, floorWidth, index);

    gsap.set(floorSnail, {
      opacity: 0,
      rotation: side === "left" ? -2 : 2,
      scale: restScale,
      x: start.x,
      xPercent: -50,
      y: laneY,
      yPercent: -50,
    });
    gsap.set(facingElement, { scaleX: start.direction, transformOrigin: "50% 86%" });
    gsap.set(snailSvg, { y: 0 });
    gsap.to(floorSnail, { delay: start.delay, duration: 0.45, opacity: 0.96, ease: "power1.out" });

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
```

- [ ] **Step 7: Remove the current one-way per-snail timeline**

Delete the current block:

```ts
floorSnails.forEach((floorSnail, index) => {
  const plan = floorSnailPlans[index];
  ...
});
```

Also remove `floorSnailPlans` and `floorSnailPartyBounds`.

- [ ] **Step 8: Call traffic startup from the master intro timeline**

In the master `timeline` chain, keep the intro reveal and idle body/shell/antenna movement. Add:

```ts
    .call(startFloorTraffic, [], "open+=0.9")
```

Place it after `floorSnailParty` fades in and before the repeating floor tile fade.

- [ ] **Step 9: Update lifecycle methods**

Replace the returned controller with:

```ts
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
```

- [ ] **Step 10: Run controller-related checks**

Run:

```bash
npm test -- src/controllers/floorSnailMotion.test.ts src/ui/cardView.test.ts
npm run build
```

Expected: tests and build pass.

## Task 5: Make Snails Bigger And Keep Them On The Floor

**Files:**
- Modify `src/styles.css`

- [ ] **Step 1: Update wrapper CSS**

Replace `.floor-snail-art` with wrapper rules for facing and spin:

```css
.floor-snail-facing,
.floor-snail-spin {
  display: block;
  transform-origin: 50% 86%;
  will-change: transform;
}

[data-floor-dancing-snail] {
  will-change: transform;
}
```

- [ ] **Step 2: Increase floor-snail size**

Change the desktop `.floor-snail` width to:

```css
width: clamp(3.45rem, 7vw, 6.8rem);
```

Change the mobile `.floor-snail` width to:

```css
width: clamp(2.75rem, 12vw, 4.7rem);
```

- [ ] **Step 3: Keep reduced-motion fallback working**

Update the reduced-motion right-facing rule from `.floor-snail-art` to `.floor-snail-facing`:

```css
[data-motion="reduced"] .floor-snail[data-floor-snail-side="right"] .floor-snail-facing {
  transform: scaleX(-1);
}
```

- [ ] **Step 4: Run CSS and build checks**

Run:

```bash
npm test
npm run build
git diff --check
```

Expected: all pass with no whitespace errors.

## Task 6: Browser Verification

**Files:**
- No source changes unless verification exposes a visual issue.

- [ ] **Step 1: Start or restart the local dev server**

Run:

```bash
npm run dev -- --host 127.0.0.1
```

Use the reported local URL. Existing sessions often use `http://127.0.0.1:5175/`.

- [ ] **Step 2: Desktop browser check**

Use Playwright or the in-app browser to verify these points at 1280 by 800:

- After about 3 seconds, only some floor snails should be visible.
- After about 20 seconds, more snails should be visible.
- Snails should be distributed across the dance floor rather than sitting in one middle pile.
- At least one snail should visibly cross most of the floor.
- At least one fast spin burst should be visible within a 20 second watch window.
- At least one snail should jump within a 20 second watch window.
- At least one snail should pause briefly and then resume movement.
- At least one snail should pause and then spin or jump before moving again.
- Pauses should be individual and staggered. The full crowd should not stop together.
- No snail should appear near the disco ball as a flying object.

- [ ] **Step 3: Mobile browser check**

Use a 390 by 844 viewport and verify:

- Snails stay in the floor band.
- Snails do not overlap the fixed music credit.
- Larger snail size still fits the floor.
- Direction flips and fast spins are visible without making the floor unreadable.
- Jumping snails stay visually attached to the floor band and do not overlap the fixed music credit.
- Pauses, pause-spins, and pause-jumps remain visible without creating a permanent pile.

- [ ] **Step 4: Capture evidence**

Save screenshots to `/private/tmp`:

```text
/private/tmp/birthday-card-random-floor-snails-desktop.png
/private/tmp/birthday-card-random-floor-snails-mobile.png
```

## Task 7: Final Review

**Files:**
- Review all changed files.

- [ ] **Step 1: Check for stale old-animation terms**

Run:

```bash
rg "mini-snail|snail-lead|snail-hype|pileup|finalX|turnX|floor-snail-art" src
```

Expected: no production references to old mini-snail, big-snail, pile-up, or final-center movement terms. Test assertions may still mention old terms only when asserting they are absent.

- [ ] **Step 2: Confirm full verification**

Run:

```bash
npm test
npm run build
git diff --check
```

Expected:

- Vitest reports 4 passing test files after adding `floorSnailMotion.test.ts`.
- Vite build completes successfully.
- `git diff --check` prints no output.

- [ ] **Step 3: Summarize for the user**

Report:

- Randomness is different on every page load because production calls use `Math.random`.
- Snails are larger.
- Snails continuously cross and turn around instead of ending in the middle.
- Some snails reverse before reaching the other side.
- Fast spin bursts, jumps, pauses, pause-spins, and pause-jumps are random and intermittent.
- Pauses affect individual snails only, and paused snails resume movement.
- Reduced-motion fallback still works.
- List the verification commands and browser checks that passed.

Do not create a pull request. Do not respond to GitHub review comments. Do not commit unless the user explicitly asks.
