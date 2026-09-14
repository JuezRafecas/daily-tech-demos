import './style.css'
import createGlobe from 'cobe'

const canvas = document.getElementById('globe') as HTMLCanvasElement
if (!canvas) {
  throw new Error('Canvas element not found')
}

// Animation state
let phi = 0
let theta = 0.3
let isDragging = false
let lastPointerX = 0
let lastPointerY = 0
let pointerX = 0
let pointerY = 0

// City coordinates [lat, lon]
const cities = {
  sf: { location: [37.7749, -122.4194] as [number, number], size: 0.08, color: [0.0, 0.94, 1.0] as [number, number, number] },
  nyc: { location: [40.7128, -74.0060] as [number, number], size: 0.07, color: [1.0, 0.0, 0.8] as [number, number, number] },
  london: { location: [51.5074, -0.1278] as [number, number], size: 0.075, color: [0.5, 1.0, 0.3] as [number, number, number] },
  tokyo: { location: [35.6762, 139.6503] as [number, number], size: 0.09, color: [1.0, 0.5, 0.0] as [number, number, number] },
  saoPaulo: { location: [-23.5505, -46.6333] as [number, number], size: 0.06, color: [1.0, 0.95, 0.0] as [number, number, number] },
}

// Calculate canvas size with device pixel ratio
const updateSize = () => {
  const rect = canvas.parentElement?.getBoundingClientRect()
  if (rect) {
    const dpr = window.devicePixelRatio || 2
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`
    return { width: canvas.width, height: canvas.height }
  }
  return { width: 1600, height: 1600 }
}

const { width: initialWidth, height: initialHeight } = updateSize()

// Create globe with official-like configuration
const globe = createGlobe(canvas, {
  devicePixelRatio: 2,
  width: initialWidth,
  height: initialHeight,
  phi: 0,
  theta: 0.3,
  dark: 0,
  diffuse: 1.2,
  mapSamples: 16000,
  mapBrightness: 6,
  baseColor: [0.8, 0.8, 0.8],
  markerColor: [1, 0.5, 1],
  glowColor: [1, 1, 1],
  markers: [
    { 
      location: cities.sf.location, 
      size: cities.sf.size,
      color: cities.sf.color,
      id: 'sf'
    },
    { 
      location: cities.nyc.location, 
      size: cities.nyc.size,
      color: cities.nyc.color,
      id: 'nyc'
    },
    { 
      location: cities.london.location, 
      size: cities.london.size,
      color: cities.london.color,
      id: 'london'
    },
    { 
      location: cities.tokyo.location, 
      size: cities.tokyo.size,
      color: cities.tokyo.color,
      id: 'tokyo'
    },
    { 
      location: cities.saoPaulo.location, 
      size: cities.saoPaulo.size,
      color: cities.saoPaulo.color,
      id: 'saoPaulo'
    },
  ],
  arcs: [
    {
      from: cities.sf.location,
      to: cities.tokyo.location,
      color: [0.0, 0.9, 1.0],
      id: 'sf-tokyo'
    },
    {
      from: cities.nyc.location,
      to: cities.london.location,
      color: [0.9, 0.0, 0.9],
      id: 'nyc-london'
    },
    {
      from: cities.london.location,
      to: cities.tokyo.location,
      color: [0.5, 1.0, 0.4],
      id: 'london-tokyo'
    },
  ],
  arcColor: [1, 0.5, 1],
  arcWidth: 0.5,
  arcHeight: 0.4,
  markerElevation: 0.02,
  scale: 1.1,
  offset: [0, 0],
})

// Animation loop using requestAnimationFrame (official COBE API)
function animate() {
  if (!isDragging) {
    // Continuous auto-rotation
    phi += 0.005
    
    // Subtle parallax based on pointer position
    const parallaxY = (pointerY - 0.5) * 0.1
    theta = 0.3 + parallaxY
  }
  
  // Update globe with new phi/theta
  globe.update({
    phi,
    theta,
    width: canvas.width,
    height: canvas.height,
  })
  
  requestAnimationFrame(animate)
}

// Start animation
animate()

// Pointer interactions for drag
canvas.addEventListener('pointerenter', () => {
  canvas.style.opacity = '1'
})

canvas.addEventListener('pointerleave', () => {
  canvas.style.opacity = '0.95'
  isDragging = false
})

canvas.addEventListener('pointermove', (e) => {
  const rect = canvas.getBoundingClientRect()
  pointerX = (e.clientX - rect.left) / rect.width
  pointerY = (e.clientY - rect.top) / rect.height
  
  if (isDragging) {
    const deltaX = e.clientX - lastPointerX
    const deltaY = e.clientY - lastPointerY
    
    phi += deltaX * 0.01
    theta = Math.max(0, Math.min(Math.PI, theta - deltaY * 0.01))
    
    lastPointerX = e.clientX
    lastPointerY = e.clientY
  }
})

canvas.addEventListener('pointerdown', (e) => {
  isDragging = true
  lastPointerX = e.clientX
  lastPointerY = e.clientY
  canvas.style.cursor = 'grabbing'
})

canvas.addEventListener('pointerup', () => {
  isDragging = false
  canvas.style.cursor = 'grab'
})

// Handle window resize with globe.update()
let resizeTimeout: number
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout)
  resizeTimeout = window.setTimeout(() => {
    const { width, height } = updateSize()
    globe.update({ width, height })
  }, 100) as unknown as number
})

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  globe.destroy()
})
