# Disco Snails Birthday Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a small, free-to-host birthday card website with a disco snails theme, polished animation, mobile support, and a GitHub Pages deployment path.

**Architecture:** Use a static Vite and TypeScript app with no backend. Render the card as semantic HTML, style it with one focused CSS file, and keep GSAP timelines, reduced-motion handling, and canvas confetti in separate modules. Deploy the built `dist/` output through GitHub Pages using a GitHub Actions workflow.

**Tech Stack:** Vite, TypeScript, GSAP, CSS, Vitest, Playwright, GitHub Pages, generated WebP/PNG visual assets.

---

## Context And Assumptions

- Current workspace: `/Users/CoveMB/Code/CoveMB/birthday-card`.
- Current state: empty directory, not a Git repository. `git fetch` and branch verification cannot run until a repository exists or the workspace points at an existing repository.
- Default migration assumption: this is a new project with no backward compatibility or migration requirement. If that is wrong, stop before implementation and get the compatibility target from the user.
- Default deployment target: GitHub Pages at a repository path such as `https://<username>.github.io/birthday-card/`.
- The Vite `base` path will come from `SITE_BASE` so the same code can support either repo-path Pages (`/birthday-card/`) or a custom domain (`/`).
- The site does not need authentication, analytics, forms, cookies, a database, server rendering, or a CMS.
- Birthday copy can start generic and be edited later without changing architecture.
- No pull request, merge request, branch, or external GitHub change should be created unless the user explicitly asks.

## Source Checks

- Vite docs: production builds use `npm run build` and output to `dist` by default. GitHub Pages deployments need the correct `base`: `/` for a user page or custom domain, `/<repo>/` for a repository page.
- GitHub Pages docs: Pages can host static sites and can deploy through GitHub Actions.
- GSAP docs: timeline-based sequencing supports chained `.to()`, `.fromTo()`, `.set()`, `.call()`, labels, repeats, staggered targets, and callbacks. That matches the choreographed animation need.

## Architecture Decisions

1. Hosting: GitHub Pages.
   - Free for this use case.
   - Static-only constraint is fine because the card has no server needs.
   - Deployment can run from GitHub Actions, which keeps local build artifacts out of Git.

2. Frontend stack: Vite plus TypeScript, no React.
   - The site is a single interactive card, not an app with complex state.
   - Vite gives fast local development, TypeScript checks, asset bundling, and a clean Pages deployment.
   - Avoiding React keeps bundle size and component overhead low.

3. Animation stack: GSAP plus small custom canvas effects.
   - GSAP handles the choreographed DOM/SVG motion: snail entrances, disco ball shimmer, shell sparkle, text reveal, and replay.
   - A small canvas module handles glitter and confetti with deterministic testable particle generation.
   - CSS handles simple idle effects and reduced-motion fallbacks.

4. Visual direction: generated bitmap assets plus DOM/SVG accents.
   - Use generated WebP/PNG assets for the primary disco snail imagery and social preview.
   - Use DOM and CSS for lighting, stage layout, typography, buttons, and responsive composition.
   - Use SVG only for small interface-safe accents when CSS or bitmap assets are a poor fit.

5. Accessibility and safety:
   - Respect `prefers-reduced-motion`.
   - Provide a visible replay button instead of autoplay-only animation.
   - Do not autoplay audio. If sound is added later, require an explicit user click.
   - Keep all assets local. Do not hotlink third-party images or scripts.
   - Do not collect data.

## File Map

- `package.json`: scripts and dependencies.
- `tsconfig.json`: strict TypeScript project settings.
- `vite.config.ts`: Vite config with deploy-safe `base`.
- `index.html`: document shell, metadata, and root mount.
- `.gitignore`: dependency, build, and local environment ignores.
- `.github/workflows/pages.yml`: GitHub Pages deployment workflow.
- `src/main.ts`: application entrypoint and event wiring.
- `src/styles.css`: responsive layout, disco styling, reduced-motion CSS.
- `src/components/card.ts`: semantic birthday card DOM.
- `src/animation/reducedMotion.ts`: reduced-motion helper.
- `src/animation/discoTimeline.ts`: GSAP timeline factory and replay controls.
- `src/particles/confetti.ts`: canvas particle generation and animation.
- `src/assets/disco-snail-stage.webp`: generated main visual asset.
- `src/assets/shell-sparkle.webp`: generated decorative asset.
- `public/og-image.png`: generated social preview image.
- `src/animation/reducedMotion.test.ts`: unit tests for motion preference helper.
- `src/particles/confetti.test.ts`: unit tests for particle generation.
- `playwright.config.ts`: browser test config.
- `tests/card.spec.ts`: end-to-end checks for the rendered card.

## Task 0: Preflight Repository And Scope Gate

**Files:**
- No file changes in this task.

- [ ] **Step 1: Verify repository state**

Run:

```bash
git status --short --branch
```

Expected if the workspace is still empty and not a repo:

