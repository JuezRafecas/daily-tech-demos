import './style.css'
import createGlobe, { type COBEOptions } from 'cobe'

const canvas = document.getElementById('globe') as HTMLCanvasElement
if (!canvas) {
  throw new Error('Canvas element not found')
}

let phi = 0
let width = window.innerWidth
let height = window.innerHeight

// City coordinates [lat, lon]
const cities = {
  sf: [37.7749, -122.4194],
  nyc: [40.7128, -74.0060],
  london: [51.5074, -0.1278],
  tokyo: [35.6762, 139.6503],
  saoPaulo: [-23.5505, -46.6333],
}

// Extended options with onRender callback
interface ExtendedCOBEOptions extends COBEOptions {
  onRender?: (state: Record<string, any>) => void
}

const globe = createGlobe(canvas, {
  devicePixelRatio: 2,
  width: width * 2,
  height: height * 2,
  phi: 0,
  theta: 0.3,
  dark: 1,
  diffuse: 1.2,
  mapSamples: 20000,
  mapBrightness: 4,
  baseColor: [0.1, 0.1, 0.15],
  markerColor: [0.4, 0.5, 1],
  glowColor: [0.4, 0.5, 0.8],
  markers: [
    { 
      location: cities.sf as [number, number], 
      size: 0.08, 
      color: [0.4, 0.5, 1],
      id: 'sf'
    },
    { 
      location: cities.nyc as [number, number], 
      size: 0.06, 
      color: [1, 0.4, 0.6],
      id: 'nyc'
    },
    { 
      location: cities.london as [number, number], 
      size: 0.07, 
      color: [0.5, 1, 0.5],
      id: 'london'
    },
    { 
      location: cities.tokyo as [number, number], 
      size: 0.09, 
      color: [1, 0.6, 0.3],
      id: 'tokyo'
    },
    { 
      location: cities.saoPaulo as [number, number], 
      size: 0.05, 
      color: [1, 1, 0.3],
      id: 'saoPaulo'
    },
  ],
  arcs: [
    {
      from: cities.sf as [number, number],
      to: cities.tokyo as [number, number],
      color: [0.5, 0.6, 1],
      id: 'sf-tokyo'
    },
    {
      from: cities.nyc as [number, number],
      to: cities.london as [number, number],
      color: [0.8, 0.5, 0.8],
      id: 'nyc-london'
    },
    {
      from: cities.london as [number, number],
      to: cities.tokyo as [number, number],
      color: [0.6, 0.9, 0.6],
      id: 'london-tokyo'
    },
  ],
  arcColor: [0.5, 0.5, 1],
  arcWidth: 0.4,
  arcHeight: 0.5,
  markerElevation: 0.025,
  scale: 1,
  offset: [0, 0],
  onRender: (state: Record<string, any>) => {
    state.phi = phi
    phi += 0.005
    
    state.width = width * 2
    state.height = height * 2
  }
} as ExtendedCOBEOptions)

// Handle window resize
window.addEventListener('resize', () => {
  width = window.innerWidth
  height = window.innerHeight
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`
})

// Initial canvas sizing
canvas.style.width = `${width}px`
canvas.style.height = `${height}px`

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  globe.destroy()
})
