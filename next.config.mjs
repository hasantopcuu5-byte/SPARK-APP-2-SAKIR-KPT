/** @type {import('next').NextConfig} */
const nextConfig = {
  // IP üzerinden dev erişiminde HMR WebSocket'ine izin ver (örn. 10.30.0.156:3000)
  allowedDevOrigins: ["10.30.0.156", "localhost"],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
