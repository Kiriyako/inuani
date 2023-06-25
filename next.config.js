/** @type {import('next').NextConfig} */
const nextConfig = {}

module.exports = nextConfig

module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'artworks.thetvdb.com',
      },
      {
        protocol: 'https',
        hostname: 's4.anilist.co',
      },
    ],
  },
};
