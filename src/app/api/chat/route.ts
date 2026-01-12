import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { tavily } from "@tavily/core";

// MCP Server URL (local for dev, will be env var for prod)
const MCP_SERVER_URL = process.env.MCP_SERVER_URL || "http://localhost:8000";
const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

// Initialize Tavily client
const tvly = TAVILY_API_KEY ? tavily({ apiKey: TAVILY_API_KEY }) : null;

// Harsh's persona and guardrails
const SYSTEM_PROMPT = `You are an AI assistant representing Harsh Agarwal on his personal website. You speak AS Harsh (first person), sharing his experiences, opinions, and personality.

## ABOUT HARSH
- Data Scientist at Newme (Bengaluru), previously at Zomato (Gurugram)
- IIT Delhi B.Tech in Electrical Engineering (2018-2022), GPA: 8.326
- Expertise: Recommendation systems, LambdaMART, XGBoost, deep embeddings, FAISS
- Achievements: JEE Advanced AIR 304, KVPY AIR 973

## PERSONALITY & TONE
- Friendly, approachable, and enthusiastic about ML/AI
- Passionate Barcelona fan - Messi is the GOAT, no debate
- Uses casual but professional language
- Humble about achievements but confident in technical skills
- Enjoys explaining complex ML concepts in simple terms

## GUARDRAILS - IMPORTANT
1. NEVER share personal contact info (email/phone) - direct to LinkedIn
2. NEVER make up information not in the context
3. NEVER discuss salary, compensation, or confidential work details
4. NEVER pretend to be the actual person - clarify you're an AI representing Harsh if directly asked
5. NEVER engage with inappropriate, offensive, or harmful requests
6. Keep responses concise (2-4 sentences for simple questions)
7. For technical questions, be accurate based on the resume data provided

## RESPONSE STYLE
- Answer as "I" (first person) - "I worked at Zomato..." not "Harsh worked at..."
- Be conversational and warm
- For football questions, show genuine passion for Barcelona
- For technical questions, demonstrate expertise without being arrogant
- If asked something outside the provided context, politely say you're not sure
- When web search results are provided, use them to answer questions about current events

## CURRENT CONTEXT (from MCP tools)
{context}

Remember: You ARE Harsh's AI representative. Be helpful, friendly, and authentic to his personality!`;

// Fetch context from MCP server
async function fetchMCPContext(message: string): Promise<string> {
  const context: string[] = [];

  try {
    // Always get personal status
    const statusRes = await fetch(`${MCP_SERVER_URL}/mcp/get_personal_status`);
    if (statusRes.ok) {
      const status = await statusRes.json();
      context.push(`CURRENT STATUS: Located in ${status.location.city}, ${status.location.country}. ${status.current_activity}.`);
    }

    // Check if message is about football
    const footballKeywords = ["football", "soccer", "barcelona", "barca", "messi", "ronaldo", "team", "match", "goal", "player", "la liga", "champions"];
    if (footballKeywords.some(kw => message.toLowerCase().includes(kw))) {
      const footballRes = await fetch(`${MCP_SERVER_URL}/mcp/consult_football_brain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: message }),
      });
      if (footballRes.ok) {
        const football = await footballRes.json();
        context.push(`FOOTBALL OPINION on "${football.topic}": ${football.opinion}`);
      }
    }

    // Check if message is about work/experience/skills
    const workKeywords = ["work", "job", "experience", "zomato", "newme", "project", "skill", "python", "ml", "machine learning", "recommendation", "data scientist"];
    if (workKeywords.some(kw => message.toLowerCase().includes(kw))) {
      const expRes = await fetch(`${MCP_SERVER_URL}/mcp/experience`);
      if (expRes.ok) {
        const experiences = await expRes.json();
        const expSummary = experiences.map((e: { company: string; role: string; projects: { name: string; impact: string }[] }) =>
          `${e.company} (${e.role}): ${e.projects.map((p: { name: string; impact: string }) => `${p.name} - ${p.impact}`).join("; ")}`
        ).join("\n");
        context.push(`WORK EXPERIENCE:\n${expSummary}`);
      }

      const skillsRes = await fetch(`${MCP_SERVER_URL}/mcp/skills`);
      if (skillsRes.ok) {
        const skills = await skillsRes.json();
        const topSkills = skills.slice(0, 10).map((s: { name: string; proficiency: number }) => `${s.name} (${s.proficiency}%)`).join(", ");
        context.push(`TOP SKILLS: ${topSkills}`);
      }
    }

    // Check if message is about education/achievements
    const eduKeywords = ["education", "college", "iit", "delhi", "degree", "study", "jee", "kvpy", "achievement", "rank"];
    if (eduKeywords.some(kw => message.toLowerCase().includes(kw))) {
      const eduRes = await fetch(`${MCP_SERVER_URL}/mcp/education`);
      if (eduRes.ok) {
        const edu = await eduRes.json();
        context.push(`EDUCATION: ${edu.education[0].institution}, ${edu.education[0].degree} in ${edu.education[0].field}, GPA: ${edu.education[0].gpa}`);
      }

      const achieveRes = await fetch(`${MCP_SERVER_URL}/mcp/achievements`);
      if (achieveRes.ok) {
        const achievements = await achieveRes.json();
        const achieveSummary = achievements.map((a: { title: string; description: string }) => `${a.title}: ${a.description}`).join("; ");
        context.push(`ACHIEVEMENTS: ${achieveSummary}`);
      }
    }

    // Default: get basic info
    if (context.length <= 1) {
      const infoRes = await fetch(`${MCP_SERVER_URL}/mcp/personal_info`);
      if (infoRes.ok) {
        const info = await infoRes.json();
        context.push(`PERSONAL INFO: ${info.name}, ${info.current_role} at ${info.current_company}. ${info.bio}`);
      }
    }

  } catch (error) {
    console.error("Error fetching MCP context:", error);
    context.push("CONTEXT: Unable to fetch live data. Respond based on general knowledge about Harsh.");
  }

  return context.join("\n\n");
}

// Web search for current events
async function searchWeb(query: string): Promise<string | null> {
  if (!tvly) return null;

  try {
    const response = await tvly.search(query, {
      maxResults: 3,
      searchDepth: "basic",
    });

    if (response.results && response.results.length > 0) {
      const summaries = response.results.map((r: { title: string; content: string; url: string }) =>
        `- ${r.title}: ${r.content.slice(0, 200)}...`
      ).join("\n");
      return `WEB SEARCH RESULTS for "${query}":\n${summaries}`;
    }
    return null;
  } catch (error) {
    console.error("Web search error:", error);
    return null;
  }
}

// Check if message needs web search (current events, recent news)
function needsWebSearch(message: string): boolean {
  const currentEventKeywords = [
    "yesterday", "today", "latest", "recent", "last night", "this week",
    "el clasico", "match result", "score", "won", "lost", "news",
    "happened", "current", "2024", "2025", "2026"
  ];
  return currentEventKeywords.some(kw => message.toLowerCase().includes(kw));
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response("Invalid request: messages required", { status: 400 });
    }

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== "user") {
      return new Response("Invalid request: last message must be from user", { status: 400 });
    }

    // Fetch context from MCP server
    let context = await fetchMCPContext(lastMessage.content);

    // Add web search for current events
    if (needsWebSearch(lastMessage.content)) {
      const webResults = await searchWeb(lastMessage.content);
      if (webResults) {
        context += "\n\n" + webResults;
      }
    }

    // Build system prompt with context
    const systemPrompt = SYSTEM_PROMPT.replace("{context}", context);

    // Stream response using Vercel AI SDK
    const result = await streamText({
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      messages,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
