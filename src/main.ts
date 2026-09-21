import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { OpenGeometry, Cuboid, Cylinder, Sphere, Wedge, Vector3 } from 'opengeometry'

const app = document.getElementById('app')
if (!app) throw new Error('Missing #app container')

// Scene setup
const scene = new THREE.Scene()
scene.background = new THREE.Color(0xf3f4f6)

// Camera
const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)
camera.position.set(4, 3, 5)

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(window.devicePixelRatio)
app.appendChild(renderer.domElement)

// Controls
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.05
controls.target.set(0, 0.8, 0)
controls.update()

// Grid
const grid = new THREE.GridHelper(10, 10, 0x9ca3af, 0xd1d5db)
scene.add(grid)

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
directionalLight.position.set(5, 8, 3)
scene.add(directionalLight)

// Initialize OpenGeometry
// In production, the WASM file is copied to the root by vite-plugin-static-copy
await OpenGeometry.create({
  wasmURL: '/opengeometry_bg.wasm'
})

// Current shape state
let currentShape: Cuboid | Cylinder | Sphere | Wedge | null = null
let currentShapeType: 'cuboid' | 'cylinder' | 'sphere' | 'wedge' = 'cuboid'
let currentColor = 0x10b981

// Create initial cuboid
function createCuboid() {
  if (currentShape) {
    scene.remove(currentShape)
  }
  
  const width = parseFloat((document.getElementById('width-slider') as HTMLInputElement).value)
  const height = parseFloat((document.getElementById('height-slider') as HTMLInputElement).value)
  const depth = parseFloat((document.getElementById('depth-slider') as HTMLInputElement).value)
  
  currentShape = new Cuboid({
    center: new Vector3(0, height / 2, 0),
    width,
    height,
    depth,
    color: currentColor,
  })
  
  const outlineChecked = (document.getElementById('outline-toggle') as HTMLInputElement).checked
  currentShape.outline = outlineChecked
  
  scene.add(currentShape)
}

function createCylinder() {
  if (currentShape) {
    scene.remove(currentShape)
  }
  
  const radius = parseFloat((document.getElementById('radius-slider') as HTMLInputElement).value)
  const height = parseFloat((document.getElementById('cyl-height-slider') as HTMLInputElement).value)
  const segments = parseInt((document.getElementById('segments-slider') as HTMLInputElement).value)
  
  currentShape = new Cylinder({
    center: new Vector3(0, height / 2, 0),
    radius,
    height,
    segments,
    angle: Math.PI * 2,
    color: currentColor,
  })
  
  const outlineChecked = (document.getElementById('outline-toggle') as HTMLInputElement).checked
  currentShape.outline = outlineChecked
  
  scene.add(currentShape)
}

function createSphere() {
  if (currentShape) {
    scene.remove(currentShape)
  }
  
  const radius = parseFloat((document.getElementById('sphere-radius-slider') as HTMLInputElement).value)
  const widthSegments = parseInt((document.getElementById('width-segments-slider') as HTMLInputElement).value)
  const heightSegments = parseInt((document.getElementById('height-segments-slider') as HTMLInputElement).value)
  
  currentShape = new Sphere({
    center: new Vector3(0, radius, 0),
    radius,
    widthSegments,
    heightSegments,
    color: currentColor,
  })
  
  const outlineChecked = (document.getElementById('outline-toggle') as HTMLInputElement).checked
  currentShape.outline = outlineChecked
  
  scene.add(currentShape)
}

function createWedge() {
  if (currentShape) {
    scene.remove(currentShape)
  }
  
  const width = parseFloat((document.getElementById('wedge-width-slider') as HTMLInputElement).value)
  const height = parseFloat((document.getElementById('wedge-height-slider') as HTMLInputElement).value)
  const depth = parseFloat((document.getElementById('wedge-depth-slider') as HTMLInputElement).value)
  
  currentShape = new Wedge({
    center: new Vector3(0, height / 2, 0),
    width,
    height,
    depth,
    color: currentColor,
  })
  
  const outlineChecked = (document.getElementById('outline-toggle') as HTMLInputElement).checked
  currentShape.outline = outlineChecked
  
  scene.add(currentShape)
}

// Shape selector
const shapeSelector = document.getElementById('shape-selector') as HTMLSelectElement
shapeSelector.addEventListener('change', () => {
  currentShapeType = shapeSelector.value as 'cuboid' | 'cylinder' | 'sphere' | 'wedge'
  
  // Hide all control sections
  document.getElementById('cuboid-controls')!.style.display = 'none'
  document.getElementById('cylinder-controls')!.style.display = 'none'
  document.getElementById('sphere-controls')!.style.display = 'none'
  document.getElementById('wedge-controls')!.style.display = 'none'
  
  // Show relevant controls and create shape
  switch (currentShapeType) {
    case 'cuboid':
      document.getElementById('cuboid-controls')!.style.display = 'block'
      createCuboid()
      break
    case 'cylinder':
      document.getElementById('cylinder-controls')!.style.display = 'block'
      createCylinder()
      break
    case 'sphere':
      document.getElementById('sphere-controls')!.style.display = 'block'
      createSphere()
      break
    case 'wedge':
      document.getElementById('wedge-controls')!.style.display = 'block'
      createWedge()
      break
  }
})

