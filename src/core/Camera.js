import { Vec3, Vec2 } from 'ogl'

const lerp = (a, b, x) => {
	return a + x * (b - a)
}

class Camera {
	id = Symbol('camera')

	lastMousePos = new Vec2(0)
	mouse = new Vec2(0)
	drag = false
	orbit = true
	inertia = 0.05
	speed = 1

	uniforms = {
		uCameraPosition: { value: new Vec3(0, 3, -5) },
		uCameraRotation: { value: new Vec3(0, 0, 0) },
		uCameraLookAt: { value: new Vec3(0) },
		uCameraZoom: { value: 0.5 },
		uCameraSpeed: { value: 1 },
	}

	constructor({ speed = 1, inertia = 0.05, zoom = 0.5 } = {}) {
		this.speed = speed
		this.inertia = inertia
		this.zoom = zoom

		document.body.addEventListener('mousedown', (e) => {
			this.lastMousePos.x = e.pageX - this.mouse.x
			this.lastMousePos.y = e.pageY + this.mouse.y

			this.drag = true
		})
		document.body.addEventListener('mouseup', () => (this.drag = false))
		document.body.addEventListener('mousemove', this.onMove)
		document.body.addEventListener('touchmove', this.onMove)
	}

	onMove = (e) => {
		if (!this.drag) return
		this.mouse.x = -this.lastMousePos.x + e.pageX
		this.mouse.y = this.lastMousePos.y - e.pageY
	}

	/**
	 * @return {Vec3}
	 */
	get lookAt() {
		return this.uniforms.uCameraLookAt.value
	}

	/**
	 *
	 * @param {Vec3} pos
	 */
	set lookAt(pos) {
		this.uniforms.uCameraLookAt.value.copy(pos)
	}

	/**
	 * @return {Vec3}
	 */
	get position() {
		return this.uniforms.uCameraPosition.value
	}

	/**
	 *
	 * @param {Vec3} pos
	 */
	set position(pos) {
		this.uniforms.uCameraPosition.value.copy(pos)
	}

	/**
	 * @returns {Number}
	 */
	get zoom() {
		return this.uniforms.uCameraZoom.value
	}

	/**
	 * @param {Number} n
	 */
	set zoom(n) {
		this.uniforms.uCameraZoom.value = n
	}

	/**
	 * @returns {Number}
	 */
	get speed() {
		return this.uniforms.uCameraSpeed.value
	}

	/**
	 * @param {Number} n
	 */
	set speed(n) {
		this.uniforms.uCameraSpeed.value = n
	}

	update() {
		const x = this.uniforms.uCameraRotation.value.x
		const y = this.uniforms.uCameraRotation.value.y

		this.uniforms.uCameraRotation.value.x = lerp(x, -this.mouse.x, this.inertia)
		this.uniforms.uCameraRotation.value.y = lerp(y, -this.mouse.y, this.inertia)
	}
}

export default Camera
