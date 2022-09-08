import './style.css'
// import sphereSdf from './src/glsl/chunks/sphere_sdf.glsl'
// console.log(sphereSdf)
import fragment from './src/glsl/examples/wip.frag'
import vertex from './src/glsl/chunks/fullscreen.vert'
import FXAA from './src/glsl/examples/FXAA_base.frag'

import { Renderer, Geometry, Program, Mesh, Vec2, Vec4, Post } from 'ogl'
import Camera from './src/core/Camera'

const lerp = (a, b, x) => {
	return a + x * (b - a)
}

{
	const renderer = new Renderer({})
	const gl = renderer.gl
	document.body.appendChild(gl.canvas)

	const camera = new Camera()
	console.log(camera)

	const post = new Post(gl),
		mouse = new Vec2(0)

	const uniforms = {
		uTime: { value: 0 },
		uResolution: { value: new Vec2(window.innerWidth, window.innerHeight) },
		uMouse: { value: mouse.clone() },
		uSphere: { value: new Vec4(0, 1, 6, 1) },
		...camera.uniforms,
	}

	let drag = false
	const lastMousePos = new Vec2(0)

	const onMove = (e) => {
		/**
		 * orbit control
		 */
		if (!drag) return
		mouse.x = -lastMousePos.x + e.pageX
		mouse.y = lastMousePos.y - e.pageY

		/**
		 * blob wave
		 */
		// mouse.x = (e.pageX / window.innerWidth - 0.5) * 5
		// mouse.y = (e.pageY / window.innerHeight - 0.5) * 2
	}

	document.body.addEventListener('mousedown', (e) => {
		lastMousePos.x = e.pageX - mouse.x
		lastMousePos.y = e.pageY + mouse.y

		drag = true
	})
	document.body.addEventListener('mouseup', () => (drag = false))
	document.body.addEventListener('mousemove', onMove)
	document.body.addEventListener('touchmove', onMove)

	function resize() {
		renderer.setSize(window.innerWidth, window.innerHeight)
		uniforms.uResolution.value.x = window.innerWidth
		uniforms.uResolution.value.y = window.innerHeight
		post.resize({ width: window.innerWidth, height: window.innerHeight })
		// camera.perspective({
		//     aspect: gl.canvas.width / gl.canvas.height,
		// });
	}
	window.addEventListener('resize', resize, false)
	resize()

	// Triangle that covers viewport, with UVs that still span 0 > 1 across viewport
	const geometry = new Geometry(gl, {
		position: { size: 2, data: new Float32Array([-1, -1, 3, -1, -1, 3]) },
		uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) },
	})
	// Alternatively, you could use the Triangle class.

	const program = new Program(gl, {
		vertex,
		fragment,
		uniforms,
	})

	const mesh = new Mesh(gl, { geometry, program })

	post.addPass({
		fragment: FXAA,
		uniforms,
	})

	requestAnimationFrame(update)
	function update(t) {
		requestAnimationFrame(update)

		program.uniforms.uTime.value = t * 0.001
		/**
		 * blob wave
		 */
		// const x = uniforms.uSphere.value.x
		// const y = uniforms.uSphere.value.y
		// uniforms.uSphere.value.x = lerp(x, mouse.x, 0.05)
		// uniforms.uSphere.value.y = lerp(y, -mouse.y, 0.05)

		/**
		 * orbit control camera
		 */
		const x = uniforms.uMouse.value.x
		const y = uniforms.uMouse.value.y
		uniforms.uMouse.value.x = lerp(x, mouse.x, 0.05)
		uniforms.uMouse.value.y = lerp(y, mouse.y, 0.05)

		// Don't need a camera if camera uniforms aren't required
		post.render({ scene: mesh })
	}
}
