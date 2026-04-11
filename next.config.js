/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    // Evita que Next use /Users/ule por un package-lock.json suelto en el home.
    root: __dirname,
  },
};

module.exports = nextConfig;
