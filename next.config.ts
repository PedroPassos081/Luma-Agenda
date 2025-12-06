/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: true, // Isso diz ao navegador para memorizar esse redirecionamento
      },
    ];
  },
};

export default nextConfig;