```text
fatal: not a git repository (or any of the parent directories): .git
```

If that output appears, stop and ask whether to initialize this folder as a new repository or switch to an existing Git repository.

- [ ] **Step 2: If a repository exists, fetch and verify branch**

Run:

```bash
git fetch --all --prune
git status --short --branch
git branch --show-current
```

Expected: the current branch is the user-approved branch for birthday-card work. If the branch is unclear, stop and ask for the intended branch.

- [ ] **Step 3: Confirm compatibility scope**

Ask the user this exact question before implementation:

```text
Is this a fresh site with no backward compatibility or migration needs, or does it need to preserve anything from an existing site or repository?
```

Continue only after the answer is known. If the answer is "fresh site", keep this plan unchanged.

## Task 1: Scaffold The Static Project

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `.gitignore`

- [ ] **Step 1: Initialize npm and install dependencies**

Run:

```bash
npm init -y
npm install gsap
npm install --save-dev vite typescript vitest @playwright/test
```

Expected: `package.json` and `package-lock.json` exist, and npm exits with code `0`.

- [ ] **Step 2: Set scripts and module type**

Run:

```bash
npm pkg set type=module
npm pkg set scripts.dev=vite
npm pkg set scripts.build="tsc --noEmit && vite build"
npm pkg set scripts.preview="vite preview"
npm pkg set scripts.typecheck="tsc --noEmit"
npm pkg set scripts.test="vitest run"
npm pkg set scripts.e2e="playwright test"
```

Expected: `package.json` contains scripts named `dev`, `build`, `preview`, `typecheck`, `test`, and `e2e`.

- [ ] **Step 3: Create `.gitignore`**

Create `./.gitignore`:

```gitignore
node_modules/
dist/
.vite/
coverage/
playwright-report/
test-results/
.DS_Store
.env
.env.*
```

- [ ] **Step 4: Create TypeScript config**

Create `./tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "types": ["vitest/globals"],
    "skipLibCheck": true,
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src", "tests", "vite.config.ts", "playwright.config.ts"]
}
```

- [ ] **Step 5: Create Vite config**

Create `./vite.config.ts`:

```ts
import { defineConfig } from "vite";

const siteBase = process.env.SITE_BASE ?? "/";

export default defineConfig({
  base: siteBase,
  build: {
    assetsInlineLimit: 0,
    sourcemap: false,
  },
});
```

- [ ] **Step 6: Create HTML shell**

Create `./index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta
      name="description"
      content="A tiny disco snails birthday card with animated glitter, shell sparkle, and birthday cheer."
    />
    <meta property="og:title" content="Disco Snails Birthday Card" />
    <meta
      property="og:description"
      content="The snails made it to the dance floor for one birthday night."
    />
    <meta property="og:image" content="/og-image.png" />
    <title>Disco Snails Birthday Card</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 7: Verify scaffold**

Run:

```bash
npm run typecheck
```

Expected initially: TypeScript may fail because `src/main.ts` does not exist yet. The expected error includes a missing input or missing file message. Continue to Task 2.

## Task 2: Add Reduced-Motion Utility With Tests

**Files:**
- Create: `src/animation/reducedMotion.ts`
- Create: `src/animation/reducedMotion.test.ts`

- [ ] **Step 1: Create failing unit tests**

Create `./src/animation/reducedMotion.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { resolveMotionPreference } from "./reducedMotion";

describe("resolveMotionPreference", () => {
  it("uses reduced motion when the media query matches", () => {
    const preference = resolveMotionPreference({
      matches: true,
    } as MediaQueryList);

    expect(preference).toEqual({
      reduceMotion: true,
      animationDurationScale: 0,
    });
  });

  it("uses full motion when the media query does not match", () => {
    const preference = resolveMotionPreference({
      matches: false,
    } as MediaQueryList);

    expect(preference).toEqual({
      reduceMotion: false,
      animationDurationScale: 1,
    });
  });
});
```

- [ ] **Step 2: Run tests and verify failure**

Run:

```bash
npm run test -- src/animation/reducedMotion.test.ts
```

Expected: fail because `src/animation/reducedMotion.ts` does not exist.

- [ ] **Step 3: Implement reduced-motion helper**

Create `./src/animation/reducedMotion.ts`:

```ts
export type MotionPreference = {
  reduceMotion: boolean;
  animationDurationScale: 0 | 1;
};

export function resolveMotionPreference(mediaQuery: MediaQueryList): MotionPreference {
  if (mediaQuery.matches) {
    return {
      reduceMotion: true,
      animationDurationScale: 0,
    };
  }

  return {
    reduceMotion: false,
    animationDurationScale: 1,
  };
}

