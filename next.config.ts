import type { NextConfig } from "next";

const config: NextConfig = {
  // The dev badge would sit on top of the phone frame during a pitch.
  devIndicators: false,
  images: { formats: ["image/avif", "image/webp"], qualities: [62, 75] },
};

export default config;
