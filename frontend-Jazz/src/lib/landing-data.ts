/* ── Landing page static data ────────────────────── */

export const FEATURES = [
  {
    icon: "microphone" as const,
    title: "Multilingual Transcription",
    desc: "Understands Hindi, English, Hinglish, and code-switches seamlessly — just like your team actually talks.",
  },
  {
    icon: "sparkle" as const,
    title: "AI-Powered Summaries",
    desc: "Get instant meeting summaries with key decisions, action items, and follow-ups — generated in seconds.",
  },
  {
    icon: "list" as const,
    title: "Action Item Extraction",
    desc: "Never miss a follow-up. JazzWall auto-extracts tasks with owners and deadlines from your conversations.",
  },
  {
    icon: "lock" as const,
    title: "Enterprise-Grade Privacy",
    desc: "End-to-end encryption. SOC2 compliant. Your meeting data never leaves your workspace.",
  },
  {
    icon: "grid" as const,
    title: "One-Click Integrations",
    desc: "Works with Google Meet today. Zoom, Teams, and Slack integrations coming soon.",
  },
  {
    icon: "chart" as const,
    title: "Meeting Analytics",
    desc: "Track talk-time ratios, meeting frequency, and follow-up completion rates across your team.",
  },
]

export const STEPS = [
  { step: "01", title: "Paste your meeting link", desc: "Drop your Google Meet link into JazzWall. We join as a silent observer — no bot avatar, no interruptions." },
  { step: "02", title: "We listen & transcribe", desc: "Our AI captures everything in real-time — Hindi, English, Hinglish, code-switches — with speaker identification." },
  { step: "03", title: "Get instant notes", desc: "The moment your call ends, receive a structured summary with action items, decisions, and follow-ups." },
]

export const PLANS = [
  {
    name: "Starter", price: "₹0", period: "forever", desc: "For individuals getting started",
    features: ["5 meetings / month", "Multilingual transcription", "Basic summaries", "7-day history"],
    cta: "Get Started Free", highlight: false,
  },
  {
    name: "Pro", price: "₹999", period: "per month", desc: "For teams that run on meetings",
    features: ["Unlimited meetings", "Advanced AI summaries", "Action item tracking", "Integrations (Slack, Notion)", "Priority support"],
    cta: "Start Pro Trial", highlight: true,
  },
  {
    name: "Enterprise", price: "Custom", period: "", desc: "For organizations at scale",
    features: ["Everything in Pro", "SSO & SAML", "Custom AI training", "Dedicated CSM", "On-prem deployment", "SLA guarantee"],
    cta: "Contact Sales", highlight: false,
  },
]

export const TESTIMONIALS = [
  { name: "Priya S.", role: "Engineering Lead, Early Access Beta", quote: "JazzWall understands when our team switches between Hindi and English mid-sentence. No other tool we tested does this." },
  { name: "Arjun M.", role: "Product Manager, Early Access Beta", quote: "We save hours per week on meeting documentation. Action items just appear — no more manual note-taking." },
  { name: "Deepika N.", role: "CTO, Early Access Beta", quote: "Finally, an AI note-taker that actually works for Indian accents and multilingual meetings. Game changer." },
]

export const FAQS = [
  { q: "How does JazzWall join my meeting?", a: "Just paste your Google Meet link and JazzWall joins as a silent observer. No bot avatar shows up in the participant list, and there are no interruptions to your flow. Your participants won't even notice it's there — it simply listens, transcribes, and generates notes in the background." },
  { q: "Which languages are supported?", a: "We currently support Hindi, English, Hinglish (the mix of Hindi and English most Indian teams use), Marathi, and Tamil — with more Indian languages coming soon. Our AI is specifically trained on Indian speech patterns, accents, and real-time code-switching between languages." },
  { q: "Is my meeting data secure?", a: "Security is our top priority. All audio streams and transcripts are encrypted end-to-end using AES-256 encryption. We're working towards SOC2 compliance, your data is never shared with third parties, and we never use your meeting content to train our models. You can also delete your data at any time." },
  { q: "Can I try it for free?", a: "Yes! Our Starter plan is completely free forever — you get 5 meetings per month with full multilingual transcription and basic AI summaries. No credit card required to sign up. When you're ready for unlimited meetings and advanced features, you can upgrade to Pro." },
  { q: "Does it work with Zoom and Teams?", a: "Google Meet is fully supported today with one-click integration. Zoom and Microsoft Teams integrations are currently in development and launching soon. You can join our waitlist to get early access to these integrations as soon as they're ready." },
]

export const PREVIEW_MESSAGES = [
  { speaker: "Priya", text: "Toh main ye feature Tuesday tak ship kar dungi, theek hai?", color: "from-amber-400 to-orange-500" },
  { speaker: "Arjun", text: "Sounds good. Let me sync with the design team and get back.", color: "from-rose-400 to-orange-400" },
  { speaker: "Deepika", text: "Haan, aur make sure the API docs are updated before launch.", color: "from-orange-400 to-amber-500" },
]
