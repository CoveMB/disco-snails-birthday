# Snail Speed Variation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give floor snails slightly different speeds and occasional mid-route speed changes.

**Architecture:** Keep the existing random segment model in `src/controllers/floorSnailMotion.ts`. Add pure movement-step planning that splits a route into a few chunks with independent speed multipliers, then have `src/controllers/motionController.ts` schedule those chunks around the existing dance events.

**Tech Stack:** TypeScript, GSAP, Vitest.

---

## File Map

- Modify `src/controllers/floorSnailMotion.ts`: add movement-step data and a helper that creates subtle speed changes for each segment.
- Modify `src/controllers/floorSnailMotion.test.ts`: cover the new speed-step behavior with injectable RNG.
- Modify `src/controllers/motionController.ts`: consume movement steps when scheduling each segment.

## Task 1: Lock the motion contract

**Files:**
- Modify: `src/controllers/floorSnailMotion.test.ts`

- [ ] **Step 1: Add a failing test for speed-change steps**

Add a test that creates a segment with high speed-change activity and asserts that the segment has more than one movement step, each step has a positive duration, and at least two steps use different speeds.

- [ ] **Step 2: Run the focused test**

Run:

```bash
npm test -- src/controllers/floorSnailMotion.test.ts
```

Expected: the new test fails because `movementSteps` does not exist yet.

## Task 2: Add pure speed-step planning

**Files:**
- Modify: `src/controllers/floorSnailMotion.ts`
- Test: `src/controllers/floorSnailMotion.test.ts`

- [ ] **Step 1: Add movement step types and helper**

Add a `FloorSnailMovementStep` type with `duration`, `pixelsPerSecond`, `startAt`, `startX`, and `targetX`. Add a helper that splits the full movement into one to four chunks. Most segments should have speed changes, but some should keep one steady speed.

- [ ] **Step 2: Attach movement steps to segments**

Add `movementSteps` to `FloorSnailSegment`. Keep `duration`, `pixelsPerSecond`, and `targetX` for existing tests and caller compatibility.

- [ ] **Step 3: Run focused tests**

Run:

```bash
npm test -- src/controllers/floorSnailMotion.test.ts
```

Expected: all floor-snail motion tests pass.

## Task 3: Schedule movement from steps

**Files:**
- Modify: `src/controllers/motionController.ts`

- [ ] **Step 1: Use movement steps between dance events**

Replace the direct linear movement chunk scheduling with a helper that schedules portions of the segment’s movement steps between two movement-time cursors. Keep dance events, pauses, jumps, and spins as they are.

- [ ] **Step 2: Run focused tests and typecheck**

Run:

```bash
npm test -- src/controllers/floorSnailMotion.test.ts
npm run typecheck
```

Expected: tests and typecheck pass.

## Task 4: Verify the app

**Files:**
- No planned source changes.

- [ ] **Step 1: Run full tests**

Run:

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 2: Run production build**

Run:

```bash
npm run build
```

Expected: TypeScript and Vite build pass.

## Self-Review

- Coverage: the plan covers baseline speed differences, occasional mid-route speed changes, existing dance events, tests, typecheck, and production build.
- Scope: the change stays in the floor-snail motion system and does not alter the entry screen or audio flow.
- Placeholders: no unresolved implementation markers remain.
