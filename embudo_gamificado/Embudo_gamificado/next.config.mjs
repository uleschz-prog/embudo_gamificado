/** @type {import('next').NextConfig} */
const nextConfig = {
  /* Aqui eliminamos cualquier mencion a turbo */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
