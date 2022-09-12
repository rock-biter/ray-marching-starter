import './style.css'
// import sphereSdf from './src/glsl/chunks/sphere_sdf.glsl'
// console.log(sphereSdf)
import Scene from './src/core/Scene'
import { gsap } from 'gsap'
import fragment from './src/glsl/examples/wip.frag'

const scene = new Scene({ fragment })
const { camera } = scene

window.addEventListener('wheel', (e) => {
	const delta = e.deltaY
	const zoom = delta > 0 ? camera.zoom * 0.5 : camera.zoom * 1.5

	gsap.to(camera, { duration: 0.5, zoom: zoom })
})
