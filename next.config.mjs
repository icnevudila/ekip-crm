/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dxajmnnogcyyiexutret.supabase.co",
      },
    ],
  },
};

export default nextConfig;
