# Math Care Center — Complete Setup & Authoring Guide

Welcome to **Math Care Center**, a modern mathematics educational platform built with Next.js 16 (App Router), React 19, Tailwind CSS v4, KaTeX math rendering, and Supabase / PostgreSQL.

---

## 🚀 1. Local Development Quick Start

### Prerequisites
- Node.js 22+
- PostgreSQL or Supabase database URL

### Steps
1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/mathcarecentre.git
   cd mathcarecentre
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   Set your database or Supabase credentials in `.env`:
   ```env
   DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. **Initialize Database Schema**:
   ```bash
   npx drizzle-kit push
   ```

5. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🐳 2. Running with Docker

Build and containerize the application with Docker:

```bash
# Build Docker image
docker build -t mathcarecentre .

# Run container on port 3000
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://postgres:postgres@host.docker.internal:5432/app_db" \
  mathcarecentre
```

---

## 💻 3. VS Code DevContainer Setup

A `.devcontainer/devcontainer.json` configuration is included for VS Code.

1. Install the **Dev Containers** extension in VS Code.
2. Open the project folder in VS Code.
3. Press `F1` and select **Dev Containers: Reopen in Container**.
4. Node.js 22 and PostgreSQL will be automatically configured for you.

---

## ⚡ 4. Supabase Setup Guide

This platform is 100% Supabase-ready:

1. Create a project at [supabase.com](https://supabase.com).
2. Get your `DATABASE_URL` from **Project Settings → Database → Connection String**.
3. Get your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from **Project Settings → API**.
4. Add these keys to `.env` or your production hosting provider (Vercel, Render, Railway, Fly.io).

---

## 📝 5. How to Write & Publish New Content

All educational content is written in Markdown / MDX files under the `content/` directory.

### Directory Structure
```
content/
├── docs/           # Start Guide & Formula Cheat Sheets
│   ├── index.mdx
│   ├── learning-path.mdx
│   └── formula-cheat-sheet.mdx
├── courses/        # Course Modules
│   ├── calculus.mdx
│   ├── linear-algebra.mdx
│   ├── algebra.mdx
│   └── probability.mdx
└── blog/           # Blog Essays
    ├── intuition-behind-calculus.mdx
    ├── mastering-linear-algebra-for-ai.mdx
    └── how-to-read-math-papers.mdx
```

---

### Writing a Blog Essay (`content/blog/my-essay.mdx`)

Create a new file in `content/blog/`:

```mdx
---
title: "The Geometry of Eigenvalues"
description: "Understanding matrix transformations through eigenvector directions."
date: "2025-02-01"
order: 4
---

## Introduction

An eigenvector of a linear transformation $A$ is a non-zero vector $v$ that does not change direction when $A$ is applied:

$$
A v = \lambda v
$$

Here $\lambda$ is the eigenvalue representing the scaling factor along $v$.

<Callout type="tip" title="Key Takeaway">
Eigenvectors form the invariant axes of a matrix transformation.
</Callout>
```

---

### Writing a Course Lesson (`content/courses/my-course.mdx`)

Create a new file in `content/courses/`:

```mdx
---
title: "Stokes' Theorem & Vector Calculus"
description: "Connecting surface integrals to line integrals along boundary curves."
order: 1
---

## Theorem Statement

<TheoremBox title="Stokes' Theorem" number="1">
For a smooth surface $S$ with boundary $\partial S$ and vector field $\mathbf{F}$:

$$
\oint_{\partial S} \mathbf{F} \cdot d\mathbf{r} = \iint_S (\nabla \times \mathbf{F}) \cdot d\mathbf{S}
$$
</TheoremBox>
```

### Adding a YouTube Video Lecture to a Course

To embed a YouTube video in a course lesson, specify its `youtubeId` in `src/lib/seed.ts`:

```ts
{
  slug: "calculus",
  title: "Calculus: Rate of Change to Stokes' Theorem",
  summary: "ε–delta limits, optimization, and Stokes' theorem.",
  collection: "courses",
  page: "calculus",
  youtubeId: "WUvTyaaNkzM", // YouTube Video ID
  minutes: 22,
}
```

The application automatically embeds a clean, responsive YouTube player at the top of the lesson!

---

### Writing Mathematics Formulas (KaTeX)

- **Inline math**: Use single dollar signs `$x^2 + y^2 = r^2$`.
- **Display block math**: Use double dollar signs:
  $$
  \int_a^b f(x)\,dx = F(b) - F(a)
  $$

---

## 🛠️ 6. Useful Scripts

- `npm run dev` — Start Next.js development server
- `npm run build` — Build production application
- `npx tsx scripts/lint.ts` — Validate MDX frontmatter & links
- `npx drizzle-kit push` — Push database schema changes
