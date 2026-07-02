export type BirthdayCardData = {
  hero: {
    kicker: string;
    title: string;
  };
  track: {
    title: string;
    artist: string;
    audioSrc: string;
  };
  art: {
    heroImageSrc: string;
    heroImageAlt: string;
  };
  birthdayMessage: {
    lines: string[];
  };
};

export function buildSiteAssetPath(assetPath: string, siteBase = import.meta.env.BASE_URL): string {
  const normalizedBase = siteBase.length === 0 || siteBase.endsWith("/") ? siteBase : `${siteBase}/`;
  const normalizedAssetPath = assetPath.replace(/^\/+/, "");

  return `${normalizedBase}${normalizedAssetPath}`;
}

export const birthdayCardData: BirthdayCardData = {
  hero: {
    kicker: "Disco Snails Birthday Transmission",
    title: "Happy Birthday",
  },
  track: {
    title: "Disco Snails",
    artist: "Vulfmon & Zachary Barker",
    audioSrc: buildSiteAssetPath("audio/disco-snails.mp3"),
  },
  art: {
    heroImageSrc: buildSiteAssetPath("assets/disco-snails-hero.png"),
    heroImageAlt: "Two glossy disco snails dancing under a mirror ball.",
  },
  birthdayMessage: {
    lines: [
      "Thanks for your disco moves little snail 🪩",
      "You are such a wonderful little being bringing care and creativity all around you ✨",
      "Get all you're wishing for, you deserve it 🙌",
      "Love 💖",
    ],
  },
};
