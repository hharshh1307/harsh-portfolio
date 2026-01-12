"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Music, Camera, Flame, ExternalLink } from "lucide-react";
import { mockMCPData } from "@/lib/data";

interface SpotifyTrack {
  isPlaying: boolean;
  title: string;
  artist: string;
  album: string;
  albumImageUrl: string;
  songUrl: string;
}

const tabs = [
  { id: "football", label: "Football", icon: Trophy },
  { id: "music", label: "Music", icon: Music },
  { id: "other", label: "Other", icon: Camera },
];

const footballOpinions = [
  {
    topic: "Best Team",
    opinion: "Barcelona - The philosophy of beautiful football and La Masia academy is unmatched.",
  },
  {
    topic: "GOAT",
    opinion: "Messi, without question. His vision, dribbling, and consistency over 15+ years makes him the greatest.",
  },
  {
    topic: "Best Match Ever",
    opinion: "Barcelona 6-1 PSG (2017) - The greatest comeback in Champions League history.",
  },
  {
    topic: "Current Take",
    opinion: "Lamine Yamal is the real deal. At 16, he's already showing generational talent.",
  },
  {
    topic: "El Clasico",
    opinion: "Always a special day. The rivalry transcends football - it's culture, history, and pride.",
  },
];

const playlists = [
  { name: "Coding Flow", tracks: 48, mood: "Focus" },
  { name: "Morning Energy", tracks: 32, mood: "Upbeat" },
  { name: "Late Night Vibes", tracks: 56, mood: "Chill" },
  { name: "Workout Beast", tracks: 24, mood: "Intense" },
];

const otherInterests = [
  {
    title: "Photography",
    description: "Capturing moments during travels and daily life. Love street photography and landscapes.",
    image: "/images/photography.jpg",
  },
  {
    title: "Gaming",
    description: "Strategy games and football simulators. FIFA and Football Manager are my go-tos.",
    image: "/images/gaming.jpg",
  },
  {
    title: "Travel",
    description: "Explored 15+ countries. Dream destinations: Japan and Iceland.",
    image: "/images/travel.jpg",
  },
  {
    title: "Coffee",
    description: "Self-proclaimed coffee enthusiast. Currently perfecting my pour-over technique.",
    image: "/images/coffee.jpg",
  },
];

// Photography gallery - replace with your actual photos
const photographyGallery = [
  { src: "/images/gallery/photo1.jpg", caption: "Sunset in Barcelona" },
  { src: "/images/gallery/photo2.jpg", caption: "Street photography" },
  { src: "/images/gallery/photo3.jpg", caption: "Mountain trek" },
  { src: "/images/gallery/photo4.jpg", caption: "City lights" },
  { src: "/images/gallery/photo5.jpg", caption: "Nature escape" },
  { src: "/images/gallery/photo6.jpg", caption: "Urban exploration" },
];

