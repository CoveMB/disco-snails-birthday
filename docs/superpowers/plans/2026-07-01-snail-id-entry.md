# Snail ID Entry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the first-load dancing-snail scene with a snail-ID club-door entry scene that starts music and reveals the existing disco animation on click.

**Architecture:** Keep the current single-rendered Vite card. Add entry-state DOM to `src/ui/cardView.ts`, store the entered/not-entered state on the card root with `data-entry-state`, and reveal the existing stage with CSS plus the existing GSAP motion controller after the user clicks the primary action. The existing audio controller remains the only code that starts, pauses, and reports audio playback state.

**Tech Stack:** Vite, TypeScript, GSAP, Vitest, CSS custom properties, inline SVG.

---

## Context And Constraints

- Workspace: `/Users/CoveMB/Code/CoveMB/birthday-card`.
- Branch: `main`.
- The design spec is `docs/superpowers/specs/2026-07-01-snail-id-entry-design.md`.
- Do not add new audio assets.
- Do not add a second stage-local button.
- Do not re-render the full card after entry.
- The page does not need backward compatibility with the old first-load dancing view.
- The button must read exactly `Show your snail ID and enter the disco` before entry.
- The status text below the button must still say music starts after interaction.
- The same click must open the door, request audio playback, fire confetti, and start the current dancing-snail animation.

## File Map

- Modify `src/domain/audioState.ts`: change paused copy to the snail-ID entry label and status text.
- Modify `src/domain/audioState.test.ts`: update paused-state expectations.
- Modify `src/ui/cardView.ts`: render the entry scene, wrap the existing disco scene in a disco layer, and add root entry state markup.
- Modify `src/ui/cardView.test.ts`: lock the entry markup and new first-load copy.
- Modify `src/controllers/viewController.ts`: expose the root entry-state update helper.
- Modify `src/main.ts`: switch the card to entered state before requesting audio, then start motion and confetti from the entry click.
- Modify `src/controllers/motionController.ts`: initialize animation targets without auto-playing the intro on load, keep the already-visible hero copy stable, and make `playIntro` idempotent after the click.
- Modify `src/styles.css`: style the club door, security snail, entry/disco layers, door-open transition, and reduced-motion behavior.

## Acceptance Criteria

- On first load, no audio playback is requested.
- On first load, the primary action label is `Show your snail ID and enter the disco`.
- On first load, the status text says music starts after the user enters.
- On first load, the animation side shows a smiling snail security agent in front of a closed club door.
- On click, the root card state changes to entered and the club door opens.
- On click, the existing audio controller requests playback.
- On click, confetti bursts and the existing dancing floor-snail animation starts.
- On click, the existing left-side hero copy does not flash or replay its page-load reveal.
- If audio playback fails, the page stays in the entered visual state and shows the existing error text.
- Reduced-motion users get the same entry-to-entered state change without continuous animation.
- `npm test` and `npm run build` pass.

## Task 0: Preflight

**Files:**
- No file changes.

- [ ] **Step 1: Verify repository state**

Run:

```bash
git fetch --all --prune
git status --short --branch
git branch --show-current
```

Expected:

```text
## main
main
```

If `git status --short --branch` shows user changes outside this plan, inspect them before editing overlapping files. Do not reset or discard user work.

- [ ] **Step 2: Re-read the current implementation files**

Run:

```bash
sed -n '1,220p' src/domain/audioState.ts
sed -n '1,280p' src/ui/cardView.ts
sed -n '1,260p' src/controllers/viewController.ts
sed -n '1,320p' src/controllers/motionController.ts
sed -n '1,760p' src/styles.css
```

Expected: the current first-load stage is the existing disco scene, and `main.ts` calls `motionController.playIntro()` immediately after wiring the audio toggle.

## Task 1: Lock New First-Load Copy And Entry Markup

**Files:**
- Modify `src/domain/audioState.test.ts`
- Modify `src/ui/cardView.test.ts`

- [ ] **Step 1: Update the paused audio-state test first**

In `src/domain/audioState.test.ts`, change the paused-state expectations to:

```ts
  it("starts paused with the snail ID entry call to action", () => {
    const state = createInitialAudioState();
    const view = getAudioControlView(state);

    expect(state.status).toBe("paused");
    expect(view.label).toBe("Show your snail ID and enter the disco");
    expect(view.statusText).toBe("Music starts after you show your snail ID.");
    expect(view.ariaPressed).toBe("false");
  });
```

- [ ] **Step 2: Update the render shell test**

In `src/ui/cardView.test.ts`, update the first test so it requires the new first-load entry state and copy:

