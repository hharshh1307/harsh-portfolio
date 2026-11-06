import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "i.scdn.co" }, // Spotify album art and artist photos
    ],
  },
  async redirects() {
    return [
      { source: "/about", destination: "/work", permanent: true },
      { source: "/hobbies", destination: "/travel", permanent: true },
      { source: "/chat", destination: "/ask", permanent: true },
      { source: "/playground", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
