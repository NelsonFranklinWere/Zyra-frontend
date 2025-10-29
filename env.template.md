# Environment Variables Template

## Frontend Environment Variables (.env.local)

Copy this file to `.env.local` in the `zyra-frontend` directory and fill in your values.

```env
# Public Environment Variables (available in browser)
NEXT_PUBLIC_APP_URL=https://zyra.vercel.app
NEXT_PUBLIC_API_URL=https://zyra-backend.onrender.com/api
NEXT_PUBLIC_WS_URL=wss://zyra-backend.onrender.com

# Google OAuth (Frontend)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# Analytics (Optional)
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-vercel-analytics-id
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# SEO (Optional)
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your-google-site-verification-code
```

## Backend Environment Variables

### Development (.env)
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=zyra_db
DB_USER=zyra_user
DB_PASSWORD=zyra_password
DATABASE_URL=postgresql://zyra_user:zyra_password@localhost:5432/zyra_db

# Redis
REDIS_URL=redis://localhost:6379

# JWT & Security
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN_MS=604800000
JWT_REFRESH_EXPIRES_IN_MS=2592000000
SESSION_SECRET=zyra_session_secret_2025

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3002

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password_here
SMTP_FROM=noreply@zyra.com

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback

# Twilio (SMS)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
OTP_RATE_LIMIT_MAX_REQUESTS=5
OTP_VERIFICATION_RATE_LIMIT=10
AUTH_RATE_LIMIT_MAX_REQUESTS=10

# Node Environment
NODE_ENV=development
PORT=3001
```

### Production (Vercel/Render/Railway)
```env
# Database (Use Neon, Supabase, or Railway Postgres)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Redis (Use Upstash Redis or Railway Redis)
REDIS_URL=redis://default:password@host:6379

# JWT & Security
JWT_SECRET=generate-a-strong-random-secret-here
JWT_EXPIRES_IN_MS=604800000
JWT_REFRESH_EXPIRES_IN_MS=2592000000
SESSION_SECRET=generate-another-strong-secret-here

# CORS
CORS_ORIGIN=https://zyra.vercel.app
FRONTEND_URL=https://zyra.vercel.app

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_production_email@gmail.com
SMTP_PASS=your_gmail_app_password
SMTP_FROM=noreply@zyra.com

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://zyra-backend.onrender.com/api/auth/google/callback

# Twilio (SMS)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
OTP_RATE_LIMIT_MAX_REQUESTS=5
OTP_VERIFICATION_RATE_LIMIT=10
AUTH_RATE_LIMIT_MAX_REQUESTS=10

# Node Environment
NODE_ENV=production
PORT=3001
```

## Vercel Environment Variables Setup

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

2. Add these variables for **Production** environment:

### Required Variables
```
NEXT_PUBLIC_APP_URL=https://zyra.vercel.app
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

### Optional Variables
```
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-id
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your-code
```

## Security Notes

⚠️ **Never commit `.env` files to Git**

- ✅ `.env.local` is already in `.gitignore`
- ✅ Use Vercel's environment variables for production
- ✅ Use secrets management for sensitive data
- ✅ Rotate secrets regularly

## Generating Secrets

```bash
# Generate JWT Secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate Session Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

