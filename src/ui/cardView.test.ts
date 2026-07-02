import { describe, expect, it } from "vitest";
import { birthdayCardData } from "../data/birthdayCard";
import { createInitialAudioState } from "../domain/audioState";
import { createCardViewModel } from "../domain/cardViewModel";
import { renderBirthdayCard } from "./cardView";

describe("renderBirthdayCard", () => {
  it("renders the card shell, audio asset, and snail ID entry control", () => {
    const html = renderBirthdayCard(
      createCardViewModel(birthdayCardData, createInitialAudioState()),
    );

    expect(html).toContain("data-card-root");
    expect(html).toContain('data-entry-state="waiting"');
    expect(html).toContain('src="/audio/disco-snails.mp3"');
    expect(html).toContain("data-audio-toggle");
    expect(html).toContain("Show your snail ID to enter the disco");
    expect(html).toContain("Music starts after you show your snail ID.");
    expect(html).toContain('aria-pressed="false"');
    expect(html).toContain(
      "Music: Vulfmon &amp; Zachary Barker - Disco Snails",
    );
    expect(html).not.toContain("data-replay-animation");
    expect(html).not.toContain("party-panel");
    expect(html).not.toContain(
      "The slowest creatures in the garden somehow got the best table.",
    );
    expect(html).not.toContain(
      "Tonight has mirror-ball shell polish, tiny dance-floor ambition, and a suspicious amount of glitter for something moving this slowly.",
    );
  });

  it("renders the initial club-door entry scene alongside the disco layer", () => {
    const html = renderBirthdayCard(
      createCardViewModel(birthdayCardData, createInitialAudioState()),
    );

    expect(html).toContain("data-entry-scene");
    expect(html).toContain("data-club-door");
    expect(html).toMatch(
      /<div class="club-door-glow"><\/div>\s*<\/div>\s*<span class="club-door-sign" data-club-door-sign>SNAIL DISCO<\/span>/,
    );
    expect(html).toContain("data-security-snail");
    expect(html).toContain("data-security-speech-bubble");
    expect(html).toContain("data-security-entry-message");
    expect(html).toContain("data-security-exit-message");
    expect(html).toContain("ID please");
    expect(html).toContain("Bye, be well and sleep tight 💫");
    expect(html).toContain(
      'aria-label="Smiling snail security agent checking snail IDs"',
    );
    expect(html).toContain("data-disco-scene");
    expect(html).toContain("data-floor-snail-party");
    expect(html).not.toContain("security-badge");
  });

  it("marks the birthday transmission copy for reveal after the ID is shown", () => {
    const html = renderBirthdayCard(
      createCardViewModel(birthdayCardData, createInitialAudioState()),
    );

    expect(html).toContain('class="eyebrow entry-reveal entry-reveal-kicker"');
    expect(html).toContain('data-entry-reveal="kicker"');
    expect(html).toContain('class="entry-reveal entry-reveal-title"');
    expect(html).toContain('data-entry-reveal="title"');
  });

  it("renders the delayed snail-themed birthday card beside the entry copy", () => {
    const html = renderBirthdayCard(
      createCardViewModel(birthdayCardData, createInitialAudioState()),
    );

    expect(html).toContain('data-message-state="intro"');
    expect(html).toContain("data-intro-copy");
    expect(html).toContain("data-birthday-message-card");
    expect(html).toContain("data-exit-disco");
    expect(html).toContain("Exit disco");
    expect(html).toContain("Thanks for your disco moves little snail 🪩");
    expect(html).toContain("creativity all around you ✨");
    expect(html).toContain("Get all you&#039;re wishing for, you deserve it 🙌");
    expect(html).toContain("Love 💖");
    expect(html).not.toContain("data-birthday-card-snail");
    expect(html).not.toContain("birthday-message-art");
  });

  it("renders floor-level code-native snails instead of the static hero image or oversized snails", () => {
    const html = renderBirthdayCard(
      createCardViewModel(birthdayCardData, createInitialAudioState()),
    );

    expect(html).toContain("data-snail-stage");
    expect(html).toContain("data-floor-snail-party");
    expect(html).toContain("data-floor-dancing-snail");
    expect(html).toContain("data-floor-snail-shell");
    expect(html).toContain("data-floor-snail-facing");
    expect(html).toContain("data-floor-snail-spin");
    expect(html).not.toContain('class="snail-stage"');
    expect(html).not.toContain("snail-lead");
    expect(html).not.toContain("snail-hype");
    expect(html).not.toContain("data-mini-snail");
    expect(html).not.toContain("data-hero-art");
    expect(html).not.toContain("<img");
  });

  it("renders a decorative floor-snail crowd that can start from both sides", () => {
    const html = renderBirthdayCard(
      createCardViewModel(birthdayCardData, createInitialAudioState()),
    );

    expect(html.match(/data-floor-snail="/g)).toHaveLength(30);
    expect(html.match(/data-floor-snail-side="left"/g)).toHaveLength(15);
    expect(html.match(/data-floor-snail-side="right"/g)).toHaveLength(15);
    expect(html.match(/data-floor-snail-wave="opening"/g)).toHaveLength(6);
    expect(html.match(/data-floor-snail-wave="late"/g)).toHaveLength(14);
    expect(html.match(/data-floor-snail-facing/g)).toHaveLength(30);
    expect(html.match(/data-floor-snail-spin/g)).toHaveLength(30);
  });

  it("renders varied shell color variables for the floor-snail crowd", () => {
    const html = renderBirthdayCard(
      createCardViewModel(birthdayCardData, createInitialAudioState()),
    );
    const shellPrimaryColors =
      html.match(/--snail-shell-primary: hsl\([^)]+\)/g) ?? [];
    const uniqueShellPrimaryColors = new Set(shellPrimaryColors);

    expect(shellPrimaryColors).toHaveLength(30);
    expect(uniqueShellPrimaryColors.size).toBeGreaterThan(20);
  });
});
