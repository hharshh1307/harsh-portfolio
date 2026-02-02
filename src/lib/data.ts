// Real data for Harsh Agarwal's personal website

export const personalInfo = {
  name: "Harsh Agarwal",
  role: "Data Scientist",
  roles: ["Data Scientist", "ML Engineer", "IIT Delhi Alum", "Barcelona Fan"],
  location: "Bengaluru, India",
  bio: "Data Scientist with 2.5+ years of experience building ML systems at scale. Currently at Newme, previously at Zomato. IIT Delhi graduate passionate about recommendation systems, deep learning, and solving real-world problems with data.",
  email: "harshh1307@gmail.com",
  phone: "+91-7414890202",
  github: "https://github.com/hharshh1307",
  linkedin: "https://www.linkedin.com/in/harsh-agarwal-7a072b19a/",
  twitter: "https://x.com/harshag76504161",
};

export const stats = {
  yearsOfExperience: 2.5,
  projectsCompleted: 10,
  dailyUsersImpacted: "900K+",
  conversionLift: "7%+",
};

export const education = {
  institution: "Indian Institute of Technology Delhi",
  degree: "Bachelor of Technology",
  field: "Electrical Engineering",
  gpa: 8.326,
  duration: "Jul 2018 - Jun 2022",
  courses: [
    "Machine Intelligence and Learning",
    "Data Structures And Algorithms",
    "Probability and Stochastic Processes",
    "Digital Electronics",
    "Digital Signal Processing",
    "Communication Engineering",
  ],
};

export const skills = {
  languages: ["Python", "C++", "MySQL", "GoLang"],
  tools: ["VS Code", "Docker", "Airflow", "GIT"],
  mlDeepLearning: [
    "Scikit-learn",
    "PyTorch",
    "TensorFlow",
    "Hugging Face",
    "SBERT",
    "CLIP / FashionCLIP",
    "FAISS",
    "XGBoost",
  ],
};

export const workExperience = [
  {
    company: "Newme",
    role: "Data Scientist",
    location: "Bengaluru, India",
    duration: "September 2024 - Present",
    projects: [
      {
        name: "Shop Page Recommendation System",
        description:
          "Implemented a LambdaMART-based ranking system using LambdaRank optimization and NDCG evaluation to personalize apparel recommendations for 200K daily active app users",
        impact: "+7% lift in conversion rate",
      },
      {
        name: "Similar Products Module",
        description:
          "Engineered a 'Similar Products' module on the PDP by combining deep product-image embeddings with key product features",
        impact: "50% boost in click-through rate, comparable uplift in conversions",
      },
      {
        name: "Order Return Risk (RTO)",
        description:
          "Built a checkout-time RTO risk prediction model to identify high-risk COD orders and mitigate fraud by dynamically restricting COD eligibility",
        impact: "Currently in experimentation phase",
      },
    ],
  },
  {
    company: "Zomato",
    role: "Data Scientist",
    location: "Gurugram, India",
    duration: "Jun 2022 - August 2024",
    projects: [
      {
        name: "Restaurant Recommendation Model",
        description:
          "Engineered a real-time, learn-to-rank model for Zomato's dining homepage, optimizing recommendations for 7L+ daily app users. Integrated cuisine preferences, ambiance, popularity, customer affordability, and geographic proximity.",
        impact: "3.4% increase in customer interaction, 1.3% uplift in ad-revenue",
      },
      {
        name: "Customer Churn Prediction",
        description:
          "Developed a predictive tree-based XGBoost model to forecast customer churn with approximately 70% precision.",
        impact: "Reduced churn rate by 1.2%",
      },
      {
        name: "New User Promo Segmentation",
        description:
          "Created a tree-based model to analyze new users' first-order features for personalized promo distribution.",
        impact: "Enhanced first-order retention by 2.3%",
      },
      {
        name: "User Community Detection",
        description:
          "Implemented the Leiden algorithm to cluster platform users into communities based on address links to identify high-value customers early.",
        impact: "Reduced acquisition costs by 4%, increased conversions by 0.8%",
      },
    ],
  },
  {
    company: "Axis Bank",
    role: "Intern - DBAT Team",
    location: "Remote",
    duration: "May 2021 - Jul 2021",
    projects: [
      {
        name: "VCIP Automation",
        description:
          "Automated the Video-Based Customer Identification Protocol (VCIP) recon file for co-origination journeys.",
        impact: "40% reduction in workflow time",
      },
    ],
  },
];

export const achievements = [
  {
    title: "JEE Advanced 2018",
    description: "All India Rank 304 among 155K candidates (99.79 percentile)",
  },
  {
    title: "KVPY Fellowship 2018",
    description: "AIR 973 - Kishore Vaigyanik Protsahan Yojna by DST, Govt. of India",
  },
  {
    title: "IITD Semester Merit",
    description: "Scholarship for being among top 7% students in Sem I 2018-19",
  },
];

export const mockMCPData = {
  // get_personal_status mock
  status: {
    location: "Bengaluru, India",
    timezone: "IST",
    currentActivity: "Building recommendation systems at Newme",
    currentCompany: "Newme",
    nextTrip: {
      destination: "Barcelona",
      date: "TBD",
      purpose: "Watch a match at Camp Nou",
    },
  },

  // consult_football_brain mock
  footballOpinions: {
    favoriteTeam: "Barcelona",
    goat: "Messi",
    currentTake: "Lamine Yamal is the next big thing - generational talent at 17",
    elClasico: "Always a Barcelona win in my heart",
    bestMoment: "6-1 remontada against PSG in 2017",
  },

  // Spotify mock
  nowPlaying: {
    track: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    isPlaying: true,
  },

  // GitHub mock
  latestCommit: {
    repo: "recommendation-engine",
    message: "Add LambdaMART ranking implementation",
    timestamp: "2 hours ago",
  },

  // Projects mock
  featuredProject: {
    name: "Shop Page Recommendations",
    description: "LambdaMART-based ranking system for personalized apparel recommendations serving 200K daily users",
    stars: 0,
    language: "Python",
    url: "#",
  },
};

export const navLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Hobbies", href: "/hobbies" },
  { name: "Playground", href: "/playground" },
  { name: "Chat", href: "/chat" },
];
