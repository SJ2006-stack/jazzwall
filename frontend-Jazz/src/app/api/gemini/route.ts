import { NextRequest, NextResponse } from "next/server"
import { rateLimit } from "@/lib/rate-limit"

export async function POST(req: NextRequest) {
  try {
    // ── Rate limiting: 10 requests per minute per IP ──
    const forwarded = req.headers.get("x-forwarded-for")
    const ip = forwarded?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "anonymous"
    const rl = rateLimit(ip, 10, 60_000)

    if (!rl.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later.", retryAfter: Math.ceil(rl.resetInMs / 1000) },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(rl.resetInMs / 1000)),
            "X-RateLimit-Remaining": "0",
          },
        }
      )
    }

    // ── Parse & validate request body ──
    const body = await req.json()
    const { transcript } = body

    if (!transcript || typeof transcript !== "string") {
      return NextResponse.json({ error: "Missing or invalid transcript" }, { status: 400 })
    }

    if (transcript.length > 50_000) {
      return NextResponse.json({ error: "Transcript too long. Maximum 50,000 characters." }, { status: 400 })
    }

    // ── Check for API key ──
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.error("❌ GEMINI_API_KEY is not set")
      return NextResponse.json({ error: "AI service not configured" }, { status: 503 })
    }

    // ── Call Gemini ──
    const { GoogleGenerativeAI } = await import("@google/generative-ai")
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `You are a meeting notes assistant. Analyze this meeting transcript and return a JSON object with:
1. "summary": A concise 2-3 paragraph summary of the meeting
2. "actionItems": An array of action items, each with "task", "assignee" (if mentioned), and "deadline" (if mentioned)
3. "decisions": An array of key decisions made
4. "followUps": An array of follow-up items needed

Be thorough but concise. If the transcript is in Hindi, Hinglish, or mixed languages, still produce the output in English.

Transcript:
${transcript}`

    const result = await model.generateContent(prompt)
    const text = result.response.text()

    // Try to parse as JSON
    let parsed
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: text, actionItems: [], decisions: [], followUps: [] }
    } catch {
      parsed = { summary: text, actionItems: [], decisions: [], followUps: [] }
    }

    return NextResponse.json(parsed, {
      headers: { "X-RateLimit-Remaining": String(rl.remaining) },
    })
  } catch (error) {
    console.error("Gemini API error:", error)
    return NextResponse.json({ error: "Failed to generate summary. Please try again." }, { status: 500 })
  }
}
