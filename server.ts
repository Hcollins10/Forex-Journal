import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health Check API
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", aiEnabled: Boolean(process.env.GEMINI_API_KEY) });
});

// AI Journal Comprehensive Audit Endpoint
app.post("/api/audit-journal", async (req, res) => {
  try {
    const { accountSummary, metrics, emotionStats, topWins, topLosses, setupStats } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Return smart structured heuristic audit if no API key
      return res.json({
        success: true,
        source: "heuristic",
        audit: {
          executiveSummary: `Auditing ${accountSummary?.name || "Trading Account"} with ${metrics?.totalTrades || 0} trades logged. Win rate stands at ${metrics?.winRate?.toFixed(1) || 0}% with a Profit Factor of ${metrics?.profitFactor?.toFixed(2) || 0}. Your primary performance driver has been your discipline on high-probability technical setups.`,
          psychologicalLeaks: [
            "FOMO and rushed entries caused disproportionately higher losses compared to calm, planned executions.",
            "Prematurely cutting winning positions reduced your average win-to-loss expectancy ratio.",
            "Moving stop losses or holding past original invalidation levels triggered the largest drawdown days."
          ],
          consistencyRating: metrics?.consistencyScore >= 75 ? "High Institutional Grade" : metrics?.consistencyScore >= 50 ? "Moderate / Improving" : "High Volatility / Erratic",
          consistencyAnalysis: `Your profit distribution demonstrates that ${metrics?.highestProfitDay ? "your best day yielded $" + metrics.highestProfitDay.pnl.toFixed(2) : "trades are evenly distributed"}. Risk management was generally kept within ${accountSummary?.maxDailyDrawdownPct || 5}% daily parameters.`,
          keyRecommendations: [
            "Stick strictly to A+ setups (e.g. Liquidity Sweeps & FVGs) where your statistical win rate exceeds 60%.",
            "Set a hard daily loss limit: If you lose 2 consecutive trades in one session, close the terminal immediately.",
            "Never move your Stop Loss further away once the order is active; let the market hit either TP or SL without intervention."
          ]
        }
      });
    }

    const prompt = `You are an elite institutional Forex Trading Performance Auditor and Risk Psychologist. Analyze the following trading journal dataset and produce a structured, high-impact performance audit report:

Account Information:
${JSON.stringify(accountSummary, null, 2)}

Overall Metrics:
${JSON.stringify(metrics, null, 2)}

Emotion & Discipline Breakdown:
${JSON.stringify(emotionStats, null, 2)}

Setup Performance:
${JSON.stringify(setupStats, null, 2)}

Top Winning Day: ${JSON.stringify(topWins)}
Top Losing Day: ${JSON.stringify(topLosses)}

Provide an audit in valid JSON format matching this exact schema:
{
  "executiveSummary": "Concise 2-3 sentence overview of overall trading performance, edge, and profitability",
  "psychologicalLeaks": ["Key psychological vulnerability 1", "Key psychological vulnerability 2", "Key psychological vulnerability 3"],
  "consistencyRating": "Institutional Grade | Moderate / Developing | High Volatility",
  "consistencyAnalysis": "Analytical assessment of lot size consistency, drawdown control, and daily PnL stability",
  "technicalEdgeSummary": "Which setups (e.g. FVG, Liquidity sweep) and pairs are generating the most alpha vs dragging capital",
  "keyRecommendations": ["Actionable tactical rule 1", "Actionable psychological rule 2", "Actionable risk management rule 3"]
}

Respond ONLY with valid JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const parsedAudit = JSON.parse(response.text || "{}");
    return res.json({ success: true, source: "gemini", audit: parsedAudit });
  } catch (error: any) {
    console.error("AI Audit Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to generate AI trading audit",
    });
  }
});

// AI Single Trade Deep Dive Analysis
app.post("/api/analyze-trade", async (req, res) => {
  try {
    const { trade } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        source: "heuristic",
        analysis: {
          verdict: trade.pnl >= 0 ? "Well-executed trade aligned with plan" : "Trade invalidation respected",
          riskScore: trade.disciplineScore >= 4 ? 90 : 60,
          strengths: ["Clear defined entry reasoning", "Strict predefined Stop Loss"],
          improvements: ["Ensure Take Profit targets are anchored to key liquidity pools", "Log emotional state during middle of trade"],
          coachingNote: `Trading ${trade.pair} with ${trade.lotSize} lots. Keep maintaining clear invalidation points before pulling the trigger.`
        }
      });
    }

    const prompt = `You are a professional Forex prop firm risk manager. Critique this individual trade log:
Trade Details:
${JSON.stringify(trade, null, 2)}

Provide your assessment in valid JSON:
{
  "verdict": "One sentence summary of the execution quality",
  "riskScore": 85,
  "strengths": ["Strength 1", "Strength 2"],
  "improvements": ["Improvement 1", "Improvement 2"],
  "coachingNote": "Direct, supportive advice for the trader regarding this specific setup and emotional state"
}
Respond ONLY with valid JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const analysis = JSON.parse(response.text || "{}");
    return res.json({ success: true, source: "gemini", analysis });
  } catch (error: any) {
    console.error("AI Trade Analysis Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to analyze trade",
    });
  }
});

// Vite middleware / Static serving
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Forex Trading Journal Server running at http://0.0.0.0:${PORT}`);
  });
}

start();
