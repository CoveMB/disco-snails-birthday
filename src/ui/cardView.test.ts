import { describe, expect, it } from "vitest";
import { createInitialAudioState } from "../domain/audioState";
import { createCardViewModel } from "../domain/cardViewModel";
import { birthdayCardData } from "../data/birthdayCard";
import { renderBirthdayCard } from "./cardView";

describe("renderBirthdayCard", () => {
  it("renders the card shell, audio asset, and controlled play button", () => {
    const html = renderBirthdayCard(createCardViewModel(birthdayCardData, createInitialAudioState()));

    expect(html).toContain('data-card-root');
    expect(html).toContain('src="/audio/disco-snails.mp3"');
    expect(html).toContain('data-audio-toggle');
    expect(html).toContain('aria-pressed="false"');
    expect(html).toContain("Music: Vulfmon &amp; Zachary Barker - Disco Snails");
    expect(html).not.toContain('data-replay-animation');
    expect(html).not.toContain('party-panel');
    expect(html).not.toContain("The slowest creatures in the garden somehow got the best table.");
    expect(html).not.toContain(
      "Tonight has mirror-ball shell polish, tiny dance-floor ambition, and a suspicious amount of glitter for something moving this slowly.",
    );
  });

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

  it("renders varied shell color variables for the floor-snail crowd", () => {
    const html = renderBirthdayCard(createCardViewModel(birthdayCardData, createInitialAudioState()));
    const shellPrimaryColors = html.match(/--snail-shell-primary: hsl\([^)]+\)/g) ?? [];
    const uniqueShellPrimaryColors = new Set(shellPrimaryColors);

    expect(shellPrimaryColors).toHaveLength(30);
    expect(uniqueShellPrimaryColors.size).toBeGreaterThan(20);
  });
});
