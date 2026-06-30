import type { CardViewModel } from "../domain/cardViewModel";
import { escapeHtml } from "./escapeHtml";

function renderDancingSnail(className: string, shellClassName: string): string {
  return `
    <svg class="dancing-snail ${className}" data-dancing-snail viewBox="0 0 260 150" role="img" aria-label="A disco snail dancing">
      <defs>
        <radialGradient id="${className}-shell" cx="46%" cy="44%" r="58%">
          <stop offset="0%" stop-color="#fffaf2" />
          <stop offset="22%" stop-color="#ffe66b" />
          <stop offset="47%" stop-color="#ff4fd8" />
          <stop offset="72%" stop-color="#7de7ff" />
          <stop offset="100%" stop-color="#2a1735" />
        </radialGradient>
        <linearGradient id="${className}-body" x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset="0%" stop-color="#9fffc8" />
          <stop offset="100%" stop-color="#f7d06b" />
        </linearGradient>
      </defs>

      <path class="snail-shadow" d="M24 130 C52 113 198 112 236 130 C210 144 54 146 24 130Z" />

      <g class="snail-body-group" data-snail-body>
        <path
          class="snail-body-fill"
          d="M70 103 C82 74 120 68 154 82 L207 104 C223 111 232 119 232 128 C232 137 220 142 198 142 L64 142 C45 142 31 136 31 126 C31 116 46 107 70 103Z"
          fill="url(#${className}-body)"
        />
        <path class="snail-mouth" d="M197 124 C204 130 213 130 220 123" />

        <g class="snail-antennae" data-snail-antennae>
          <path d="M190 101 C194 73 207 56 228 48" />
          <path d="M210 108 C218 79 233 67 250 62" />
          <circle class="snail-eye" cx="229" cy="47" r="8" />
          <circle class="snail-eye" cx="251" cy="61" r="8" />
          <circle class="snail-pupil" cx="231" cy="48" r="3" />
          <circle class="snail-pupil" cx="253" cy="62" r="3" />
        </g>
      </g>

      <g class="snail-shell ${shellClassName}" data-snail-shell>
        <circle cx="88" cy="82" r="52" fill="url(#${className}-shell)" />
        <path d="M88 82 m-33 0 a33 33 0 1 0 66 0 a25 25 0 1 0-50 0 a17 17 0 1 0 34 0 a9 9 0 1 0-18 0" />
        <path class="shell-spark" d="M74 34 L82 52 L101 57 L84 66 L79 85 L68 68 L49 63 L66 52Z" />
      </g>
    </svg>
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
