"use client";

import { motion } from "framer-motion";
import {
  Briefcase,
  GraduationCap,
  Code2,
  Brain,
  Database,
  Award,
  Download,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { personalInfo, education, workExperience, achievements, skills } from "@/lib/data";

const timeline = [
  {
    year: "Sep 2024 - Present",
    title: "Data Scientist",
    company: "Newme",
    location: "Bengaluru, India",
    description: "Building recommendation systems for 200K daily users. LambdaMART ranking, similar products module, RTO risk prediction.",
    icon: Brain,
  },
  {
    year: "Jun 2022 - Aug 2024",
    title: "Data Scientist",
    company: "Zomato",
    location: "Gurugram, India",
    description: "Real-time restaurant recommendations for 7L+ users. Customer churn prediction, user community detection, promo segmentation.",
    icon: TrendingUp,
  },
  {
    year: "May 2021 - Jul 2021",
    title: "Intern - DBAT Team",
    company: "Axis Bank",
    location: "Remote",
    description: "Automated VCIP recon files, reducing workflow time by 40%.",
    icon: Briefcase,
  },
  {
    year: "Jul 2018 - Jun 2022",
    title: "B.Tech - Electrical Engineering",
    company: "IIT Delhi",
    location: "Delhi, India",
    description: `GPA: ${education.gpa}/10. Courses: Machine Learning, DSA, Probability, Signal Processing.`,
    icon: GraduationCap,
  },
];

const skillsData = [
  { name: "Python", level: 95, category: "Languages" },
  { name: "XGBoost / LambdaMART", level: 92, category: "ML" },
  { name: "PyTorch / TensorFlow", level: 88, category: "Deep Learning" },
  { name: "FAISS / SBERT", level: 85, category: "Embeddings" },
  { name: "Hugging Face", level: 82, category: "NLP" },
  { name: "SQL / MySQL", level: 90, category: "Databases" },
  { name: "Docker / Airflow", level: 78, category: "MLOps" },
  { name: "C++ / GoLang", level: 70, category: "Languages" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            About <span className="gradient-text">{personalInfo.name}</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Data Scientist building ML systems at scale. IIT Delhi graduate with expertise in recommendation systems, deep learning, and real-time ML infrastructure.
          </p>
        </motion.div>

        {/* Two column layout */}
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column - Bio & Timeline */}
          <div>
            {/* Bio */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-12"
            >
              <h2 className="text-2xl font-semibold mb-4">My Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  I&apos;m {personalInfo.name}, a Data Scientist currently at Newme building
                  recommendation systems that serve 200K+ daily users. Previously, I spent 2+ years
                  at Zomato optimizing restaurant recommendations for 7 lakh+ users daily.
                </p>
                <p>
                  I graduated from IIT Delhi with a B.Tech in Electrical Engineering (GPA: 8.326).
                  My work focuses on learn-to-rank models, deep embeddings, customer behavior prediction,
                  and building ML systems that drive real business impact.
                </p>
                <p>
                  When I&apos;m not building models, you&apos;ll find me cheering for Barcelona,
                  exploring new ML research papers, or debating why Messi is the GOAT.
                </p>
              </div>
              <Button className="mt-6" variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download Resume
              </Button>
            </motion.div>

            {/* Timeline */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-2xl font-semibold mb-6">Experience</h2>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

                <div className="space-y-8">
                  {timeline.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="relative pl-12"
                    >
                      {/* Timeline dot */}
                      <div className="absolute left-0 p-2 rounded-lg bg-card border border-border">
                        <item.icon className="w-4 h-4 text-blue-500" />
                      </div>

                      <div className="bg-card border border-border rounded-lg p-4">
                        <span className="text-xs text-muted-foreground">
                          {item.year}
                        </span>
                        <h3 className="font-semibold mt-1">{item.title}</h3>
                        <p className="text-sm text-blue-500">{item.company}</p>
                        <p className="text-xs text-muted-foreground">{item.location}</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          {item.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Skills & Achievements */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-2xl font-semibold mb-6">Skills</h2>

              <div className="space-y-5">
                {skillsData.map((skill, index) => (
                  <motion.div
                    key={skill.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                  >
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">{skill.name}</span>
                      <span className="text-xs text-muted-foreground">{skill.category}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.level}%` }}
                        transition={{ duration: 1, delay: 0.5 + index * 0.05 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Tech Stack */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-10"
            >
              <h3 className="text-lg font-semibold mb-4">Core Tech</h3>
              <div className="flex flex-wrap gap-2">
                {[...skills.languages, ...skills.mlDeepLearning, ...skills.tools].map((tech, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-card border border-border rounded-full text-sm text-muted-foreground hover:border-blue-500/50 transition-colors"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="mt-10"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                Achievements
              </h3>
              <div className="space-y-3">
                {achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className="bg-card border border-border rounded-lg p-3"
                  >
                    <p className="font-medium text-sm">{achievement.title}</p>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Key Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="mt-10"
            >
              <h3 className="text-lg font-semibold mb-4">Impact Metrics</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: "900K+", label: "Daily Users Impacted" },
                  { value: "+7%", label: "Conversion Lift" },
                  { value: "70%", label: "Churn Prediction Precision" },
                  { value: "50%", label: "CTR Boost (Similar Products)" },
                ].map((metric, index) => (
                  <div
                    key={index}
                    className="bg-card border border-border rounded-lg p-4 text-center"
                  >
                    <p className="text-2xl font-bold gradient-text">{metric.value}</p>
                    <p className="text-xs text-muted-foreground">{metric.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