```ts
  it("renders the card shell, audio asset, and snail ID entry control", () => {
    const html = renderBirthdayCard(createCardViewModel(birthdayCardData, createInitialAudioState()));

    expect(html).toContain('data-card-root');
    expect(html).toContain('data-entry-state="waiting"');
    expect(html).toContain('src="/audio/disco-snails.mp3"');
    expect(html).toContain('data-audio-toggle');
    expect(html).toContain("Show your snail ID and enter the disco");
    expect(html).toContain("Music starts after you show your snail ID.");
    expect(html).toContain('aria-pressed="false"');
    expect(html).toContain("Music: Vulfmon &amp; Zachary Barker - Disco Snails");
    expect(html).not.toContain('data-replay-animation');
    expect(html).not.toContain('party-panel');
    expect(html).not.toContain("The slowest creatures in the garden somehow got the best table.");
    expect(html).not.toContain(
      "Tonight has mirror-ball shell polish, tiny dance-floor ambition, and a suspicious amount of glitter for something moving this slowly.",
    );
  });
```

- [ ] **Step 3: Add an entry-scene render test**

In `src/ui/cardView.test.ts`, add this test after the shell test:

```ts
  it("renders the initial club-door entry scene alongside the disco layer", () => {
    const html = renderBirthdayCard(createCardViewModel(birthdayCardData, createInitialAudioState()));

    expect(html).toContain('data-entry-scene');
    expect(html).toContain('data-club-door');
    expect(html).toContain('data-security-snail');
    expect(html).toContain('aria-label="Smiling snail security agent checking snail IDs"');
    expect(html).toContain('data-disco-scene');
    expect(html).toContain('data-floor-snail-party');
  });
```

- [ ] **Step 4: Run focused tests and confirm they fail**

Run:

```bash
npm test -- src/domain/audioState.test.ts src/ui/cardView.test.ts
```

Expected: fails because production still returns `Start the disco`, does not render `data-entry-state="waiting"`, and does not render the entry-scene markup.

## Task 2: Implement Audio Copy And Entry Markup

**Files:**
- Modify `src/domain/audioState.ts`
- Modify `src/ui/cardView.ts`

- [ ] **Step 1: Change paused audio copy**

In `src/domain/audioState.ts`, change only the final paused return value in `getAudioControlView`:

```ts
  return {
    label: "Show your snail ID and enter the disco",
    statusText: "Music starts after you show your snail ID.",
    ariaPressed: "false",
    disabled: false,
  };
```

- [ ] **Step 2: Add entry-scene render helpers**

In `src/ui/cardView.ts`, add these helpers after `renderFloorSnailParty`:

```ts
function renderSecuritySnail(): string {
  return `
    <div class="security-snail" data-security-snail>
      ${renderDancingSnail("security-dancing-snail", "security-shell", {
        ariaLabel: "Smiling snail security agent checking snail IDs",
        gradientId: "security-snail",
        snailDataAttribute: "data-security-snail-svg",
      })}
      <span class="security-badge" aria-hidden="true">ID</span>
    </div>
  `;
}

function renderClubDoorEntry(): string {
  return `
    <div class="entry-scene" data-entry-scene aria-hidden="true">
      <div class="club-door-scene">
        <div class="club-door-frame" data-club-door>
          <div class="club-door-panel club-door-panel-left">
            <span class="club-door-window"></span>
          </div>
          <div class="club-door-panel club-door-panel-right">
            <span class="club-door-window"></span>
          </div>
          <div class="club-door-glow"></div>
          <span class="club-door-sign">SNAIL DISCO</span>
        </div>
        ${renderSecuritySnail()}
      </div>
    </div>
  `;
}
```

This reuses the existing SVG snail renderer and adds a small badge without introducing new assets.

- [ ] **Step 3: Add root entry state and scene layers**

In `renderBirthdayCard`, change the opening root element to:

```ts
    <main class="page-shell" data-card-root data-entry-state="waiting">
```

Then replace the contents of the stage with this layer structure while preserving the current disco markup inside `data-disco-scene`:

```ts
        <div class="stage" data-snail-stage aria-label="Animated disco snails birthday scene">
          ${renderClubDoorEntry()}

          <div class="disco-scene" data-disco-scene aria-hidden="true">
            <div class="mirror-ball" data-mirror-ball aria-hidden="true">
              <span></span>
            </div>

            ${renderFloorSnailParty()}

            <div class="light-rig" aria-hidden="true">
              <span class="beam beam-cyan"></span>
              <span class="beam beam-pink"></span>
              <span class="beam beam-gold"></span>
            </div>

            <div class="snail-track" aria-hidden="true">
              <span class="snail-trail trail-one"></span>
              <span class="snail-trail trail-two"></span>
            </div>

            <div class="dance-floor" aria-hidden="true">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
```

- [ ] **Step 4: Run focused tests**

Run:

```bash
npm test -- src/domain/audioState.test.ts src/ui/cardView.test.ts
```

Expected: the two focused test files pass.

