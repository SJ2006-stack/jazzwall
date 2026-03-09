import type { MetadataRoute } from "next"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://jazzwall.ai"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/meeting/", "/dashboard"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
