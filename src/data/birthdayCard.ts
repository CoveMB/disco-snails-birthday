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
};

export const birthdayCardData: BirthdayCardData = {
  hero: {
    kicker: "Disco Snails Birthday Transmission",
    title: "Happy Birthday",
  },
  track: {
    title: "Disco Snails",
    artist: "Vulfmon & Zachary Barker",
    audioSrc: "/audio/disco-snails.mp3",
  },
  art: {
    heroImageSrc: "/assets/disco-snails-hero.png",
    heroImageAlt: "Two glossy disco snails dancing under a mirror ball.",
  },
};
