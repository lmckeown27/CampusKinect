# CampusKinect Web Frontend

A modern, responsive web application for the CampusKinect student community platform built with Next.js 14, TypeScript, and Tailwind CSS.

## 🚀 Production Ready

This frontend is now fully configured for production deployment with:
- ✅ Docker containerization
- ✅ nginx reverse proxy 
- ✅ SSL/HTTPS support
- ✅ Performance optimizations
- ✅ Security headers
- ✅ Health monitoring
- ✅ CI/CD pipeline

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## 🚢 Production Deployment

### Quick Deployment

```bash
# 1. Copy environment file
cp env.production.example .env.production

# 2. Update .env.production with your values

# 3. Deploy with Docker Compose
./deploy.sh

# 4. Or deploy to Vercel
DEPLOY_METHOD=vercel ./deploy.sh
```

### Deployment Options

1. **Docker Compose** (Recommended for VPS/dedicated servers)
   - Full nginx reverse proxy setup
   - SSL termination
   - Redis caching
   - Health monitoring

2. **Vercel** (Recommended for quick deployment)
   - Automatic SSL
   - Global CDN
   - Zero downtime deployments

3. **Manual Docker** (For custom orchestration)
   - Kubernetes
   - Docker Swarm
   - Custom container platforms

### Documentation

- 📖 **[Complete Production Guide](./production.md)** - Comprehensive deployment instructions
- 🔧 **Environment Configuration** - See `env.production.example`
- 🐳 **Docker Setup** - See `Dockerfile` and `docker-compose.prod.yml`
- 🏥 **Health Monitoring** - Available at `/api/health`

### Security Features

- Security headers (CSP, HSTS, etc.)
- Rate limiting
- Input validation
- HTTPS enforcement
- Vulnerability scanning

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