export function getMotionPreference(): MotionPreference {
  return resolveMotionPreference(window.matchMedia("(prefers-reduced-motion: reduce)"));
}
```

- [ ] **Step 4: Run tests and verify pass**

Run:

```bash
npm run test -- src/animation/reducedMotion.test.ts
```

Expected: both tests pass.

- [ ] **Step 5: Commit this task if inside a Git repo**

Run only after repository setup is confirmed:

```bash
git add src/animation/reducedMotion.ts src/animation/reducedMotion.test.ts package.json package-lock.json tsconfig.json vite.config.ts index.html .gitignore
git commit -m "chore: scaffold birthday card project"
```

Expected: one commit is created. If Git is not initialized, skip this step and note it in the implementation log.

## Task 3: Build The Card DOM And Base Styling

**Files:**
- Create: `src/components/card.ts`
- Create: `src/main.ts`
- Create: `src/styles.css`

- [ ] **Step 1: Create the card component**

Create `./src/components/card.ts`:

```ts
export function renderBirthdayCard(root: HTMLElement): void {
  root.innerHTML = `
    <main class="page-shell" data-card-root>
      <canvas class="sparkle-canvas" data-sparkle-canvas aria-hidden="true"></canvas>

      <section class="birthday-card" aria-labelledby="birthday-title">
        <div class="card-copy">
          <p class="eyebrow">Disco Snails Present</p>
          <h1 id="birthday-title">Happy Birthday</h1>
          <p class="birthday-message">
            The snails polished their shells, found the mirror ball, and made it to the dance floor.
          </p>
          <div class="card-actions">
            <button class="icon-button replay-button" type="button" data-replay-animation aria-label="Replay animation">
              <span aria-hidden="true">↻</span>
            </button>
          </div>
        </div>

        <div class="stage" aria-label="Animated disco snails on a tiny dance floor">
          <div class="disco-ball" data-disco-ball aria-hidden="true">
            <span></span>
          </div>

          <div class="light-beam beam-one" aria-hidden="true"></div>
          <div class="light-beam beam-two" aria-hidden="true"></div>

          <figure class="snail snail-one" data-snail>
            <div class="snail-shell" data-shell></div>
            <div class="snail-body">
              <span class="snail-eye eye-left"></span>
              <span class="snail-eye eye-right"></span>
            </div>
          </figure>

          <figure class="snail snail-two" data-snail>
            <div class="snail-shell shell-alt" data-shell></div>
            <div class="snail-body body-alt">
              <span class="snail-eye eye-left"></span>
              <span class="snail-eye eye-right"></span>
            </div>
          </figure>

          <div class="dance-floor" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </section>
    </main>
  `;
}
```

- [ ] **Step 2: Create entrypoint**

Create `./src/main.ts`:

```ts
import "./styles.css";
import { createDiscoTimeline } from "./animation/discoTimeline";
import { getMotionPreference } from "./animation/reducedMotion";
import { startSparkleCanvas } from "./particles/confetti";
import { renderBirthdayCard } from "./components/card";

const root = document.querySelector<HTMLElement>("#app");

if (!root) {
  throw new Error("Missing #app root element.");
}

renderBirthdayCard(root);

const cardRoot = root.querySelector<HTMLElement>("[data-card-root]");
const replayButton = root.querySelector<HTMLButtonElement>("[data-replay-animation]");
const canvas = root.querySelector<HTMLCanvasElement>("[data-sparkle-canvas]");

if (!cardRoot || !replayButton || !canvas) {
  throw new Error("Birthday card did not render required interactive elements.");
}

const motionPreference = getMotionPreference();
cardRoot.dataset.motion = motionPreference.reduceMotion ? "reduced" : "full";

const timeline = createDiscoTimeline(cardRoot, motionPreference);
const sparkleCanvas = startSparkleCanvas(canvas, motionPreference);

replayButton.addEventListener("click", () => {
  timeline.replay();
  sparkleCanvas.burst();
});

timeline.play();
```

- [ ] **Step 3: Run typecheck and verify expected failures**

Run:

```bash
npm run typecheck
```

Expected: fail because `src/animation/discoTimeline.ts` and `src/particles/confetti.ts` do not exist yet.

- [ ] **Step 4: Create base styles**

Create `./src/styles.css`:

```css
:root {
  color: #fffaf2;
  background: #111112;
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
}

* {
  box-sizing: border-box;
}

body {
  min-width: 320px;
  min-height: 100vh;
  margin: 0;
  overflow-x: hidden;
}

button {
  font: inherit;
}

