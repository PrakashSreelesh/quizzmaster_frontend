const nextConfig = {
  /* config options here */
  allowedDevOrigins: ['192.168.1.9', 'localhost:3000'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
