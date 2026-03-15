/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/__clerk/:path*',
        destination: 'https://thankful-owl-17.clerk.accounts.dev/:path*',
      },
    ]
  },
};

export default nextConfig;
