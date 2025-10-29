# Vercel Deployment Checklist

## Pre-Deployment Checklist

### ✅ Code Quality
- [ ] Run `npm run verify` (type-check + lint + build)
- [ ] All TypeScript errors resolved
- [ ] All ESLint warnings addressed
- [ ] No deprecated packages in `package.json`
- [ ] ReactFlow properly configured (if using workflow builder)

### ✅ Configuration
- [ ] `next.config.js` optimized for Vercel
- [ ] `.npmrc` configured correctly
- [ ] `tsconfig.json` strict mode enabled
- [ ] Environment variables documented

### ✅ Dependencies
- [ ] All dependencies up to date
- [ ] No security vulnerabilities (`npm audit`)
- [ ] Node.js version specified in `package.json` engines
- [ ] Lock file committed (`package-lock.json`)

## Vercel Deployment Steps

### 1. Connect Repository
- [ ] Connect GitHub repository to Vercel
- [ ] Select correct branch (usually `main` or `develop`)
- [ ] Verify root directory is `zyra-frontend` (if in monorepo)

### 2. Configure Build Settings
In Vercel project settings:

**Framework Preset:** Next.js  
**Root Directory:** `zyra-frontend` (if monorepo)  
**Build Command:** `npm run build` (default)  
**Output Directory:** `.next` (default)  
**Install Command:** `npm install` (default)  
**Node.js Version:** 18.x or 20.x

### 3. Environment Variables

Add these in **Vercel Dashboard → Settings → Environment Variables**:

#### Required (Production)
```env
NEXT_PUBLIC_APP_URL=https://zyra.vercel.app
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

#### Optional
```env
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your-code
```

**⚠️ Important:** Add these to **Production** environment tab

### 4. Deploy
- [ ] Push to connected branch
- [ ] Vercel will automatically deploy
- [ ] Monitor build logs for errors
- [ ] Verify deployment success

### 5. Post-Deployment Verification

#### Frontend Checks
- [ ] Site loads at `https://zyra.vercel.app`
- [ ] No console errors in browser
- [ ] All pages accessible
- [ ] Images load correctly
- [ ] API calls work (check Network tab)

#### Authentication Flow
- [ ] Signup flow works
- [ ] Login flow works
- [ ] Google OAuth redirects correctly
- [ ] OTP email delivery works
- [ ] Session persistence works

#### Dashboard & Features
- [ ] Dashboard loads user data
- [ ] AI chat functional
- [ ] Data upload works
- [ ] All navigation links work

#### Performance
- [ ] Lighthouse score > 90
- [ ] Page load < 3 seconds
- [ ] Images optimized
- [ ] No layout shifts

## Backend Deployment (Separate Service)

### Option 1: Render.com
1. Connect GitHub repository
2. Select `backend` directory as root
3. Build command: `npm install && npm run migrate`
4. Start command: `npm start`
5. Add all environment variables from backend `.env`

### Option 2: Railway.app
1. Connect GitHub repository
2. Select `backend` directory
3. Railway auto-detects Node.js
4. Add environment variables
5. Railway handles migrations automatically

### Option 3: Fly.io
1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Initialize: `fly launch` in backend directory
3. Deploy: `fly deploy`
4. Set secrets: `fly secrets set KEY=value`

## Database Setup (Production)

### Option 1: Neon.tech (Recommended)
1. Sign up at https://neon.tech
2. Create new project
3. Copy connection string
4. Update `DATABASE_URL` in backend environment variables
5. Run migrations: `npm run migrate`

### Option 2: Supabase
1. Sign up at https://supabase.com
2. Create new project
3. Copy connection string from Settings → Database
4. Update `DATABASE_URL`
5. Run migrations

### Option 3: Railway Postgres
1. Create Postgres service in Railway
2. Copy connection string
3. Update `DATABASE_URL`
4. Migrations run automatically

## Redis Setup (Production)

### Option 1: Upstash Redis (Recommended)
1. Sign up at https://upstash.com
2. Create Redis database
3. Copy connection URL
4. Update `REDIS_URL` in backend

### Option 2: Railway Redis
1. Add Redis service in Railway
2. Copy connection URL
3. Update `REDIS_URL`

## Post-Deployment Tasks

### 1. Custom Domain (Optional)
- [ ] Add custom domain in Vercel
- [ ] Configure DNS records
- [ ] Update `NEXT_PUBLIC_APP_URL`
- [ ] Update OAuth redirect URIs

### 2. Analytics Setup
- [ ] Enable Vercel Analytics in dashboard
- [ ] Add Google Analytics if needed
- [ ] Verify events are tracking

### 3. Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Configure uptime monitoring
- [ ] Set up performance monitoring

### 4. SEO
- [ ] Submit sitemap to Google Search Console
- [ ] Verify Google site verification
- [ ] Test Open Graph tags
- [ ] Verify meta tags

## Troubleshooting

### Build Fails
```bash
# Check logs in Vercel dashboard
# Common issues:
# - Missing environment variables
# - TypeScript errors
# - ESLint errors (if not ignored)
# - Missing dependencies
```

### Runtime Errors
- Check browser console
- Check Vercel function logs
- Verify API endpoints are accessible
- Check CORS configuration

### Environment Variables Not Working
- Ensure variables start with `NEXT_PUBLIC_` for client-side
- Redeploy after adding variables
- Check environment dropdown (Production/Preview/Development)

## Quick Commands

```bash
# Build locally to test
cd zyra-frontend
npm run build

# Test production build
npm run start

# Verify setup
./verify-setup.sh

# Check for issues
npm run type-check
npm run lint
npm audit
```

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

## ✅ Deployment Complete!

Once all checks pass, your Zyra frontend is live on Vercel! 🎉

