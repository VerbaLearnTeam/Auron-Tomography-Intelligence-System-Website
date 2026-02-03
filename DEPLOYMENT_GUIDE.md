# Next.js + Railway Deployment Guide

A comprehensive guide for deploying Next.js (App Router) applications with Railway. Based on real deployment experience and common pitfalls across multiple production sites.

---

## Table of Contents

1. [Tech Stack Overview](#tech-stack-overview)
2. [Project Setup](#project-setup)
3. [Next.js 15/16 Breaking Changes](#nextjs-1516-breaking-changes)
4. [Framer Motion & Mobile Issues](#framer-motion--mobile-issues)
5. [CSS Best Practices](#css-best-practices)
6. [Prisma Configuration](#prisma-configuration)
7. [Auth.js (NextAuth v5) Setup](#authjs-nextauth-v5-setup)
8. [Railway Deployment](#railway-deployment)
9. [Environment Variables](#environment-variables)
10. [Common Errors & Solutions](#common-errors--solutions)
11. [Deployment Checklist](#deployment-checklist)

---

## Tech Stack Overview

### Full-Stack Application (with Database & Auth)

| Component | Recommended | Purpose |
|-----------|-------------|---------|
| Framework | Next.js 16+ (App Router) | Full-stack React framework |
| Database | PostgreSQL | Relational database |
| ORM | Prisma | Type-safe database access |
| Auth | Auth.js v5 (NextAuth) | Authentication with magic links |
| Email | Resend | Transactional email delivery |
| Hosting | Railway | Cloud platform with Postgres |
| Forms | React Hook Form + Zod | Type-safe form validation |
| Animation | Framer Motion | Production-grade animations |

### Marketing/Portfolio Site (Static)

| Component | Recommended | Purpose |
|-----------|-------------|---------|
| Framework | Next.js 16+ (App Router) | Static site generation |
| Styling | CSS Variables + Tokens | Design system |
| Animation | Framer Motion | Scroll reveals, transitions |
| Email | Resend | Contact form submission |
| Hosting | Railway | Simple deployment |
| Forms | React Hook Form + Zod | Type-safe validation |

### When to Use Which Stack

| Use Full-Stack When | Use Static When |
|---------------------|-----------------|
| User accounts needed | Marketing/portfolio site |
| Data persistence required | Contact form only |
| Admin dashboard needed | No user accounts |
| Complex business logic | Mostly static content |

---

## Project Setup

### Initial Setup

```bash
npx create-next-app@latest my-app --typescript --tailwind --app
cd my-app
npm install prisma @prisma/client @auth/prisma-adapter next-auth@beta resend
npm install react-hook-form @hookform/resolvers zod
npx prisma init
```

### File Structure

```
├── prisma/
│   └── schema.prisma
├── public/
│   └── logo.png
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── auth/[...nextauth]/route.ts
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   ├── lib/
│   │   ├── db/prisma.ts
│   │   └── auth/
│   ├── auth.ts
│   └── middleware.ts
├── .env.example
├── .gitignore
└── package.json
```

---

## Next.js 15/16 Breaking Changes

### 1. Async `cookies()` and `headers()`

**Problem:** In Next.js 15+, `cookies()` and `headers()` from `next/headers` return a `Promise`.

**Before (broken):**
```typescript
import { cookies } from "next/headers";

function getCookie() {
  return cookies().get("my-cookie")?.value; // ❌ Error
}
```

**After (fixed):**
```typescript
import { cookies } from "next/headers";

async function getCookie() {
  const cookieStore = await cookies();
  return cookieStore.get("my-cookie")?.value; // ✅ Works
}
```

### 2. Server Action Return Types

**Problem:** Server actions used with `<form action={...}>` must return `void` or `Promise<void>`.

**Before (broken):**
```typescript
"use server";

export async function myAction(formData: FormData) {
  // ... do stuff
  return { ok: true, data: result }; // ❌ Type error
}
```

**After (fixed):**
```typescript
"use server";

export async function myAction(formData: FormData): Promise<void> {
  // ... do stuff
  revalidatePath("/my-page");
  // No return value ✅
}
```

### 3. Zod `z.literal(true)` with Form Defaults

**Problem:** Using `z.literal(true)` for required checkboxes causes type errors with `defaultValues: false`.

**Before (broken):**
```typescript
const schema = z.object({
  agree: z.literal(true, { errorMap: () => ({ message: "Required" }) })
});

useForm({
  resolver: zodResolver(schema),
  defaultValues: { agree: false } // ❌ Type 'false' not assignable to 'true'
});
```

**After (fixed):**
```typescript
useForm({
  resolver: zodResolver(schema)
  // Don't specify defaultValues for z.literal(true) fields ✅
  // React Hook Form handles unchecked checkboxes automatically
});
```

### 4. Middleware and Edge Runtime

**Problem:** Middleware runs in Edge Runtime, which doesn't support Node.js APIs like `global`.

**Before (broken):**
```typescript
// middleware.ts
import { auth } from "@/auth"; // ❌ Imports Prisma → "global is not defined"

export default auth((req) => {
  // ...
});
```

**After (fixed):**
```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Check session cookie directly - no Prisma import ✅
  const sessionToken =
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value;

  if (!sessionToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}
```

---

## Framer Motion & Mobile Issues

### CRITICAL: Mobile Blank Page Issue

**Problem:** Pages appear blank on mobile in-app browsers (Instagram, Messages, Facebook, etc.) but work fine on desktop and after clicking internal links.

**Root Cause:** Framer Motion's `useInView` hook uses `IntersectionObserver`, which can fail to detect elements as "in view" on initial page load in mobile WebViews. Content stays at `opacity: 0` indefinitely.

**Symptoms:**
- Page is blank on first load from external link
- Header shows but content doesn't
- Clicking internal links (logo, nav) makes content appear
- Works perfectly on desktop

### Solution: Progressive Enhancement Pattern

**Never hide content with JavaScript.** Content must be visible by default, with animations as enhancement only.

#### 1. ScrollReveal Components - Show Content Before Mount

```typescript
"use client";

import { motion, useReducedMotion, useInView } from "framer-motion";
import { useRef, useState, useEffect, ReactNode } from "react";

export default function ScrollReveal({ children, className = "" }) {
  const [hasMounted, setHasMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    // Delay lets IntersectionObserver initialize properly on mobile
    const timer = setTimeout(() => setHasMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // CRITICAL: Show content immediately before mount
  if (!hasMounted || prefersReducedMotion) {
    return <div ref={ref} className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 1, y: 0 }}  // Start visible!
      animate={isInView ? "visible" : "initial"}
      variants={{
        initial: { opacity: 1, y: 0 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
      }}
    >
      {children}
    </motion.div>
  );
}
```

#### 2. Never Use `initial={{ opacity: 0 }}` in Page Components

**Bad:**
```typescript
<motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
  Hello World
</motion.h1>
```

**Good:**
```typescript
<ScrollReveal>
  <h1>Hello World</h1>
</ScrollReveal>
```

#### 3. Add CSS Fallback Rules

```css
/* Ensure content is visible even if JS fails */
main, .hero, .section, .container, .cards, .card,
h1, h2, h3, h4, p, .badge, .btn {
  opacity: 1;
  transform: none;
  visibility: visible;
}
```

### Loading Screen for Hydration

For complex animated sites, use a loading screen to ensure everything is hydrated before revealing content:

```typescript
"use client";

import { useState, useEffect } from "react";

export default function LoadingScreen({ children, minLoadTime = 800 }) {
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), minLoadTime);
    return () => clearTimeout(timer);
  }, [minLoadTime]);

  useEffect(() => {
    if (!isLoading) {
      setTimeout(() => setShowContent(true), 200);
    }
  }, [isLoading]);

  return (
    <>
      {isLoading && <YourLoadingUI />}
      <div style={{ opacity: showContent ? 1 : 0 }}>
        {children}
      </div>
    </>
  );
}
```

### Key Framer Motion Rules

| Do | Don't |
|----|-------|
| Use `hasMounted` pattern for scroll animations | Use `initial={{ opacity: 0 }}` directly on elements |
| Wrap animated content in scroll-aware components | Rely on `useInView` for initial visibility |
| Add CSS fallbacks for visibility | Hide content before JS loads |
| Test on mobile in-app browsers | Only test in Safari/Chrome on desktop |
| Use 100ms delay before enabling animations | Enable animations immediately on mount |

---

## CSS Best Practices

### Fix Overscroll Background Color

**Problem:** White background shows when scrolling past content bounds on iOS.

```css
html {
  background-color: #050709;  /* Match your dark theme */
  overscroll-behavior: none;
}

body {
  background-color: #050709;
  /* Your gradient on top */
  background-image: radial-gradient(...), linear-gradient(...);
  background-attachment: fixed;
}
```

### Mobile Responsive Essentials

```css
/* Prevent iOS zoom on input focus */
.input, .textarea, .select {
  font-size: 16px;  /* Must be 16px or larger */
}

/* Touch-friendly button sizes (Apple's 44px minimum) */
@media (hover: none) and (pointer: coarse) {
  .btn {
    min-height: 44px;
  }
}

/* Safe areas for notched devices (iPhone X+) */
@supports (padding: max(0px)) {
  .site-header {
    padding-left: max(18px, env(safe-area-inset-left));
    padding-right: max(18px, env(safe-area-inset-right));
  }
  
  .site-footer {
    padding-bottom: max(20px, env(safe-area-inset-bottom));
  }
}

/* Smooth scrolling with reduced motion respect */
html {
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}
```

### Premium Visual Enhancements

```css
/* Text rendering */
body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

/* Gradient text */
h1 {
  background: linear-gradient(135deg, #f3f4f6 0%, #7dd3fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Glassmorphism card */
.glass-card {
  background: linear-gradient(145deg, rgba(125, 211, 252, 0.08), rgba(15, 23, 42, 0.9));
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(148, 163, 184, 0.2);
}

/* Subtle noise texture */
body::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  opacity: 0.015;
  background-image: url("data:image/svg+xml,...");  /* SVG noise filter */
}
```

---

## Prisma Configuration

### Schema Setup (`prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Auth.js required models
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

### Prisma Client Singleton (`src/lib/db/prisma.ts`)

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

---

## Auth.js (NextAuth v5) Setup

### Auth Configuration (`src/auth.ts`)

```typescript
import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // USE JWT SESSIONS - Required for Edge-compatible middleware
  session: { strategy: "jwt" },
  providers: [
    Resend({
      from: process.env.EMAIL_FROM,
      apiKey: process.env.AUTH_RESEND_KEY
    })
  ],
  pages: {
    signIn: "/login"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    }
  }
});
```

### API Route (`src/app/api/auth/[...nextauth]/route.ts`)

```typescript
import { handlers } from "@/auth";
export const { GET, POST } = handlers;
```

### Key Auth.js Gotchas

1. **Always use JWT sessions** when you need middleware auth checks
2. **Don't import `@/auth` in middleware** - it pulls in Prisma
3. **Check session cookies directly** in middleware instead

---

## Railway Deployment

### Step-by-Step Setup

1. **Create Railway Project**
   - Go to [railway.app](https://railway.app)
   - New Project → Deploy from GitHub repo

2. **Add PostgreSQL**
   - Project canvas → + New → Database → PostgreSQL

3. **Configure Variables** (in web service, not Postgres)
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   AUTH_SECRET=<run: openssl rand -base64 32>
   AUTH_TRUST_HOST=true
   AUTH_RESEND_KEY=<from resend.com>
   EMAIL_FROM=Your App <onboarding@resend.dev>
   ```

4. **Configure Build Settings** (Settings tab)
   
   | Setting | Value |
   |---------|-------|
   | Build Command | `npx prisma generate && npm run build` |
   | Start Command | `npm run start` |
   | Pre-Deploy Command | `npx prisma migrate deploy` |

5. **Configure Networking**
   - Settings → Networking → Generate Domain
   - Set Target Port to match your app (usually `8080` on Railway, or set `PORT` env var)

6. **Deploy**
   - Deployments → Redeploy or push to GitHub

### Port Configuration

Railway sets `PORT=8080` by default. Next.js will use this automatically.

**Option A:** Set Target Port to `8080` in Networking settings

**Option B:** Add `PORT=3000` to Variables and set Target Port to `3000`

---

## Environment Variables

### Required Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:port/db

# Auth.js
AUTH_SECRET=<openssl rand -base64 32>
AUTH_TRUST_HOST=true

# Email (Resend)
AUTH_RESEND_KEY=re_xxxxx
EMAIL_FROM=Your App <onboarding@resend.dev>

# App
APP_URL=https://your-app.up.railway.app
```

### `.env.example` Template

```bash
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/myapp

# Auth.js - generate with: openssl rand -base64 32
AUTH_SECRET=
AUTH_TRUST_HOST=true

# Resend (resend.com)
AUTH_RESEND_KEY=
EMAIL_FROM="My App <onboarding@resend.dev>"

# App URLs
APP_URL=http://localhost:3000
```

### Security Notes

- Never commit `.env` files
- Use `${{ServiceName.VARIABLE}}` syntax in Railway for service references
- Resend requires domain verification for custom FROM addresses (use `@resend.dev` for testing)

---

## Common Errors & Solutions

### 1. "global is not defined"

**Cause:** Prisma or other Node.js code running in Edge Runtime (middleware)

**Solution:** 
- Use JWT sessions: `session: { strategy: "jwt" }`
- Don't import Prisma-dependent code in middleware
- Check cookies directly instead of using Auth.js `auth()` wrapper

### 2. "Property 'get' does not exist on type 'Promise<ReadonlyRequestCookies>'"

**Cause:** Next.js 15+ async `cookies()` API

**Solution:** Add `await` before `cookies()`:
```typescript
const cookieStore = await cookies();
const value = cookieStore.get("name");
```

### 3. "Type error: Type '...' is not assignable to type 'void'"

**Cause:** Server action returning a value when used with `<form action={...}>`

**Solution:** Change return type to `Promise<void>`, use `revalidatePath()` instead of returning data

### 4. "Repository not found" on git push

**Cause:** Remote URL doesn't match actual GitHub repo

**Solution:** 
```bash
git remote set-url origin https://github.com/USER/REPO.git
```

### 5. Railway "Not Found - Train has not arrived"

**Cause:** Port mismatch between app and Railway networking

**Solution:** Check Deploy Logs for actual port, update Target Port in Networking settings

### 6. Security vulnerabilities blocking Railway deploy

**Cause:** Outdated dependencies with known CVEs

**Solution:**
```bash
npm audit fix --force
git add -A && git commit -m "Fix security vulnerabilities" && git push
```

### 7. Blank page on mobile (content works after clicking links)

**Cause:** Framer Motion's `useInView`/`IntersectionObserver` failing on initial page load in mobile WebViews

**Symptoms:**
- Header shows, content blank
- Works after clicking any internal link
- Works on desktop
- Specifically fails in Instagram, Facebook, Messages in-app browsers

**Solution:** Use progressive enhancement pattern (see [Framer Motion & Mobile Issues](#framer-motion--mobile-issues)):
1. Add `hasMounted` state to scroll animation components
2. Show content as plain `<div>` before mount
3. Remove `initial={{ opacity: 0 }}` from page components
4. Add CSS fallback: `opacity: 1; transform: none;`

### 8. White background on iOS overscroll

**Cause:** `html` element doesn't have background color set

**Solution:**
```css
html {
  background-color: #050709;  /* Your dark background */
  overscroll-behavior: none;
}
```

### 9. Resend API key error during build

**Cause:** Resend client instantiated at module level, requires API key at build time

**Solution:** Lazy-load the Resend client:
```typescript
// Bad - runs at build time
const resend = new Resend(process.env.RESEND_API_KEY);

// Good - only runs when function is called
export async function sendEmail() {
  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);
  // ...
}
```

### 10. Zod v4 `required_error` not working

**Cause:** Zod v4 changed the API for error customization

**Solution:**
```typescript
// Zod v3 style (may not work in v4)
z.string({ required_error: "Required" })

// Zod v4 style
z.string().min(1, "Required")
```

---

## Deployment Checklist

### Before First Deploy

- [ ] `.env.example` documents all required variables
- [ ] `.gitignore` includes `.env`, `node_modules`, `.next`
- [ ] Prisma schema is complete
- [ ] `npm run build` succeeds locally
- [ ] No TypeScript errors

### Railway Configuration

- [ ] PostgreSQL service added
- [ ] `DATABASE_URL` references Postgres service
- [ ] All env vars set (AUTH_SECRET, AUTH_TRUST_HOST, etc.)
- [ ] Pre-deploy command: `npx prisma migrate deploy`
- [ ] Build command: `npx prisma generate && npm run build`  
- [ ] Start command: `npm run start`
- [ ] Public domain generated
- [ ] Target port matches app port (check Deploy Logs)

### After Deploy

- [ ] Home page loads on desktop
- [ ] Auth flow works (magic link sends, login succeeds)
- [ ] Database operations work
- [ ] Protected routes redirect correctly
- [ ] No errors in Deploy Logs

### Mobile Testing (CRITICAL)

- [ ] Test on iPhone Safari
- [ ] Test on iPhone in Instagram in-app browser
- [ ] Test on iPhone in Messages/iMessage links
- [ ] Test on Android Chrome
- [ ] Content visible on first load (not blank)
- [ ] No white background on overscroll
- [ ] Forms don't cause zoom on focus
- [ ] Buttons are large enough to tap (44px min)
- [ ] Loading screen shows (if implemented)
- [ ] All animations work after content loads

---

## Quick Reference Commands

```bash
# Local development
npm run dev

# Database
npx prisma generate          # Generate client after schema changes
npx prisma migrate dev       # Create and apply migrations (dev)
npx prisma migrate deploy    # Apply migrations (prod)
npx prisma studio            # GUI for database

# Git
git add -A && git commit -m "message" && git push

# Generate secrets
openssl rand -base64 32

# Check for vulnerabilities
npm audit
npm audit fix --force
```

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Auth.js Documentation](https://authjs.dev)
- [Railway Documentation](https://docs.railway.app)
- [Resend Documentation](https://resend.com/docs)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [React Hook Form Documentation](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)

---

## Project Examples

| Project | Type | Features |
|---------|------|----------|
| Auron Intelligence | Full-stack | Prisma, Auth.js, Protected routes, Admin dashboard |
| RMVS Portfolio | Static | Framer Motion animations, Contact form, Loading screen |

---

## Key Lessons Learned

1. **Test on mobile in-app browsers** - Desktop testing is not sufficient. Instagram, Messages, and Facebook WebViews behave differently than Safari/Chrome.

2. **Progressive enhancement is mandatory** - Never hide content with JavaScript. Content must be visible by default.

3. **IntersectionObserver is unreliable on mobile** - Don't depend on `useInView` for initial visibility. Use mount detection with fallbacks.

4. **100ms delay matters** - Give browser time to initialize observers before enabling animations.

5. **CSS fallbacks are your safety net** - Always have `opacity: 1` as default in CSS.

6. **Edge Runtime has limited Node.js support** - Middleware can't use Prisma, `global`, or most Node APIs.

7. **JWT sessions are Edge-compatible** - Use `session: { strategy: "jwt" }` for Auth.js with middleware.

8. **Lazy-load API clients** - Don't instantiate Resend/Stripe/etc. at module level.

9. **Set background on html element** - Prevents white flash on iOS overscroll.

10. **16px minimum font for inputs** - Prevents iOS zoom on focus.

---

*Last updated: February 3, 2026*
*Based on: Auron Intelligence Website, RMVS Portfolio Website deployments*
