/** @type {import('next').NextConfig} */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
let supabaseHostname = null

try {
  supabaseHostname = supabaseUrl ? new URL(supabaseUrl).hostname : null
} catch {
  supabaseHostname = null
}

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: supabaseHostname
      ? [
          {
            protocol: "https",
            hostname: supabaseHostname,
            pathname: "/storage/v1/object/public/venue-images/**",
          },
        ]
      : [],
  },
}

export default nextConfig
