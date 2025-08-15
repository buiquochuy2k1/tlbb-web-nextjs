// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' }, // mọi host HTTPS
      { protocol: 'http', hostname: '**' }, // (nếu bạn thật sự cần HTTP)
    ],
  },
};
export default nextConfig;