## Task 3: Wire Entered State And Deferred Motion

**Files:**
- Modify `src/controllers/viewController.ts`
- Modify `src/controllers/motionController.ts`
- Modify `src/main.ts`

- [ ] **Step 1: Add an entry-state helper**

In `src/controllers/viewController.ts`, add this exported function after `updateAudioControl`:

```ts
export function markEntered(refs: CardRefs): void {
  refs.root.dataset.entryState = "entered";
}
```

- [ ] **Step 2: Make motion initialization safe before entry**

In `src/controllers/motionController.ts`, remove the hero-copy target from the intro timeline so entry only animates the disco side. Delete this query:

```ts
  const heroCopy = root.querySelector<HTMLElement>("[data-hero-copy]");
```

Then remove `!heroCopy ||` from the missing-target guard.

In the timeline setup, remove `heroCopy` from this `.set` call:

```ts
    .set([heroCopy, mirrorBall, floorSnailParty], {
      opacity: 0,
    })
```

so it becomes:

```ts
    .set([mirrorBall, floorSnailParty], {
      opacity: 0,
    })
```

Delete these two timeline calls:

```ts
    .set(heroCopy, { y: 26 })
    .to(heroCopy, { opacity: 1, y: 0 }, "open")
```

Then add a `hasPlayedIntro` flag near the `timeline` declaration:

```ts
  let hasPlayedIntro = false;
```

Then change `playIntro` to the idempotent version so repeat clicks do not restart the animation:

```ts
    playIntro: () => {
      if (hasPlayedIntro) {
        return;
      }

      hasPlayedIntro = true;
      stopFloorTraffic();
      timeline.play(0);
    },
```

Do not call `playIntro` from `createMotionController`.

- [ ] **Step 3: Switch main click flow to entry-first behavior**

In `src/main.ts`, change the import from `viewController` to include `markEntered`:

```ts
import { getCardRefs, markEntered, updateAudioControl } from "./controllers/viewController";
```

Then replace the audio-toggle listener and remove the immediate intro/confetti calls at the bottom:

```ts
refs.audioToggle.addEventListener("click", () => {
  markEntered(refs);
  motionController.playIntro();
  audioController.toggle(audioState);
  confettiController.burst();
});
```

Remove:

```ts
motionController.playIntro();
window.setTimeout(() => confettiController.burst(), 550);
```

- [ ] **Step 4: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: TypeScript passes.

## Task 4: Style Entry And Disco Scene States

**Files:**
- Modify `src/styles.css`

- [ ] **Step 1: Add scene-layer base styles**

In `src/styles.css`, after the `.stage` rule, add:

```css
.entry-scene,
.disco-scene {
  position: absolute;
  inset: 0;
}

.entry-scene {
  z-index: 4;
  display: grid;
  place-items: center;
  opacity: 1;
  transition:
    opacity 0.42s ease,
    transform 0.42s ease;
}

.disco-scene {
  z-index: 1;
  opacity: 0;
  transition: opacity 0.42s ease;
}

[data-entry-state="entered"] .entry-scene {
  opacity: 0;
  pointer-events: none;
  transform: translateY(-0.8rem) scale(0.98);
}

[data-entry-state="entered"] .disco-scene {
  opacity: 1;
}
```

- [ ] **Step 2: Add club-door and security-snail styles**

In `src/styles.css`, after the scene-layer styles, add:

