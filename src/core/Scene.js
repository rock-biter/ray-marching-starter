import { Renderer, Geometry, Program, Mesh, Vec2, Vec4, Post } from 'ogl'
import Camera from './Camera'
import vertex from '../glsl/chunks/fullscreen.vert'
import fragment from '../glsl/examples/basic_scene.frag'

class Scene {
	fragment = fragment
	vertex = vertex

	uniforms = {
		uTime: { value: 0 },
		uResolution: { value: new Vec2(window.innerWidth, window.innerHeight) },
		uMouse: { value: new Vec2(0) },
	}

	constructor({ fragment } = {}) {
		this.renderer = new Renderer({})
		this.gl = this.renderer.gl
		this.post = new Post(this.gl)
		this.appendCanvas(document.body)
		this.camera = new Camera()
		this.mouse = new Vec2(0)

		fragment && (this.fragment = fragment)

		this.geometry = new Geometry(this.gl, {
			position: { size: 2, data: new Float32Array([-1, -1, 3, -1, -1, 3]) },
			uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) },
		})

		this.program = new Program(this.gl, {
			vertex: this.vertex,
			fragment: this.fragment,
			uniforms: this.uniforms,
		})

		this.mesh = new Mesh(this.gl, {
			geometry: this.geometry,
			program: this.program,
		})

		requestAnimationFrame(this.update)
	}

	appendCanvas(DOMElement) {
		DOMElement.appendChild(this.gl.canvas)
		window.addEventListener('resize', this.onResize.bind(this), false)
		this.onResize()
	}

	/**
	 * @param {Camera} camera
	 */
	set camera(camera) {
		if (camera instanceof Camera) {
			this.mainCamera = camera
			this.uniforms = {
				...this.uniforms,
				...camera.uniforms,
			}
		} else {
			throw 'Camera must be an instance of Camera class'
		}
	}

	get camera() {
		return this.mainCamera
	}

	onResize() {
		this.renderer.setSize(window.innerWidth, window.innerHeight)
		this.uniforms.uResolution.value.x = window.innerWidth
		this.uniforms.uResolution.value.y = window.innerHeight
		this.post &&
			this.post.resize({ width: window.innerWidth, height: window.innerHeight })
	}

	update = (t) => {
		requestAnimationFrame(this.update)

		this.uniforms.uTime.value = t * 0.001
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
		const x = this.uniforms.uMouse.value.x
		const y = this.uniforms.uMouse.value.y
		// this.uniforms.uMouse.value.x = lerp(x, mouse.x, 0.05)
		// this.uniforms.uMouse.value.y = lerp(y, mouse.y, 0.05)
		// update camera uniform
		this.camera && this.camera.update()

		// Don't need a camera if camera uniforms aren't required
		this.post.render({ scene: this.mesh })
	}
}

export default Scene
