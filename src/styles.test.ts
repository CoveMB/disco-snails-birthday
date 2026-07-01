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
    expect(bubbleRule?.[0]).toContain("border-radius: 999px;");
    expect(bubbleRule?.[0]).toContain("background: #fffaf2;");
    expect(bubbleTailRule?.[0]).toContain("clip-path: polygon");
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
