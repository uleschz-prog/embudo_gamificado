/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {
    // Evita que Next use /Users/ule por un package-lock.json suelto en el home.
    root: __dirname,
  },
};

module.exports = nextConfig;
