# ConveyX Training Game

This repository contains the ConveyX Training Game web application. It is built with Next.js and provides the main experience for practicing ConveyX workflows.

## Viewing the App Locally

Once the development server is running, open the landing page at [http://localhost:3000/](http://localhost:3000/). From there you can launch the interactive training experience at [http://localhost:3000/training](http://localhost:3000/training), which renders the `MainGame` component.

## Getting Started

1. Install dependencies:
   ```bash
   cd app
   yarn install
   ```
2. Run the development server:
   ```bash
   yarn dev
   ```
3. Visit the app in your browser using the link above.

## Static Export for GitHub Pages

GitHub Pages expects a collection of static files that includes an `index.html` entry point. The steps below describe how to generate those files from the Next.js project under `app/` and publish them so GitHub Pages can serve the site at [https://theboysday.github.io/conveyx-training-game](https://theboysday.github.io/conveyx-training-game).

### 1. Configure Next.js for Static Export

The application already ships with a `next.config.js` that enables static export when the `GITHUB_PAGES` environment variable is set. The relevant options are:

- `output: 'export'` – enables Next.js' static export mode.
- `basePath` and `assetPrefix` – automatically point to `/conveyx-training-game` when `GITHUB_PAGES=true`, ensuring assets load correctly when served from a repository sub-path.
- `images.unoptimized` and `trailingSlash` – remove Next.js' dynamic image loader and make every route resolve to an `.html` file, which matches how GitHub Pages serves static content.

No additional configuration changes are required before exporting.

### 2. Build and Export the Static Site

From the repository root run:

```bash
# Install dependencies if you have not already
cd app
yarn install

# Build and export the static site into app/out
export GITHUB_PAGES=true
yarn build
yarn export
```

This sequence runs `next build` followed by `next export`, producing an `app/out` directory that contains `index.html` alongside all other assets required by GitHub Pages.

To rebuild later you only need to repeat the `export GITHUB_PAGES=true`, `yarn build`, and `yarn export` commands.

### 3. Publish the Exported Files to GitHub Pages

GitHub Pages can either serve the repository root or a `docs/` folder. Choose the option that best matches your current GitHub Pages settings:

#### Option A – Serve from the repository root

1. Remove any previously exported files:
   ```bash
   git clean -fdX
   ```
   (This deletes untracked files such as a previous `index.html` in the root.)
2. Copy the freshly exported assets from `app/out/` into the repository root without overwriting source code:
   ```bash
   rsync -av --delete --exclude 'app' --exclude '.git' --exclude '.github' \
     --exclude 'README.md' --exclude 'docs' --exclude '.gitignore' \
     app/out/ ./
   ```
3. Commit and push the generated static files:
   ```bash
   git add .
   git commit -m "Publish static export"
   git push origin master
   ```

> **Tip:** keeping generated files in the repository root can make diffs noisy. Consider creating a dedicated `gh-pages` branch if you prefer to isolate the static output.

#### Option B – Serve from `docs/`

1. Copy the exported site into a `docs/` directory (created if necessary):
   ```bash
   mkdir -p docs
   rsync -av --delete app/out/ docs/
   ```
2. In your repository settings (`Settings → Pages`) change the Pages source to `Deploy from a branch → master → /docs`.
3. Commit and push the updated static files:
   ```bash
   git add docs
   git commit -m "Publish static export"
   git push origin master
   ```

Either approach leaves you with an `index.html` entry point where GitHub Pages expects it, ensuring the site renders correctly.

### 4. Automate the Deployment (Optional)

A GitHub Actions workflow can rebuild and publish the site on every push to `master`. The provided `.github/workflows/deploy-gh-pages.yml` workflow performs the following steps:

1. Checks out the repository.
2. Installs Node.js 18.x and project dependencies from `app/yarn.lock`.
3. Runs `yarn build` and `yarn export` with `GITHUB_PAGES=true` to generate `app/out`.
4. Publishes the contents of `app/out` to the `gh-pages` branch using `peaceiris/actions-gh-pages@v4`.

To use the workflow:

```bash
git push origin master
```

Then in the GitHub repository settings choose `Settings → Pages → Build and deployment → Source → Deploy from a branch` and set `Branch` to `gh-pages` with the `/ (root)` folder. GitHub Pages will serve the exported static files automatically after each push.

## Repository Structure

- `app/` – Next.js application source, including pages, components, and configuration.
- `.github/workflows/` – Continuous deployment workflow to rebuild and publish the static export.
- `docs/` – Optional location for static exports when serving GitHub Pages from `/docs`.
- `prisma/` – Database schema and Prisma client setup.
- `app/scripts/` – Utility scripts for development.

Feel free to explore the codebase to understand how the training game is implemented.
