import './style.css'
import Scene from './src/core/Scene'
import { gsap } from 'gsap'
import fragment from './src/glsl/examples/mix-lights-color.frag'

const scene = new Scene({ fragment })
const { camera } = scene

window.addEventListener('wheel', (e) => {
	const delta = e.deltaY
	const zoom = delta > 0 ? camera.zoom * 0.7 : camera.zoom * 1.3
	gsap.to(camera, { duration: 0.5, zoom: zoom })
})
