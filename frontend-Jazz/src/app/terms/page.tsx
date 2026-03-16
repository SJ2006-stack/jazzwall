export const runtime = "edge"

import Link from "next/link"

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <div className="max-w-3xl mx-auto px-6 py-24 sm:py-32">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors mb-10"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to home
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 font-display mb-4">
          Terms of Service
        </h1>
        <p className="text-sm text-zinc-400 mb-12">Last updated: March 7, 2026</p>

        <div className="prose prose-zinc prose-sm max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3 font-display">1. Acceptance of Terms</h2>
            <p className="text-zinc-600 leading-relaxed">
              By accessing or using JazzWall, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3 font-display">2. Service Description</h2>
            <p className="text-zinc-600 leading-relaxed">
              JazzWall provides AI-powered meeting transcription, summarization, and action item extraction for Google Meet (and soon Zoom and Microsoft Teams). The service joins meetings as a silent observer and processes audio in real-time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3 font-display">3. User Responsibilities</h2>
            <p className="text-zinc-600 leading-relaxed">
              You are responsible for ensuring all meeting participants are aware of and consent to the use of JazzWall. You must comply with all applicable local laws regarding recording and transcription of conversations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3 font-display">4. Intellectual Property</h2>
            <p className="text-zinc-600 leading-relaxed">
              You retain ownership of all meeting content processed by JazzWall. We do not claim any intellectual property rights over your transcripts, summaries, or any content generated from your meetings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3 font-display">5. Limitation of Liability</h2>
            <p className="text-zinc-600 leading-relaxed">
              JazzWall is provided &ldquo;as is&rdquo; without warranties of any kind. We are not liable for any inaccuracies in transcription or summarization. AI-generated content should be reviewed for accuracy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3 font-display">6. Contact</h2>
            <p className="text-zinc-600 leading-relaxed">
              For questions about these terms, contact us at{" "}
              <a href="mailto:hello@jazzwall.ai" className="text-amber-600 hover:text-amber-700 underline underline-offset-2">
                hello@jazzwall.ai
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
