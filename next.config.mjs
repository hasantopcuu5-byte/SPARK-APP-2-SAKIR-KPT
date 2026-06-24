/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',  // 'export' yerine bu

  allowedDevOrigins: ["10.30.0.156", "localhost"],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig