# Next.js + Prisma + Railway Deployment Guide

A comprehensive guide for deploying Next.js (App Router) applications with Prisma, Auth.js, and Railway. Based on real deployment experience and common pitfalls.

---

## Table of Contents

1. [Tech Stack Overview](#tech-stack-overview)
2. [Project Setup](#project-setup)
3. [Next.js 15/16 Breaking Changes](#nextjs-1516-breaking-changes)
4. [Prisma Configuration](#prisma-configuration)
5. [Auth.js (NextAuth v5) Setup](#authjs-nextauth-v5-setup)
6. [Railway Deployment](#railway-deployment)
7. [Environment Variables](#environment-variables)
8. [Common Errors & Solutions](#common-errors--solutions)
9. [Deployment Checklist](#deployment-checklist)

---

## Tech Stack Overview

| Component | Recommended | Purpose |
|-----------|-------------|---------|
| Framework | Next.js 15+ (App Router) | Full-stack React framework |
| Database | PostgreSQL | Relational database |
| ORM | Prisma | Type-safe database access |
| Auth | Auth.js v5 (NextAuth) | Authentication with magic links |
| Email | Resend | Transactional email delivery |
| Hosting | Railway | Cloud platform with Postgres |
| Forms | React Hook Form + Zod | Type-safe form validation |

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

- [ ] Home page loads
- [ ] Auth flow works (magic link sends, login succeeds)
- [ ] Database operations work
- [ ] Protected routes redirect correctly
- [ ] No errors in Deploy Logs

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

---

*Last updated: February 2026*
