import { GoogleGenAI, Type } from "@google/genai";
import { InstagramComment } from "../../types/instagram";
import { query } from "../db/client";

const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export async function classifyComment(commentText: string) {
  if (!ai) throw new Error("GEMINI_API_KEY is not set.");
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Analyze this social media comment from an Indian audience profile: "${commentText}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          authenticity: { type: Type.STRING, enum: ["Genuine", "Spam"] },
          bot_likelihood: { type: Type.STRING, enum: ["Human", "Likely-bot", "Uncertain"] },
          political_inclination: {
            type: Type.OBJECT,
            properties: {
              stance: { type: Type.STRING, enum: ["Positive", "Neutral", "Negative"] },
              target_party: { type: Type.STRING } // e.g., "BJP", "Congress", "None"
            },
            required: ["stance", "target_party"]
          },
          relevance: { type: Type.STRING, enum: ["On-topic", "Off-topic"] },
          type: { type: Type.STRING, enum: ["Praise", "Question", "Criticism", "Tag-a-friend", "Sales-or-promo", "Other"] },
          language: { type: Type.STRING, enum: ["English", "Hindi", "Hinglish", "Regional", "Hinglish_Flagged_For_Review"] }
        },
        required: ["authenticity", "bot_likelihood", "political_inclination", "relevance", "type", "language"]
      },
      systemInstruction: "You are an expert content moderation AI system specializing in South Asian social media dynamics, text parsing, and internet slang interpretation."
    }
  });
  
  if (!response.text) return null;
  return JSON.parse(response.text);
}

// Batch Classification Algorithm
const CHUNK_SIZE = 100; // Safe chunk size per request to avoid payload limits
const RPM_LIMIT = 15;
const DELAY_MS = (60 * 1000) / RPM_LIMIT + 1000; // e.g. 5000ms delay between chunks

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function processCommentsInBackground(jobId: number, allComments: InstagramComment[]) {
  console.log(`[Gemini ML] Starting background ML job ${jobId} for ${allComments.length} comments.`);

  const chunks = [];
  for (let i = 0; i < allComments.length; i += CHUNK_SIZE) {
    chunks.push(allComments.slice(i, i + CHUNK_SIZE));
  }

  await query(`UPDATE jobs SET total_chunks = $1, processed_chunks = 0, status = 'Processing_ML', updated_at = NOW() WHERE id = $2`, [chunks.length, jobId]);

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    console.log(`[Gemini ML] Processing chunk ${i + 1}/${chunks.length}...`);
    
    // Process chunk sequentially internally, or batch them in a single prompt if desired.
    // The user provided a single-comment function `classifyComment`. We will iterate over the chunk.
    // In a real production scenario with 1M tokens, we would alter the schema to accept an array,
    // but we'll stick to the user's provided function and run them concurrently within rate limits or use an array prompt.
    // Let's modify the approach to an array prompt to be efficient with the chunk.
    
    try {
      if (!ai) throw new Error("GEMINI_API_KEY is not set.");
      const chunkPayload = chunk.map(c => ({ id: c.id, text: c.raw_text }));
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze these social media comments from Indian audience profiles: ${JSON.stringify(chunkPayload)}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.INTEGER },
                authenticity: { type: Type.STRING, enum: ["Genuine", "Spam"] },
                bot_likelihood: { type: Type.STRING, enum: ["Human", "Likely-bot", "Uncertain"] },
                political_inclination: {
                  type: Type.OBJECT,
                  properties: {
                    stance: { type: Type.STRING, enum: ["Positive", "Neutral", "Negative"] },
                    target_party: { type: Type.STRING }
                  },
                  required: ["stance", "target_party"]
                },
                relevance: { type: Type.STRING, enum: ["On-topic", "Off-topic"] },
                type: { type: Type.STRING, enum: ["Praise", "Question", "Criticism", "Tag-a-friend", "Sales-or-promo", "Other"] },
                language: { type: Type.STRING, enum: ["English", "Hindi", "Hinglish", "Regional", "Hinglish_Flagged_For_Review"] }
              },
              required: ["id", "authenticity", "bot_likelihood", "political_inclination", "relevance", "type", "language"]
            }
          },
          systemInstruction: "You are an expert content moderation AI system specializing in South Asian social media dynamics, text parsing, and internet slang interpretation."
        }
      });
      
      const results = JSON.parse(response.text || "[]");
      
      // Update DB with results
      for (const res of results) {
        await query(`
          UPDATE comments 
          SET authenticity = $1, bot_likelihood = $2, political_stance = $3, political_party = $4, relevance = $5, comment_type = $6, language = $7
          WHERE id = $8
        `, [
          res.authenticity, res.bot_likelihood, res.political_inclination?.stance, res.political_inclination?.target_party,
          res.relevance, res.type, res.language, res.id
        ]);
      }
    } catch (e: any) {
      console.error(`[Gemini ML] Error processing chunk ${i + 1}: ${e.message}`);
    }

    await query(`UPDATE jobs SET processed_chunks = $1, updated_at = NOW() WHERE id = $2`, [i + 1, jobId]);
    
    if (i < chunks.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  await query(`UPDATE jobs SET status = 'Completed', updated_at = NOW() WHERE id = $1`, [jobId]);
  console.log(`[Gemini ML] Job ${jobId} Completed.`);
}
