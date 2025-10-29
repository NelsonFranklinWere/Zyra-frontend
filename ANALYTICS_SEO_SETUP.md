# Analytics & SEO Setup Guide

## Overview

This guide helps you set up analytics and SEO for your Zyra application on Vercel.

## Analytics Options

### Option 1: Vercel Analytics (Recommended) ⭐

**Why Vercel Analytics?**
- ✅ Built-in to Vercel
- ✅ Zero configuration
- ✅ Privacy-focused
- ✅ No performance impact
- ✅ Web Vitals tracking

**Setup:**

1. **Enable in Vercel Dashboard**
   - Go to Project Settings → Analytics
   - Enable "Web Analytics"
   - Copy Analytics ID

2. **Add to Environment Variables**
   ```env
   NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id
   ```

3. **Already Configured**
   - `next.config.js` automatically includes analytics if ID is present
   - No code changes needed!

---

### Option 2: Google Analytics 4

**Setup:**

1. **Create GA4 Property**
   - Go to https://analytics.google.com
   - Create new property
   - Copy Measurement ID (format: `G-XXXXXXXXXX`)

2. **Add to Environment Variables**
   ```env
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   ```

3. **Add Script to Layout**
   ```typescript
   // In app/layout.tsx
   import Script from 'next/script'
   
   // Add before </body>
   {process.env.NEXT_PUBLIC_GA_ID && (
     <>
       <Script
         src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
         strategy="afterInteractive"
       />
       <Script id="google-analytics" strategy="afterInteractive">
         {`
           window.dataLayer = window.dataLayer || [];
           function gtag(){dataLayer.push(arguments);}
           gtag('js', new Date());
           gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
         `}
       </Script>
     </>
   )}
   ```

---

### Option 3: Plausible Analytics

**Why Plausible?**
- ✅ Privacy-focused
- ✅ GDPR compliant
- ✅ Lightweight
- ✅ No cookie banners

**Setup:**

1. **Sign Up**
   - Go to https://plausible.io
   - Create account

2. **Add Domain**
   - Add `zyra.vercel.app` to your Plausible account
   - Copy script snippet

3. **Add to Layout**
   ```typescript
   // In app/layout.tsx
   import Script from 'next/script'
   
   {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
     <Script
       data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
       src="https://plausible.io/js/script.js"
       strategy="afterInteractive"
     />
   )}
   ```

---

## SEO Setup

### 1. Metadata (Already Configured ✅)

Your `app/layout.tsx` already includes comprehensive metadata:
- ✅ Title and description
- ✅ Open Graph tags
- ✅ Twitter Card tags
- ✅ Robots directives
- ✅ Canonical URLs

### 2. Sitemap Generation

**Create `app/sitemap.ts`:**
```typescript
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://zyra.vercel.app'
  
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/automation`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    // Add more pages...
  ]
}
```

### 3. Robots.txt

**Create `app/robots.ts`:**
```typescript
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://zyra.vercel.app'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/admin/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
```

### 4. Google Search Console Setup

1. **Verify Ownership**
   - Go to https://search.google.com/search-console
   - Add property: `https://zyra.vercel.app`
   - Choose "HTML tag" verification method
   - Copy verification code

2. **Add to Environment Variables**
   ```env
   NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your-verification-code
   ```

3. **Already Configured**
   - Metadata includes verification tag automatically

### 5. Submit Sitemap

After deployment:
1. Go to Google Search Console
2. Navigate to Sitemaps
3. Submit: `https://zyra.vercel.app/sitemap.xml`

---

## Open Graph Images

### Create OG Image

1. **Create Image**
   - Size: 1200x630px
   - Format: PNG or JPG
   - Include logo and tagline

2. **Save to Public Folder**
   ```
   public/zyra-og-image.png
   ```

3. **Already Configured**
   - Metadata includes OG image reference

---

## Environment Variables Summary

Add these to Vercel:

```env
# Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-id
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=zyra.vercel.app

# SEO
NEXT_PUBLIC_APP_URL=https://zyra.vercel.app
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your-code
```

---

## Verification Checklist

After setup:

- [ ] Analytics tracking working (check in dashboard)
- [ ] Metadata visible in page source
- [ ] OG tags verified (use https://www.opengraph.xyz/)
- [ ] Sitemap accessible at `/sitemap.xml`
- [ ] Robots.txt accessible at `/robots.txt`
- [ ] Google Search Console verified
- [ ] Sitemap submitted to Google
- [ ] Web Vitals tracking active

---

## Status: ✅ SEO Ready

Your Zyra application is now configured for optimal SEO and analytics tracking!

