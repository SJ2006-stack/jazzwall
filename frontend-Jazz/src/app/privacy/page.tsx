export const runtime = "edge"

import Link from "next/link"

export default function PrivacyPolicy() {
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
          Privacy Policy
        </h1>
        <p className="text-sm text-zinc-400 mb-12">Last updated: March 7, 2026</p>

        <div className="prose prose-zinc prose-sm max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3 font-display">1. Information We Collect</h2>
            <p className="text-zinc-600 leading-relaxed">
              JazzWall collects information necessary to provide our AI meeting notes service. This includes your Google account information (name, email) when you sign in, meeting audio for real-time transcription, and generated transcripts and summaries.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3 font-display">2. How We Use Your Data</h2>
            <p className="text-zinc-600 leading-relaxed">
              Your meeting data is used solely to provide transcription, summarization, and action item extraction services. We do not sell your data to third parties, and we never use your meeting content to train our AI models.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3 font-display">3. Data Security</h2>
            <p className="text-zinc-600 leading-relaxed">
              All audio streams and transcripts are encrypted end-to-end using AES-256 encryption. Data is stored securely and access is restricted to authorized systems. We are working towards SOC2 compliance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3 font-display">4. Data Retention & Deletion</h2>
            <p className="text-zinc-600 leading-relaxed">
              You can delete your meeting data at any time from your dashboard. When you delete data, it is permanently removed from our systems within 30 days. If you delete your account, all associated data is purged.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3 font-display">5. Contact Us</h2>
            <p className="text-zinc-600 leading-relaxed">
              For privacy-related questions or concerns, please contact us at{" "}
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
