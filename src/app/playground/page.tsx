"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Trophy,
  Database,
  Github,
  Music,
  Play,
  ChevronRight,
  Terminal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockMCPData } from "@/lib/data";

interface MCPDemoProps {
  title: string;
  description: string;
  icon: React.ElementType;
  toolName: string;
  exampleInput?: string;
  mockOutput: unknown;
  accentColor: string;
}

function MCPDemo({
  title,
  description,
  icon: Icon,
  toolName,
  exampleInput,
  mockOutput,
  accentColor,
}: MCPDemoProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [showOutput, setShowOutput] = useState(false);

  const handleExecute = () => {
    setIsExecuting(true);
    setShowOutput(false);
    setTimeout(() => {
      setIsExecuting(false);
      setShowOutput(true);
    }, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className={`p-4 bg-gradient-to-r ${accentColor} bg-opacity-10`}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-background">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
      </div>

      {/* Tool Info */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-2">
          <Terminal className="w-4 h-4 text-muted-foreground" />
          <code className="text-sm text-blue-500">{toolName}</code>
        </div>
        {exampleInput && (
          <p className="text-xs text-muted-foreground">
            Input: <code className="text-foreground">{exampleInput}</code>
          </p>
        )}
      </div>

      {/* Execute Button */}
      <div className="p-4">
        <Button
          onClick={handleExecute}
          disabled={isExecuting}
          className="w-full"
          variant="outline"
        >
          {isExecuting ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Executing...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              Try it
            </span>
          )}
        </Button>

        {/* Output */}
        {showOutput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4"
          >
            <p className="text-xs text-muted-foreground mb-2">Output:</p>
            <pre className="bg-muted p-3 rounded-lg text-xs overflow-x-auto">
              {JSON.stringify(mockOutput, null, 2)}
            </pre>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default function PlaygroundPage() {
  const demos: MCPDemoProps[] = [
    {
      title: "Travel Tracker",
      description: "Get current location and upcoming trips",
      icon: MapPin,
      toolName: "get_personal_status()",
      mockOutput: mockMCPData.status,
      accentColor: "from-green-500/10 to-emerald-500/10",
    },
    {
      title: "Football Oracle",
      description: "Ask about my football opinions",
      icon: Trophy,
      toolName: "consult_football_brain(query)",
      exampleInput: '"What do you think about Messi?"',
      mockOutput: {
        topic: "GOAT",
        opinion: mockMCPData.footballOpinions.goat,
        confidence: "100%",
      },
      accentColor: "from-blue-500/10 to-indigo-500/10",
    },
    {
      title: "Resume Query",
      description: "Query my experience database",
      icon: Database,
      toolName: "query_resume_sql(sql)",
      exampleInput: '"SELECT * FROM skills WHERE category = \'AI/ML\'"',
      mockOutput: {
        results: [
          { skill: "PyTorch", years: 4 },
          { skill: "TensorFlow", years: 3 },
          { skill: "LLMs", years: 2 },
        ],
      },
      accentColor: "from-purple-500/10 to-pink-500/10",
    },
    {
      title: "GitHub Activity",
      description: "Latest commits and repos",
      icon: Github,
      toolName: "github_mcp.get_activity()",
      mockOutput: {
        latestCommit: mockMCPData.latestCommit,
        featuredRepo: mockMCPData.featuredProject.name,
      },
      accentColor: "from-gray-500/10 to-slate-500/10",
    },
    {
      title: "Now Playing",
      description: "Current Spotify track",
      icon: Music,
      toolName: "spotify_mcp.current_track()",
      mockOutput: mockMCPData.nowPlaying,
      accentColor: "from-green-500/10 to-lime-500/10",
    },
  ];

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            MCP <span className="gradient-text">Playground</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Explore the MCP (Model Context Protocol) servers that power this website.
            These tools provide real-time context to the AI chat agent.
          </p>
          <div className="inline-flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2 text-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-muted-foreground">5 MCP tools available</span>
          </div>
        </motion.div>

        {/* What is MCP Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-xl p-6 mb-12"
        >
          <h2 className="text-lg font-semibold mb-3">What is MCP?</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Model Context Protocol (MCP) is a standard for connecting AI models to external data sources
            and tools. It allows the chat agent on this site to access real-time information about me,
            including my location, opinions, projects, and current activities.
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { title: "Internal MCP", desc: "Personal data, opinions, resume" },
              { title: "External APIs", desc: "Spotify, GitHub, Soccer data" },
              { title: "Real-time", desc: "Live updates, current status" },
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Demo Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {demos.map((demo, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <MCPDemo {...demo} />
            </motion.div>
          ))}
        </div>

        {/* CTA to Chat */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <p className="text-muted-foreground mb-4">
            Want to see these tools in action? Chat with my AI agent!
          </p>
          <Button asChild size="lg" className="bg-blue-500 hover:bg-blue-600">
            <a href="/chat">
              Start Chatting
              <ChevronRight className="ml-2 w-4 h-4" />
            </a>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
