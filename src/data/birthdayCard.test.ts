import { describe, expect, it } from "vitest";
import { buildSiteAssetPath } from "./birthdayCard";

describe("buildSiteAssetPath", () => {
  it("prefixes public asset paths with the configured site base", () => {
    expect(
      buildSiteAssetPath("audio/disco-snails.mp3", "/disco-snails-birthday/"),
    ).toBe("/disco-snails-birthday/audio/disco-snails.mp3");
  });

  it("keeps root deployments root-relative", () => {
    expect(buildSiteAssetPath("audio/disco-snails.mp3", "/")).toBe(
      "/audio/disco-snails.mp3",
    );
  });
});
