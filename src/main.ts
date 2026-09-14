import './style.css'
import createGlobe, { type COBEOptions } from 'cobe'

const canvas = document.getElementById('globe') as HTMLCanvasElement
if (!canvas) {
  throw new Error('Canvas element not found')
}

// State
let phi = 0
let theta = 0.3
let width = 0
let height = 0
let pointerX = 0
let pointerY = 0
let targetPhi = 0
let targetTheta = 0.3

// City coordinates [lat, lon] with pulsing colors
const cities = {
  sf: { location: [37.7749, -122.4194] as [number, number], size: 0.1, baseColor: [0.0, 0.94, 1.0] as [number, number, number] },
  nyc: { location: [40.7128, -74.0060] as [number, number], size: 0.08, baseColor: [1.0, 0.0, 0.8] as [number, number, number] },
  london: { location: [51.5074, -0.1278] as [number, number], size: 0.09, baseColor: [0.5, 1.0, 0.3] as [number, number, number] },
  tokyo: { location: [35.6762, 139.6503] as [number, number], size: 0.12, baseColor: [1.0, 0.5, 0.0] as [number, number, number] },
  saoPaulo: { location: [-23.5505, -46.6333] as [number, number], size: 0.07, baseColor: [1.0, 0.95, 0.0] as [number, number, number] },
}

// Pulsing animation for markers
let pulseTime = 0
const getPulseColor = (baseColor: [number, number, number], offset: number = 0): [number, number, number] => {
  const pulse = 0.7 + 0.3 * Math.sin((pulseTime + offset) * 0.002)
  return [
    baseColor[0] * pulse,
    baseColor[1] * pulse,
    baseColor[2] * pulse
  ]
}

// Extended options with onRender callback
interface ExtendedCOBEOptions extends COBEOptions {
  onRender?: (state: Record<string, any>) => void
}

// Calculate responsive sizing
const updateSize = () => {
  const rect = canvas.parentElement?.getBoundingClientRect()
  if (rect) {
    width = rect.width
    height = rect.height
  }
}

updateSize()

// Create globe with enhanced configuration
const globe = createGlobe(canvas, {
  devicePixelRatio: 2,
  width: width * 2,
  height: height * 2,
  phi: 0,
  theta: 0.3,
  dark: 1,
  diffuse: 1.8,
  mapSamples: 24000,
  mapBrightness: 3.5,
  mapBaseBrightness: 0.05,
  baseColor: [0.05, 0.05, 0.08],
  markerColor: [0.4, 0.6, 1.0],
  glowColor: [0.2, 0.4, 0.8],
  markers: [
    { 
      location: cities.sf.location as [number, number], 
      size: cities.sf.size,
      color: cities.sf.baseColor,
      id: 'sf'
    },
    { 
      location: cities.nyc.location as [number, number], 
      size: cities.nyc.size,
      color: cities.nyc.baseColor,
      id: 'nyc'
    },
    { 
      location: cities.london.location as [number, number], 
      size: cities.london.size,
      color: cities.london.baseColor,
      id: 'london'
    },
    { 
      location: cities.tokyo.location as [number, number], 
      size: cities.tokyo.size,
      color: cities.tokyo.baseColor,
      id: 'tokyo'
    },
    { 
      location: cities.saoPaulo.location as [number, number], 
      size: cities.saoPaulo.size,
      color: cities.saoPaulo.baseColor,
      id: 'saoPaulo'
    },
  ],
  arcs: [
    {
      from: cities.sf.location as [number, number],
      to: cities.tokyo.location as [number, number],
      color: [0.0, 0.9, 1.0],
      id: 'sf-tokyo'
    },
    {
      from: cities.nyc.location as [number, number],
      to: cities.london.location as [number, number],
      color: [0.9, 0.0, 0.9],
      id: 'nyc-london'
    },
    {
      from: cities.london.location as [number, number],
      to: cities.tokyo.location as [number, number],
      color: [0.5, 1.0, 0.4],
      id: 'london-tokyo'
    },
  ],
  arcColor: [0.5, 0.6, 1.0],
  arcWidth: 0.6,
  arcHeight: 0.6,
  markerElevation: 0.03,
  scale: 1.1,
  offset: [0, 0],
  onRender: (state: Record<string, any>) => {
    // Smooth auto-rotation with parallax
    if (!isDragging) {
      targetPhi = phi + 0.003
      
      // Add subtle parallax based on pointer position
      const parallaxY = (pointerY - 0.5) * 0.15
      
      targetTheta = 0.3 + parallaxY
      
      // Apply easing
      phi += (targetPhi - phi) * 0.1
      theta += (targetTheta - theta) * 0.05
    }
    
    state.phi = phi
    state.theta = theta
    state.width = width * 2
    state.height = height * 2
    
    // Update pulse animation time
    pulseTime += 1
    
    // Update marker colors with pulse effect
    if (state.markers) {
      state.markers = [
        { 
          location: cities.sf.location as [number, number], 
          size: cities.sf.size,
          color: getPulseColor(cities.sf.baseColor, 0),
          id: 'sf'
        },
        { 
          location: cities.nyc.location as [number, number], 
          size: cities.nyc.size,
          color: getPulseColor(cities.nyc.baseColor, 200),
          id: 'nyc'
        },
        { 
          location: cities.london.location as [number, number], 
          size: cities.london.size,
          color: getPulseColor(cities.london.baseColor, 400),
          id: 'london'
        },
        { 
          location: cities.tokyo.location as [number, number], 
          size: cities.tokyo.size,
          color: getPulseColor(cities.tokyo.baseColor, 600),
          id: 'tokyo'
        },
        { 
          location: cities.saoPaulo.location as [number, number], 
          size: cities.saoPaulo.size,
          color: getPulseColor(cities.saoPaulo.baseColor, 800),
          id: 'saoPaulo'
        },
      ]
    }
  }
} as ExtendedCOBEOptions)

// Pointer tracking for parallax
let isDragging = false
let lastPointerX = 0
let lastPointerY = 0

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
    
    targetPhi = phi
    targetTheta = theta
    
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

// Handle window resize
let resizeTimeout: number
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout)
  resizeTimeout = window.setTimeout(() => {
    updateSize()
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
  }, 100) as unknown as number
})

// Initial canvas sizing
canvas.style.width = `${width}px`
canvas.style.height = `${height}px`

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  globe.destroy()
})
