# SocialSync POC

This is a minimal proof of concept that generates a daily Instagram "thought of the day" post for a chosen vertical and can publish it automatically.

## Free-tool stack

- Google AI Studio free tier for text generation through Gemini.
- Sharp for rendering the post image locally.
- Cloudinary free tier for hosting the generated image with a public URL.
- Instagram Graph API for publishing to Instagram.
- GitHub Actions free tier for daily automation.

## Important Instagram constraint

Instagram auto-publishing only works with a **professional Instagram account**:

- Instagram Business or Creator account
- Connected to a Facebook Page
- Meta app with Instagram Graph API access

This does not work for a normal personal Instagram account.

## What the POC does

1. Generates a thought of the day for a vertical like `motivation`, `fitness`, `finance`, or `startup`.
2. Builds a square quote image.
3. Uploads the image to Cloudinary to get a public URL.
4. Publishes the image and caption to Instagram.
5. Saves run reports in `output/`.

## Setup

1. Copy `.env.example` to `.env`.
2. Fill in all required values.
3. Install dependencies:

```bash
npm install
```

4. Check configuration:

```bash
npm run check
```

5. Run a safe dry run first:

```bash
npm run run:once
```

When `DRY_RUN=true`, the app generates content, creates the image locally, and skips Instagram publishing. If Cloudinary credentials are present, it also uploads the image and returns a public URL.

## Environment variables

```env
VERTICAL=motivation
BRAND_NAME=Thought Loop
TIMEZONE=Asia/Singapore
DAILY_POST_CRON=0 9 * * *
DRY_RUN=true
GEMINI_API_KEY=
INSTAGRAM_BUSINESS_ACCOUNT_ID=
INSTAGRAM_ACCESS_TOKEN=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## Local scheduler

Run this if you want the process to stay alive and post daily on your machine:

```bash
npm start
```

This uses `node-cron` with the `DAILY_POST_CRON` schedule.

## Free daily automation without keeping your laptop on

Use the included GitHub Actions workflow in `.github/workflows/daily-post.yml`.

Add these repository secrets in GitHub:

- `VERTICAL`
- `BRAND_NAME`
- `TIMEZONE`
- `DAILY_POST_CRON`
- `DRY_RUN`
- `GEMINI_API_KEY`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `INSTAGRAM_BUSINESS_ACCOUNT_ID`
- `INSTAGRAM_ACCESS_TOKEN`

Then the workflow can run every day automatically.

GitHub Actions schedules are stored in the workflow file itself and use UTC. The included workflow runs at `01:30 UTC` by default, which is `09:30` in Singapore on most dates. Edit `.github/workflows/daily-post.yml` if you want a different publish time.

## Suggested POC path

1. Start with `DRY_RUN=true`.
2. Verify that the image and report are created in `output/`.
3. Create a professional Instagram account and Meta app if not already done.
4. Switch `DRY_RUN=false`.
5. Run `npm run run:once` to validate publishing.
6. Enable GitHub Actions for the daily schedule.

## Notes

- The content prompt is intentionally simple for POC speed.
- If `GEMINI_API_KEY` is missing, the app falls back to a small built-in quote set so the pipeline still works in dry-run mode.
- Cloudinary is used because Instagram requires a public image URL for media publishing.