```css
.club-door-scene {
  position: relative;
  display: grid;
  align-items: end;
  justify-items: center;
  width: min(31rem, 100%);
  min-height: clamp(23rem, 46vw, 34rem);
}

.club-door-frame {
  position: absolute;
  right: 4%;
  bottom: 9%;
  width: min(19rem, 62vw);
  height: min(25rem, 76vw);
  max-height: 28rem;
  overflow: hidden;
  border: 0.24rem solid rgba(255, 250, 242, 0.82);
  border-radius: 8px 8px 0 0;
  background:
    radial-gradient(circle at 50% 18%, rgba(255, 230, 107, 0.28), transparent 24%),
    linear-gradient(180deg, rgba(125, 231, 255, 0.16), rgba(17, 17, 18, 0.92));
  box-shadow:
    0 0 2rem rgba(125, 231, 255, 0.28),
    inset 0 0 2rem rgba(0, 0, 0, 0.34);
}

.club-door-panel {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 50%;
  background:
    linear-gradient(180deg, rgba(255, 79, 216, 0.32), transparent 44%),
    linear-gradient(135deg, #281a34, #111112);
  transition: transform 0.72s cubic-bezier(0.2, 0.74, 0.22, 1);
}

.club-door-panel-left {
  left: 0;
  border-right: 1px solid rgba(255, 250, 242, 0.24);
  transform-origin: left center;
}

.club-door-panel-right {
  right: 0;
  border-left: 1px solid rgba(255, 250, 242, 0.24);
  transform-origin: right center;
}

.club-door-window {
  position: absolute;
  top: 26%;
  left: 50%;
  width: 34%;
  aspect-ratio: 1;
  border-radius: 50%;
  border: 2px solid rgba(255, 250, 242, 0.58);
  background: rgba(125, 231, 255, 0.22);
  transform: translateX(-50%);
}

.club-door-glow {
  position: absolute;
  inset: 9% 17% 0;
  background: linear-gradient(180deg, rgba(255, 230, 107, 0.5), rgba(255, 79, 216, 0.2), transparent);
  opacity: 0;
  transition: opacity 0.4s ease 0.16s;
}

.club-door-sign {
  position: absolute;
  top: 0.85rem;
  left: 50%;
  z-index: 2;
  width: max-content;
  padding: 0.36rem 0.58rem;
  border: 1px solid rgba(255, 230, 107, 0.62);
  border-radius: 8px;
  color: #ffe66b;
  background: rgba(17, 17, 18, 0.76);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0;
  transform: translateX(-50%);
}

[data-entry-state="entered"] .club-door-panel-left {
  transform: perspective(22rem) rotateY(-72deg);
}

[data-entry-state="entered"] .club-door-panel-right {
  transform: perspective(22rem) rotateY(72deg);
}

[data-entry-state="entered"] .club-door-glow {
  opacity: 1;
}

.security-snail {
  position: absolute;
  left: 2%;
  bottom: 8%;
  z-index: 5;
  width: clamp(12rem, 28vw, 18rem);
  transform: rotate(-2deg);
}

.security-dancing-snail {
  filter: drop-shadow(0 1.1rem 0.9rem rgba(0, 0, 0, 0.44));
}

.security-shell {
  --snail-shell-primary: #ffe66b;
  --snail-shell-secondary: #7de7ff;
  --snail-shell-accent: #ff4fd8;
  --snail-shell-shadow: #2a1735;
}

.security-badge {
  position: absolute;
  right: 14%;
  bottom: 21%;
  display: grid;
  place-items: center;
  width: 2.2rem;
  aspect-ratio: 1;
  border: 2px solid #111112;
  border-radius: 50%;
  color: #111112;
  background: #ffe66b;
  font-size: 0.78rem;
  font-weight: 900;
  box-shadow: 0 0.35rem 0.8rem rgba(0, 0, 0, 0.28);
}
```

- [ ] **Step 3: Scope existing stage-floor pseudo-element to the disco state**

Change the `.stage::after` selector to:

```css
.disco-scene::after {
```

Keep the existing declaration block unchanged, except set `width: 96%;` and `height: 30%;` as it already has.

- [ ] **Step 4: Add mobile adjustments**

Inside the existing `@media (max-width: 680px)` block, add:

```css
  .club-door-scene {
    min-height: 24rem;
  }

  .club-door-frame {
    right: 0;
    width: min(16rem, 74vw);
  }

  .security-snail {
    left: -0.3rem;
    width: clamp(10rem, 48vw, 13.5rem);
  }
```

Change the existing selector:

```css
  .dance-floor,
  .stage::after {
    width: 100%;
  }
```

to:

```css
  .dance-floor,
  .disco-scene::after {
    width: 100%;
  }
```

- [ ] **Step 5: Run build**

Run:

```bash
npm run build
```

Expected: TypeScript and Vite build pass.

## Task 5: Full Verification And Local Preview

**Files:**
- No planned source changes.

- [ ] **Step 1: Run the full test suite**

Run:

```bash
npm test
```

Expected: all Vitest tests pass.

- [ ] **Step 2: Run the production build**

Run:

```bash
npm run build
```

Expected: TypeScript passes and Vite writes `dist/`.

- [ ] **Step 3: Start the dev server**

Run:

```bash
npm run dev -- --host 127.0.0.1
```

Expected: Vite reports a local URL, usually `http://127.0.0.1:5173/`. Leave the server running for the user.

- [ ] **Step 4: Browser smoke check**

Open the dev-server URL and verify:

- The first view shows the security-agent snail and closed door.
- The first view does not start music.
- The button copy fits at desktop and mobile widths.
- Clicking the button opens the door, starts the disco scene, and requests audio playback.
- The dance floor and music credit do not overlap on mobile.

## Self-Review

- Spec coverage: the plan covers first-load entry state, the security snail, club door, single-click audio start, preserved existing disco animation, stable hero copy, reduced-motion behavior, render tests, audio tests, full test run, build, and local preview.
- Placeholder scan: no unresolved markers or vague implementation placeholders remain.
- Type consistency: `data-entry-state`, `markEntered`, `data-entry-scene`, `data-club-door`, `data-security-snail`, and `data-disco-scene` are named consistently across tasks.