// Cuboid controls
const widthSlider = document.getElementById('width-slider') as HTMLInputElement
const heightSlider = document.getElementById('height-slider') as HTMLInputElement
const depthSlider = document.getElementById('depth-slider') as HTMLInputElement

widthSlider.addEventListener('input', () => {
  document.getElementById('width-value')!.textContent = parseFloat(widthSlider.value).toFixed(1)
  if (currentShapeType === 'cuboid') createCuboid()
})

heightSlider.addEventListener('input', () => {
  document.getElementById('height-value')!.textContent = parseFloat(heightSlider.value).toFixed(1)
  if (currentShapeType === 'cuboid') createCuboid()
})

depthSlider.addEventListener('input', () => {
  document.getElementById('depth-value')!.textContent = parseFloat(depthSlider.value).toFixed(1)
  if (currentShapeType === 'cuboid') createCuboid()
})

// Cylinder controls
const radiusSlider = document.getElementById('radius-slider') as HTMLInputElement
const cylHeightSlider = document.getElementById('cyl-height-slider') as HTMLInputElement
const segmentsSlider = document.getElementById('segments-slider') as HTMLInputElement

radiusSlider.addEventListener('input', () => {
  document.getElementById('radius-value')!.textContent = parseFloat(radiusSlider.value).toFixed(1)
  if (currentShapeType === 'cylinder') createCylinder()
})

cylHeightSlider.addEventListener('input', () => {
  document.getElementById('cyl-height-value')!.textContent = parseFloat(cylHeightSlider.value).toFixed(1)
  if (currentShapeType === 'cylinder') createCylinder()
})

segmentsSlider.addEventListener('input', () => {
  document.getElementById('segments-value')!.textContent = segmentsSlider.value
  if (currentShapeType === 'cylinder') createCylinder()
})

// Sphere controls
const sphereRadiusSlider = document.getElementById('sphere-radius-slider') as HTMLInputElement
const widthSegmentsSlider = document.getElementById('width-segments-slider') as HTMLInputElement
const heightSegmentsSlider = document.getElementById('height-segments-slider') as HTMLInputElement

sphereRadiusSlider.addEventListener('input', () => {
  document.getElementById('sphere-radius-value')!.textContent = parseFloat(sphereRadiusSlider.value).toFixed(1)
  if (currentShapeType === 'sphere') createSphere()
})

widthSegmentsSlider.addEventListener('input', () => {
  document.getElementById('width-segments-value')!.textContent = widthSegmentsSlider.value
  if (currentShapeType === 'sphere') createSphere()
})

heightSegmentsSlider.addEventListener('input', () => {
  document.getElementById('height-segments-value')!.textContent = heightSegmentsSlider.value
  if (currentShapeType === 'sphere') createSphere()
})

// Wedge controls
const wedgeWidthSlider = document.getElementById('wedge-width-slider') as HTMLInputElement
const wedgeHeightSlider = document.getElementById('wedge-height-slider') as HTMLInputElement
const wedgeDepthSlider = document.getElementById('wedge-depth-slider') as HTMLInputElement

wedgeWidthSlider.addEventListener('input', () => {
  document.getElementById('wedge-width-value')!.textContent = parseFloat(wedgeWidthSlider.value).toFixed(1)
  if (currentShapeType === 'wedge') createWedge()
})

wedgeHeightSlider.addEventListener('input', () => {
  document.getElementById('wedge-height-value')!.textContent = parseFloat(wedgeHeightSlider.value).toFixed(1)
  if (currentShapeType === 'wedge') createWedge()
})

wedgeDepthSlider.addEventListener('input', () => {
  document.getElementById('wedge-depth-value')!.textContent = parseFloat(wedgeDepthSlider.value).toFixed(1)
  if (currentShapeType === 'wedge') createWedge()
})

// Color picker
const colorButtons = document.querySelectorAll('.color-btn')
colorButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    colorButtons.forEach(b => b.classList.remove('active'))
    btn.classList.add('active')
    
    currentColor = parseInt((btn as HTMLElement).dataset.color!)
    
    if (currentShape) {
      currentShape.color = currentColor
    }
  })
})

// Set initial active color
colorButtons[0].classList.add('active')

// Outline toggle
const outlineToggle = document.getElementById('outline-toggle') as HTMLInputElement
outlineToggle.addEventListener('change', () => {
  if (currentShape) {
    currentShape.outline = outlineToggle.checked
  }
})

// Create initial shape
createCuboid()

// Animation loop
function animate() {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}

animate()

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})
