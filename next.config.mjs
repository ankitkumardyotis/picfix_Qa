/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: false,
    domains: [
      "upcdn.io",
      "replicate.delivery",
      "lh3.googleusercontent.com",
      "via.placeholder.com",
      "text-to-video-generation-service.b0287d60c39debfb14d7e3f036436719.r2.cloudflarestorage.com",
      "picfix.ai",
      "picfixcdn.com",
      "replicate.com"
    ],

    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "upcdn.io",
        port: "",
        pathname: "/**",
      },
    ],
  },

  api: {
    bodyParser: {
      sizeLimit: "16mb", // Adjust this value as needed
    },
  },

  async redirects() {
    return [
      {
        source: '/restorePhoto/runModel',
        destination: '/ai-image-editor?model=gfp-restore',
        permanent: true,
      },
      {
        source: '/price',
        destination: '/pricing',
        permanent: true,
      },
      {
        source: '/backgroundRemoval/runModel',
        destination: '/ai-image-editor?model=background-removal',
        permanent: true,
      },
      {
        source: '/adding-stunning-colors-to-black-and-white-photos-using-ai',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/aiHomeMakeover/runModel',
        destination: '/ai-image-editor?model=home-designer',
        permanent: true,
      },
      {
        source: '/removeObject',
        destination: '/ai-image-editor?model=remove-object',
        permanent: true,
      },
      {
        source: '/restorePhoto',
        destination: '/ai-image-editor?model=restore-image',
        permanent: true,
      },
      {
        source: '/imageColorization',
        destination: '/ai-image-editor',
        permanent: true,
      },
      {
        source: '/backgroundRemoval',
        destination: '/ai-image-editor?model=background-removal',
        permanent: true,
      },
      {
        source: '/imageColorization/runModel',
        destination: '/ai-image-editor?model=image-colorization',
        permanent: true,
      },
      {
        source: '/object-removal',
        destination: '/ai-image-editor?model=object-removal',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
