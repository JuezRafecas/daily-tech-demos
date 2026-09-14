# daily-tech-demos

Daily tech demos from X bookmarks, with Cloudflare Pages preview deploys.

## Current Demo: COBE WebGL Globe

An interactive demo of [COBE](https://github.com/shuding/cobe) by [@shuding](https://github.com/shuding) — a lightweight ~5KB WebGL globe library with zero dependencies.

### Features

- **Full-viewport rotating WebGL globe** with smooth animations
- **Multiple city markers** (San Francisco, NYC, London, Tokyo, São Paulo) with varied sizes and colors
- **Interactive arcs** connecting major cities across the globe
- **CSS-anchored labels** using COBE's CSS anchor positioning API (`--cobe-{id}` variables)
- **Premium dark theme** with gradient text and subtle glow effects
- **Fully responsive** design optimized for desktop

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
- **TypeScript** - Type safety
- **COBE** - WebGL globe rendering (~5KB)
- **CSS Anchor Positioning** - Modern CSS for marker labels

### Project Structure

```
.
├── index.html          # Entry HTML with canvas and marker labels
├── src/
│   ├── main.ts         # Globe initialization and configuration
│   ├── style.css       # Dark theme and CSS-anchored label styles
│   └── vite-env.d.ts   # TypeScript declarations
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
└── vite.config.ts      # Vite build configuration
```

### COBE Configuration

The demo showcases key COBE features:

- **Auto-rotation** via `onRender` callback (phi increment)
- **Custom marker colors** and sizes for each city
- **Multiple arcs** with custom colors between cities
- **CSS anchor positioning** for labels bound to marker IDs
- **Visibility variables** (`--cobe-visible-{id}`) for smooth fade transitions
- **Dark mode optimized** with tuned `mapBrightness` and `glowColor`

### Browser Support

Requires a browser with:
- WebGL support
- CSS Anchor Positioning (Chrome 125+, Edge 125+)
  - For other browsers, labels won't position correctly but the globe still works

### License

Demo code is MIT licensed. COBE library is also MIT licensed.