.page-shell {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(circle at 18% 18%, rgba(240, 71, 255, 0.24), transparent 26rem),
    radial-gradient(circle at 85% 12%, rgba(75, 214, 255, 0.22), transparent 24rem),
    linear-gradient(135deg, #171014 0%, #231527 40%, #101414 100%);
}

.sparkle-canvas {
  position: fixed;
  inset: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.birthday-card {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(20rem, 1.1fr);
  align-items: center;
  min-height: 100vh;
  width: min(72rem, calc(100% - 2rem));
  margin: 0 auto;
  gap: clamp(1.5rem, 4vw, 4rem);
  padding: clamp(1rem, 3vw, 3rem) 0;
}

.card-copy {
  max-width: 34rem;
}

.eyebrow {
  margin: 0 0 0.75rem;
  color: #7de7ff;
  font-size: clamp(0.82rem, 1.3vw, 0.95rem);
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
}

h1 {
  max-width: 11ch;
  margin: 0;
  font-size: clamp(3.35rem, 9vw, 7.25rem);
  line-height: 0.88;
  letter-spacing: 0;
}

.birthday-message {
  max-width: 31rem;
  margin: 1.25rem 0 0;
  color: #f8e9d3;
  font-size: clamp(1rem, 1.8vw, 1.25rem);
  line-height: 1.65;
}

.card-actions {
  display: flex;
  margin-top: 1.5rem;
}

.icon-button {
  display: inline-grid;
  place-items: center;
  width: 3rem;
  height: 3rem;
  border: 1px solid rgba(255, 250, 242, 0.36);
  border-radius: 50%;
  color: #fffaf2;
  background: rgba(255, 255, 255, 0.08);
  cursor: pointer;
}

.icon-button:hover,
.icon-button:focus-visible {
  outline: 2px solid #7de7ff;
  outline-offset: 3px;
}

.stage {
  position: relative;
  display: grid;
  align-items: end;
  min-height: clamp(28rem, 62vw, 42rem);
  isolation: isolate;
}

.disco-ball {
  position: absolute;
  top: 3%;
  left: 50%;
  width: clamp(5rem, 10vw, 8rem);
  aspect-ratio: 1;
  border-radius: 50%;
  transform: translateX(-50%);
  background:
    linear-gradient(90deg, transparent 48%, rgba(255, 255, 255, 0.5) 49% 51%, transparent 52%),
    linear-gradient(0deg, transparent 48%, rgba(255, 255, 255, 0.34) 49% 51%, transparent 52%),
    radial-gradient(circle at 35% 25%, #ffffff, #c7f9ff 28%, #9b5cff 64%, #3f225e);
  box-shadow: 0 0 3rem rgba(125, 231, 255, 0.4);
}

.disco-ball span {
  position: absolute;
  inset: 16%;
  border-radius: inherit;
  border: 1px solid rgba(255, 255, 255, 0.45);
}

.light-beam {
  position: absolute;
  top: 15%;
  width: 38%;
  height: 70%;
  opacity: 0.34;
  transform-origin: top center;
  background: linear-gradient(to bottom, rgba(125, 231, 255, 0.7), transparent);
  clip-path: polygon(48% 0, 100% 100%, 0 100%);
}

.beam-one {
  left: 18%;
  transform: rotate(-12deg);
}

.beam-two {
  right: 10%;
  background: linear-gradient(to bottom, rgba(240, 71, 255, 0.58), transparent);
  transform: rotate(14deg);
}

.snail {
  position: absolute;
  bottom: 14%;
  display: grid;
  grid-template-columns: 4.8rem 7rem;
  align-items: end;
  width: 12rem;
  margin: 0;
  filter: drop-shadow(0 1.2rem 1.2rem rgba(0, 0, 0, 0.34));
}

.snail-one {
  left: 8%;
}

.snail-two {
  right: 4%;
  transform: scaleX(-1) scale(0.86);
}

.snail-shell {
  position: relative;
  z-index: 2;
  width: 5.2rem;
  aspect-ratio: 1;
  border-radius: 50%;
  background:
    radial-gradient(circle at 50% 50%, #ffe66b 0 12%, #ff4fd8 13% 28%, #7de7ff 29% 43%, #251732 44% 100%);
  border: 0.28rem solid rgba(255, 250, 242, 0.8);
}

.shell-alt {
  background:
    radial-gradient(circle at 50% 50%, #7de7ff 0 12%, #ffe66b 13% 28%, #ff4fd8 29% 43%, #251732 44% 100%);
}

.snail-body {
  position: relative;
  width: 7.6rem;
  height: 3.1rem;
  margin-left: -0.7rem;
  border-radius: 999px 999px 1.4rem 1.4rem;
  background: linear-gradient(90deg, #b7f7be, #61d394);
}

.body-alt {
  background: linear-gradient(90deg, #ffd166, #f4a261);
}

.snail-eye {
  position: absolute;
  top: -1.6rem;
  width: 0.34rem;
  height: 1.8rem;
  border-radius: 999px;
  background: #f8e9d3;
}

.snail-eye::after {
  content: "";
  position: absolute;
  top: -0.35rem;
  left: 50%;
  width: 0.76rem;
  aspect-ratio: 1;
  border-radius: 50%;
  transform: translateX(-50%);
  background: #111112;
  border: 0.18rem solid #f8e9d3;
}

.eye-left {
  right: 1.4rem;
}

.eye-right {
  right: 0.35rem;
}

.dance-floor {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  align-self: end;
  min-height: 8rem;
  border-radius: 8px 8px 0 0;
  overflow: hidden;
  transform: perspective(26rem) rotateX(58deg);
  transform-origin: bottom center;
}

.dance-floor span:nth-child(odd) {
  background: rgba(125, 231, 255, 0.58);
}

.dance-floor span:nth-child(even) {
  background: rgba(240, 71, 255, 0.52);
}

@media (max-width: 760px) {
  .birthday-card {
    grid-template-columns: 1fr;
    align-content: start;
    min-height: 100vh;
    padding-top: 1.25rem;
  }

  .card-copy {
    max-width: 100%;
  }

  .stage {
    min-height: 25rem;
  }

  .snail {
    width: 10rem;
    grid-template-columns: 4rem 6rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}
```

- [ ] **Step 5: Commit this task if inside a Git repo**

Run only after repository setup is confirmed:

```bash
git add src/components/card.ts src/main.ts src/styles.css
git commit -m "feat: build disco snails card layout"
```

Expected: one commit is created. If Git is not initialized, skip this step and note it in the implementation log.

## Task 4: Add GSAP Disco Timeline

**Files:**
- Create: `src/animation/discoTimeline.ts`
- Modify: `src/main.ts`

- [ ] **Step 1: Create timeline module**

Create `./src/animation/discoTimeline.ts`:

```ts
import { gsap } from "gsap";
import type { MotionPreference } from "./reducedMotion";

export type DiscoTimeline = {
  play: () => void;
  replay: () => void;
  kill: () => void;
};

export function createDiscoTimeline(root: HTMLElement, motionPreference: MotionPreference): DiscoTimeline {
  const snails = Array.from(root.querySelectorAll<HTMLElement>("[data-snail]"));
  const shells = Array.from(root.querySelectorAll<HTMLElement>("[data-shell]"));
  const discoBall = root.querySelector<HTMLElement>("[data-disco-ball]");
  const headline = root.querySelector<HTMLElement>("h1");
  const message = root.querySelector<HTMLElement>(".birthday-message");
  const beams = Array.from(root.querySelectorAll<HTMLElement>(".light-beam"));

  if (!discoBall || !headline || !message || snails.length === 0 || shells.length === 0) {
    throw new Error("Missing required timeline targets.");
  }

  if (motionPreference.reduceMotion) {
    gsap.set([headline, message, discoBall, ...snails, ...shells, ...beams], {
      clearProps: "all",
      opacity: 1,
      x: 0,
      y: 0,
      rotation: 0,
      scale: 1,
    });

    return {
      play: () => undefined,
      replay: () => undefined,
      kill: () => undefined,
    };
  }

  const timeline = gsap.timeline({
    paused: true,
    defaults: {
      duration: 0.8,
      ease: "power2.out",
    },
  });

  timeline
    .set([headline, message], { opacity: 0, y: 24 })
    .set(snails, { opacity: 0, x: -80 })
    .set(shells, { rotation: -18, scale: 0.94 })
    .set(discoBall, { opacity: 0, y: -36, rotation: -20 })
    .set(beams, { opacity: 0 })
    .addLabel("lights")
    .to(discoBall, { opacity: 1, y: 0, rotation: 0, duration: 0.9 }, "lights")
    .to(beams, { opacity: 0.55, stagger: 0.12 }, "lights+=0.2")
    .to(headline, { opacity: 1, y: 0, duration: 0.7 }, "lights+=0.25")
    .to(message, { opacity: 1, y: 0, duration: 0.7 }, "lights+=0.45")
    .addLabel("snails")
    .to(snails, { opacity: 1, x: 0, stagger: 0.24, duration: 1 }, "snails")
    .to(shells, { rotation: 360, scale: 1, stagger: 0.16, duration: 1.25, ease: "back.out(1.8)" }, "snails+=0.12")
    .to(discoBall, { rotation: 360, duration: 4, repeat: -1, ease: "none" }, "snails+=0.35")
    .to(beams, { opacity: 0.25, duration: 0.8, repeat: -1, yoyo: true, stagger: 0.18 }, "snails+=0.35")
    .to(shells, { y: -6, duration: 0.42, repeat: -1, yoyo: true, stagger: 0.16, ease: "sine.inOut" }, "snails+=0.4");

  return {
    play: () => timeline.play(0),
    replay: () => timeline.restart(),
    kill: () => timeline.kill(),
  };
}
```

- [ ] **Step 2: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: fail because `src/particles/confetti.ts` does not exist yet. No GSAP type errors should appear.

- [ ] **Step 3: Commit this task if inside a Git repo**

Run only after repository setup is confirmed:

```bash
git add src/animation/discoTimeline.ts src/main.ts
git commit -m "feat: add disco snail animation timeline"
```

Expected: one commit is created. If Git is not initialized, skip this step and note it in the implementation log.

## Task 5: Add Canvas Sparkle And Confetti

**Files:**
- Create: `src/particles/confetti.ts`
- Create: `src/particles/confetti.test.ts`

- [ ] **Step 1: Create failing particle tests**

Create `./src/particles/confetti.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createFlakes } from "./confetti";

describe("createFlakes", () => {
  it("creates deterministic flakes inside the viewport", () => {
    const flakes = createFlakes({
      count: 3,
      width: 320,
      height: 480,
      seed: 42,
    });

    expect(flakes).toHaveLength(3);
    expect(flakes[0]).toMatchObject({
      x: expect.any(Number),
      y: expect.any(Number),
      radius: expect.any(Number),
      velocityX: expect.any(Number),
      velocityY: expect.any(Number),
      color: expect.any(String),
    });
    expect(flakes.every((flake) => flake.x >= 0 && flake.x <= 320)).toBe(true);
    expect(flakes.every((flake) => flake.y >= -480 && flake.y <= 0)).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests and verify failure**

Run:

```bash
npm run test -- src/particles/confetti.test.ts
```

Expected: fail because `src/particles/confetti.ts` does not exist.

- [ ] **Step 3: Implement canvas module**

Create `./src/particles/confetti.ts`:

```ts
import type { MotionPreference } from "../animation/reducedMotion";

export type Flake = {
  x: number;
  y: number;
  radius: number;
  velocityX: number;
  velocityY: number;
  color: string;
};

export type FlakeOptions = {
  count: number;
  width: number;
  height: number;
  seed: number;
};

export type SparkleCanvas = {
  burst: () => void;
  stop: () => void;
};

const colors = ["#7de7ff", "#ff4fd8", "#ffe66b", "#b7f7be", "#fffaf2"];

function seededRandom(seed: number): () => number {
  let value = seed % 2147483647;

  if (value <= 0) {
    value += 2147483646;
  }

  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

export function createFlakes(options: FlakeOptions): Flake[] {
  const random = seededRandom(options.seed);

  return Array.from({ length: options.count }, () => {
    const colorIndex = Math.floor(random() * colors.length);

    return {
      x: random() * options.width,
      y: -random() * options.height,
      radius: 2 + random() * 4,
      velocityX: -0.8 + random() * 1.6,
      velocityY: 1.2 + random() * 2.8,
      color: colors[colorIndex] ?? colors[0],
    };
  });
}

export function startSparkleCanvas(canvas: HTMLCanvasElement, motionPreference: MotionPreference): SparkleCanvas {
  const context = canvas.getContext("2d");

  if (!context || motionPreference.reduceMotion) {
    return {
      burst: () => undefined,
      stop: () => undefined,
    };
  }

  let animationFrame = 0;
  let flakes: Flake[] = [];

  function resize(): void {
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = Math.floor(window.innerWidth * pixelRatio);
    canvas.height = Math.floor(window.innerHeight * pixelRatio);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }

  function draw(): void {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);

    flakes = flakes
      .map((flake) => ({
        ...flake,
        x: flake.x + flake.velocityX,
        y: flake.y + flake.velocityY,
      }))
      .filter((flake) => flake.y < window.innerHeight + 12);

    for (const flake of flakes) {
      context.beginPath();
      context.fillStyle = flake.color;
      context.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
      context.fill();
    }

    animationFrame = window.requestAnimationFrame(draw);
  }

  function burst(): void {
    flakes = createFlakes({
      count: 90,
      width: window.innerWidth,
      height: window.innerHeight,
      seed: Date.now(),
    });
  }

  resize();
  burst();
  draw();
  window.addEventListener("resize", resize);

  return {
    burst,
    stop: () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
    },
  };
}
```

- [ ] **Step 4: Run unit tests and typecheck**

Run:

```bash
npm run test
npm run typecheck
```

Expected: unit tests and typecheck pass.

- [ ] **Step 5: Commit this task if inside a Git repo**

Run only after repository setup is confirmed:

```bash
git add src/particles/confetti.ts src/particles/confetti.test.ts
git commit -m "feat: add disco sparkle effects"
```

Expected: one commit is created. If Git is not initialized, skip this step and note it in the implementation log.

## Task 6: Add Generated Visual Assets

**Files:**
- Create: `src/assets/disco-snail-stage.webp`
- Create: `src/assets/shell-sparkle.webp`
- Create: `public/og-image.png`
- Modify: `src/components/card.ts`
- Modify: `src/styles.css`

- [ ] **Step 1: Generate the main WebP asset**

Create `./src/assets/disco-snail-stage.webp` with this image prompt:

```text
A playful disco birthday card illustration featuring two cheerful snails with glossy spiral shells on a tiny lit dance floor, mirror ball above, colorful light beams, glitter, warm funny mood, crisp web illustration, transparent-feeling dark background, no text, no logos.
```

Expected: asset is landscape, around `1600x1100`, under `700 KB` after compression.

- [ ] **Step 2: Generate the shell sparkle asset**

Create `./src/assets/shell-sparkle.webp` with this image prompt:

```text
Close-up decorative disco snail shell sparkle, glossy spiral shell with tiny reflected lights, playful birthday-card style, isolated object, no text, no logo.
```

Expected: asset is square, around `800x800`, under `300 KB` after compression.

- [ ] **Step 3: Generate social preview**

Create `./public/og-image.png` with this image prompt:

```text
Social preview image for a disco snails birthday card, two snails dancing under a mirror ball, bright playful party lighting, readable empty space in the middle for platform cropping, no text, no logo.
```

Expected: asset is `1200x630`, under `1 MB`.

- [ ] **Step 4: Import the main asset in the card**

Modify `./src/components/card.ts` to import and render the image:

```ts
import discoSnailStageUrl from "../assets/disco-snail-stage.webp";

export function renderBirthdayCard(root: HTMLElement): void {
  root.innerHTML = `
    <main class="page-shell" data-card-root>
      <canvas class="sparkle-canvas" data-sparkle-canvas aria-hidden="true"></canvas>

      <section class="birthday-card" aria-labelledby="birthday-title">
        <div class="card-copy">
          <p class="eyebrow">Disco Snails Present</p>
          <h1 id="birthday-title">Happy Birthday</h1>
          <p class="birthday-message">
            The snails polished their shells, found the mirror ball, and made it to the dance floor.
          </p>
          <div class="card-actions">
            <button class="icon-button replay-button" type="button" data-replay-animation aria-label="Replay animation">
              <span aria-hidden="true">↻</span>
            </button>
          </div>
        </div>

        <div class="stage" aria-label="Animated disco snails on a tiny dance floor">
          <img class="stage-art" src="${discoSnailStageUrl}" alt="" aria-hidden="true" />

          <div class="disco-ball" data-disco-ball aria-hidden="true">
            <span></span>
          </div>

          <div class="light-beam beam-one" aria-hidden="true"></div>
          <div class="light-beam beam-two" aria-hidden="true"></div>

          <figure class="snail snail-one" data-snail>
            <div class="snail-shell" data-shell></div>
            <div class="snail-body">
              <span class="snail-eye eye-left"></span>
              <span class="snail-eye eye-right"></span>
            </div>
          </figure>

          <figure class="snail snail-two" data-snail>
            <div class="snail-shell shell-alt" data-shell></div>
            <div class="snail-body body-alt">
              <span class="snail-eye eye-left"></span>
              <span class="snail-eye eye-right"></span>
            </div>
          </figure>

          <div class="dance-floor" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </section>
    </main>
  `;
}
```

- [ ] **Step 5: Add asset styling**

Append to `./src/styles.css` near `.stage`:

```css
.stage-art {
  position: absolute;
  inset: auto 0 3rem;
  z-index: -1;
  width: 100%;
  max-height: 72%;
  object-fit: contain;
  opacity: 0.62;
  filter: saturate(1.15) contrast(1.05);
}
```

- [ ] **Step 6: Run build**

Run:

```bash
npm run build
```

Expected: build passes and `dist/` contains hashed assets plus `index.html`.

- [ ] **Step 7: Commit this task if inside a Git repo**

Run only after repository setup is confirmed:

```bash
git add src/assets/disco-snail-stage.webp src/assets/shell-sparkle.webp public/og-image.png src/components/card.ts src/styles.css
git commit -m "feat: add disco snail visual assets"
```

Expected: one commit is created. If Git is not initialized, skip this step and note it in the implementation log.

## Task 7: Add Browser Tests

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/card.spec.ts`

- [ ] **Step 1: Install Chromium browser for Playwright**

Run:

```bash
npx playwright install chromium
```

Expected: Chromium installs successfully.

- [ ] **Step 2: Create Playwright config**

Create `./playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  webServer: {
    command: "npm run dev -- --host 127.0.0.1",
    url: "http://127.0.0.1:5173",
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: "http://127.0.0.1:5173",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "desktop-chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chromium",
      use: { ...devices["Pixel 7"] },
    },
  ],
});
```

- [ ] **Step 3: Create card tests**

Create `./tests/card.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("renders the birthday card", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("Disco Snails Birthday Card");
  await expect(page.getByRole("heading", { name: "Happy Birthday" })).toBeVisible();
  await expect(page.getByText("The snails polished their shells")).toBeVisible();
  await expect(page.getByRole("button", { name: "Replay animation" })).toBeVisible();
});

test("supports reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  await expect(page.locator("[data-card-root]")).toHaveAttribute("data-motion", "reduced");
});

test("keeps the stage visible on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const stage = page.locator(".stage");
  await expect(stage).toBeVisible();

  const box = await stage.boundingBox();
  expect(box?.width).toBeGreaterThan(300);
  expect(box?.height).toBeGreaterThan(250);
});
```

- [ ] **Step 4: Run browser tests**

Run:

```bash
npm run e2e
```

Expected: all Playwright tests pass in desktop and mobile projects.

- [ ] **Step 5: Commit this task if inside a Git repo**

Run only after repository setup is confirmed:

```bash
git add playwright.config.ts tests/card.spec.ts package.json package-lock.json
git commit -m "test: add birthday card browser checks"
```

Expected: one commit is created. If Git is not initialized, skip this step and note it in the implementation log.

## Task 8: Add GitHub Pages Deployment

**Files:**
- Create: `.github/workflows/pages.yml`

- [ ] **Step 1: Create deployment workflow**

Create `./.github/workflows/pages.yml`:

```yaml
name: Deploy GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          SITE_BASE: /birthday-card/

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Adjust `SITE_BASE` if deployment target differs**

For `https://<username>.github.io/birthday-card/`, keep:

```yaml
SITE_BASE: /birthday-card/
```

For a custom domain or `https://<username>.github.io/`, change it to:

```yaml
SITE_BASE: /
```

- [ ] **Step 3: Enable Pages in GitHub repository settings**

In GitHub repository settings, set Pages source to GitHub Actions. This is an external repository setting, so do it only after the user approves modifying GitHub settings.

- [ ] **Step 4: Run local build before pushing**

Run:

```bash
npm run build
```

Expected: build passes locally before any push triggers deployment.

- [ ] **Step 5: Commit this task if inside a Git repo**

Run only after repository setup is confirmed:

```bash
git add .github/workflows/pages.yml
git commit -m "chore: add github pages deployment"
```

Expected: one commit is created. If Git is not initialized, skip this step and note it in the implementation log.

## Task 9: Final Verification And Handoff

**Files:**
- Modify only files that fail verification.

- [ ] **Step 1: Run full verification**

Run:

```bash
npm run typecheck
npm run test
npm run build
npm run e2e
```

Expected: all commands exit with code `0`.

- [ ] **Step 2: Preview production build**

Run:

```bash
npm run preview -- --host 127.0.0.1
```

Expected: Vite prints a local preview URL. Open the URL and verify:

- The first viewport immediately reads as a birthday card.
- The disco snails theme is visible without scrolling.
- The replay button works.
- The stage remains framed on a narrow mobile viewport.
- Reduced-motion mode removes the major motion while preserving the layout.

- [ ] **Step 3: Inspect built assets**

Run:

```bash
find dist -maxdepth 2 -type f
```

Expected: output includes `dist/index.html`, hashed CSS, hashed JS, and generated image assets.

- [ ] **Step 4: Record deployment instructions**

Add a concise `README.md` only after implementation is complete. Use this content:

````markdown
# Disco Snails Birthday Card

A small static birthday card website built with Vite, TypeScript, and GSAP.

## Local Development

```bash
npm install
npm run dev
```

## Verification

```bash
npm run typecheck
npm run test
npm run build
npm run e2e
```

## Deployment

The site deploys to GitHub Pages through `.github/workflows/pages.yml`.

For a repository page at `https://<username>.github.io/birthday-card/`, keep `SITE_BASE` set to `/birthday-card/`.

For a custom domain or user page, set `SITE_BASE` to `/`.
````

- [ ] **Step 5: Commit final docs if inside a Git repo**

Run only after repository setup is confirmed:

```bash
git add README.md
git commit -m "docs: add birthday card setup notes"
```

Expected: one commit is created. If Git is not initialized, skip this step and note it in the implementation log.

## Risks And Mitigations

- Git state risk: the workspace is not a repository right now. Mitigation: Task 0 stops implementation until the user chooses a repo setup.
- GitHub Pages base-path risk: repo pages need `/birthday-card/`, while custom domains need `/`. Mitigation: the workflow owns `SITE_BASE`, and `vite.config.ts` reads it.
- Animation fatigue risk: disco effects can become unpleasant if every element moves. Mitigation: keep motion concentrated in the timeline, provide replay, and respect reduced-motion.
- Bundle and asset size risk: generated visuals can become large. Mitigation: WebP for app assets, PNG only for social preview, and explicit file-size checks.
- Dependency risk: use npm package installs, no CDN scripts, and commit `package-lock.json`.
- Privacy risk: no analytics, no forms, no external image requests, and no cookies.

## Acceptance Criteria

- The site runs locally with `npm run dev`.
- The production build completes with `npm run build`.
- The birthday card is usable at desktop and mobile widths.
- The disco snails theme is clear in the first viewport.
- Replay works without reloading the page.
- Reduced-motion users receive a stable layout with no major choreographed motion.
- Unit and browser tests pass.
- GitHub Pages deployment workflow exists and uses the correct `SITE_BASE` for the chosen hosting URL.

## Plan Self-Review

- Coverage: architecture, hosting, animation, assets, accessibility, tests, deployment, and final verification are covered.
- Scope: this is one small static website and does not need decomposition into separate subsystems.
- Ambiguity: repository setup and migration scope are gated before implementation.
- Consistency: selectors used in tests and animation modules match selectors rendered by `src/components/card.ts`.
- Marker scan: no unresolved implementation markers remain in this plan.
