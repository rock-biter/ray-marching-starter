import './style.css'
// import sphereSdf from './src/glsl/chunks/sphere_sdf.glsl'
// console.log(sphereSdf)
import fragment from './src/glsl/examples/blob_wave.frag'
import vertex from './src/glsl/chunks/fullscreen.vert'
import FXAA from './src/glsl/examples/FXAA_base.frag'

import { Renderer, Geometry, Program, Mesh, Vec2, Vec4, Post } from 'ogl'

const lerp = (a, b, x) => {
	return a + x * (b - a)
}

{
	const renderer = new Renderer({})
	const gl = renderer.gl
	document.body.appendChild(gl.canvas)

	const post = new Post(gl),
		mouse = new Vec2(0)

	const uniforms = {
		uTime: { value: 0 },
		uResolution: { value: new Vec2(window.innerWidth, window.innerHeight) },
		uMouse: { value: mouse },
		uSphere: { value: new Vec4(1, 0, 6, 1) },
	}

	const onMove = (e) => {
		mouse.x = (e.pageX / window.innerWidth - 0.5) * 5
		mouse.y = (e.pageY / window.innerHeight - 0.5) * 2
	}

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
		const x = uniforms.uSphere.value.x
		const y = uniforms.uSphere.value.y
		uniforms.uSphere.value.x = lerp(x, 1 + mouse.x, 0.05)
		uniforms.uSphere.value.y = lerp(y, -mouse.y, 0.05)

		// Don't need a camera if camera uniforms aren't required
		post.render({ scene: mesh })
	}
}
