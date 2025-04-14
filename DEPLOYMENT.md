# Cloudflare Deployment Instructions for StoryDraw

This document provides step-by-step instructions for deploying the StoryDraw collaborative drawing story game application to Cloudflare Pages with D1 database integration.

## Prerequisites

1. A Cloudflare account (free tier is sufficient)
2. Node.js and npm installed on your local machine
3. Git installed on your local machine

## Step 1: Clone the Repository

First, create a GitHub repository and push the code:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/story-draw-app.git
git push -u origin main
```

## Step 2: Set Up Cloudflare Pages

1. Log in to your Cloudflare dashboard
2. Navigate to "Pages" in the sidebar
3. Click "Create a project"
4. Choose "Connect to Git"
5. Connect your GitHub account if not already connected
6. Select the repository you created in Step 1
7. Configure your build settings:
   - Build command: `npm run build`
   - Build output directory: `.next`
   - Root directory: `/` (leave as default)
8. Click "Save and Deploy"

## Step 3: Create D1 Database

1. In your Cloudflare dashboard, navigate to "Workers & Pages"
2. Click on "D1" in the sidebar
3. Click "Create database"
4. Name your database "story_draw_db"
5. Choose a location close to your target audience
6. Click "Create database"
7. Once created, note the database ID (you'll need this later)

## Step 4: Apply Database Migrations

1. Install Wrangler CLI globally:
   ```bash
   npm install -g wrangler
   ```

2. Log in to Cloudflare via Wrangler:
   ```bash
   wrangler login
   ```

3. Update the `wrangler.toml` file with your database ID:
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "story_draw_db"
   database_id = "YOUR_DATABASE_ID" # Replace with your actual database ID
   ```

4. Apply the database migrations:
   ```bash
   wrangler d1 execute story_draw_db --file=migrations/0001_initial.sql
   ```

## Step 5: Configure Environment Variables

1. In your Cloudflare Pages project, go to "Settings" > "Environment variables"
2. Add the following environment variables:
   - `JWT_SECRET`: A random string for JWT token signing (e.g., generate with `openssl rand -hex 32`)
   - `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID (found in the dashboard URL)

## Step 6: Bind D1 Database to Your Application

1. In your Cloudflare Pages project, go to "Settings" > "Functions"
2. Under "D1 Database Bindings", click "Add binding"
3. Set the Variable name to "DB"
4. Select your "story_draw_db" database
5. Click "Save"

## Step 7: Deploy Updates

Whenever you make changes to your application:

1. Commit your changes to Git:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push
   ```

2. Cloudflare Pages will automatically detect the changes and deploy a new version

## Troubleshooting

- **Database Connection Issues**: Ensure your D1 database binding is correctly set up in the Cloudflare Pages settings
- **Build Failures**: Check the build logs in the Cloudflare Pages dashboard for specific errors
- **API Errors**: Use the "View Function Logs" feature in Cloudflare Pages to debug API issues

## Additional Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Next.js on Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/deploy-a-nextjs-site/)
