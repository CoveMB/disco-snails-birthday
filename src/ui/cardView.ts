import type { CardViewModel } from "../domain/cardViewModel";
import { escapeHtml } from "./escapeHtml";

type DancingSnailOptions = {
  ariaLabel?: string;
  antennaeDataAttribute?: string;
  bodyDataAttribute?: string;
  gradientId?: string;
  shellDataAttribute?: string;
  snailDataAttribute?: string;
};

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

function renderDancingSnail(className: string, shellClassName: string, options: DancingSnailOptions = {}): string {
  const gradientId = options.gradientId ?? className;
  const snailDataAttribute = options.snailDataAttribute ?? "data-dancing-snail";
  const bodyDataAttribute = options.bodyDataAttribute ?? "data-snail-body";
  const shellDataAttribute = options.shellDataAttribute ?? "data-snail-shell";
  const antennaeDataAttribute = options.antennaeDataAttribute ?? "data-snail-antennae";
  const ariaLabel = options.ariaLabel ?? "A disco snail dancing";

  return `
    <svg class="dancing-snail ${className}" ${snailDataAttribute} viewBox="0 0 260 150" role="img" aria-label="${ariaLabel}">
      <defs>
        <radialGradient id="${gradientId}-shell" cx="46%" cy="44%" r="58%">
          <stop offset="0%" stop-color="#fffaf2" />
          <stop offset="22%" style="stop-color: var(--snail-shell-primary, #ffe66b);" />
          <stop offset="47%" style="stop-color: var(--snail-shell-secondary, #ff4fd8);" />
          <stop offset="72%" style="stop-color: var(--snail-shell-accent, #7de7ff);" />
          <stop offset="100%" style="stop-color: var(--snail-shell-shadow, #2a1735);" />
        </radialGradient>
        <linearGradient id="${gradientId}-body" x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset="0%" stop-color="#9fffc8" />
          <stop offset="100%" stop-color="#f7d06b" />
        </linearGradient>
      </defs>

      <path class="snail-shadow" d="M24 130 C52 113 198 112 236 130 C210 144 54 146 24 130Z" />

      <g class="snail-body-group" ${bodyDataAttribute}>
        <path
          class="snail-body-fill"
          d="M70 103 C82 74 120 68 154 82 L207 104 C223 111 232 119 232 128 C232 137 220 142 198 142 L64 142 C45 142 31 136 31 126 C31 116 46 107 70 103Z"
          fill="url(#${gradientId}-body)"
        />
        <path class="snail-mouth" d="M197 124 C204 130 213 130 220 123" />

        <g class="snail-antennae" ${antennaeDataAttribute}>
          <path d="M190 101 C194 73 207 56 228 48" />
          <path d="M210 108 C218 79 233 67 250 62" />
          <circle class="snail-eye" cx="229" cy="47" r="8" />
          <circle class="snail-eye" cx="251" cy="61" r="8" />
          <circle class="snail-pupil" cx="231" cy="48" r="3" />
          <circle class="snail-pupil" cx="253" cy="62" r="3" />
        </g>
      </g>

      <g class="snail-shell ${shellClassName}" ${shellDataAttribute}>
        <circle cx="88" cy="82" r="52" fill="url(#${gradientId}-shell)" />
        <path d="M88 82 m-33 0 a33 33 0 1 0 66 0 a25 25 0 1 0-50 0 a17 17 0 1 0 34 0 a9 9 0 1 0-18 0" />
        <path class="shell-spark" d="M74 34 L82 52 L101 57 L84 66 L79 85 L68 68 L49 63 L66 52Z" />
      </g>
    </svg>
  `;
}

function renderFloorSnail(snail: FloorSnail): string {
  const snailNumber = String(snail.id).padStart(2, "0");
  const shellSecondaryHue = (snail.hue + 118) % 360;
  const shellAccentHue = (snail.hue + 214) % 360;
  const shellShadowHue = (snail.hue + 268) % 360;

  return `
    <span
      class="floor-snail"
      data-floor-snail="${snailNumber}"
      data-floor-snail-side="${snail.side}"
      data-floor-snail-wave="${snail.wave}"
      style="--floor-lane-y: ${snail.laneY}%; --floor-rest-scale: ${snail.restScale}; --floor-hue: ${snail.hue}deg; --snail-shell-primary: hsl(${snail.hue} 92% 62%); --snail-shell-secondary: hsl(${shellSecondaryHue} 88% 60%); --snail-shell-accent: hsl(${shellAccentHue} 90% 68%); --snail-shell-shadow: hsl(${shellShadowHue} 58% 24%);"
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
    </span>
  `;
}

function renderFloorSnailParty(): string {
  return `
    <div class="floor-snail-party" data-floor-snail-party aria-hidden="true">
      ${floorSnails.map(renderFloorSnail).join("")}
    </div>
  `;
}

function renderSecuritySnail(): string {
  return `
    <div class="security-snail" data-security-snail>
      ${renderDancingSnail("security-dancing-snail", "security-shell", {
        ariaLabel: "Smiling snail security agent checking snail IDs",
        gradientId: "security-snail",
        snailDataAttribute: "data-security-snail-svg",
      })}
      <span class="security-speech-bubble" data-security-speech-bubble aria-hidden="true">ID please</span>
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
        </div>
        <span class="club-door-sign" data-club-door-sign>SNAIL DISCO</span>
        ${renderSecuritySnail()}
      </div>
    </div>
  `;
}

export function renderBirthdayCard(viewModel: CardViewModel): string {
  return `
    <main class="page-shell" data-card-root data-entry-state="waiting">
      <canvas class="confetti-canvas" data-confetti-canvas aria-hidden="true"></canvas>

      <section class="hero" aria-labelledby="birthday-title">
        <div class="hero-copy" data-hero-copy>
          <p class="eyebrow entry-reveal entry-reveal-kicker" data-entry-reveal="kicker">${escapeHtml(viewModel.hero.kicker)}</p>
          <h1 id="birthday-title" class="entry-reveal entry-reveal-title" data-entry-reveal="title">${escapeHtml(viewModel.hero.title)}</h1>

          <div class="action-row" aria-label="Birthday card controls">
            <button
              class="primary-action"
              type="button"
              data-audio-toggle
              aria-pressed="${viewModel.audioControl.ariaPressed}"
              ${viewModel.audioControl.disabled ? "disabled" : ""}
            >
              <span class="play-glyph" aria-hidden="true"></span>
              <span data-audio-label>${escapeHtml(viewModel.audioControl.label)}</span>
            </button>
          </div>

          <p class="audio-status" data-audio-status role="status">
            ${escapeHtml(viewModel.audioControl.statusText)}
          </p>
        </div>

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
      </section>

      <footer class="music-credit" aria-label="Music credit">
        <small>Music: ${escapeHtml(viewModel.musicCredit)}</small>
      </footer>

      <audio
        data-disco-audio
        src="${escapeHtml(viewModel.track.audioSrc)}"
        preload="auto"
      ></audio>
    </main>
  `;
}
