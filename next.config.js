/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		domains: ["picsum.photos"],
	},
	experimental: {
		serverActions: true,
	},
};

module.exports = nextConfig;
