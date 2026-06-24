/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare'e projenin statik dosyalar olarak derlenmesini söyler
  output: 'export', 
  
  allowedDevOrigins: ["10.30.0.156", "localhost"],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig