/** @type {import('next').NextConfig} */
const nextConfig = {
  /* Aquí eliminamos cualquier mención a turbo */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
