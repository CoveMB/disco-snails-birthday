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

  it("renders code-native dancing snails instead of the static hero image", () => {
    const html = renderBirthdayCard(createCardViewModel(birthdayCardData, createInitialAudioState()));

    expect(html).toContain('data-snail-stage');
    expect(html).toContain('data-dancing-snail');
    expect(html).toContain('data-snail-shell');
    expect(html).not.toContain('data-hero-art');
    expect(html).not.toContain("<img");
  });
});
