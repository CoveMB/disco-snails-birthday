import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const styles = readFileSync(new URL("./styles.css", import.meta.url), "utf8");

const discoRoomSelectors = [
  ".disco-scene::after",
  ".dance-floor",
  ".floor-snail-party",
] as const;

describe("disco room layout", () => {
  it("keeps the floor visuals and snail movement area inset from the sides", () => {
    expect(styles).toContain("--disco-room-side-inset: 12%;");
    expect(styles).toContain("--disco-room-mobile-side-inset: 8%;");

    for (const selector of discoRoomSelectors) {
      const rule = styles.match(new RegExp(`${selector.replaceAll(".", "\\.").replace("::", "::")} \\{[^}]+\\}`));

      expect(rule?.[0]).toContain("left: var(--disco-room-side-inset);");
      expect(rule?.[0]).toContain("right: var(--disco-room-side-inset);");
      expect(rule?.[0]).toContain("width: auto;");
    }
  });
});

describe("entry security snail", () => {
  it("styles the ID request as a comic speech bubble with a tail", () => {
    const bubbleRule = styles.match(/\.security-speech-bubble \{[^}]+\}/);
    const bubbleTailRule = styles.match(/\.security-speech-bubble::after \{[^}]+\}/);

    expect(bubbleRule).not.toBeNull();
    expect(bubbleTailRule).not.toBeNull();
    expect(bubbleRule?.[0]).toContain("top: -2.1rem;");
    expect(bubbleRule?.[0]).toContain("border-radius: 999px;");
    expect(bubbleRule?.[0]).toContain("background: #fffaf2;");
    expect(bubbleTailRule?.[0]).toContain("clip-path: polygon");
  });

  it("swaps the ID request for the goodbye message after disco exit", () => {
    const exitMessageRule = styles.match(/\.security-speech-exit \{[^}]+\}/);
    const hiddenEntryMessageRule = styles.match(/\[data-entry-state="exited"\] \.security-speech-entry \{[^}]+\}/);
    const visibleExitMessageRule = styles.match(/\[data-entry-state="exited"\] \.security-speech-exit \{[^}]+\}/);

    expect(exitMessageRule?.[0]).toContain("display: none;");
    expect(hiddenEntryMessageRule?.[0]).toContain("display: none;");
    expect(visibleExitMessageRule?.[0]).toContain("display: inline;");
  });
});

describe("entry club door sign", () => {
  it("places the larger Snail Disco sign above the door frame", () => {
    const sceneRule = styles.match(/\.club-door-scene \{[^}]+\}/);
    const frameRule = styles.match(/\.club-door-frame \{[^}]+\}/);
    const signRule = styles.match(/\.club-door-sign \{[^}]+\}/);

    expect(sceneRule?.[0]).toContain("--club-door-width: min(19rem, 62vw);");
    expect(frameRule?.[0]).toContain("width: var(--club-door-width);");
    expect(signRule?.[0]).toContain("bottom: calc(var(--club-door-bottom) + var(--club-door-height) + 0.55rem);");
    expect(signRule?.[0]).toContain("width: var(--club-door-width);");
    expect(signRule?.[0]).toContain("font-size: clamp(0.95rem, 2.4vw, 1.35rem);");
  });
});

describe("entry birthday copy reveal", () => {
  it("hides the birthday copy before ID entry and reveals it after entry", () => {
    const hiddenRule = styles.match(/\.entry-reveal \{[^}]+\}/);
    const visibleRule = styles.match(/\[data-entry-state="entered"\] \.entry-reveal \{[^}]+\}/);
    const titleDelayRule = styles.match(/\.entry-reveal-title \{[^}]+\}/);

    expect(hiddenRule?.[0]).toContain("opacity: 0;");
    expect(hiddenRule?.[0]).toContain("visibility: hidden;");
    expect(hiddenRule?.[0]).toContain("transform: translateY(0.9rem) scale(0.98);");
    expect(visibleRule?.[0]).toContain("opacity: 1;");
    expect(visibleRule?.[0]).toContain("visibility: visible;");
    expect(visibleRule?.[0]).toContain("transform: translateY(0) scale(1);");
    expect(titleDelayRule?.[0]).toContain("transition-delay: 0.12s;");
  });
});

describe("delayed birthday card reveal", () => {
  it("cross-fades the intro copy into the lower-contrast snail birthday card", () => {
    const heroCopyRule = styles.match(/\.hero-copy \{[^}]+\}/);
    const introCopyRule = styles.match(/\.intro-copy \{[^}]+\}/);
    const birthdayCardRule = styles.match(/\.birthday-message-card \{[^}]+\}/);
    const birthdayCardAccentRule = styles.match(/\.birthday-message-card::before \{[^}]+\}/);
    const birthdayCardActionRule = styles.match(/\.birthday-message-actions \.primary-action \{[^}]+\}/);
    const hiddenIntroRule = styles.match(/\[data-message-state="card"\] \.intro-copy \{[^}]+\}/);
    const visibleCardRule = styles.match(/\[data-message-state="card"\] \.birthday-message-card \{[^}]+\}/);

    expect(heroCopyRule?.[0]).toContain("display: grid;");
    expect(introCopyRule?.[0]).toContain("grid-area: 1 / 1;");
    expect(introCopyRule?.[0]).toContain("transition:");
    expect(birthdayCardRule?.[0]).toContain("grid-area: 1 / 1;");
    expect(birthdayCardRule?.[0]).toContain("opacity: 0;");
    expect(birthdayCardRule?.[0]).toContain("pointer-events: none;");
    expect(birthdayCardRule?.[0]).toContain("color: #fffaf2;");
    expect(birthdayCardRule?.[0]).toContain("background:");
    expect(birthdayCardRule?.[0]).toContain("rgba(19, 18, 24, 0.72)");
    expect(birthdayCardRule?.[0]).toContain("inset 0 0 0 1px rgba(255, 255, 255, 0.1);");
    expect(birthdayCardAccentRule?.[0]).toContain("height: 0.12rem;");
    expect(birthdayCardAccentRule?.[0]).toContain("rgba(125, 231, 255, 0.38)");
    expect(birthdayCardActionRule?.[0]).toContain("background: rgba(255, 230, 107, 0.12);");
    expect(styles).not.toContain(".birthday-message-art");
    expect(styles).not.toContain(".birthday-card-snail");
    expect(styles).not.toContain("border: 1px dashed");
    expect(styles).not.toContain("background: rgba(255, 250, 242, 0.94);");
    expect(hiddenIntroRule?.[0]).toContain("opacity: 0;");
    expect(visibleCardRule?.[0]).toContain("opacity: 1;");
    expect(visibleCardRule?.[0]).toContain("pointer-events: auto;");
  });

  it("uses modern system type for the card message", () => {
    const messageLineRule = styles.match(/\.birthday-message-line \{[^}]+\}/);

    expect(messageLineRule?.[0]).toContain("font-family: inherit;");
    expect(messageLineRule?.[0]).toContain("color: rgba(255, 250, 242, 0.9);");
  });
});

describe("exit disco transition", () => {
  it("hides the copy layer when returning to the entry door", () => {
    const exitedHeroRule = styles.match(/\[data-entry-state="exited"\] \.hero-copy \{[^}]+\}/);

    expect(exitedHeroRule?.[0]).toContain("opacity: 0;");
    expect(exitedHeroRule?.[0]).toContain("visibility: hidden;");
    expect(exitedHeroRule?.[0]).toContain("pointer-events: none;");
  });
});
