import { describe, expect, it } from "vitest";
import {
  createDanceEvents,
  createFloorSnailMovementDirection,
  createFloorSnailSegment,
  createFloorSnailStart,
} from "./floorSnailMotion";

function sequenceRng(values: number[]): () => number {
  let index = 0;
  return () => {
    const value = values[index] ?? values[values.length - 1] ?? 0.5;
    index += 1;
    return value;
  };
}

describe("floor snail motion helpers", () => {
  it("starts the first six snails already moving inside the floor", () => {
    expect(createFloorSnailStart("left", 1000, 0, sequenceRng([0.5, 0.2]))).toMatchObject({
      delay: 0,
      direction: -1,
      isInitiallyActive: true,
      x: 500,
    });
    expect(createFloorSnailStart("right", 1000, 5, sequenceRng([0.25, 0.8]))).toMatchObject({
      delay: 0,
      direction: 1,
      isInitiallyActive: true,
      x: 370,
    });
  });

  it("starts later left snails outside the left edge and right snails outside the right edge", () => {
    expect(createFloorSnailStart("left", 1000, 6, sequenceRng([0.5]))).toMatchObject({
      direction: 1,
      isInitiallyActive: false,
      x: -140,
    });
    expect(createFloorSnailStart("right", 1000, 7, sequenceRng([0.5]))).toMatchObject({
      direction: -1,
      isInitiallyActive: false,
      x: 1140,
    });
  });

  it("spreads non-initial entry delays across a gradual window", () => {
    const firstDelayed = createFloorSnailStart("left", 1000, 6, sequenceRng([0]));
    const lateDelayed = createFloorSnailStart("right", 1000, 29, sequenceRng([1]));

    expect(firstDelayed.delay).toBeGreaterThanOrEqual(2.8);
    expect(lateDelayed.delay - firstDelayed.delay).toBeGreaterThan(27);
  });

  it("can create a full crossing segment that targets the far side", () => {
    const segment = createFloorSnailSegment(0, 1, 1000, sequenceRng([0.1, 0.5, 0.5, 0.5, 0.9]));

    expect(segment.targetX).toBe(1140);
    expect(segment.nextDirection).toBe(-1);
    expect(segment.duration).toBeGreaterThan(25);
  });

  it("varies segment speed enough for snails to move at visibly different paces", () => {
    const slow = createFloorSnailSegment(0, 1, 1000, sequenceRng([0.1, 0.5, 0, 0]));
    const fast = createFloorSnailSegment(0, 1, 1000, sequenceRng([0.1, 0.5, 1, 0]));

    expect(slow.pixelsPerSecond).toBeLessThan(10);
    expect(fast.pixelsPerSecond).toBeGreaterThan(30);
    expect(fast.pixelsPerSecond).toBeLessThan(40);
    expect(slow.duration).toBeGreaterThan(fast.duration * 3);
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

  it("creates flip dance events that briefly turn the snail around", () => {
    const events = createDanceEvents(20, sequenceRng([0.8, 0.2, 0.4, 0.5, 0]));

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ kind: "flip" });
    expect(events[0].duration).toBeGreaterThanOrEqual(0.38);
  });

  it("creates giggle dance events with a side-to-side shake", () => {
    const events = createDanceEvents(20, sequenceRng([0.8, 0.2, 0.55, 0.5, 0.4, 0.5]));

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ kind: "giggle" });
    expect(events[0].wiggleDistance).toBeGreaterThan(0);
  });

  it("creates pause dance events that are long enough to read as stopped", () => {
    const events = createDanceEvents(20, sequenceRng([0.8, 0.2, 0.6, 0.5, 0]));

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ kind: "pause" });
    expect(events[0].duration).toBeGreaterThanOrEqual(1.2);
  });

  it("creates occasional pause events for more moving snails", () => {
    const events = createDanceEvents(20, sequenceRng([0.25, 0.2, 0.6, 0.5, 0.4]));

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ kind: "pause" });
  });

  it("can create pause-then-spin and pause-then-jump events", () => {
    const pauseSpin = createDanceEvents(20, sequenceRng([0.8, 0.2, 0.82, 0.5, 0.4, 0.2]));
    const pauseJump = createDanceEvents(20, sequenceRng([0.8, 0.2, 0.9, 0.5, 0.4, 0.5]));

    expect(pauseSpin[0]).toMatchObject({ kind: "pause-spin" });
    expect(Math.abs(pauseSpin[0].rotation ?? 0)).toBe(360);
    expect(pauseJump[0]).toMatchObject({ kind: "pause-jump" });
    expect(pauseJump[0].jumpHeight).toBeGreaterThan(0);
  });

  it("can schedule three dance events in high-activity segments", () => {
    const events = createDanceEvents(
      20,
      sequenceRng([0.8, 0.9, 0.1, 0.5, 0.5, 0.4, 0.3, 0.5, 0.5, 0.5, 0.55, 0.5, 0.5, 0.5]),
    );

    expect(events).toHaveLength(3);
  });

  it("uses RNG values so production calls can differ on each page load", () => {
    const first = createFloorSnailSegment(300, -1, 1000, sequenceRng([0.1, 0.2, 0.2, 0.2]));
    const second = createFloorSnailSegment(300, -1, 1000, sequenceRng([0.95, 0.95, 0.95, 0.95]));

    expect(first.targetX).not.toBe(second.targetX);
    expect(first.duration).not.toBe(second.duration);
  });

  it("derives facing direction from the actual movement target", () => {
    expect(createFloorSnailMovementDirection(800, 200, 1)).toBe(-1);
    expect(createFloorSnailMovementDirection(100, 900, -1)).toBe(1);
    expect(createFloorSnailMovementDirection(500, 500, -1)).toBe(-1);
  });
});