export default function HobbiesPage() {
  const [activeTab, setActiveTab] = useState("football");
  const [nowPlaying, setNowPlaying] = useState<SpotifyTrack | null>(null);
  const [spotifyLoading, setSpotifyLoading] = useState(true);

  // Fetch Spotify now playing
  useEffect(() => {
    async function fetchNowPlaying() {
      try {
        const res = await fetch("/api/spotify/now-playing");
        if (res.ok) {
          const data = await res.json();
          setNowPlaying(data);
        }
      } catch (error) {
        console.error("Failed to fetch Spotify data:", error);
      } finally {
        setSpotifyLoading(false);
      }
    }

    fetchNowPlaying();
    // Refresh every 30 seconds
    const interval = setInterval(fetchNowPlaying, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Beyond <span className="gradient-text">Code</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Life is more than just writing code. Here's what keeps me going when I'm not in front of a terminal.
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center gap-2 mb-12"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-blue-500 text-white"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "football" && (
            <motion.div
              key="football"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Team Header */}
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-3 bg-card border border-border rounded-full px-6 py-3">
                  <span className="text-2xl">🔴🔵</span>
                  <span className="font-semibold text-lg">{mockMCPData.footballOpinions.favoriteTeam}</span>
                  <span className="text-muted-foreground">| Visca el Barca!</span>
                </div>
              </div>

              {/* Opinions Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                {footballOpinions.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-card border border-border rounded-xl p-6 hover:border-blue-500/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <h3 className="font-semibold">{item.topic}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.opinion}</p>
                  </motion.div>
                ))}
              </div>

              {/* Hot Take Banner */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-border rounded-xl p-6 text-center"
              >
                <p className="text-sm text-muted-foreground mb-2">Current Hot Take 🔥</p>
                <p className="text-lg font-medium">
                  &quot;{mockMCPData.footballOpinions.currentTake}&quot;
                </p>
              </motion.div>
            </motion.div>
          )}

          {activeTab === "music" && (
            <motion.div
              key="music"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Now Playing - Real Spotify Data */}
              <div className="bg-card border border-border rounded-xl p-6 mb-8">
                <h3 className="text-sm text-muted-foreground mb-4">
                  {nowPlaying?.isPlaying ? "Currently Vibing To" : "Recently Played"}
                </h3>
                {spotifyLoading ? (
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-lg bg-muted animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-6 w-40 bg-muted animate-pulse rounded" />
                      <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-6">
                    {nowPlaying?.albumImageUrl ? (
                      <img
                        src={nowPlaying.albumImageUrl}
                        alt={nowPlaying.album}
                        className="w-20 h-20 rounded-lg object-cover shadow-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Music className="w-10 h-10 text-white" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold">{nowPlaying?.title || mockMCPData.nowPlaying.track}</h4>
                      <p className="text-muted-foreground">{nowPlaying?.artist || mockMCPData.nowPlaying.artist}</p>
                      <p className="text-sm text-muted-foreground">{nowPlaying?.album || mockMCPData.nowPlaying.album}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {nowPlaying?.isPlaying && (
                        <div className="flex items-center gap-1">
                          <span className="w-1 h-4 bg-green-500 rounded-full animate-pulse" />
                          <span className="w-1 h-6 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: "0.1s" }} />
                          <span className="w-1 h-3 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
                        </div>
                      )}
                      {nowPlaying?.songUrl && (
                        <a
                          href={nowPlaying.songUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full bg-green-500 hover:bg-green-600 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4 text-white" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Playlists */}
              <h3 className="text-lg font-semibold mb-4">My Playlists</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {playlists.map((playlist, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-card border border-border rounded-xl p-4 hover:border-purple-500/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <Music className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium">{playlist.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {playlist.tracks} tracks • {playlist.mood}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "other" && (
            <motion.div
              key="other"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Interest Cards with Images */}
              <div className="grid sm:grid-cols-2 gap-6">
                {otherInterests.map((interest, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-card border border-border rounded-xl overflow-hidden hover:border-blue-500/50 transition-colors group"
                  >
                    {/* Image with gradient overlay */}
                    <div className="relative h-40 bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                      <img
                        src={interest.image}
                        alt={interest.title}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        onError={(e) => {
                          // Hide image on error, show gradient background
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                    </div>
                    <div className="p-5 -mt-8 relative">
                      <h3 className="text-lg font-semibold mb-2">{interest.title}</h3>
                      <p className="text-sm text-muted-foreground">{interest.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Photography Gallery */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-10"
              >
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Camera className="w-5 h-5" /> Photography Gallery
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {photographyGallery.map((photo, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="relative aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-blue-500/10 to-purple-500/10 group cursor-pointer"
                    >
                      <img
                        src={photo.src}
                        alt={photo.caption}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                        <p className="text-white text-sm">{photo.caption}</p>
                      </div>
                      {/* Placeholder icon when no image */}
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30 pointer-events-none">
                        <Camera className="w-12 h-12" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Fun Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                {[
                  { label: "Countries Visited", value: "15+" },
                  { label: "Coffees This Year", value: "847" },
                  { label: "Photos Taken", value: "10K+" },
                  { label: "FIFA Matches Won", value: "∞" },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="bg-card border border-border rounded-xl p-4 text-center"
                  >
                    <p className="text-2xl font-bold gradient-text">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
