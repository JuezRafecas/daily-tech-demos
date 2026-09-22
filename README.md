# daily-tech-demos

Daily tech demos from X bookmarks, with Cloudflare Pages preview deploys.

## Current Demo: Video States — Cinematic Click-Driven Video Website

An interactive demo based on [Amir Mušić's Video States pack](https://github.com/amirmushichge/video-states-website) — a cinematic fashion video experience with four click-driven state transitions.

### Features

- **Four interactive controls** (Scene, Lighting, Clothing, Cast) that play prepared forward/reverse video clips
- **Seam-safe video playback** with proper frame holding and state management
- **Glass UI design** with Manrope typography and restrained blue glass materials
- **Fully responsive** layout optimized for desktop and mobile
- **No runtime generation** — all transitions use pre-rendered LTX video clips

### Local Development

```bash
# Install dependencies
npm install

# Start dev server (typically http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Cloudflare Pages Deployment

#### Git Integration

1. Connect your repository to Cloudflare Pages
2. Configure the build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node version:** 18 or higher (set via environment variable `NODE_VERSION=18`)

The project will automatically build and deploy on every push.

### Tech Stack

- **Vite** - Fast build tool and dev server
- **React** - Component-based UI
- **TypeScript** - Type safety
- **Manrope** - Typography from Google Fonts
- **LTX-generated video** - Pre-rendered transitions from LTX Studio

### Project Structure

```
.
├── index.html          # Entry HTML
├── public/
│   ├── ltx-studio-logo.svg
│   └── retake/         # Video clips and reference images
├── src/
│   ├── main.tsx        # React app with video player logic
│   ├── style.css       # Glass UI and responsive styles
│   └── vite-env.d.ts   # TypeScript declarations
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
└── vite.config.ts      # Vite build configuration
```

### Attribution

Video assets and design concept by [Amir Mušić](https://github.com/amirmushichge). Original X bookmark: https://x.com/AmirMushich/status/2097673877539238021

### License

Demo code is MIT licensed. Video assets are licensed under CC BY 4.0 (see source pack).
