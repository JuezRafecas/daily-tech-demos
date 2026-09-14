import './style.css'
import createGlobe from 'cobe'

const canvas = document.getElementById('globe') as HTMLCanvasElement
if (!canvas) {
  throw new Error('Canvas element not found')
}

// Simple animation state
let phi = 0

// City locations matching official demo style
const markers = [
  { location: [37.78, -122.44] as [number, number], size: 0.03, id: 'sf' },      // San Francisco
  { location: [40.71, -74.01] as [number, number], size: 0.03, id: 'nyc' },      // New York
  { location: [51.51, -0.13] as [number, number], size: 0.03, id: 'london' },    // London
  { location: [35.68, 139.65] as [number, number], size: 0.03, id: 'tokyo' },    // Tokyo
]

// Calculate canvas size
const updateSize = () => {
  const container = canvas.parentElement
  if (container) {
    const size = Math.min(container.clientWidth, container.clientHeight)
    const dpr = window.devicePixelRatio || 2
    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    return { width: canvas.width, height: canvas.height }
  }
  return { width: 1200, height: 1200 }
}

const { width: initialWidth, height: initialHeight } = updateSize()

// Create globe with official defaults
const globe = createGlobe(canvas, {
  devicePixelRatio: 2,
  width: initialWidth,
  height: initialHeight,
  phi: 0,
  theta: 0.2,
  dark: 0,
  diffuse: 1.2,
  mapSamples: 16000,
  mapBrightness: 6,
  baseColor: [1, 1, 1],
  markerColor: [0.2, 0.4, 1],
  glowColor: [1, 1, 1],
  markers: markers,
  arcs: [
    { from: [37.78, -122.44], to: [40.71, -74.01] },    // SF to NYC
    { from: [40.71, -74.01], to: [51.51, -0.13] },      // NYC to London
  ],
  arcColor: [0.3, 0.5, 1],
  arcWidth: 0.5,
  arcHeight: 0.3,
  scale: 1,
  offset: [0, 0],
})

// Simple animation loop - official pattern
function animate() {
  phi += 0.005
  globe.update({ phi })
  requestAnimationFrame(animate)
}

animate()

// Handle resize
let resizeTimeout: number
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout)
  resizeTimeout = window.setTimeout(() => {
    const { width, height } = updateSize()
    globe.update({ width, height })
  }, 100) as unknown as number
})

// Cleanup
window.addEventListener('beforeunload', () => {
  globe.destroy()
})
