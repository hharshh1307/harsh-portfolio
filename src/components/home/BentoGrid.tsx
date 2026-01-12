"use client";

import { motion } from "framer-motion";
import {
  User,
  MapPin,
  BarChart3,
  Github,
  Music,
  Link as LinkIcon,
  Trophy,
  Code
} from "lucide-react";
import { BentoCard } from "./BentoCard";
import { personalInfo, stats, mockMCPData } from "@/lib/data";

export function BentoGrid() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4">At a Glance</h2>
          <p className="text-muted-foreground">
            Quick snapshots of what I&apos;m up to
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[minmax(180px,auto)]"
        >
          {/* About Card - Spans 2 columns */}
          <motion.div variants={itemVariants} className="md:col-span-2">
            <BentoCard
              title="About Me"
              icon={User}
              className="h-full"
              href="/about"
            >
              <p className="text-muted-foreground leading-relaxed">
                {personalInfo.bio}
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm text-blue-500">
                <span>Learn more about my journey</span>
                <LinkIcon size={14} />
              </div>
            </BentoCard>
          </motion.div>

          {/* Current Status Card */}
          <motion.div variants={itemVariants}>
            <BentoCard
              title="Currently"
              icon={MapPin}
              className="h-full"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm text-muted-foreground">
                    {mockMCPData.status.location}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {mockMCPData.status.currentActivity}
                </p>
                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground">Next trip:</p>
                  <p className="text-sm font-medium">
                    {mockMCPData.status.nextTrip.destination} - {mockMCPData.status.nextTrip.date}
                  </p>
                </div>
              </div>
            </BentoCard>
          </motion.div>

          {/* Quick Stats */}
          <motion.div variants={itemVariants}>
            <BentoCard
              title="Quick Stats"
              icon={BarChart3}
              className="h-full"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold gradient-text">{stats.yearsOfExperience}+</p>
                  <p className="text-xs text-muted-foreground">Years Experience</p>
                </div>
                <div>
                  <p className="text-2xl font-bold gradient-text">{stats.dailyUsersImpacted}</p>
                  <p className="text-xs text-muted-foreground">Daily Users</p>
                </div>
                <div>
                  <p className="text-2xl font-bold gradient-text">{stats.conversionLift}</p>
                  <p className="text-xs text-muted-foreground">Conversion Lift</p>
                </div>
                <div>
                  <p className="text-2xl font-bold gradient-text">IIT-D</p>
                  <p className="text-xs text-muted-foreground">B.Tech EE</p>
                </div>
              </div>
            </BentoCard>
          </motion.div>

          {/* Latest Project - Spans 2 columns */}
          <motion.div variants={itemVariants} className="md:col-span-2">
            <BentoCard
              title="Featured Project"
              icon={Github}
              className="h-full"
              href={mockMCPData.featuredProject.url}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-lg mb-1">
                    {mockMCPData.featuredProject.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {mockMCPData.featuredProject.description}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Code size={14} />
                    <span>{mockMCPData.featuredProject.language}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>&#9733;</span>
                    <span>{mockMCPData.featuredProject.stars}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Latest commit</p>
                <p className="text-sm font-mono">
                  {mockMCPData.latestCommit.message}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {mockMCPData.latestCommit.timestamp}
                </p>
              </div>
            </BentoCard>
          </motion.div>

          {/* Now Playing */}
          <motion.div variants={itemVariants}>
            <BentoCard
              title="Now Playing"
              icon={Music}
              className="h-full"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Music className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{mockMCPData.nowPlaying.track}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {mockMCPData.nowPlaying.artist}
                  </p>
                </div>
                {mockMCPData.nowPlaying.isPlaying && (
                  <div className="flex items-center gap-0.5">
                    <span className="w-1 h-3 bg-green-500 rounded-full animate-pulse" />
                    <span className="w-1 h-4 bg-green-500 rounded-full animate-pulse delay-75" />
                    <span className="w-1 h-2 bg-green-500 rounded-full animate-pulse delay-150" />
                  </div>
                )}
              </div>
            </BentoCard>
          </motion.div>

          {/* Football Card */}
          <motion.div variants={itemVariants}>
            <BentoCard
              title="Football"
              icon={Trophy}
              className="h-full"
              href="/hobbies"
            >
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Team:</span>{" "}
                  {mockMCPData.footballOpinions.favoriteTeam}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">GOAT:</span>{" "}
                  {mockMCPData.footballOpinions.goat}
                </p>
                <div className="pt-2 border-t border-border">
                  <p className="text-xs italic text-muted-foreground">
                    &quot;{mockMCPData.footballOpinions.currentTake}&quot;
                  </p>
                </div>
              </div>
            </BentoCard>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <BentoCard
              title="Connect"
              icon={LinkIcon}
              className="h-full"
            >
              <div className="flex flex-col gap-3">
                <a
                  href={personalInfo.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Github size={16} />
                  <span>GitHub</span>
                </a>
                <a
                  href={personalInfo.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <LinkIcon size={16} />
                  <span>LinkedIn</span>
                </a>
                <a
                  href={personalInfo.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <LinkIcon size={16} />
                  <span>Twitter</span>
                </a>
              </div>
            </BentoCard>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
