# 🧠 Creator Intelligence Module

<div align="center">

![Creator Intelligence Module Banner](https://img.shields.io/badge/Creator%20Intelligence-Module-6c63ff?style=for-the-badge&logo=instagram&logoColor=white)

**A full-stack Instagram creator analytics platform powered by AI — **

[![Next.js](https://img.shields.io/badge/Next.js-16.2.9-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Gemini AI](https://img.shields.io/badge/Gemini-2.5%20Flash-4285f4?style=flat-square&logo=google)](https://ai.google.dev/)
[![Apify](https://img.shields.io/badge/Apify-Comment%20Scraper-00b300?style=flat-square&logo=apify)](https://apify.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

[🚀 Live Demo](#) · [📂 GitHub Repo](https://github.com/gauravsahu188/Creator-Intelligence-Module) · [📬 Contact](#)

</div>

---

## 📖 Project Description

The **Creator Intelligence Module** is a full-stack web application that takes an Instagram creator's handle, scrapes their public profile and last 12 posts, classifies every comment using Google Gemini AI, estimates aggregate audience demographics, and presents everything in a beautiful interactive analytics dashboard.

This project was built as part of an internship assignment to demonstrate real-world data engineering, AI/ML integration, and full-stack web development skills.

**Problem it solves:** Brands and marketers need to quickly assess whether an Instagram creator's audience is genuine, what they talk about, and who they are — this module automates that entire intelligence pipeline end-to-end.

---

## ✨ Features

### 🔍 Creator Data Collection
- Scrapes Instagram public profile: handle, display name, HD avatar, bio, external link, verified status, follower/following/post counts
- Extracts last **12 posts** (both collab/sponsored and personal): likes, comments, media type, thumbnail, caption, timestamp
- Computes **engagement metrics**: avg. likes, avg. comments, engagement rate, and identifies the top-performing post

### 🤖 AI Comment Classification (via Gemini 2.5 Flash)
Every comment across all 12 posts is classified across 6 buckets:

| Bucket | Values |
|--------|--------|
| **Authenticity** | Genuine / Spam (emoji-only, repeated text, link-drops, bot handles) |
| **Bot-likelihood** | Human / Likely-bot / Uncertain |
| **Political Inclination** | Positive / Neutral / Negative (with party identification) |
| **Relevance** | On-topic / Off-topic / Generic |
| **Type** | Praise / Question / Criticism / Tag-a-friend / Sales-or-promo / Other |
| **Language/Script** | English / Hindi / Hinglish / Regional — Hinglish flagged for manual review |

### 👥 Aggregate Audience Demographics
- **Gender split**: Female % / Male % / Undisclosed % (all three reported)
- **Interest cohort classification** across 10 niche categories
- **Political inclination distribution** with High / Medium / Low confidence levels

### 📊 Interactive Analytics Dashboard
- Real-time job progress tracking with live status polling
- Glassmorphic dark-mode UI with smooth animations
- Engagement trend chart — Likes vs. Comments across all 12 posts
- Sentiment, comment type, bot-likelihood, and language distribution charts
- Paginated results table with search, sort, filter, and CSV/JSON export

### 🏗 Async Job Architecture
- Non-blocking background processing — UI never times out
- Chunked Gemini API calls (100 comments/chunk) to respect rate limits
- Real-time progress reporting: `Scraping → Processing_ML → Completed`

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16.2.9 (App Router, TypeScript) |
| **Frontend** | React 19, Tailwind CSS v4, Recharts, Lucide Icons |
| **Backend** | Next.js API Routes (serverless + background workers) |
| **Database** | PostgreSQL 14+ (via `pg` driver, auto-schema init) |
| **AI / ML** | Google Gemini 2.5 Flash (`@google/genai`) |
| **Data Collection** | ScrapOps Residential Proxy + Apify Instagram Comment Scraper |
| **HTTP Client** | `got-scraping` (residential proxy-aware), `node-fetch` |
| **HTML Parsing** | Cheerio |

---

## 🗂 Project Structure

```
creator-intelligence-module/
├── app/
│   ├── api/
│   │   ├── analyze/          # POST — start scrape + analysis job
│   │   ├── jobs/[jobId]/     # GET  — poll job status & fetch results
│   │   ├── results/          # GET  — paginated profile listing
│   │   ├── stats/            # GET  — aggregated dashboard stats
│   │   ├── download/         # GET  — CSV / JSON export
│   │   └── proxy-image/      # GET  — image proxy (avoids hotlink blocks)
│   ├── results/              # Results listing page
│   ├── page.tsx              # Main search page
│   └── layout.tsx
├── components/
│   ├── Dashboard.tsx         # Main analytics dashboard (charts + tables)
│   ├── HeroSearch.tsx        # Landing search input
│   ├── ProfileHeader.tsx     # Creator profile card
│   ├── ProgressCard.tsx      # Real-time job progress tracker
│   ├── RecentPostsGrid.tsx   # Post thumbnail grid
│   ├── ResultsTable.tsx      # Paginated + sortable results table
│   ├── StatsCard.tsx         # Metric summary cards
│   ├── DemographicsCard.tsx  # Audience demographics display
│   └── HealthGauge.tsx       # Authenticity health gauge
├── lib/
│   ├── ai/
│   │   ├── gemini.ts         # Gemini batch comment classification
│   │   └── heuristics.ts     # Bio-based demographic inference
│   ├── db/
│   │   └── schema.sql        # PostgreSQL schema definition
│   ├── instagram/
│   │   ├── scraper.ts        # ScrapOps proxy Instagram scraper
│   │   └── apify.ts          # Apify comment scraper integration
│   └── AppContext.tsx        # Global React context
└── types/                    # Shared TypeScript type definitions
```

---

## 🗄 Database Schema

```
+-------------------+
|       jobs        |   Tracks job lifecycle & chunk progress
+-------------------+
| id (PK, UUID)     |
| username          |
| status            |   Scraping | Processing_ML | Completed | Failed
| apify_run_id      |
| total_chunks      |
| processed_chunks  |
| created_at        |
| updated_at        |
+-------------------+
          |
          ▼
+-------------------+     +-------------------+     +-------------------+
|     profiles      |────▶|       posts       |────▶|     comments      |
+-------------------+     +-------------------+     +-------------------+
| id (PK)           |     | id (PK)           |     | id (PK)           |
| username (Unique) |     | profile_id (FK)   |     | post_id (FK)      |
| full_name         |     | shortcode (Unique)|     | username          |
| bio               |     | caption           |     | raw_text          |
| followers         |     | likes_count       |     | authenticity      |
| following_count   |     | comments_count    |     | bot_likelihood    |
| post_count        |     | media_type        |     | political_stance  |
| is_verified       |     | thumbnail_url     |     | political_party   |
| is_private        |     | timestamp         |     | relevance         |
| profile_pic_url   |     | created_at        |     | comment_type      |
| external_url      |     +-------------------+     | language          |
| female_pct        |                               | created_at        |
| male_pct          |                               +-------------------+
| undisclosed_pct   |
| interest_cohort   |
| scraped_at        |
+-------------------+
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/analyze` | Start a new analysis job for an Instagram handle |
| `GET` | `/api/jobs/[jobId]` | Poll job status or retrieve completed results |
| `GET` | `/api/results` | Paginated list of all analyzed profiles |
| `GET` | `/api/stats` | Aggregated platform-wide summary metrics |
| `GET` | `/api/download` | Export profiles as `csv` or `json` |
| `GET` | `/api/proxy-image` | Proxy Instagram CDN images to avoid hotlink blocks |

---

## ⚙️ System Architecture

```
                        ┌─────────────────────┐
                        │   Frontend (Next.js) │
                        │  Search → Poll → UI  │
                        └──────────┬──────────┘
                                   │ POST /api/analyze
                                   ▼
                        ┌─────────────────────┐
                        │  POST /api/analyze  │
                        │  1. Create DB job   │
                        │  2. Scrape profile  │──▶ ScrapOps Proxy ──▶ Instagram
                        │  3. Return jobId    │
                        └──────────┬──────────┘
                                   │ (background, non-blocking)
                     ┌─────────────▼─────────────┐
                     │      Background Worker      │
                     │  1. Persist profile + posts │
                     │  2. Apify → fetch comments  │──▶ Apify ──▶ Instagram
                     │  3. Chunk comments (100)    │
                     │  4. Gemini classify each    │──▶ Gemini 2.5 Flash
                     │  5. Save results to DB      │
                     │  6. Update job: Completed   │
                     └─────────────────────────────┘
                                   │
                        ┌──────────▼──────────┐
                        │   GET /api/jobs/id  │◀── Frontend polls every 3s
                        │   Returns status    │
                        │   + full payload    │
                        └─────────────────────┘

---

## 💸 Cost Optimization & Logic

This module was designed as a test platform and heavily optimized to remain within free tiers and minimize external API costs.

### Why Apify Only for Comments?
We utilize **Apify** exclusively for scraping Instagram comments, while the primary profile and post data is scraped using a custom residential proxy setup. Apify provides a highly robust Instagram comment scraper that handles pagination and anti-bot measures flawlessly. To **minimize costs**, we bundle all comment scraping into a **single API call** rather than launching multiple runs per post. We pass the URLs for all 12 posts in one run, significantly reducing compute usage and Apify platform fees per analysis.

### Comment Scraping Limits
As this is an exploratory test platform, we introduced a strict limit of **30 comments per post**. This acts as a safeguard against runaway costs and ensures that our Apify free credit consumption remains predictable.
> **Disclaimer:** If you decide to increase the limit above 30 comments per post in the codebase, please be aware that **your Apify usage and costs will increase proportionally**, as the Apify Actor charges based on compute time and the volume of data extracted.

### AI Processing: Gemini vs Hugging Face
We chose **Google Gemini 2.5 Flash** for comment classification instead of running open-source models (e.g., from Hugging Face) because:
- **Cost & Speed:** The Gemini 2.5 Flash model offers a generous free tier with incredibly fast inference times, making it ideal for bulk text processing.
- **No Infrastructure Overhead:** It provides excellent zero-shot classification and complex sentiment analysis without the need to provision, manage, or pay for expensive GPU instances that would be required to run equivalent Hugging Face models at scale.

### Chunking for Rate Limits
To crack the Gemini API free-tier rate limits and handle large context windows efficiently, we implemented a **chunking strategy**. Scraped comments are batched into chunks of 100 before being sent to the Gemini model. This ensures we don't hit token payload size restrictions or exceed the requests-per-minute (RPM) quota, maintaining a stable, free, and non-blocking background processing pipeline.
```

---

## ☁️ Deployment

For production deployments, the application is pre-configured to run on **Railway** connected to a **Supabase** PostgreSQL database.

See the detailed, step-by-step [Deployment Guide](file:///Users/gauravsahu/Downloads/Gumroad%20-%20The%20Ultimate%20Web%20Scraping%20Course%20-%20Adrian%20Horning/WebScraping%20Code/Creator%20Intelligence%20Module/DEPLOYMENT.md) for full setup instructions.

---

## 🚀 Local Setup & Installation

### Prerequisites

- **Node.js** v18 or newer
- **PostgreSQL** v14 or newer (running locally)
- API keys for: ScrapOps, Apify, Google Gemini

### Step 1 — Clone the Repository

```bash
git clone https://github.com/gauravsahu188/Creator-Intelligence-Module.git
cd Creator-Intelligence-Module
```

### Step 2 — Install Dependencies

```bash
npm install
```

### Step 3 — Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# ScrapOps Residential Proxy (for Instagram scraping)
SCRAPEOPS_API_KEY=your_scrapeops_api_key_here

# PostgreSQL Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=instagram_scrapper_data
DB_USER=postgres
DB_PASSWORD=your_postgres_password_here

# Apify (Instagram comment scraper)
APIFY_API_TOKEN=your_apify_token_here

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here
```

> **Note:** A `.env.example` file is provided with placeholder values for reference.

### Step 4 — Set Up PostgreSQL Database

Create the database in PostgreSQL:

```sql
CREATE DATABASE instagram_scrapper_data;
```

> The application will **automatically initialize all tables** on first launch using the embedded schema.

### Step 5 — Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The app is ready! 🎉

---

## 📸 Screenshots

> *(Add your screenshots here after deploying or running locally)*

| Feature | Preview |
|---------|---------|
| 🔍 Search Page | *(screenshot)* |
| ⏳ Progress Tracker | *(screenshot)* |
| 📊 Analytics Dashboard | *(screenshot)* |
| 📋 Results Table | *(screenshot)* |

---

## 🔑 API Keys — Where to Get Them

| Service | Where to Get | Free Tier |
|---------|-------------|-----------|
| **ScrapOps** | [scrapeops.io](https://scrapeops.io) | ✅ 1,000 req/month free |
| **Apify** | [apify.com](https://apify.com) | ✅ $5 free credit |
| **Google Gemini** | [aistudio.google.com](https://aistudio.google.com) | ✅ Free tier available |
| **PostgreSQL** | [postgresql.org](https://postgresql.org) | ✅ Free & open source |

---

## 🧠 Interest Cohort Classification

The module classifies creators and their audiences into one of 10 niche interest cohorts:

| Cohort | Examples |
|--------|---------|
| Beauty & Personal Care | Makeup, skincare, grooming |
| Fashion & Lifestyle | Apparel, styling, daily-life vlogging |
| Fitness & Wellness | Gym, yoga, nutrition, sport |
| Food & Cooking | Recipes, food reviews, regional cuisine |
| Tech & Gadgets | Reviews, how-to, unboxing |
| Travel | Destinations, regional tourism |
| Entertainment & Comedy | Skits, memes, reactions |
| Education & Knowledge | Exam prep, skilling, explainers |
| Parenting & Family | Homemaking, kids, family vlogs |
| Devotional / Spiritual | Faith-based lifestyle content |

---

## 👤 Author

**Gaurav Sahu**
- GitHub: [@gauravsahu188](https://github.com/gauravsahu188)
- LinkedIn: [linkedin.com/in/gaurav-sahu-932817195]

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">

Built with ❤️ as part of an internship assignment.

**Stack:** Next.js · TypeScript · PostgreSQL · Gemini AI · Apify · ScrapOps

</div>
