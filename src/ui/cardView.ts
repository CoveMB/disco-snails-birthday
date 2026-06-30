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

type MiniSnailWave = "opening" | "rush" | "pileup";

type MiniSnail = {
  hue: number;
  id: number;
  restRotation: number;
  restScale: number;
  restX: number;
  restY: number;
  wave: MiniSnailWave;
};

const miniSnails: MiniSnail[] = [
  { id: 1, wave: "opening", restX: -34, restY: 14, restScale: 0.86, restRotation: -12, hue: 0 },
  { id: 2, wave: "opening", restX: -18, restY: -34, restScale: 0.72, restRotation: 18, hue: 70 },
  { id: 3, wave: "opening", restX: 10, restY: -44, restScale: 0.78, restRotation: -24, hue: 135 },
  { id: 4, wave: "opening", restX: 34, restY: -20, restScale: 0.68, restRotation: 16, hue: 205 },
  { id: 5, wave: "opening", restX: 46, restY: 24, restScale: 0.84, restRotation: -8, hue: 285 },
  { id: 6, wave: "opening", restX: -6, restY: 32, restScale: 0.76, restRotation: 10, hue: 330 },
  { id: 7, wave: "rush", restX: -58, restY: -4, restScale: 0.62, restRotation: 28, hue: 35 },
  { id: 8, wave: "rush", restX: 60, restY: -8, restScale: 0.6, restRotation: -30, hue: 100 },
  { id: 9, wave: "rush", restX: -50, restY: 46, restScale: 0.7, restRotation: -18, hue: 160 },
  { id: 10, wave: "rush", restX: 58, restY: 50, restScale: 0.72, restRotation: 22, hue: 230 },
  { id: 11, wave: "rush", restX: -74, restY: 26, restScale: 0.58, restRotation: 12, hue: 300 },
  { id: 12, wave: "rush", restX: 78, restY: 20, restScale: 0.6, restRotation: -16, hue: 15 },
  { id: 13, wave: "rush", restX: -36, restY: 70, restScale: 0.74, restRotation: 26, hue: 80 },
  { id: 14, wave: "rush", restX: 30, restY: 72, restScale: 0.76, restRotation: -20, hue: 145 },
  { id: 15, wave: "rush", restX: -12, restY: 82, restScale: 0.64, restRotation: 8, hue: 215 },
  { id: 16, wave: "rush", restX: 12, restY: -78, restScale: 0.56, restRotation: -8, hue: 275 },
  { id: 17, wave: "rush", restX: -86, restY: -36, restScale: 0.54, restRotation: -32, hue: 340 },
  { id: 18, wave: "rush", restX: 88, restY: -42, restScale: 0.54, restRotation: 34, hue: 55 },
  { id: 19, wave: "pileup", restX: -28, restY: 104, restScale: 0.88, restRotation: -22, hue: 120 },
  { id: 20, wave: "pileup", restX: -8, restY: 108, restScale: 0.92, restRotation: 18, hue: 185 },
  { id: 21, wave: "pileup", restX: 14, restY: 106, restScale: 0.9, restRotation: -12, hue: 255 },
  { id: 22, wave: "pileup", restX: 34, restY: 110, restScale: 0.86, restRotation: 24, hue: 315 },
  { id: 23, wave: "pileup", restX: -42, restY: 124, restScale: 0.78, restRotation: 10, hue: 25 },
  { id: 24, wave: "pileup", restX: -18, restY: 126, restScale: 0.84, restRotation: -30, hue: 95 },
  { id: 25, wave: "pileup", restX: 6, restY: 124, restScale: 0.82, restRotation: 32, hue: 155 },
  { id: 26, wave: "pileup", restX: 30, restY: 128, restScale: 0.78, restRotation: -26, hue: 225 },
  { id: 27, wave: "pileup", restX: -30, restY: 142, restScale: 0.72, restRotation: 20, hue: 290 },
  { id: 28, wave: "pileup", restX: -4, restY: 144, restScale: 0.78, restRotation: -14, hue: 350 },
  { id: 29, wave: "pileup", restX: 22, restY: 142, restScale: 0.74, restRotation: 28, hue: 60 },
  { id: 30, wave: "pileup", restX: 46, restY: 138, restScale: 0.68, restRotation: -18, hue: 170 },
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
          <stop offset="22%" stop-color="#ffe66b" />
          <stop offset="47%" stop-color="#ff4fd8" />
          <stop offset="72%" stop-color="#7de7ff" />
          <stop offset="100%" stop-color="#2a1735" />
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

function renderMiniSnail(snail: MiniSnail): string {
  const snailNumber = String(snail.id).padStart(2, "0");

  return `
    <span
      class="mini-snail"
      data-mini-snail="${snailNumber}"
      data-mini-snail-wave="${snail.wave}"
      style="--mini-rest-x: ${snail.restX}%; --mini-rest-y: ${snail.restY}%; --mini-rest-scale: ${snail.restScale}; --mini-rest-rotation: ${snail.restRotation}deg; --mini-hue: ${snail.hue}deg;"
    >
      ${renderDancingSnail(`mini-dancing-snail mini-dancing-snail-${snailNumber}`, "mini-shell", {
        antennaeDataAttribute: "data-mini-snail-antennae",
        ariaLabel: "A tiny disco snail dancing",
        bodyDataAttribute: "data-mini-snail-body",
        gradientId: `mini-snail-${snailNumber}`,
        shellDataAttribute: "data-mini-snail-shell",
        snailDataAttribute: "data-mini-dancing-snail",
      })}
    </span>
  `;
}

function renderMiniSnailParty(): string {
  return `
    <div class="mini-snail-party" data-mini-snail-party aria-hidden="true">
      ${miniSnails.map(renderMiniSnail).join("")}
    </div>
  `;
}

export function renderBirthdayCard(viewModel: CardViewModel): string {
  return `
    <main class="page-shell" data-card-root>
      <canvas class="confetti-canvas" data-confetti-canvas aria-hidden="true"></canvas>

      <section class="hero" aria-labelledby="birthday-title">
        <div class="hero-copy" data-hero-copy>
          <p class="eyebrow">${escapeHtml(viewModel.hero.kicker)}</p>
          <h1 id="birthday-title">${escapeHtml(viewModel.hero.title)}</h1>

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
          <div class="mirror-ball" data-mirror-ball aria-hidden="true">
            <span></span>
          </div>

          ${renderMiniSnailParty()}

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

          <div class="snail-stage" aria-hidden="true">
            ${renderDancingSnail("snail-lead", "shell-lead")}
            ${renderDancingSnail("snail-hype", "shell-hype")}
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
