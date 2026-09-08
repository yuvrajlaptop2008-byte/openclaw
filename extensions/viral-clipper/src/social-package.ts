import { SocialPostCopy } from "./types.js";

export function generateSocialPostPackages(
  title: string,
  summaryText: string,
  language = "en"
): SocialPostCopy[] {
  const cleanTitle = title.trim();
  const hashtags = ["#viral", "#reels", "#shorts", "#tiktok", "#contentcreator"];

  return [
    {
      platform: "instagram_reels",
      title: cleanTitle,
      caption: `${cleanTitle}\n\n${summaryText}\n\nDrop your thoughts below! 👇`,
      hashtags,
    },
    {
      platform: "youtube_shorts",
      title: `${cleanTitle} #Shorts`,
      caption: `${cleanTitle}\n\n${summaryText}`,
      hashtags: ["#Shorts", ...hashtags],
    },
    {
      platform: "tiktok",
      title: cleanTitle,
      caption: `${cleanTitle} - ${summaryText}`,
      hashtags: ["#fyp", "#foryou", ...hashtags],
    },
  ];
}
